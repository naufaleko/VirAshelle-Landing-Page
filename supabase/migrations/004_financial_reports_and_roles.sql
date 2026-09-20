-- ============================================================
-- 004_financial_reports_and_roles.sql
-- Financial Reporting System (Cash In / Out / Debit / Credit)
-- Role-Based Access Control (C-Level, Marketing, Production, Admin)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Extend admin_users with Role-Based Access Control
-- ------------------------------------------------------------
ALTER TABLE public.admin_users 
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'staff',
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS display_alias TEXT;

-- Seed / Update Team Roles
INSERT INTO public.admin_users (email, role, name, display_alias)
VALUES
  ('admin@virashelle.com', 'superadmin', 'Master Admin', 'admin'),
  ('clevel@virashelle.com', 'c_level', 'Naufal Eko (Director)', 'clevel'),
  ('naufal@virashelle.com', 'c_level', 'Naufal Eko (Leader)', 'naufal'),
  ('jesica@virashelle.com', 'marketing', 'Jessica Same (Marketing)', 'jesica'),
  ('dixon@virashelle.com', 'production', 'Dixon (Lead Production)', 'dixon')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  display_alias = EXCLUDED.display_alias;

-- Helper to retrieve caller's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT role FROM public.admin_users WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) LIMIT 1),
    'guest'
  );
$$;

REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon;

-- Helper to check if caller is C-Level or Superadmin
CREATE OR REPLACE FUNCTION public.is_c_level_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      AND role IN ('c_level', 'superadmin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_c_level_or_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_c_level_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_c_level_or_admin() TO anon;

-- Helper to get full user profile of the caller
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'email', email,
    'role', role,
    'name', name,
    'display_alias', display_alias
  )
  FROM public.admin_users
  WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_my_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO anon;


-- ------------------------------------------------------------
-- 2. Financial Transactions Ledger Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type             TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category         TEXT NOT NULL,
  amount           NUMERIC(14,2) NOT NULL DEFAULT 0,
  account          TEXT NOT NULL DEFAULT 'BCA - VirAshelle Master',
  reference_no     TEXT,
  reference_id     UUID,
  description      TEXT NOT NULL DEFAULT '',
  attachment_url   TEXT,
  status           TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'reconciled')),
  created_by       TEXT NOT NULL DEFAULT (coalesce(auth.jwt() ->> 'email', 'system')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at
DROP TRIGGER IF EXISTS financial_transactions_updated_at ON public.financial_transactions;
CREATE TRIGGER financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Indexes for lightning-fast queries and filters
CREATE INDEX IF NOT EXISTS idx_fin_tx_date ON public.financial_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_fin_tx_type ON public.financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_fin_tx_category ON public.financial_transactions(category);
CREATE INDEX IF NOT EXISTS idx_fin_tx_created ON public.financial_transactions(created_at DESC);


-- ------------------------------------------------------------
-- 3. Row-Level Security Policies for Financial Ledger
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Whitelisted users can read financial transactions" ON public.financial_transactions;
CREATE POLICY "Whitelisted users can read financial transactions" ON public.financial_transactions
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Whitelisted users can insert financial transactions" ON public.financial_transactions;
CREATE POLICY "Whitelisted users can insert financial transactions" ON public.financial_transactions
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "C-level can update any, staff can update own" ON public.financial_transactions;
CREATE POLICY "C-level can update any, staff can update own" ON public.financial_transactions
  FOR UPDATE
  USING (
    public.is_c_level_or_admin() OR 
    lower(created_by) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  WITH CHECK (
    public.is_c_level_or_admin() OR 
    lower(created_by) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

DROP POLICY IF EXISTS "C-level can delete any, staff can delete own" ON public.financial_transactions;
CREATE POLICY "C-level can delete any, staff can delete own" ON public.financial_transactions
  FOR DELETE
  USING (
    public.is_c_level_or_admin() OR 
    lower(created_by) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

