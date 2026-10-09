-- =============================================================
-- STEX — Phase 2 Security Fixes (Forward-Only Migration)
-- Migration: 003_phase2_security_fixes.sql
-- =============================================================
-- PURPOSE:
--   Resolves Phase 2 security-validation blockers without modifying
--   previously-applied migrations (001, 002).
--
-- PREREQUISITES:
--   001_initial_schema.sql                must already be applied.
--   002_phase2_security_hardening.sql     must already be applied.
--
-- VERIFY APPLIED MIGRATIONS (run in Supabase SQL Editor):
--   SELECT schemaname, tablename
--   FROM pg_tables WHERE schemaname = 'public';
--   -- Expect 11 tables: profiles, skills, user_skills, connections,
--   --   messages, projects, project_skills, project_members,
--   --   reviews, notifications, reports
--
--   SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
--   -- Expect: handle_new_user, is_blocked_between, are_users_connected,
--   --         handle_connection_update, handle_message_update,
--   --         handle_project_member_insert, handle_project_member_update,
--   --         get_my_profile
--
--   SELECT trigger_name, event_object_table
--   FROM information_schema.triggers
--   WHERE trigger_schema = 'public'
--   ORDER BY event_object_table, trigger_name;
--   -- Expect: on_auth_user_created (auth.users),
--   --         trg_validate_connection_update (connections),
--   --         trg_validate_message_update (messages),
--   --         trg_validate_project_member_insert (project_members),
--   --         trg_validate_project_member_update (project_members)
--
-- HOW TO APPLY:
--   Paste this entire file into Supabase Dashboard → SQL Editor → New Query.
--   Every DDL statement uses CREATE OR REPLACE, DROP IF EXISTS, or DO-block
--   guards so the script is safe to re-run.
-- =============================================================


-- =============================================================
-- FIX 1: PROFILE PRIVACY
-- =============================================================
-- PROBLEM (002 bug): GRANT SELECT ON public_profiles TO anon;
--   This allowed unauthenticated visitors to enumerate all student
--   profiles, violating the product requirement that discovery is
--   for authenticated students only.
--
-- FIX:
--   a) Revoke the anon grant on both the view and the base table.
--   b) Recreate the view explicitly without email.
--   c) Create a SECURITY DEFINER RPC function that authenticated
--      callers can use for discovery, bypassing the owner-only
--      RLS on profiles without leaking email.

REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.profiles FROM anon;

-- Recreate view (idempotent) — explicitly excludes email:
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  college,
  course,
  year_semester,
  bio,
  avatar_url,
  availability,
  looking_for,
  created_at
FROM public.profiles;

-- Grant ONLY to authenticated (anon already revoked above):
GRANT SELECT ON public.public_profiles TO authenticated;

-- SECURITY DEFINER function for profile discovery.
-- Authenticated callers get a safe projection of ALL profiles
-- (no email). Anonymous callers cannot execute this function.
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id            UUID,
  full_name     TEXT,
  college       TEXT,
  course        TEXT,
  year_semester TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  availability  TEXT,
  looking_for   TEXT,
  created_at    TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id,
    full_name,
    college,
    course,
    year_semester,
    bio,
    avatar_url,
    availability,
    looking_for,
    created_at
  FROM public.profiles;
$$;

GRANT  EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_profiles() FROM anon;


-- =============================================================
-- FIX 2: PROJECT MEMBER COUNT DEDUPLICATION & CORRECTNESS
-- =============================================================
-- PROBLEM:
--   a) A legacy placeholder function update_project_member_count()
--      may exist from early drafts — drop it to remove ambiguity.
--   b) 002's handle_project_member_update() did not handle the
--      accepted -> rejected correction path (count must decrement).
--   c) There was no trigger to decrement current_members when an
--      accepted member record is DELETED (e.g., member withdraws).
--   d) No CHECK constraint prevented current_members from exceeding
--      team_size at the database level.

-- a) Drop any leftover duplicate function (idempotent):
DROP FUNCTION IF EXISTS public.update_project_member_count() CASCADE;

-- b) Replace handle_project_member_update with correct logic:
--    • Owner convention: owner is NOT in project_members; projects.current_members
--      starts at 1 (the owner) per the DEFAULT in 001. Each accepted applicant +1.
--    • applied -> accepted : check current_members < team_size, then +1.
--    • applied -> rejected  : no count change.
--    • accepted -> rejected : decrement (data-correction path), never below 1.
CREATE OR REPLACE FUNCTION public.handle_project_member_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id        UUID;
  v_team_size       INT;
  v_current_members INT;
BEGIN
  SELECT owner_id, team_size, current_members
  INTO v_owner_id, v_team_size, v_current_members
  FROM public.projects
  WHERE id = OLD.project_id;

  -- Only project owner can approve or reject
  IF auth.uid() <> v_owner_id THEN
    RAISE EXCEPTION 'Only the project owner can approve or reject applications';
  END IF;

  -- Immutable fields
  IF NEW.project_id <> OLD.project_id OR NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'Cannot modify project or user on membership record';
  END IF;

  -- No-op when status unchanged
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- applied -> accepted: enforce team size limit and increment
  IF OLD.status = 'applied' AND NEW.status = 'accepted' THEN
    IF v_current_members >= v_team_size THEN
      RAISE EXCEPTION 'Project team is already full (% of % slots used)',
        v_current_members, v_team_size;
    END IF;
    UPDATE public.projects
    SET current_members = current_members + 1
    WHERE id = OLD.project_id;
    RETURN NEW;
  END IF;

  -- applied -> rejected: no count change
  IF OLD.status = 'applied' AND NEW.status = 'rejected' THEN
    RETURN NEW;
  END IF;

  -- accepted -> rejected: data-correction; decrement but keep >= 1 (owner)
  IF OLD.status = 'accepted' AND NEW.status = 'rejected' THEN
    UPDATE public.projects
    SET current_members = GREATEST(1, current_members - 1)
    WHERE id = OLD.project_id;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid project member status transition from % to %',
    OLD.status, NEW.status;
END;
$$;

-- Recreate the update trigger (DROP IF EXISTS first to avoid duplicate):
DROP TRIGGER IF EXISTS trg_validate_project_member_update ON public.project_members;
CREATE TRIGGER trg_validate_project_member_update
  BEFORE UPDATE ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_project_member_update();

-- c) Add AFTER DELETE trigger to handle member withdrawal or removal:
CREATE OR REPLACE FUNCTION public.handle_project_member_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only decrement if the member was accepted (applied/rejected never counted)
  IF OLD.status = 'accepted' THEN
    UPDATE public.projects
    SET current_members = GREATEST(1, current_members - 1)
    WHERE id = OLD.project_id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_project_member_delete ON public.project_members;
CREATE TRIGGER trg_on_project_member_delete
  AFTER DELETE ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_project_member_delete();

-- d) Add DB-level CHECK constraints (idempotent via DO block):
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.projects'::regclass
      AND conname  = 'chk_members_lte_team_size'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT chk_members_lte_team_size
      CHECK (current_members <= team_size);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.projects'::regclass
      AND conname  = 'chk_members_gte_one'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT chk_members_gte_one
      CHECK (current_members >= 1);
  END IF;
END;
$$;


-- =============================================================
-- VERIFICATION QUERIES (run after applying to confirm state)
-- =============================================================

-- 1. Confirm anon cannot SELECT public_profiles:
--      SET ROLE anon;
--      SELECT count(*) FROM public.public_profiles; -- must raise permission denied
--      RESET ROLE;

-- 2. Confirm authenticated user can call get_public_profiles():
--      SELECT count(*) FROM public.get_public_profiles();  -- returns row count, no email

-- 3. Confirm no duplicate triggers:
--      SELECT trigger_name, event_object_table, action_timing, event_manipulation
--      FROM information_schema.triggers WHERE trigger_schema='public'
--      ORDER BY event_object_table, trigger_name;

-- 4. Confirm CHECK constraints exist:
--      SELECT conname FROM pg_constraint
--      WHERE conrelid='public.projects'::regclass
--        AND contype='c';
--      -- Expect: chk_members_lte_team_size, chk_members_gte_one

-- 5. Confirm update_project_member_count is gone:
--      SELECT routine_name FROM information_schema.routines
--      WHERE routine_schema='public'
--        AND routine_name='update_project_member_count';
--      -- Expect: (0 rows)

-- =============================================================
-- END OF MIGRATION 003
-- =============================================================
