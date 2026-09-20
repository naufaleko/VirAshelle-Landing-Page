-- ============================================
-- MIGRATION 003: Invoices (Invoice Generator persistence)
-- ============================================
--
-- Purpose:
--   Persist invoices created in the admin Invoice Generator (/admin/invoice)
--   so they survive a page refresh and can be re-opened / edited later.
--   The full form state is stored as a JSONB blob in `data`; the scalar
--   columns (no_inv, client_name, payment_type, grand_total) are denormalised
--   copies used only for listing/searching without loading the blob.
--
--   NOTE: `data` may contain base64 data URLs for a custom logo/watermark
--   (a few hundred KB per row) when the user uploaded them.
--
-- Prerequisites:
--   * 001_initial_schema.sql  -> provides public.update_timestamp()
--   * 002_admin_access.sql    -> provides public.is_admin()
--   Apply 002 BEFORE this file, otherwise the policy below fails to create.
--
-- How to apply:
--   Supabase Dashboard -> SQL Editor -> paste & run this file, or
--   `supabase db push` / `supabase migration up` with the CLI.
--   The file is idempotent and safe to re-run.
-- ============================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no_inv       TEXT NOT NULL,
  client_name  TEXT NOT NULL DEFAULT '',
  payment_type TEXT NOT NULL DEFAULT 'dp',
  grand_total  NUMERIC(14,2) NOT NULL DEFAULT 0,
  data         JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security: admin-only (public.is_admin() comes from 002_admin_access.sql)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can do everything with invoices" ON public.invoices;
CREATE POLICY "Admins can do everything with invoices" ON public.invoices
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Auto-update updated_at (public.update_timestamp() comes from 001_initial_schema.sql)
DROP TRIGGER IF EXISTS invoices_updated_at ON public.invoices;
CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_created ON public.invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_updated ON public.invoices(updated_at DESC);
