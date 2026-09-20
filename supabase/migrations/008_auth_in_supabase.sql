-- ============================================================
-- 008_auth_in_supabase.sql
-- Login aliases move from the client bundle into admin_users, and the
-- debug function that exposed auth.users to the anon key is dropped.
--
-- Accounts themselves live in Supabase Auth and are managed only from the
-- Dashboard (Authentication -> Users: invite, reset password, delete).
-- Migrations 005 and 007 used to create/update those accounts with plaintext
-- passwords in SQL; they were applied once and have been removed from the
-- repo. Never recreate them: SQL files get committed, passwords must not.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Extra login IDs per account (display_alias stays the primary one)
-- ------------------------------------------------------------
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS login_aliases TEXT[] NOT NULL DEFAULT '{}';

-- Same IDs the client used to hard-code, now data. Edit this table to add
-- or rename an ID; the app needs no redeploy.
UPDATE public.admin_users SET login_aliases = ARRAY['virashelle'] WHERE lower(email) = 'admin@virashelle.com';
UPDATE public.admin_users SET login_aliases = ARRAY['jessica']    WHERE lower(email) = 'jesica@virashelle.com';

-- ------------------------------------------------------------
-- 2. resolve_login_id(): turn a typed ID into the Auth email
--
-- Called from the login form before there is a session, so it runs as anon.
-- It answers only "which email does this exact ID map to"; the password is
-- still verified by Supabase Auth. Anyone can probe IDs one at a time, which
-- is the same exposure a public email address has and far less than the
-- previous alias map that shipped every admin email inside the JS bundle.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_login_id(p_id text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM public.admin_users
  WHERE lower(email) = lower(trim(p_id))
     OR lower(coalesce(display_alias, '')) = lower(trim(p_id))
     OR lower(trim(p_id)) = ANY (login_aliases)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.resolve_login_id(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_login_id(text) TO anon;
GRANT EXECUTE ON FUNCTION public.resolve_login_id(text) TO authenticated;

-- ------------------------------------------------------------
-- 3. Remove the debug helper from 006_debug_auth.sql
--
-- It was SECURITY DEFINER over auth.users and auth.identities and granted to
-- anon, so any visitor holding the public anon key could read password
-- hashes and recovery tokens for any email. Drop it wherever it was applied.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.debug_auth_user(text);
