# IntelliConnect — Capgemini Tunisia Partnership Management Platform

Next.js 16 full-stack app. PostgreSQL + Drizzle ORM. JWT auth. Bun runtime.
Master's degree final project — partnership lifecycle management with AI automation.


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
- capgemini_dev       — main app database (partners, employees, offers, etc.)
- dw_intelliconnect   — data warehouse for the BI dashboard (charts, analytics)

    psql -U your_pg_user -d postgres -c "CREATE DATABASE capgemini_dev;"
    psql -U your_pg_user -d postgres -c "CREATE DATABASE dw_intelliconnect;"

On macOS with Homebrew Postgres, your_pg_user is usually your macOS username.
On Linux, it's usually "postgres". Check with: psql -U postgres -c "SELECT 1;"

### 3. Restore the database dumps

Both dumps are bundled in the repo as plain SQL files:

    psql -U your_pg_user -d capgemini_dev < scripts/db-dumps/capgemini_dev.sql
    psql -U your_pg_user -d dw_intelliconnect < scripts/db-dumps/dw_intelliconnect.sql

Expected output: a few "NOTICE: table does not exist, skipping" on first run.
That's normal — the dump includes DROP IF EXISTS statements.

Verify it worked:

    psql -U your_pg_user -d capgemini_dev -c "SELECT COUNT(*) FROM partners;"
    -- should return 178

    psql -U your_pg_user -d dw_intelliconnect -c "SELECT COUNT(*) FROM dim_partner;"
    -- should return 30

### 4. Configure environment variables

    cp .env.example .env

Then edit .env with your values:

    DATABASE_URL="postgresql://your_pg_user@localhost:5432/capgemini_dev"
    DW_DATABASE_URL="postgresql://your_pg_user@localhost:5432/dw_intelliconnect"
    JWT_SECRET="paste_a_random_secret_here"
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    OPENROUTER_KEY=                    # optional — AI features
    GMAIL_USER=                        # optional — email notifications
    GMAIL_APP_PASSWORD=                # optional — Gmail app password

Generate a JWT secret:

    node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

### 5. Reset passwords (required after restoring dump)

The dump includes hashed passwords, but they may not match. Reset them:

    node scripts/reset-passwords.js
    node scripts/setup-partner-accounts.js

### 6. Start the dev server

    bun dev

Open http://localhost:3000. You're ready.


## Verify Everything Works

    Page                        What to check
    http://localhost:3000        Landing page loads
    /auth/sign-in               Login form renders
    /dashboard                  Login as employee, dashboard loads
    /dashboard/bi               BI charts show data (30 partners, 40 events, 35 projects)
    /partner                    Login as partner, portal loads

Quick API smoke test (after logging in):

    curl -s http://localhost:3000/api/partners | python3 -m json.tool | head -5


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

The app uses two separate PostgreSQL databases:

### Main Database (capgemini_dev) — OLTP

This is the live app database. Drizzle ORM manages the schema.

    partners                178 records — main partner table
    capgemini_employees       7 records — employee accounts + auth
    partner_contacts         30 records — contact persons per partner
    offers                   30 records — commercial offers
    partner_events           39 records — organized events
    partner_documents        — uploaded document metadata
    partner_meetings         — meeting logs
    partner_notifications    — notification + email history
    partner_status_history   — status change audit trail
    student_recruitments     — university recruitment tracking
    partnership_requests     — external partnership applications
    technology_partners      — supplier subtype data
    university_partners      — university subtype data
    vendor_projects          — supplier project records

### Data Warehouse (dw_intelliconnect) — BI Analytics

Separate database for the BI dashboard (/dashboard/bi). Uses raw pg pool, not Drizzle.

    dim_partner                    30 records — partner dimension (category, status, level)
    fact_partner_activity          30 records — revenue + satisfaction per partner
    fact_events                    40 records — event stats (participants, budget, revenue)
    fact_projects                  35 records — project value + satisfaction scores
    fact_university_recruitment    50 records — student recruitment + CDI conversions

The BI page queries these tables to render charts:
- Partners by category / status / level
- Top 10 revenue partners
- Event totals (5,545 participants, 1M TND budget)
- Project totals (35 projects, 16.5M TND value)
- Recruitment stats (50 students, 32 converted to CDI)


## AI Agent Capabilities

The AI layer automates five core partnership management functions:

1. Automated Partner Scoring — Analyzes new partnership applications (specialties,
   budget, volume, track record) and generates a compatibility score (0-100) with
   recommendation (APPROVE/REJECT/REVIEW) in ~2 seconds.

2. Document Generation — Creates professional partnership proposals (8-10 pages:
   introduction, objectives, terms, legal clauses) in ~15 seconds via GPT-4.
   Reduces manual effort from 8 hours to seconds.

3. Conversational Data Querying — NLP chatbot accepts natural French queries
   (e.g. "Show me university partners with conversion rate above 70%"), translates
   to SQL, executes against the database, returns formatted answers with context.

4. Churn Prediction — Analyzes historical data (satisfaction trends, interaction
   frequency, status changes) to predict at-risk partners, assigns risk scores,
   recommends proactive retention actions.

5. Smart Recommendations — Given Capgemini needs (e.g. "recruit 10 Cloud engineers"),
   suggests top 5 suitable partners using semantic similarity and embeddings.

Target: 70% manual workload reduction, 15% annual revenue growth through optimized partnerships.


## Architecture

    app/                    Next.js App Router
      api/                  30+ API routes (auth, partners, hr, bi, docs, etc.)
      auth/sign-in/         Login page
      dashboard/            Employee portal (17 pages)
      partner/              Partner portal (15 pages)
      (public pages)        solutions, success-stories, privacy, terms

    backend/
      auth/                 JWT (jose) + session management
      db/schema/            15+ Drizzle ORM tables
      db/migrations/        Versioned SQL migrations
      db/dw-config.ts       Data warehouse pg pool (BI)
      services/email.ts     Nodemailer (Gmail SMTP)

    frontend/
      components/ui/        25+ shadcn/ui components
      components/auth/      Login form, user menu
      components/dashboard/ Sidebar, partner form
      components/partner/   Partner sidebar

    scripts/
      db-dumps/             Bundled database dumps (git-tracked)
        capgemini_dev.sql     Main OLTP database
        dw_intelliconnect.sql Data warehouse for BI
      reset-passwords.js    Reset employee passwords
      setup-partner-accounts.js  Setup partner logins
      seed-dw.sql           DW schema + seed (source of truth for DW)


## Tech Stack

    Framework       Next.js 16.1.6 (App Router)
    Runtime         Bun
    Language        TypeScript (strict)
    UI              React 19, shadcn/ui, Radix UI
    Styling         Tailwind CSS v4
    Animations      Framer Motion
    Icons           Hugeicons
    ORM             Drizzle ORM
    Database        PostgreSQL 17
    Auth            JWT (jose) + bcryptjs
    Email           Nodemailer (Gmail SMTP)
    Theme           next-themes (light/dark)
    Notifications   Sonner (toast)


## Partner Categories

    customer    — Revenue, active projects, contracts
    marketing   — Campaigns, ROI, leads, conversions
    supplier    — Certifications, projects, SLA
    university  — Recruitment, conventions, internships


## API Routes

    Auth:       POST /api/auth/login, logout, GET /api/auth/me, POST /api/auth/change-password
    Partners:   GET/POST/PUT/DELETE /api/partners/*, /api/partners/manage/*, /api/partners/status
    Contacts:   GET/POST/DELETE /api/contacts
    Offers:     GET/POST/DELETE /api/offers
    Events:     GET/POST/DELETE /api/events
    Documents:  GET/POST/DELETE /api/documents, GET /api/documents/download
    Meetings:   GET/POST/DELETE /api/meetings
    Notifications: GET/POST/PATCH /api/notifications
    HR:         GET/PATCH /api/hr/employees, GET/POST/DELETE /api/hr/recruitments
    BI:         GET /api/bi (reads from DW database)
    Requests:   POST /api/partnership-requests


## Security

    - JWT httpOnly cookies (not localStorage)
    - bcrypt password hashing (cost 10)
    - Middleware route protection (/dashboard/*, /partner/*)
    - Role-based access control per API route
    - Server-side input validation
    - Secure file upload (type + size validation)


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
Fix: Make sure dw_intelliconnect database exists and is restored:
    psql -U your_pg_user -d dw_intelliconnect -c "SELECT COUNT(*) FROM dim_partner;"
    If 0 or error, re-run: psql -U your_pg_user -d dw_intelliconnect < scripts/db-dumps/dw_intelliconnect.sql

Problem: Login returns 401
Fix: Passwords may need resetting after dump restore:
    node scripts/reset-passwords.js
    node scripts/setup-partner-accounts.js

Problem: "ECONNREFUSED" on start
Fix: PostgreSQL is not running. Start it:
    brew services start postgresql@17    (macOS)
    sudo systemctl start postgresql      (Linux)
