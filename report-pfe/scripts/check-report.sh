#!/usr/bin/env bash
# check-report.sh — Verification harness for the IntelliConnect PFE report.
# Run from any directory; resolves paths relative to its own location.
# Exit codes: 0 = PASS, 1 = one or more checks failed.

set -euo pipefail

# ---------------------------------------------------------------------------
# 0. Path resolution
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MAIN_TEX="${REPORT_ROOT}/main.tex"
MAIN_PDF="${REPORT_ROOT}/main.pdf"
MAIN_LOG="${REPORT_ROOT}/main.log"

STATUS=0

pass() { echo "  [PASS] $*"; }
fail() { echo "  [FAIL] $*"; STATUS=1; }

# ---------------------------------------------------------------------------
# 1. Build
# ---------------------------------------------------------------------------
echo ""
echo "=== [1/5] BUILD ==="
cd "${REPORT_ROOT}"

if command -v latexmk &>/dev/null; then
  echo "  Using latexmk …"
  if latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex; then
    pass "latexmk compilation succeeded"
  else
    fail "latexmk compilation failed (check main.log for details)"
  fi
else
  echo "  latexmk not found — falling back to pdflatex (3 passes) …"
  BUILD_OK=true
  for pass_num in 1 2 3; do
    echo "  pdflatex pass ${pass_num}/3 …"
    if ! pdflatex -interaction=nonstopmode -halt-on-error main.tex; then
      fail "pdflatex pass ${pass_num} failed"
      BUILD_OK=false
      break
    fi
  done
  if ${BUILD_OK}; then
    pass "pdflatex compilation succeeded (3 passes)"
  fi
fi

# ---------------------------------------------------------------------------
# 2. PDF existence
# ---------------------------------------------------------------------------
echo ""
echo "=== [2/5] PDF OUTPUT ==="
if [[ -f "${MAIN_PDF}" ]]; then
  pass "main.pdf exists ($(du -h "${MAIN_PDF}" | cut -f1))"
else
  fail "main.pdf is missing after build"
fi

# ---------------------------------------------------------------------------
# 3. Log — undefined references / citations
# ---------------------------------------------------------------------------
echo ""
echo "=== [3/5] LOG QUALITY ==="
if [[ ! -f "${MAIN_LOG}" ]]; then
  fail "main.log not found — cannot check for undefined references"
else
  LOG_PROBLEMS=()

  # Undefined control sequence
  if grep -qiE "Undefined control sequence" "${MAIN_LOG}"; then
    LOG_PROBLEMS+=("Undefined control sequence")
  fi

  # Undefined references
  if grep -qiE "There were undefined references" "${MAIN_LOG}"; then
    LOG_PROBLEMS+=("There were undefined references")
  fi

  # Citation .* undefined
  if grep -qiE "Citation .* undefined" "${MAIN_LOG}"; then
    LOG_PROBLEMS+=("Undefined citation(s)")
  fi

  # Reference .* undefined
  if grep -qiE "Reference .* undefined" "${MAIN_LOG}"; then
    LOG_PROBLEMS+=("Undefined cross-reference(s)")
  fi

  if [[ ${#LOG_PROBLEMS[@]} -eq 0 ]]; then
    pass "main.log — no undefined references or control sequences"
  else
    for problem in "${LOG_PROBLEMS[@]}"; do
      fail "main.log — ${problem}"
    done
    echo ""
    echo "  Relevant log excerpts:"
    grep -nEi "Undefined control sequence|undefined references|Citation .* undefined|Reference .* undefined" \
      "${MAIN_LOG}" | head -20 | sed 's/^/    /'
  fi
fi

# ---------------------------------------------------------------------------
# 4. Banned recruitment-specific terms in chapter files
# ---------------------------------------------------------------------------
echo ""
echo "=== [4/5] BANNED TERMS ==="
# NOTE: 'recruitment' is intentionally NOT banned — it names a real product feature.
# These terms signal copy-paste from a hiring-platform context that doesn't apply
# to IntelliConnect (a partnership management platform, not an ATS).

CHAPTERS_DIR="${REPORT_ROOT}/chapters"
if [[ ! -d "${CHAPTERS_DIR}" ]]; then
  fail "chapters/ directory not found at ${CHAPTERS_DIR}"
else
  TERM_FAILURES=0

  # check_term <ERE-pattern> <human-label>
  check_term() {
    local pattern="$1" label="$2"
    if grep -qrE "${pattern}" "${CHAPTERS_DIR}" 2>/dev/null; then
      fail "Banned term found: \"${label}\""
      echo "    Occurrences:"
      grep -rnE "${pattern}" "${CHAPTERS_DIR}" | head -10 | sed 's/^/      /'
      TERM_FAILURES=$((TERM_FAILURES + 1))
    fi
  }

  check_term '\bcandidate\b'    "candidate"
  check_term '\bCV\b'           "standalone CV"
  check_term '\bATS\b'          "standalone ATS"
  check_term 'Better Auth'      "Better Auth"
  check_term '\bNeon\b'         "Neon (database vendor)"
  check_term '\bGreenhouse\b'   "Greenhouse"
  check_term '\bWorkday\b'      "Workday"
  check_term 'LinkedIn Talent'  "LinkedIn Talent"
  check_term 'Talent Acquisition' "Talent Acquisition"

  if [[ ${TERM_FAILURES} -eq 0 ]]; then
    pass "No banned recruitment-specific terms found in chapters/"
  fi
fi

# ---------------------------------------------------------------------------
# 5. \input{} target existence
# ---------------------------------------------------------------------------
echo ""
echo "=== [5/5] \\\\input{} TARGETS ==="
if [[ ! -f "${MAIN_TEX}" ]]; then
  fail "main.tex not found at ${MAIN_TEX}"
else
  INPUT_MISSING=0
  # Extract all \input{...} arguments; strip surrounding whitespace
  while IFS= read -r raw_path; do
    target="${raw_path//[$'\t\r\n ']/}"   # strip whitespace
    [[ -z "${target}" ]] && continue

    # If the path already has an extension, check as-is; otherwise try .tex
    if [[ "${target}" == *.* ]]; then
      candidates=("${REPORT_ROOT}/${target}")
    else
      candidates=("${REPORT_ROOT}/${target}.tex" "${REPORT_ROOT}/${target}")
    fi

    found=false
    for candidate in "${candidates[@]}"; do
      if [[ -f "${candidate}" ]]; then
        found=true
        break
      fi
    done

    if ${found}; then
      pass "\\input{${target}} → file exists"
    else
      fail "\\input{${target}} → file NOT found (tried: ${candidates[*]})"
      INPUT_MISSING=$((INPUT_MISSING + 1))
    fi
  done < <(grep -oE '\\input\{[^}]+\}' "${MAIN_TEX}" | sed 's/\\input{//;s/}//' | grep -vE '^#[0-9]+')

  if [[ ${INPUT_MISSING} -eq 0 ]]; then
    # Already printed individual PASSes above; summary:
    echo ""
    pass "All \\\\input{} targets resolved"
  fi
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo "=============================="
if [[ ${STATUS} -eq 0 ]]; then
  echo "  RESULT: PASS — report is clean"
else
  echo "  RESULT: FAIL — one or more checks failed (see above)"
fi
echo "=============================="
echo ""

exit ${STATUS}
