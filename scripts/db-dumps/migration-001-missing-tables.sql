-- Migration 001: Create tables that exist in Drizzle schema but were missing from the original dump.
-- Run against: capgemini_dev
-- Safe to re-run (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS partner_kpis (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  quarter INTEGER,
  month INTEGER,
  total_interactions INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_budget_spent INTEGER DEFAULT 0,
  total_interns INTEGER DEFAULT 0,
  total_apprentices INTEGER DEFAULT 0,
  total_hires INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  total_revenue_generated DECIMAL(18,2) DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  total_licenses_sold INTEGER DEFAULT 0,
  avg_satisfaction_score DECIMAL(5,2),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_partner_kpis_partner ON partner_kpis(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_kpis_period ON partner_kpis(year, quarter, month);

CREATE TABLE IF NOT EXISTS marketing_partners (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  marketing_type VARCHAR(100),
  leads_generated_per_year INTEGER,
  conversion_rate DECIMAL,
  annual_marketing_budget INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_marketing_partners_partner ON marketing_partners(partner_id);

CREATE TABLE IF NOT EXISTS client_partners (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  client_type VARCHAR(50),
  industry VARCHAR(100),
  annual_revenue BIGINT,
  num_active_projects INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_client_partners_partner ON client_partners(partner_id);

CREATE TABLE IF NOT EXISTS chat_threads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_type TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES chat_threads(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT,
  parts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
