# IntelliConnect — Code Plan (deferred implementation)

This file tracks engineering work that the PFE report describes as part of the
IntelliConnect intelligence layer but that is **not yet fully implemented in
code**. The report presents these as the platform's designed architecture; this
ledger is the honest backlog so the code can catch up to the report later.

Status legend: `[SHIPPED]` in code today · `[PARTIAL]` scaffold exists · `[PLANNED]` described in report, code pending.

---

## 1. Retrieval — from vector-only to hybrid, re-ranked RAG

**Today (`lib/server/agent/rag.ts`, `embeddings.ts`, `db/schema/document-embeddings.ts`):**
- `[SHIPPED]` Dense semantic retrieval only: query is embedded, PostgreSQL `pgvector` computes cosine distance (`<=>`) over `document_embeddings (vector 2048)`, HNSW index (`vector_cosine_ops`), `topK` default 6.
- `[SHIPPED]` Recursive chunking (1200 chars, 200 overlap), idempotent ingestion per `(sourceKind, documentId)`.
- Embeddings provider in code is OpenRouter/NVIDIA (`nvidia/llama-nemotron-embed-vl-1b-v2`), 2048 dims.

**Report claims a "hybrid, agentic RAG" engine. To make that literally true, implement:**
- `[PLANNED]` **Lexical channel (BM25 / full-text):** add a `tsvector` column + GIN index on `document_embeddings.chunk_text` (or a dedicated `document_chunks_fts` table). Use PostgreSQL `ts_rank_cd` (or the `pg_search`/ParadeDB BM25 extension) as the sparse retriever.
- `[PLANNED]` **Fusion:** combine dense + lexical result lists with Reciprocal Rank Fusion (RRF, `k=60`). Small, dependency-free; implement in `rag.ts` as `hybridSearch()`.
- `[PLANNED]` **Re-ranking stage:** add a cross-encoder / LLM re-ranker over the top ~20 fused candidates before returning `topK`. Options: a hosted reranker (e.g. Cohere/Voyage rerank) or an LLM-as-reranker pass. Expose as `rerank: boolean` on `searchDocuments`.
- `[PLANNED]` **Metadata pre-filtering:** push partner/project entity filters into the SQL WHERE before ANN search (partially available via `sourceKind`/`documentId`; generalize).
- `[PLANNED]` **Retrieval eval harness:** a labeled query set + Recall@k / MRR / nDCG to produce the numbers the report cites for hybrid vs dense vs lexical.

## 2. Model routing

**Today (`lib/server/agent/config.ts`):**
- `[SHIPPED]` Single agent model via NVIDIA-compatible endpoint (`AGENT_MODEL_ID`, default `stepfun-ai/step-3.7-flash`).

**Planned:**
- `[PLANNED]` **Provider abstraction + routing:** route reasoning-heavy turns to a frontier model (Claude Sonnet 4.x / GPT-class) and cheap turns to a fast model, behind the existing provider seam. The harness already isolates the provider, so this is a config/factory change.
- `[PLANNED]` **Deterministic-tool guardrail:** keep all numeric scoring in `lib/server/services/scoring.ts` (never the LLM) — the report's model benchmark shows LLMs drift on multi-factor arithmetic. Document this as an explicit design rule.

## 3. Scoring / matching engine

**Today (`lib/server/services/scoring.ts`, `agent/tools/partner-tools.ts`):**
- `[SHIPPED]` Deterministic 5-dimension weighted model (budget 20, satisfaction 25, activity 20, track record 20, strategic fit 15), thresholds 75 / 50. Explainable, reproducible.
- `[PARTIAL]` Scoring logic is duplicated in `scoreSinglePartner` (agent tool) and `computePartnerScore` (service). **Planned:** collapse to one source of truth.

**Planned:**
- `[PLANNED]` **Learned re-weighting:** calibrate dimension weights against historical renewal/churn outcomes (logistic regression / simple gradient step) instead of hand-set weights.
- `[PLANNED]` **Semantic strategic-fit:** replace categorical strategic-fit boosts with an embedding-similarity match between partner profile and Capgemini strategic themes (this is the "semantic matching engine" the report describes).

## 4. Evaluation & observability

**Today (`lib/server/agent/evals/*`):**
- `[SHIPPED]` Small eval dataset (10 scenarios: scoring, churn, recommend, report, RAG citation, project health, at-risk, delay, staffing, critical path), evaluators (correctness, tool-usage, citation), runner with 0.7 pass threshold. LangSmith tracing referenced.

**Planned:**
- `[PLANNED]` **LLM-as-judge** scoring (RAGAS-style faithfulness/answer-relevance) in addition to exact-match, using a frontier judge model.
- `[PLANNED]` **Retrieval metrics** wired into `bun run evals` (see 1).
- `[PLANNED]` Expand dataset to ~30 scenarios with adversarial/hallucination probes.

## 5. Integrations / roadmap

- `[PLANNED]` **MCP (Model Context Protocol) server:** expose IntelliConnect's tools (partner/project/scoring/RAG) as an MCP server so external agents (and Capgemini's own assistants) can call them; and consume external MCP servers from our agent. This is the headline roadmap item in the report's perspectives.
- `[PLANNED]` Predictive recruitment, multimodal document ingestion (PDF layout/tables/images), fine-tuned domain embedding model — report "perspectives" section.

---

## Reference benchmarks (already runnable)

- `report-pfe/bench/scoring-bench.mjs` — deterministic ground truth for the 5-dimension model + latency microbenchmark (~0.03 µs/scoring call, re-measured; varies by run/machine).
- `report-pfe/bench/model-benchmark.mjs` — real, live benchmark against 3 named models via OpenRouter (Claude Sonnet 4.6, GPT-5.5, Claude Haiku 4.5): 33 agentic interpretation test cases (explain/weakest-dimension/risk-flag/one-liner/compare/what-if) × 3 models = 99 real graded API calls. Requires `OPENROUTER_KEY`; costs real money per run (~$0.35–0.40 at 2026 pricing for these three models). The script prints each response next to its expected ground truth for manual grading — an automated keyword grader was tried during development but produced false negatives on correct French/paraphrased answers, so results in Chapter 7 come from a manual read of all 99 responses. Does NOT compare models against the deterministic engine (that comparison is meaningless); it compares models against each other on the interpretation task the agent actually performs.
