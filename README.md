# IntelliConnect

IntelliConnect is a Capgemini Tunisia partnership management platform built as a master's degree final internship project in software engineering, with an applied AI focus. The product manages the partnership lifecycle across public applications, employee operations, partner self-service, analytics, and AI-assisted decision support.

The repository documentation is intentionally centralized here. Agent-specific engineering rules live in [AGENTS.md](AGENTS.md).

> **Demo-ready state.** The database ships pruned to a clean, believable Capgemini Tunisia portfolio of **26 partners** (no vendor-catalog noise), with **two flagship partners** — **LangSmith** and **Polytech Intl** — fully seeded across every scoring dimension (both score **90/100**) plus RAG documents. Jump to [AI Agent Demo Prompts](#ai-agent-demo-prompts) to run the showcase.

## Quick test logins

Use these two accounts to cover the main flows quickly:

| Flow | Email | Password | Notes |
| --- | --- | --- | --- |
| Employee admin flow | `khaled.maatoug@capgemini.com` | `Capgemini2024!` | Admin account; can access the employee portal and see the broadest set of features. |
| Partner flow | `partenariats@esprit.tn` | `Partner2024!` | Partner account for testing the partner portal. |

## Product Scope

IntelliConnect has three main surfaces:

| Surface | Path | Purpose |
| --- | --- | --- |
| Public website | `/`, `/solutions`, `/success-stories`, `/success-stories/apply` | Present Capgemini partnership value and collect partnership requests. |
| Employee portal | `/dashboard` | Manage partners, contacts, offers, events, documents, status history, HR workflows, BI, reports, and the AI agent. |
| Partner portal | `/partner` | Give external partners access to their dashboard, offers, events, documents, notifications, profile, contacts, statistics, recruitments, or supplier projects. |

Important product rule: source code, comments, commit messages, and documentation are written in English. User-facing web application UI copy is written in French.

## Core Features

- **Partner lifecycle management** across customer, marketing, supplier, and university partners (create, edit, status workflow, negotiation, suspend).
- **Partner CRM**: contacts, offers, events, meetings, documents, notifications, and full status history.
- **Public partnership requests** with employee review, AI-assisted scoring, acceptance/rejection, and optional email notification.
- **Role-based employee portal** for admin, manager, commercial, analyst, and HR users.
- **Partner self-service portal** with category-specific navigation (offers, events, documents, recruitments, supplier projects, statistics).
- **Project delivery management**: projects with milestones, tasks, team allocations, documents, health and progress tracking.
- **HR workflows**: employee roster, recruitment pipeline, student recruitments and CDI conversions.
- **Automated partner scoring** — a 5-dimension weighted model (budget, satisfaction, activity, track record, strategic fit) with an explainable scoring page (ring, radar, signals).
- **BI dashboard** backed by a separate data-warehouse database.
- **AI agent** for partner search, analytics, scoring, churn-risk prediction, recommendations, project health, RAG document search, and rich report generation with charts, tables, and exportable PDF reports.

## Application Map — Pages & Routes

User-facing copy is **French**; the tables below describe each surface in English.

### Public website

| Route | Purpose |
| --- | --- |
| `/` | Landing page (hero, value proposition, partnership CTA). |
| `/solutions` | Marketing page presenting the six partnership collaboration models. |
| `/success-stories` | Public success-stories listing. |
| `/success-stories/apply` | Partnership application wizard (submits a public partnership request). |
| `/privacy`, `/terms` | Legal pages. |
| `/auth/sign-in` | Unified login (employee / partner toggle, French inline validation). |

### Employee portal (`/dashboard`)

| Route | Purpose |
| --- | --- |
| `/dashboard` | Home hub: daily AI briefing, pending requests, negotiations, recruitment snapshots. |
| `/dashboard/partners` | Partner list with search, category/status filters, and row actions. |
| `/dashboard/partners/new` | Create a partner. |
| `/dashboard/partners/[id]/scoring` | **Automated scoring** page — score ring, 5-dimension radar, signals, methodology. |
| `/dashboard/partners/[id]/communications` | Tabbed hub: documents, meetings, notifications for a partner. |
| `/dashboard/partners/[id]/documents` | Partner document upload / download. |
| `/dashboard/partners/[id]/edit` | Edit a partner. |
| `/dashboard/projects` | Project portfolio list. |
| `/dashboard/projects/[id]` | Project detail: milestones, tasks, team allocations, documents. |
| `/dashboard/agent` | **AI agent** chat (streaming tools, charts/tables, reports, plan HUD, conversation history). |
| `/dashboard/reports` | Report viewer/editor with markdown preview and PDF export. |
| `/dashboard/bi` | BI dashboard (data-warehouse-backed charts). |
| `/dashboard/contacts` | Partner contacts directory. |
| `/dashboard/events` | Partner events. |
| `/dashboard/partnership-requests` | Review queue for incoming public requests. |
| `/dashboard/status-history` | Partnership lifecycle history. |
| `/dashboard/profile` | Employee profile + password change. |
| `/dashboard/hr/employees` | HR employee roster. |
| `/dashboard/hr/recruitments` | HR recruitment pipeline. |
| `/dashboard/hr/events` | HR events. |

### Partner portal (`/partner`)

| Route | Purpose |
| --- | --- |
| `/partner` | Partner home dashboard (metrics, profile synthesis). |
| `/partner/stats` | Partner statistics and comparison charts. |
| `/partner/offers`, `/partner/offers/new` | Manage / create offers. |
| `/partner/events`, `/partner/events/new` | Manage / create events. |
| `/partner/projects`, `/partner/projects/new` | Supplier projects (where applicable). |
| `/partner/recruitments`, `/partner/recruitments/new` | University recruitments. |
| `/partner/documents` | Partner documents. |
| `/partner/contacts` | Partner contacts. |
| `/partner/notifications` | Notification center. |
| `/partner/profile` | Partner profile + password change. |

All portals are responsive (desktop / tablet / mobile with a slide-over drawer), support light and dark mode, and use the shared design tokens.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Runtime and package manager | Bun |
| Language | TypeScript strict mode |
| UI | React 19, shadcn/ui, Radix UI |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Hugeicons |
| Charts | Recharts |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | JWT with httpOnly cookies, `jose`, `bcryptjs` |
| AI | Vercel AI SDK v6, OpenRouter, optional Voyage embeddings and LangSmith tracing |
| Email | Nodemailer with optional Gmail SMTP |
| Theme | `next-themes` light and dark mode |
| Toasts | Sonner through the local unified toast wrapper |

## Repository Structure

```text
app/                         Next.js pages, layouts, loading/error states, and API routes
  api/                       Backend route handlers
  dashboard/                 Employee portal
  partner/                   Partner portal
  auth/                      Authentication pages
  solutions/                 Public marketing page
  success-stories/           Public success stories and application flow

lib/server/
  agent/                     AI agent tools, RAG, prompt, ingestion, evals, tests
  ai/                        AI-assisted business services
  auth/                      JWT and session helpers
  db/                        Drizzle config, schema, migrations, DW config
  services/                  Shared server business services

components/                   Shared UI, auth, dashboard, partner, agent, project components
hooks/                        Client hooks
lib/                          Shared utilities
  server/                     Server-only auth, DB, services, AI, and agent code

scripts/                     Idempotent seed, prune, and account-setup scripts (read DATABASE_URL from .env)
scripts/db-dumps/            Main database and DW SQL dumps
public/                      Static assets
```

## Local Setup

### 1. Install dependencies

```bash
bun install
```

Never use npm, yarn, or pnpm in this project.

### 2. Create local PostgreSQL databases

The app uses two databases:

- `capgemini_dev`: main application database.
- `dw_intelliconnect`: data warehouse for BI charts and analytics.

```bash
psql -U your_pg_user -d postgres -c "CREATE DATABASE capgemini_dev;"
psql -U your_pg_user -d postgres -c "CREATE DATABASE dw_intelliconnect;"
```

On macOS with Homebrew PostgreSQL, `your_pg_user` is usually your macOS username.

### 3. Restore database dumps

```bash
psql -U your_pg_user -d capgemini_dev < scripts/db-dumps/capgemini_dev.sql
psql -U your_pg_user -d dw_intelliconnect < scripts/db-dumps/dw_intelliconnect.sql
```

The first restore can print `NOTICE: table does not exist, skipping`; this is expected because the dumps include `DROP IF EXISTS`.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Required:

```env
DATABASE_URL="postgresql://your_pg_user@localhost:5432/capgemini_dev"
DW_DATABASE_URL="postgresql://your_pg_user@localhost:5432/dw_intelliconnect"
JWT_SECRET="replace_with_a_random_secret"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional:

```env
OPENROUTER_KEY=
OPENROUTER_MODEL_ID=openrouter/owl-alpha
VOYAGE_API_KEY=
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=capgemini-intelliconnect
LANGSMITH_TRACING=true
GMAIL_USER=
GMAIL_APP_PASSWORD=
```

Generate a JWT secret:

```bash
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Reset demo passwords

Run this after restoring the dump so demo credentials are predictable.

```bash
bun scripts/reset-passwords.js
bun scripts/setup-partner-accounts.js
```

### 6. Start the app

```bash
bun dev
```

Open `http://localhost:3000`.

## Demo Accounts

Employee password: `Capgemini2024!`

| Name | Email | Role |
| --- | --- | --- |
| Khaled Maatoug | `khaled.maatoug@capgemini.com` | Admin |
| Karim Mejri | `karim.mejri@capgemini.com` | Manager |
| Sami Trabelsi | `sami.trabelsi@capgemini.com` | Manager |
| Leila Ben Ali | `leila.benali@capgemini.com` | Commercial |
| Ahmed Gharbi | `ahmed.gharbi@capgemini.com` | Commercial |
| Nadia Haddad | `nadia.haddad@capgemini.com` | Analyst |
| Mouna Baccar | `mouna.baccar@capgemini.com` | HR |

Partner password: `Partner2024!`

| Category | Partner | Email |
| --- | --- | --- |
| University | ESPRIT | `partenariats@esprit.tn` |
| University | INSAT | `relations-entreprises@insat.rnu.tn` |
| Customer | BIAT | `relationsclient@biat.tn` |
| Customer | Amen Bank | `contact@amenbank.tn` |
| Marketing | Pluxee Tunisie | `contact@pluxee.tn` |
| Marketing | Orange Tunisie | `partenariat@orange.tn` |
| Supplier | Microsoft Tunisie | `partenariats@microsoft.tn` |
| Supplier | Dell Tunisia | `ventes@dell.tn` |

Do not publish real secrets or production credentials in documentation, commits, screenshots, or AI outputs.

## Useful Commands

```bash
bun dev                            # Start the development server
bun run build                      # Production build
bun run lint                       # ESLint
bun run evals                      # AI agent eval dataset
bun run db:generate                # Generate Drizzle migrations
bun run db:migrate                 # Apply Drizzle migrations
bun run db:studio                  # Open Drizzle Studio
bun test                           # Run unit tests (agent tools, formatters)
```

### Maintained data scripts

All scripts read `DATABASE_URL` from `.env`, are idempotent, and never hardcode credentials.

```bash
bun scripts/reset-passwords.js        # Reset employee demo password (Capgemini2024!)
bun scripts/setup-partner-accounts.js # Set the 8 partner demo passwords (Partner2024!)
bun scripts/seed-langsmith-demo.js    # Seed flagship LangSmith (partner 184) + scoring data
bun scripts/seed-langsmith-rag.js     # Seed LangSmith RAG documents + embeddings
bun scripts/seed-polytech-demo.js     # Seed flagship Polytech Intl (partner 187) + scoring data
bun scripts/seed-polytech-rag.js      # Seed Polytech Intl RAG documents + embeddings
bun scripts/cleanup-demo-data.js      # Remove test/junk rows + de-duplicate requests
bun scripts/prune-catalog-partners.js # Prune vendor-catalog noise to the clean 26-partner portfolio
```

## Verification Checklist

After setup or a meaningful change, verify the relevant subset:

| Path | What to check |
| --- | --- |
| `/` | Public landing page renders in French and supports light/dark mode. |
| `/auth/sign-in` | Login form renders, validates input, and shows French feedback. |
| `/dashboard` | Employee portal loads after employee login. |
| `/dashboard/partners` | Partner list, search, filters, loading, error, empty, and actions work. |
| `/dashboard/agent` | AI chat streams responses, persists threads, and renders tool results. |
| `/dashboard/bi` | BI charts show real DW data or a clear French error state. |
| `/dashboard/reports` | Report preview and PDF export work. |
| `/partner` | Partner dashboard loads after partner login with category-specific navigation. |

For UI work, also verify at mobile, tablet, desktop, light mode, dark mode, keyboard navigation, empty data, long text, slow network, and API failure states.

## Architecture Notes

- `app/` owns routing, pages, layouts, and route handlers.
- `lib/server/auth` owns JWT and session extraction.
- `lib/server/db/schema` owns Drizzle table definitions.
- `lib/server/services` owns shared server-side business logic.
- `lib/server/agent` owns AI tools, prompts, RAG, evals, and agent tests.
- `components/ui` owns shared design-system primitives.
- Feature-specific UI should stay close to its existing domain folder under `components`.
- API routes must authenticate first where required, validate external input, use proper status codes, and return structured errors.

## AI Agent

The AI agent (`/dashboard/agent`) is a read-oriented partnership-intelligence assistant built on the Vercel AI SDK with typed, Zod-validated tools. It streams responses, renders rich visual tool results, persists conversations, and never fabricates data — every number traces to a tool result.

### Capabilities (tools)

| Group | Tools |
| --- | --- |
| Meta | `declareMethodology`, `createPlan`, `askClarification` |
| Partner intelligence | `queryPartners`, `getPartnerDetails`, `queryAnalytics`, `scorePartner` (single + batch), `predictChurn`, `recommendPartners` |
| Portfolio | `summarizePartnerPortfolio`, `getCategoryBenchmarks`, `getPartnerActivityTimeline` |
| Projects | `analyzeProjectHealth`, `identifyAtRiskProjects`, `forecastProjectDelay`, `recommendStaffing`, `findCriticalPath`, `crossEntityAnalysis` |
| Visualization | `createBarChart`, `createLineChart`, `createPieChart`, `createTable` |
| Reporting | `generateReport` (executive report markdown → PDF) |
| RAG | `searchDocuments` (semantic search over partner/project documents) |

### Agent UX

- **Landing page**: minimalist hero plus suggestion pills directly under the input — including one-click flagship demos for **LangSmith** and **Polytech Intl**.
- **Plan HUD**: a compact, animated progress band showing the agent's live multi-step plan.
- **Conversation history**: collapsible sidebar, date-grouped (today / yesterday / 7 days / 30 days / older + pinned), per-item timestamps, fluid optimistic list.
- **Rich results**: bar / line / pie charts, interactive tables (CSV/Excel export), report cards with **Télécharger PDF**, and `## Sources` sections with deep links to the relevant in-app pages.
- The agent runs with a high step budget; tool calls have timeouts as a safety net. Set `OPENROUTER_KEY` (and optionally `VOYAGE_API_KEY` for embeddings) to enable it.

### Partner scoring model

`scorePartner` and the `/dashboard/partners/[id]/scoring` page use one explainable weighted model (`lib/server/services/scoring.ts`):

| Dimension | Weight | Driven by |
| --- | --- | --- |
| Budget | 20% | annual partnership budget (TND) |
| Satisfaction | 25% | partner + event + meeting + KPI satisfaction scores |
| Activity | 20% | events, meetings, active offers, KPI interactions |
| Track record | 20% | vendor projects, CDI conversions, conversion rate, revenue |
| Strategic fit | 15% | category, partnership level/status, framework/support agreements |

Final score ≥ 75 → **APPROUVER**, 50–74 → **À revoir**, < 50 → **Rejeter**.

## Demo Data & Seeding

The restored dump is pruned to a clean **26-partner** Capgemini Tunisia portfolio (5 customers, 9 marketing, 6 suppliers, 6 universities). Two flagship partners are fully seeded for the demo:

| Flagship | Type | Partner ID | Score | Highlights |
| --- | --- | --- | --- | --- |
| **LangSmith** | Technology supplier | `184` | 90/100 | events, meetings, multi-quarter KPIs, projects, vendor projects, offers, RAG contract docs |
| **Polytech Intl** | Tunisian engineering university (EUR-ACE) | `187` | 90/100 | events, KPIs, 20 student recruitments (8 CDI conversions), accord-cadre RAG docs |

To rebuild the demo data on a fresh database, run (after restoring the dumps):

```bash
bun scripts/seed-langsmith-demo.js && bun scripts/seed-langsmith-rag.js
bun scripts/seed-polytech-demo.js && bun scripts/seed-polytech-rag.js
bun scripts/prune-catalog-partners.js   # optional: re-prune vendor-catalog noise
```

All seed/prune scripts are idempotent — safe to re-run.

## Troubleshooting

Problem: `role postgres does not exist`

Use your local PostgreSQL user instead:

```bash
psql -U $(whoami) -d postgres -c "SELECT 1;"
```

Problem: login returns `401`

Reset demo passwords:

```bash
bun scripts/reset-passwords.js
bun scripts/setup-partner-accounts.js
```

Problem: BI dashboard has no data

Restore or inspect the data warehouse:

```bash
psql -U your_pg_user -d dw_intelliconnect -c "SELECT COUNT(*) FROM dim_partner;"
psql -U your_pg_user -d dw_intelliconnect < scripts/db-dumps/dw_intelliconnect.sql
```

Problem: missing tables after restoring an older dump

Apply the additive migration:

```bash
psql -U your_pg_user -d capgemini_dev < scripts/db-dumps/migration-001-missing-tables.sql
```

Problem: AI agent errors

Check `OPENROUTER_KEY`, `OPENROUTER_MODEL_ID`, and the server logs. Optional RAG search also needs `VOYAGE_API_KEY`.

Problem: PostgreSQL connection refused

Start PostgreSQL:

```bash
brew services start postgresql@17
```

## AI Agent Demo Prompts

Use these prompts at `/dashboard/agent` to showcase the full system for the graduation demo. Each exercises multiple tools and produces charts, tables, and exportable reports.

There are **two flagship demo partners**, each seeded with rich, realistic, accurate data across every scoring dimension. Run both seed scripts once after restoring the database:

```bash
bun scripts/seed-langsmith-demo.js   # LangSmith — technology supplier (partner id 184)
bun scripts/seed-polytech-demo.js    # Polytech Intl — Tunisian engineering university (partner id 187)
```

Both score **90/100 (APPROUVER)** with all five dimensions populated, and both have RAG documents so the agent can cite real partnership clauses.

### 🏆 Mega showcase 1 — LangSmith (technology supplier)

```
Génère le rapport exécutif stratégique du partenaire LangSmith (fournisseur technologique) pour Capgemini Tunisia. Déclare d'abord ta méthodologie et ton plan d'analyse, puis : (1) score les 5 dimensions stratégiques de LangSmith — graphique en barres et tableau détaillé ; (2) répartition de son activité (événements, réunions, projets) en camembert ; (3) évolution trimestrielle des KPIs (interactions, revenus, satisfaction) en courbes ; (4) évalue le risque de churn avec signaux d'alerte et plan de rétention sur 30 jours ; (5) analyse la santé de ses projets ; (6) cite les obligations contractuelles et les conditions de renouvellement depuis nos documents. Termine par un rapport PDF exportable et une section ## Sources avec liens profonds vers les fiches concernées.
```

Expected output: methodology header → plan → bar chart + table (5 dimensions) → pie chart (activity) → line chart (quarterly KPIs) → churn risk + retention table → project health → document citations → `generateReport` card with **Télécharger PDF** button and deep links to `/dashboard/partners/184/scoring`.

### 🏆 Mega showcase 2 — Polytech Intl (Tunisian engineering university)

```
Génère le rapport exécutif stratégique du partenaire universitaire Polytechnique Internationale (Polytech Intl) pour Capgemini Tunisia. Déclare d'abord ta méthodologie et ton plan d'analyse, puis : (1) score les 5 dimensions stratégiques de Polytech Intl — graphique en barres et tableau détaillé ; (2) répartition de l'activité (événements, réunions, recrutements) en camembert ; (3) évolution trimestrielle des KPIs en courbes ; (4) analyse le pipeline de recrutement (stages, alternances, conversions CDI) avec un plan de rétention des talents ; (5) évalue le risque de churn du partenariat académique ; (6) cite les obligations de l'accord-cadre depuis nos documents. Termine par un rapport PDF exportable et une section ## Sources avec liens profonds vers les fiches concernées.
```

Expected output: methodology header → plan → bar chart + table (5 dimensions) → pie chart (activity) → line chart (quarterly KPIs) → recruitment pipeline + talent-retention table → academic churn risk → accord-cadre citations → `generateReport` card with **Télécharger PDF** button and deep links to `/dashboard/partners/187/scoring`. Polytech Intl is a real EUR-ACE-accredited Tunisian engineering school — ideal when the jury knows the institution.

### Portefeuille global (vue d'ensemble)

```
Génère le rapport exécutif complet du portefeuille partenaires Capgemini Tunisia : répartition par catégorie (camembert), top 5 partenaires par score stratégique (tableau + graphique en barres), top 3 à risque de churn avec plan de rétention, indicateurs budgétaires par catégorie, et recommandations stratégiques prioritaires. Finalise avec un rapport PDF exportable.
```

Expected output: pie chart → bar chart → table → churn risk bar chart → table → `generateReport` card with **Télécharger PDF** button.

### Scoring comparatif (3 partenaires)

```
Compare et score les partenaires LangSmith, BIAT et Microsoft Tunisie sur les 5 dimensions stratégiques. Affiche un tableau comparatif détaillé, un graphique en barres des scores, et dis-moi lequel renouveler en priorité avec justification.
```

### Risque de churn

```
Identifie les 3 partenaires les plus à risque de churn. Pour chacun : score de risque, 3 signaux d'alerte principaux, et plan de rétention concret sur 30 jours. Affiche un graphique des niveaux de risque et un tableau récapitulatif.
```

### Santé des projets

```
Analyse la santé de tous les projets actifs. Classe-les Rouge / Orange / Vert, affiche un tableau avec budget, avancement et retard, un graphique de distribution des statuts, et propose 3 actions correctives prioritaires pour les projets en rouge.
```

### Staffing intelligent

```
Pour le projet 1, identifie les 5 meilleurs profils internes Capgemini pour le staffing. Justifie chaque recommandation avec compétences clés, taux d'adéquation et disponibilité. Affiche un tableau comparatif et un graphique d'adéquation.
```

### Recherche documentaire (RAG)

```
Cherche dans nos documents partenaires : quelles sont les obligations contractuelles et les conditions de renouvellement du partenariat LangSmith ? Cite les extraits sources exacts et affiche un tableau récapitulatif des clauses clés.
```

### Report viewer flow

After the agent generates a report, click **Télécharger PDF** in the report card to download immediately, or **Rapport complet** to open `/dashboard/reports` for full editing, markdown copy, and PDF export.

## Documentation Policy

- Keep durable project documentation in this README.
- Keep agent rules and coding standards in AGENTS.md.
- Do not add scattered docs unless they are clearly generated artifacts or feature deliverables requested by the user.
- When docs drift from the running product, update them in the same change as the product fix.
