-- ============================================
-- SCHEMA: cms (Landing Page CMS)
-- ============================================

-- Single-row config table for all site content
CREATE TABLE IF NOT EXISTS public.site_content (
  id          TEXT PRIMARY KEY DEFAULT 'main',
  hero        JSONB NOT NULL DEFAULT '{}',
  about       JSONB NOT NULL DEFAULT '{}',
  services    JSONB NOT NULL DEFAULT '{}',
  why_us      JSONB NOT NULL DEFAULT '{}',
  workflow    JSONB NOT NULL DEFAULT '{}',
  portfolio   JSONB NOT NULL DEFAULT '{}',
  milestone   JSONB NOT NULL DEFAULT '{}',
  key_people  JSONB NOT NULL DEFAULT '[]',
  clients     JSONB NOT NULL DEFAULT '{}',
  header      JSONB NOT NULL DEFAULT '{}',
  footer      JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public website)
CREATE POLICY "Public can read site content" ON public.site_content
  FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can modify site content" ON public.site_content
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Enable realtime for site_content
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;

-- Insert default row
INSERT INTO public.site_content (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INTERNAL: Project Tracking & Management
-- ============================================

-- Project status enum
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM (
    'briefing', 'concept', 'production', 'review', 'completed', 'on_hold'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_priority AS ENUM (
    'low', 'medium', 'high', 'urgent'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  client        TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT '',
  status        project_status NOT NULL DEFAULT 'briefing',
  priority      project_priority NOT NULL DEFAULT 'medium',
  description   TEXT DEFAULT '',
  start_date    DATE,
  deadline      DATE,
  completed_at  TIMESTAMPTZ,
  progress      INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  team          TEXT[] DEFAULT '{}',
  budget        NUMERIC(12,2),
  tags          TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything with projects" ON public.projects
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Project Updates / Timeline
CREATE TABLE IF NOT EXISTS public.project_updates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  author      TEXT NOT NULL DEFAULT '',
  old_status  project_status,
  new_status  project_status,
  progress    INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything with project updates" ON public.project_updates
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

ALTER PUBLICATION supabase_realtime ADD TABLE public.project_updates;

-- Team Members (for dropdown references)
CREATE TABLE IF NOT EXISTS public.team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT '',
  email      TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything with team members" ON public.team_members
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON public.projects(deadline);
CREATE INDEX IF NOT EXISTS idx_project_updates_project ON public.project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_created ON public.project_updates(created_at DESC);

-- Insert initial team members
INSERT INTO public.team_members (name, role, email) VALUES
  ('Naufal Eko', 'Leader', 'virashelle@gmail.com'),
  ('Dixon', 'Production', null),
  ('Jessica Same', 'Marketing', null)
ON CONFLICT DO NOTHING;

