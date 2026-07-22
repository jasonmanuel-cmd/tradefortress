-- ============================================================
-- COAI GRANT COMMAND CENTER — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- GRANTS TABLE — The inventory of all discovered grants
-- ============================================================
CREATE TABLE grants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  funder        TEXT NOT NULL,
  amount_min    NUMERIC,
  amount_max    NUMERIC,
  deadline      DATE,
  category      TEXT,                        -- 'tech', 'small_business', 'ai', 'community', etc.
  grant_type    TEXT,                        -- 'federal', 'state', 'foundation', 'corporate'
  location      TEXT,                        -- 'CA', 'National', 'Kern County', etc.
  description   TEXT,
  source_url    TEXT,
  requirements  TEXT,
  eligibility   TEXT,
  cfda_number   TEXT,                        -- Federal grants tracking number
  status        TEXT DEFAULT 'active',       -- 'active', 'expired', 'awarded'
  is_saved      BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPLICATIONS TABLE — Your pipeline tracker
-- ============================================================
CREATE TABLE applications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id      UUID REFERENCES grants(id) ON DELETE CASCADE,
  stage         INTEGER DEFAULT 1,           -- 1-12 pipeline stages
  stage_name    TEXT DEFAULT 'Interest',
  notes         TEXT,
  requested_amount NUMERIC,
  awarded_amount   NUMERIC,
  submitted_date   DATE,
  award_date       DATE,
  result        TEXT,                        -- 'pending', 'awarded', 'denied', 'withdrawn'
  priority      TEXT DEFAULT 'medium',       -- 'high', 'medium', 'low'
  assigned_to   TEXT DEFAULT 'Jason',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS TABLE — AI-generated proposals, LOIs, narratives
-- ============================================================
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  grant_id      UUID REFERENCES grants(id) ON DELETE SET NULL,
  doc_type      TEXT NOT NULL,               -- 'proposal', 'loi', 'budget', 'narrative', 'executive_summary'
  title         TEXT,
  content       TEXT,
  ai_generated  BOOLEAN DEFAULT true,
  version       INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNDERS TABLE — Foundation/funder intelligence
-- ============================================================
CREATE TABLE funders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  funder_type   TEXT,                        -- 'federal', 'state', 'foundation', 'corporate'
  website       TEXT,
  focus_areas   TEXT[],
  typical_amount_min NUMERIC,
  typical_amount_max NUMERIC,
  application_cycles TEXT,                   -- 'Rolling', 'Annual', 'Quarterly'
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STAGE DEFINITIONS — Pipeline stage names
-- ============================================================
CREATE TABLE pipeline_stages (
  stage_number  INTEGER PRIMARY KEY,
  stage_name    TEXT NOT NULL,
  description   TEXT,
  color         TEXT
);

INSERT INTO pipeline_stages (stage_number, stage_name, description, color) VALUES
  (1,  'Interest',    'Identified — evaluating fit',           '#6366F1'),
  (2,  'Eligible',    'Confirmed COAI qualifies',              '#8B5CF6'),
  (3,  'Calendar',    'Deadline tracked, timeline set',        '#F59E0B'),
  (4,  'Writing',     'Proposal in progress',                  '#3B82F6'),
  (5,  'Review',      'Internal review + refinement',          '#06B6D4'),
  (6,  'Final',       'Proposal finalized',                    '#10B981'),
  (7,  'Submitted',   'Application submitted',                 '#84CC16'),
  (8,  'Denied',      'Application denied — log learnings',    '#EF4444'),
  (9,  'Awarded',     'GRANT WON',                             '#F97316'),
  (10, 'Implement',   'Project execution underway',            '#14B8A6'),
  (11, 'Reporting',   'Progress/outcome reports due',          '#A855F7'),
  (12, 'Post Award',  'Grant cycle closed',                    '#64748B');

-- ============================================================
-- COAI PROFILE — Your static business context for AI writer
-- ============================================================
CREATE TABLE coai_profile (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_name    TEXT UNIQUE NOT NULL,
  field_value   TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO coai_profile (field_name, field_value) VALUES
  ('company_name',      'Chaotically Organized AI, LLC (COAI)'),
  ('ein',               'YOUR-EIN-HERE'),
  ('founded',           '2023'),
  ('location',          'Bakersfield, CA 93301 — 661 Market'),
  ('address',           '1712 19th St #216, Bakersfield, CA 93301'),
  ('mission',           'Delivering sovereign AI infrastructure, automation, and digital architecture to underserved local businesses in the Central Valley'),
  ('services',          'Custom web builds, AI automation, SEO/GEO/AEO, AI voice agents (Cipher), business process automation'),
  ('target_market',     'Local SMBs in Bakersfield/Kern County — trades, healthcare, cannabis, real estate, service businesses'),
  ('ceo',               'Jason Manuel'),
  ('employees',         '1-5'),
  ('business_type',     'LLC — Technology & AI Consulting'),
  ('naics_code',        '541511 — Custom Computer Programming Services'),
  ('certifications',    'Pending — Small Business, Minority-Owned'),
  ('annual_revenue',    'Under $500K'),
  ('website',           'coaibakersfield.com'),
  ('email',             'jason@coaibakersfield.com'),
  ('phone',             '661-569-4244');

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_grants_deadline ON grants(deadline);
CREATE INDEX idx_grants_category ON grants(category);
CREATE INDEX idx_grants_status ON grants(status);
CREATE INDEX idx_grants_type ON grants(grant_type);
CREATE INDEX idx_applications_stage ON applications(stage);
CREATE INDEX idx_applications_grant ON applications(grant_id);
CREATE INDEX idx_documents_application ON documents(application_id);

-- ============================================================
-- UPDATED_AT trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grants_updated_at BEFORE UPDATE ON grants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED: Sample grants to start your inventory
-- ============================================================
INSERT INTO grants (title, funder, amount_min, amount_max, deadline, category, grant_type, location, description, source_url) VALUES
  (
    'SBIR Phase I — AI & Machine Learning Applications',
    'U.S. Small Business Administration',
    50000, 275000,
    '2025-09-30',
    'ai',
    'federal',
    'National',
    'Funding for small businesses developing innovative AI/ML solutions with commercial potential.',
    'https://www.sbir.gov'
  ),
  (
    'California Competes Tax Credit',
    'Governor''s Office of Business & Economic Development',
    null, 500000,
    '2025-03-31',
    'small_business',
    'state',
    'CA',
    'Tax credits for businesses that want to come to California or stay and grow in California.',
    'https://business.ca.gov/california-competes-tax-credit/'
  ),
  (
    'Kern County Small Business Relief Grant',
    'Kern County Economic Development',
    5000, 25000,
    null,
    'small_business',
    'local',
    'Kern County',
    'Local relief and growth grants for Kern County small businesses.',
    'https://kernedcorp.com'
  );
