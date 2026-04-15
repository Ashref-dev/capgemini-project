# IntelliConnect -- Capgemini Tunisia Partnership Management Platform

Next.js 16 full-stack app. PostgreSQL + Drizzle ORM. JWT auth. Bun runtime.
Master's degree final project -- partnership lifecycle management with AI automation.


## Prerequisites

    Bun           1.0+    https://bun.sh
    PostgreSQL    15+     https://www.postgresql.org/download/
    Node.js       18+     (bundled with Bun)


## Local Dev Setup (step by step)

### 1. Clone and install

    git clone https://github.com/Ashref-dev/capgemini-project.git
    cd capgemini-project
    bun install

### 2. Create two local PostgreSQL databases

The app uses two databases:
- capgemini_dev       -- main app database (partners, employees, offers, etc.)
- dw_intelliconnect   -- data warehouse for the BI dashboard (charts, analytics)

    psql -U your_pg_user -d postgres -c "CREATE DATABASE capgemini_dev;"
    psql -U your_pg_user -d postgres -c "CREATE DATABASE dw_intelliconnect;"

On macOS with Homebrew Postgres, your_pg_user is usually your macOS username.
On Linux, it is usually "postgres". Check with: psql -U postgres -c "SELECT 1;"

### 3. Restore the database dumps

Both dumps are bundled in the repo as plain SQL files.

    psql -U your_pg_user -d capgemini_dev < scripts/db-dumps/capgemini_dev.sql
    psql -U your_pg_user -d dw_intelliconnect < scripts/db-dumps/dw_intelliconnect.sql

Expected output: a few "NOTICE: table does not exist, skipping" on first run.
That is normal -- the dump includes DROP IF EXISTS statements.

### 4. Run migrations (if needed)

If you restored the latest dump, all 19 tables + 5 DW tables are already present.
If you restored an older dump, run the migration to add missing tables:

    psql -U your_pg_user -d capgemini_dev < scripts/db-dumps/migration-001-missing-tables.sql

Verify all tables exist (should return 19 rows):

    psql -U your_pg_user -d capgemini_dev -c "\dt public.*"

Expected tables:

    capgemini_employees        partners                  partner_kpis
    chat_threads               partner_contacts          marketing_partners
    chat_messages              partner_documents         client_partners
    offers                     partner_events            partnership_requests
    partner_meetings           partner_notifications     student_recruitments
    partner_status_history     technology_partners       university_partners
    vendor_projects

### 5. Configure environment variables

    cp .env.example .env

Edit .env with your values:

    DATABASE_URL="postgresql://your_pg_user@localhost:5432/capgemini_dev"
    DW_DATABASE_URL="postgresql://your_pg_user@localhost:5432/dw_intelliconnect"
    JWT_SECRET="paste_a_random_secret_here"
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    OPENROUTER_KEY=sk-or-v1-...       # required for AI agent
    GMAIL_USER=                        # optional -- email notifications
    GMAIL_APP_PASSWORD=                # optional -- Gmail app password

Generate a JWT secret:

    node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

Get an OpenRouter API key (free tier available):

    https://openrouter.ai/settings/keys

### 6. Reset passwords (required after restoring dump)

The dump includes hashed passwords but they may not match the expected values.

    node scripts/reset-passwords.js
    node scripts/setup-partner-accounts.js

### 7. Start the dev server

    bun dev

Open http://localhost:3000.


## Verify Everything Works

    Page                            What to check
    http://localhost:3000            Landing page loads
    /auth/sign-in                   Login form renders
    /dashboard                      Employee dashboard loads after login
    /dashboard/agent                AI agent chat page with thread sidebar
    /dashboard/bi                   BI charts show real data
    /dashboard/partners/1/scoring   Partner scoring radar chart
    /dashboard/reports              Report viewer + PDF export
    /dashboard/demo                 Live demo tour page
    /dashboard/benchmark            AI vs Manual comparison
    /partner                        Partner portal loads after partner login


## Test Accounts

### Capgemini Employees (password: Capgemini2024!)

    #  Name               Email                            Role
    1  Karim Mejri         karim.mejri@capgemini.com        Manager
    2  Leila Ben Ali       leila.benali@capgemini.com       Commercial
    3  Ahmed Gharbi        ahmed.gharbi@capgemini.com       Commercial
    4  Nadia Haddad        nadia.haddad@capgemini.com       Analyst
    5  Sami Trabelsi       sami.trabelsi@capgemini.com      Manager
    6  Mouna Baccar        mouna.baccar@capgemini.com       RH
    7  Khaled Maatoug      khaled.maatoug@capgemini.com     Admin

### Partners (password: Partner2024!)

    Category    Partner              Email
    University  ESPRIT               partenariats@esprit.tn
    University  INSAT                relations-entreprises@insat.rnu.tn
    Customer    BIAT                 relationsclient@biat.tn
    Customer    Amen Bank            contact@amenbank.tn
    Marketing   Pluxee Tunisie       contact@pluxee.tn
    Marketing   Orange Tunisie       partenariat@orange.tn
    Supplier    Microsoft Tunisie    partenariats@microsoft.tn
    Supplier    Dell Tunisia         ventes@dell.tn


## Database Architecture

The app uses two separate PostgreSQL databases.

### Main Database (capgemini_dev) -- 19 tables

Drizzle ORM manages the schema. All tables are defined in backend/db/schema/.

    Table                     Records  Purpose
    partners                  178      Main partner table (all categories)
    capgemini_employees         7      Employee accounts + auth
    partner_contacts           30      Contact persons per partner
    offers                     30      Commercial offers
    partner_events             39      Organized events
    partner_documents          --      Uploaded document metadata
    partner_meetings           --      Meeting logs
    partner_notifications      --      Notification + email history
    partner_status_history     --      Status change audit trail
    student_recruitments       --      University recruitment tracking
    partnership_requests       --      External partnership applications
    technology_partners        --      Supplier subtype data
    university_partners        --      University subtype data
    client_partners            --      Customer subtype data
    marketing_partners         --      Marketing subtype data
    vendor_projects            --      Supplier project records
    partner_kpis               --      Pre-computed KPI snapshots
    chat_threads               --      AI agent conversation threads
    chat_messages              --      AI agent messages (persistent)

### Data Warehouse (dw_intelliconnect) -- 5 tables

Separate database for the BI dashboard. Uses raw pg pool, not Drizzle.

    dim_partner                    30 records
    fact_partner_activity          30 records
    fact_events                    40 records
    fact_projects                  35 records
    fact_university_recruitment    50 records


## AI Agent

The AI agent is a ReAct-style tool-calling chatbot at /dashboard/agent.
Model: NVIDIA Nemotron 3 Super (free via OpenRouter).
Streaming: Vercel AI SDK v6 with server-sent events.
Persistence: Chat threads and messages stored in PostgreSQL.

### Agent Tools (13+)

    Tool                    Purpose
    queryPartners           Fuzzy search + filter partners by name, category, status, level
    queryAnalytics          Query DW for BI metrics (7 pre-built queries)
    getPartnerDetails       Full partner profile with subtype data, contacts, events, KPIs
    scorePartner            0-100 scoring across 5 dimensions with APPROVE/REVIEW/REJECT
    predictChurn            Risk analysis with factors and retention recommendations
    recommendPartners       Top N partner suggestions for a given need
    generateReport          Markdown report generation (6 topics) with PDF export
    summarizePartnerPortfolio  Aggregate portfolio stats by category
    searchPartners          Text search across partner names and descriptions
    createBarChart          Bar chart visualization (rendered by UI)
    createLineChart         Line chart visualization
    createPieChart          Pie/donut chart visualization
    createTable             Interactive table with sort, search, export


## Key Features

### Partner Scoring Explainability (/dashboard/partners/[id]/scoring)

Visual breakdown of AI partner scoring with:
- Radar chart showing 5 dimensions (budget, satisfaction, activity, track record, strategic fit)
- Animated score circle with color-coded recommendation
- Dimension cards with progress bars and contributing signals

### Report Generation (/dashboard/reports)

- AI generates markdown reports on 6 topics (partner overview, revenue, churn, etc.)
- Preview rendered markdown with tables and formatting
- Edit raw markdown before export
- One-click PDF export via html2pdf.js

### Live Demo Mode (/dashboard/demo)

- Interactive guided tour using driver.js
- Feature card grid with platform overview
- Quick stats row with real metrics

### AI vs Manual Benchmark (/dashboard/benchmark)

- Side-by-side comparison table (manual time vs AI time)
- Animated counter cards (99.7% reduction, 178 partners, etc.)
- ROI calculator (887.5 hours saved per year)


## Architecture

    app/                    Next.js App Router (72 routes)
      api/                  35+ API routes
        auth/               Login, logout, me, change-password
        chat/               AI agent streaming + thread management
        partners/           CRUD + scoring + manage + status
        bi/                 BI dashboard data (DW queries)
        hr/                 Employees + recruitments
        ...
      dashboard/            Employee portal (22 pages)
        agent/              AI chat with thread history
        bi/                 BI analytics dashboard
        benchmark/          AI vs Manual comparison
        demo/               Live guided tour
        partners/           Partner list, detail, scoring
        reports/            Report viewer + PDF export
        ...
      partner/              Partner portal (15 pages)
      (public)              Landing, solutions, success-stories, privacy, terms

    backend/
      auth/                 JWT (jose) + session management
      db/schema/            19 Drizzle ORM tables
      db/dw-config.ts       Data warehouse pg pool
      services/scoring.ts   Partner scoring engine (shared)
      services/email.ts     Nodemailer (Gmail SMTP)

    frontend/
      components/ui/        27 shadcn/ui components (incl. chart, table)
      components/agent/     7 agent components (charts, table, message, report)
      components/dashboard/ Sidebar, partner form, tour controller
      components/partner/   Partner sidebar
      hooks/use-auth.ts     Auth hook
      lib/utils.ts          Utility functions

    scripts/
      db-dumps/             Database dumps (git-tracked)
        capgemini_dev.sql     Main DB (19 tables, 178 partners)
        dw_intelliconnect.sql DW (5 tables, 30 dim + 175 facts)
        migration-001-missing-tables.sql  Additive migration
      seed-dw.sql           DW schema + seed data source
      reset-passwords.js    Reset employee passwords
      setup-partner-accounts.js  Reset partner passwords


## Tech Stack

    Framework       Next.js 16.1.6 (App Router)
    Runtime         Bun
    Language        TypeScript (strict)
    UI              React 19, shadcn/ui, Radix UI
    Styling         Tailwind CSS v4
    Animations      Framer Motion
    Icons           Hugeicons
    Charts          Recharts (bar, line, pie, radar)
    ORM             Drizzle ORM
    Database        PostgreSQL 17
    Auth            JWT (jose) + bcryptjs
    AI              Vercel AI SDK v6 + OpenRouter
    AI Model        nvidia/nemotron-3-super-120b-a12b (free)
    Guided Tour     driver.js
    PDF Export      html2pdf.js
    Markdown        react-markdown + remark-gfm
    Email           Nodemailer (Gmail SMTP)
    Theme           next-themes (light/dark)
    Notifications   Sonner (toast)


## API Routes

    Auth:
      POST /api/auth/login
      POST /api/auth/logout
      GET  /api/auth/me
      POST /api/auth/change-password

    AI Agent:
      POST /api/chat                           Stream chat with tools
      GET  /api/chat/threads                   List user threads
      GET  /api/chat/threads/[threadId]        Load thread messages
      DELETE /api/chat/threads                 Delete a thread

    Partners:
      GET    /api/partners                     List all partners
      POST   /api/partners                     Create partner
      GET    /api/partners/manage               List managed partners
      PUT    /api/partners/manage/[id]         Update partner
      DELETE /api/partners/manage/[id]         Delete partner
      POST   /api/partners/status               Update partner status
      POST   /api/partners/negotiate            Negotiate partner
      GET    /api/partners/[id]/score           Score a partner (explainability)

    Contacts:    GET/POST/DELETE /api/contacts
    Offers:      GET/POST/DELETE /api/offers
    Events:      GET/POST/DELETE /api/events
    Documents:   GET/POST/DELETE /api/documents, GET /api/documents/download
    Meetings:    GET/POST/DELETE /api/meetings
    Notifications: GET/POST/PATCH /api/notifications
    HR:          GET/PATCH /api/hr/employees, GET/POST/DELETE /api/hr/recruitments
    BI:          GET /api/bi
    Requests:    POST /api/partnership-requests


## Security

    JWT httpOnly cookies (not localStorage)
    bcrypt password hashing (cost 10)
    Middleware route protection (/dashboard/*, /partner/*)
    Role-based access control per API route
    Server-side input validation
    Secure file upload (type + size validation)


## Scripts Reference

    node scripts/reset-passwords.js           Reset employee passwords to Capgemini2024!
    node scripts/setup-partner-accounts.js    Reset partner passwords to Partner2024!
    node scripts/check-tables.js              List all DB tables
    node scripts/explore-db.js                Inspect DB structure + sample data
    bun run db:generate                       Generate Drizzle migrations
    bun run db:migrate                        Run Drizzle migrations
    bun run db:studio                         Open Drizzle Studio (visual DB browser)


## Troubleshooting

Problem: "role postgres does not exist"
Fix: Use your macOS username instead: psql -U $(whoami) -d postgres

Problem: BI dashboard shows "Donnees indisponibles"
Fix: Make sure dw_intelliconnect database exists and is restored.
    psql -U your_pg_user -d dw_intelliconnect -c "SELECT COUNT(*) FROM dim_partner;"
    If 0 or error: psql -U your_pg_user -d dw_intelliconnect < scripts/db-dumps/dw_intelliconnect.sql

Problem: Login returns 401
Fix: Passwords need resetting after dump restore.
    node scripts/reset-passwords.js
    node scripts/setup-partner-accounts.js

Problem: AI agent returns errors
Fix: Check that OPENROUTER_KEY is set in .env with a valid key.
    Get one at https://openrouter.ai/settings/keys (free tier available).

Problem: "ECONNREFUSED" on start
Fix: PostgreSQL is not running.
    brew services start postgresql@17    (macOS)
    sudo systemctl start postgresql      (Linux)

Problem: Missing tables (partner_kpis, marketing_partners, client_partners, chat_*)
Fix: Run the additive migration.
    psql -U your_pg_user -d capgemini_dev < scripts/db-dumps/migration-001-missing-tables.sql
