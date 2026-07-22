-- ============================================================
-- v1.1 SECURITY MIGRATION — Row Level Security
-- Run this in Supabase SQL Editor AFTER schema.sql
--
-- WHY: Without RLS, your anon key (shipped in the browser)
-- grants full read/write to anyone with your app URL.
-- After this migration: only authenticated users can touch data.
-- ============================================================

-- 1) Enable RLS on all tables
ALTER TABLE grants          ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE funders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coai_profile    ENABLE ROW LEVEL SECURITY;

-- 2) Authenticated users get full access (single-operator system)
--    The service role key (server-side only) bypasses RLS automatically.

CREATE POLICY "auth_all_grants" ON grants
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_applications" ON applications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_documents" ON documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_funders" ON funders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_read_stages" ON pipeline_stages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_all_profile" ON coai_profile
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3) Anon role gets NOTHING. No policies for anon = no access.

-- ============================================================
-- 4) CREATE YOUR USER — do this in the Supabase Dashboard:
--    Authentication → Users → Add User → Create new user
--    Email: jason@coaibakersfield.com
--    Password: [strong password — store in your password manager]
--
--    Then DISABLE public signups:
--    Authentication → Providers → Email → toggle OFF "Enable Signups"
--    (Existing users can still log in; nobody new can register.)
-- ============================================================

-- Verification query — run after applying:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
-- All rows should show rowsecurity = true
