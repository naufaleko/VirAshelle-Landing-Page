-- ============================================================
-- 002_admin_access.sql
-- Restrict admin writes to a whitelist of admin emails
-- ============================================================
--
-- WHAT THIS DOES
--   001_initial_schema.sql lets ANY authenticated user (auth.role() =
--   'authenticated') insert/update/delete site_content, projects,
--   project_updates and team_members. That means anyone who manages to sign
--   up (or otherwise obtain a session) gets full write access.
--
--   This migration replaces those policies with ones that only pass when the
--   caller's JWT email is listed in public.admin_users:
--     * public.admin_users      -- whitelist table (RLS on, no policies, so
--                                  clients can never read or write it)
--     * public.is_admin()       -- SECURITY DEFINER helper that checks the
--                                  caller's email against admin_users
--     * new "Admins can ..." policies on the four content tables
--
--   The public SELECT policy on site_content ("Public can read site content")
--   is left untouched -- the landing page needs it.
--
-- HOW TO APPLY
--   Option A: Supabase Dashboard > SQL Editor > paste this file > Run.
--   Option B: from the repo root with the Supabase CLI linked to the project:
--               supabase db push
--   The script is idempotent and safe to re-run.
--
-- HOW TO ADD ANOTHER ADMIN
--   1. Create the user in Supabase Dashboard > Authentication > Users
--      (the account must exist in Supabase Auth to be able to log in).
--   2. Whitelist the email:
--        INSERT INTO public.admin_users (email) VALUES ('someone@example.com')
--        ON CONFLICT DO NOTHING;
--   Remove a row from admin_users to revoke write access (the account can
--   still log in, but every write will be rejected by RLS).
--
-- REMINDER
--   1. Disable "Enable email signups" in Supabase Dashboard > Authentication >
--      Providers > Email so strangers cannot create accounts at all. This
--      migration protects the data even if signups are on, but there is no
--      reason to leave the door open.
--   2. ROTATE THE ADMIN PASSWORD. Earlier versions of this repo shipped the
--      admin@virashelle.com password inside the client JS bundle and it is
--      still present in git history. Anyone who saw it can log in as the
--      whitelisted admin, so this migration alone does not close that hole:
--      Supabase Dashboard > Authentication > Users > admin@virashelle.com >
--      Reset password (or "Send password recovery").
-- ============================================================


-- ------------------------------------------------------------
-- Admin whitelist table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  email      TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS on, no policies: nothing can read or write this table through the API.
-- Only the SECURITY DEFINER function below (and the service role) reads it.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- is_admin(): true when the caller's JWT email is whitelisted
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;


-- ------------------------------------------------------------
-- Seed the initial admin
-- ------------------------------------------------------------
INSERT INTO public.admin_users (email)
VALUES ('admin@virashelle.com')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------
-- site_content: public read stays, writes become admin-only
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can modify site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can modify site content" ON public.site_content;

CREATE POLICY "Admins can modify site content" ON public.site_content
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ------------------------------------------------------------
-- projects
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can do everything with projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can do everything with projects" ON public.projects;

CREATE POLICY "Admins can do everything with projects" ON public.projects
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ------------------------------------------------------------
-- project_updates
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can do everything with project updates" ON public.project_updates;
DROP POLICY IF EXISTS "Admins can do everything with project updates" ON public.project_updates;

CREATE POLICY "Admins can do everything with project updates" ON public.project_updates
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ------------------------------------------------------------
-- team_members
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can do everything with team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can do everything with team members" ON public.team_members;

CREATE POLICY "Admins can do everything with team members" ON public.team_members
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());
