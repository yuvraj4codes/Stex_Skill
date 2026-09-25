-- =============================================================
-- STEX — Initial Database Schema
-- Phase 2: Supabase PostgreSQL + RLS
-- =============================================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  email          TEXT NOT NULL,
  college        TEXT NOT NULL,
  course         TEXT NOT NULL,
  year_semester  TEXT NOT NULL,
  bio            TEXT,
  avatar_url     TEXT,
  availability   TEXT CHECK (availability IN ('Available', 'Busy', 'Weekends Only')),
  looking_for    TEXT CHECK (looking_for IN ('Learn', 'Teach', 'Find Teammates', 'Collaborate', 'All')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 2. SKILLS (global catalog)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skills (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  category   TEXT NOT NULL CHECK (category IN (
               'Programming', 'Web Development', 'Design',
               'Creative', 'Business', 'Other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 3. USER_SKILLS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_skills (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id         UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('TEACH', 'LEARN')),
  experience_level TEXT CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, skill_id, type)
);

-- ─────────────────────────────────────────────────────────────
-- 4. CONNECTIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.connections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  intro_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sender_id, receiver_id)
);

-- ─────────────────────────────────────────────────────────────
-- 5. MESSAGES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  attachment_url TEXT,
  is_read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 6. PROJECTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  team_size       INTEGER NOT NULL,
  current_members INTEGER NOT NULL DEFAULT 1,
  status          TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 7. PROJECT_SKILLS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_skills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  skill_id    UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  role_needed TEXT
);

-- ─────────────────────────────────────────────────────────────
-- 8. PROJECT_MEMBERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT,
  status     TEXT NOT NULL CHECK (status IN ('applied', 'accepted', 'rejected')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 9. REVIEWS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reviewer_id, reviewee_id)
);

-- ─────────────────────────────────────────────────────────────
-- 10. NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN (
               'connection_request', 'connection_accepted', 'new_message',
               'project_application', 'project_accepted', 'project_rejected',
               'project_invitation')),
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  link_url   TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 11. REPORTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'message', 'project')),
  target_id   UUID NOT NULL,
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id  ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_connections_sender   ON public.connections(sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender      ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver    ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at  ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_proj ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_skills  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports         ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles: authenticated can read all"
  ON public.profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "profiles: user can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: user can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- skills (read-only for users)
CREATE POLICY "skills: authenticated can read"
  ON public.skills FOR SELECT TO authenticated USING (TRUE);

-- user_skills
CREATE POLICY "user_skills: authenticated can read"
  ON public.user_skills FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "user_skills: user manages own insert"
  ON public.user_skills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_skills: user manages own update"
  ON public.user_skills FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_skills: user manages own delete"
  ON public.user_skills FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- connections
CREATE POLICY "connections: parties can read"
  ON public.connections FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "connections: sender can insert"
  ON public.connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "connections: parties can update"
  ON public.connections FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "connections: sender can delete"
  ON public.connections FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- messages
CREATE POLICY "messages: parties can read"
  ON public.messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages: sender can insert"
  ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages: parties can update is_read"
  ON public.messages FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- projects
CREATE POLICY "projects: authenticated can read"
  ON public.projects FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "projects: owner can insert"
  ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "projects: owner can update"
  ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "projects: owner can delete"
  ON public.projects FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- project_skills
CREATE POLICY "project_skills: authenticated can read"
  ON public.project_skills FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "project_skills: project owner can manage"
  ON public.project_skills FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_skills.project_id AND projects.owner_id = auth.uid()
  ));

-- project_members
CREATE POLICY "project_members: owner and member can read"
  ON public.project_members FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_members.project_id AND projects.owner_id = auth.uid())
  );
CREATE POLICY "project_members: user can apply"
  ON public.project_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "project_members: owner can update status"
  ON public.project_members FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects WHERE projects.id = project_members.project_id AND projects.owner_id = auth.uid()
  ));

-- reviews
CREATE POLICY "reviews: authenticated can read"
  ON public.reviews FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "reviews: reviewer can insert"
  ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "reviews: reviewer can update own"
  ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id);

-- notifications
CREATE POLICY "notifications: user reads own"
  ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications: user updates own"
  ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- reports (insert only; no read for users to protect reporter identity)
CREATE POLICY "reports: reporter can insert"
  ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- =============================================================
-- TRIGGER: auto-create profile row on sign-up
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, college, course, year_semester)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'college', ''),
    COALESCE(NEW.raw_user_meta_data->>'course', ''),
    COALESCE(NEW.raw_user_meta_data->>'year_semester', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- SEED: Default Skill Catalog
-- =============================================================
INSERT INTO public.skills (name, category) VALUES
  ('c',                  'Programming'),
  ('c++',                'Programming'),
  ('java',               'Programming'),
  ('python',             'Programming'),
  ('javascript',         'Programming'),
  ('typescript',         'Programming'),
  ('sql',                'Programming'),
  ('rust',               'Programming'),
  ('go',                 'Programming'),
  ('kotlin',             'Programming'),
  ('swift',              'Programming'),
  ('html',               'Web Development'),
  ('css',                'Web Development'),
  ('react',              'Web Development'),
  ('vue',                'Web Development'),
  ('angular',            'Web Development'),
  ('next.js',            'Web Development'),
  ('node.js',            'Web Development'),
  ('tailwind css',       'Web Development'),
  ('frontend',           'Web Development'),
  ('backend',            'Web Development'),
  ('rest api',           'Web Development'),
  ('graphql',            'Web Development'),
  ('ui/ux design',       'Design'),
  ('figma',              'Design'),
  ('adobe photoshop',    'Design'),
  ('illustrator',        'Design'),
  ('canva',              'Design'),
  ('wireframing',        'Design'),
  ('photography',        'Creative'),
  ('video editing',      'Creative'),
  ('animation',          'Creative'),
  ('blender',            'Creative'),
  ('sketching',          'Creative'),
  ('music',              'Creative'),
  ('marketing',          'Business'),
  ('entrepreneurship',   'Business'),
  ('finance',            'Business'),
  ('presentation',       'Business'),
  ('public speaking',    'Business'),
  ('project management', 'Business'),
  ('data analysis',      'Other'),
  ('machine learning',   'Other'),
  ('ai',                 'Other'),
  ('cybersecurity',      'Other'),
  ('networking',         'Other')
ON CONFLICT (name) DO NOTHING;
