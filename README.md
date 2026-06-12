# IntelliConnect

IntelliConnect is a Capgemini Tunisia partnership management platform built as a master's degree final internship project in software engineering, with an applied AI focus. The product manages the partnership lifecycle across public applications, employee operations, partner self-service, analytics, and AI-assisted decision support.

The repository documentation is intentionally centralized here. Agent-specific engineering rules live in [AGENTS.md](/Users/mohamedashrefbenabdallah/Sideprojects/capgemini/AGENTS.md).

## Product Scope

IntelliConnect has three main surfaces:

| Surface | Path | Purpose |
| --- | --- | --- |
| Public website | `/`, `/solutions`, `/success-stories`, `/success-stories/apply` | Present Capgemini partnership value and collect partnership requests. |
| Employee portal | `/dashboard` | Manage partners, contacts, offers, events, documents, status history, HR workflows, BI, reports, and the AI agent. |
| Partner portal | `/partner` | Give external partners access to their dashboard, offers, events, documents, notifications, profile, contacts, statistics, recruitments, or supplier projects. |

Important product rule: source code, comments, commit messages, and documentation are written in English. User-facing web application UI copy is written in French.

## Core Features

- Partner lifecycle management across customer, marketing, supplier, and university partners.
- Partner contacts, offers, events, meetings, documents, notifications, and status history.
- Public partnership requests with employee review, acceptance, rejection, and optional email notification.
- Employee role-based portal for admin, manager, commercial, analyst, and HR users.
- Partner self-service portal with category-specific navigation and workflows.
- BI dashboard backed by a separate data warehouse database.
- AI agent for partner search, analytics, scoring, churn risk, recommendations, report generation, and visual tool results.
- Report generation with markdown preview and PDF export.
- Guided demo and AI-vs-manual benchmark screens for presentation use.

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

scripts/                     Database, seed, migration, smoke-test, and maintenance scripts
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
bun dev                         # Start the development server
bun run build                   # Production build
bun run lint                    # ESLint
bun run evals                   # AI agent eval dataset
bun run db:generate             # Generate Drizzle migrations
bun run db:migrate              # Apply Drizzle migrations
bun run db:studio               # Open Drizzle Studio
bun scripts/check-tables.js     # Inspect main DB tables
bun scripts/explore-db.js       # Inspect DB structure and samples
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

## AI Agent Scope

The AI agent is a read-oriented assistant for partnership intelligence. It should:

- Query real database-backed data.
- Use typed AI SDK tools with Zod `inputSchema`.
- Stream UI messages with `toUIMessageStreamResponse()`.
- Include useful visual tool results such as charts or tables when appropriate.
- Persist chat threads and messages.
- Handle tool errors gracefully in French user-facing copy.
- Avoid exposing raw SQL, stack traces, or database errors to users.
- Avoid modifying data unless the workflow has explicit product approval.

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

## Documentation Policy

- Keep durable project documentation in this README.
- Keep agent rules and coding standards in AGENTS.md.
- Do not add scattered docs unless they are clearly generated artifacts or feature deliverables requested by the user.
- When docs drift from the running product, update them in the same change as the product fix.
