#!/usr/bin/env bash
set -e
BIN=/var/folders/ry/n1gttgmj2f5czjv3q27crm640000gn/T/opencode/mmd-tooling/node_modules/.bin/mmdc
cd "$(dirname "$0")"
for f in src/*.mmd; do
  name=$(basename "$f" .mmd)
  PUPPETEER_SKIP_DOWNLOAD=1 "$BIN" -i "$f" -o "$name.png" -c theme.json -C diagram.css -p puppeteer.json -b white -s 3 -w 1600 >/dev/null 2>&1 && echo "[ok] $name" || echo "[FAIL] $name"
done
