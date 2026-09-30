-- =============================================================
-- STEX — Phase 2 Security Hardening Migration
-- =============================================================
-- Fixes:
-- 1. Message Authorization (accepted connection required, no self-messages, no messaging blocked users)
-- 2. Connection Lifecycle (no self-connections, pairwise uniqueness, state transitions: pending -> accepted/rejected by recipient only)
-- 3. Blocking Enforcement (cannot message, send requests, or apply to projects when blocked; cannot unblock/delete to bypass block)
-- 4. Message Updates (immutable sender, receiver, content, attachments; only recipient can update is_read)
-- 5. Profile Privacy (public_profiles view without email; profiles table locked to owner read only)
-- 6. Project Membership Authorization (cannot self-accept, applications start as 'applied', only owner can accept/reject)
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. HELPER SECURITY FUNCTIONS
-- ─────────────────────────────────────────────────────────────

-- Check if a blocking relationship exists between two users in either direction
CREATE OR REPLACE FUNCTION public.is_blocked_between(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'blocked'
      AND (
        (sender_id = user_a AND receiver_id = user_b) OR
        (sender_id = user_b AND receiver_id = user_a)
      )
  );
$$;

-- Check if two users have an active accepted connection and are not blocked
CREATE OR REPLACE FUNCTION public.are_users_connected(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
      AND (
        (sender_id = user_a AND receiver_id = user_b) OR
        (sender_id = user_b AND receiver_id = user_a)
      )
  ) AND NOT public.is_blocked_between(user_a, user_b);
$$;

-- ─────────────────────────────────────────────────────────────
-- 2. CONNECTIONS HARDENING
-- ─────────────────────────────────────────────────────────────

-- Prevent self-connection constraint
ALTER TABLE public.connections
  DROP CONSTRAINT IF EXISTS check_connections_no_self;
ALTER TABLE public.connections
  ADD CONSTRAINT check_connections_no_self CHECK (sender_id <> receiver_id);

-- Enforce pairwise uniqueness (user A and user B can only have at most one relationship record)
CREATE UNIQUE INDEX IF NOT EXISTS idx_connections_pairwise
  ON public.connections (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id));

-- Trigger: Enforce valid connection lifecycle and unauthorized status changes
CREATE OR REPLACE FUNCTION public.handle_connection_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent altering immutable fields
  IF NEW.sender_id <> OLD.sender_id OR NEW.receiver_id <> OLD.receiver_id THEN
    RAISE EXCEPTION 'Cannot modify connection participants';
  END IF;

  IF NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Cannot modify connection creation time';
  END IF;

  -- Allow update if status is unchanged
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- Lifecycle transition: pending -> accepted (ONLY recipient can accept)
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    IF auth.uid() <> OLD.receiver_id THEN
      RAISE EXCEPTION 'Only the recipient can accept a connection request';
    END IF;
    RETURN NEW;
  END IF;

  -- Lifecycle transition: pending -> rejected (ONLY recipient can reject)
  IF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    IF auth.uid() <> OLD.receiver_id THEN
      RAISE EXCEPTION 'Only the recipient can reject a connection request';
    END IF;
    RETURN NEW;
  END IF;

  -- Transition: any state -> blocked (either participant can block)
  IF NEW.status = 'blocked' THEN
    IF auth.uid() <> OLD.sender_id AND auth.uid() <> OLD.receiver_id THEN
      RAISE EXCEPTION 'Unauthorized to block connection';
    END IF;
    RETURN NEW;
  END IF;

  -- Blocked state cannot be arbitrarily transitioned out of by regular update
  IF OLD.status = 'blocked' THEN
    RAISE EXCEPTION 'Cannot modify status of a blocked relationship';
  END IF;

  -- Disallow all other invalid transitions (e.g., rejected -> accepted, accepted -> pending)
  RAISE EXCEPTION 'Invalid connection status transition from % to %', OLD.status, NEW.status;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_connection_update ON public.connections;
CREATE TRIGGER trg_validate_connection_update
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_connection_update();

-- Update Connections RLS Policies
DROP POLICY IF EXISTS "connections: sender can insert" ON public.connections;
CREATE POLICY "connections: sender can insert"
  ON public.connections FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_id <> receiver_id
    AND status IN ('pending', 'blocked')
    AND NOT public.is_blocked_between(sender_id, receiver_id)
  );

DROP POLICY IF EXISTS "connections: parties can update" ON public.connections;
CREATE POLICY "connections: parties can update"
  ON public.connections FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "connections: sender can delete" ON public.connections;
DROP POLICY IF EXISTS "connections: parties can delete non-blocked" ON public.connections;
CREATE POLICY "connections: parties can delete non-blocked"
  ON public.connections FOR DELETE TO authenticated
  USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND status <> 'blocked'
  );

-- ─────────────────────────────────────────────────────────────
-- 3. MESSAGES HARDENING
-- ─────────────────────────────────────────────────────────────

-- Prevent self-messaging constraint
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS check_messages_no_self;
ALTER TABLE public.messages
  ADD CONSTRAINT check_messages_no_self CHECK (sender_id <> receiver_id);

-- Enforce message authorization: sender must have accepted connection and not be blocked
DROP POLICY IF EXISTS "messages: sender can insert" ON public.messages;
DROP POLICY IF EXISTS "messages: authorized sender can insert" ON public.messages;
CREATE POLICY "messages: authorized sender can insert"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_id <> receiver_id
    AND public.are_users_connected(sender_id, receiver_id)
    AND NOT public.is_blocked_between(sender_id, receiver_id)
  );

-- Message SELECT policy: cannot read messages if blocked
DROP POLICY IF EXISTS "messages: parties can read" ON public.messages;
DROP POLICY IF EXISTS "messages: authorized parties can read" ON public.messages;
CREATE POLICY "messages: authorized parties can read"
  ON public.messages FOR SELECT TO authenticated
  USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND NOT public.is_blocked_between(sender_id, receiver_id)
  );

-- Trigger: Make message sender, receiver, content, attachments, and timestamps immutable
CREATE OR REPLACE FUNCTION public.handle_message_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'Cannot modify message ID';
  END IF;

  IF NEW.sender_id <> OLD.sender_id OR NEW.receiver_id <> OLD.receiver_id THEN
    RAISE EXCEPTION 'Cannot modify message sender or recipient';
  END IF;

  IF NEW.content <> OLD.content THEN
    RAISE EXCEPTION 'Cannot modify message content';
  END IF;

  IF NEW.attachment_url IS DISTINCT FROM OLD.attachment_url THEN
    RAISE EXCEPTION 'Cannot modify message attachments';
  END IF;

  IF NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Cannot modify message creation timestamp';
  END IF;

  -- Only receiver can update is_read
  IF NEW.is_read <> OLD.is_read THEN
    IF auth.uid() <> OLD.receiver_id THEN
      RAISE EXCEPTION 'Only the recipient can mark a message as read';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_message_update ON public.messages;
CREATE TRIGGER trg_validate_message_update
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_message_update();

-- Message UPDATE policy: only recipient can update is_read
DROP POLICY IF EXISTS "messages: parties can update is_read" ON public.messages;
DROP POLICY IF EXISTS "messages: receiver can update is_read" ON public.messages;
CREATE POLICY "messages: receiver can update is_read"
  ON public.messages FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- ─────────────────────────────────────────────────────────────
-- 4. PROFILE PRIVACY HARDENING
-- ─────────────────────────────────────────────────────────────

-- Create public_profiles view without exposing email addresses
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

GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Lock down direct SELECT on public.profiles to only the owner
DROP POLICY IF EXISTS "profiles: authenticated can read all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: user can view own profile" ON public.profiles;
CREATE POLICY "profiles: user can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Secure RPC function to retrieve own full profile
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. PROJECT MEMBERSHIP & APPLICATION HARDENING
-- ─────────────────────────────────────────────────────────────

-- Unique application per user per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_members_unique
  ON public.project_members (project_id, user_id);

-- Trigger: Validate application creation (force 'applied', prevent owner self-apply, prevent blocked)
CREATE OR REPLACE FUNCTION public.handle_project_member_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_project_status TEXT;
BEGIN
  SELECT owner_id, status INTO v_owner_id, v_project_status
  FROM public.projects
  WHERE id = NEW.project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project does not exist';
  END IF;

  -- Owner cannot apply to their own project
  IF v_owner_id = NEW.user_id THEN
    RAISE EXCEPTION 'Project owner cannot apply to their own project';
  END IF;

  -- Project must be open
  IF v_project_status <> 'open' THEN
    RAISE EXCEPTION 'Cannot apply to a project that is not open';
  END IF;

  -- Cannot apply if blocked between user and project owner
  IF public.is_blocked_between(NEW.user_id, v_owner_id) THEN
    RAISE EXCEPTION 'Cannot apply to this project due to blocking';
  END IF;

  -- Force applied status and current timestamp
  NEW.status := 'applied';
  NEW.joined_at := NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_project_member_insert ON public.project_members;
CREATE TRIGGER trg_validate_project_member_insert
  BEFORE INSERT ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_project_member_insert();

-- Trigger: Validate application status update (only owner can accept/reject)
CREATE OR REPLACE FUNCTION public.handle_project_member_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_team_size INT;
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

  -- Immutable project_id and user_id
  IF NEW.project_id <> OLD.project_id OR NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'Cannot modify project or user on membership record';
  END IF;

  -- Lifecycle transition: applied -> accepted
  IF OLD.status = 'applied' AND NEW.status = 'accepted' THEN
    IF v_current_members >= v_team_size THEN
      RAISE EXCEPTION 'Project team is already full';
    END IF;

    UPDATE public.projects
    SET current_members = current_members + 1
    WHERE id = OLD.project_id;

    RETURN NEW;
  END IF;

  -- Lifecycle transition: applied -> rejected
  IF OLD.status = 'applied' AND NEW.status = 'rejected' THEN
    RETURN NEW;
  END IF;

  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid project member status transition from % to %', OLD.status, NEW.status;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_project_member_update ON public.project_members;
CREATE TRIGGER trg_validate_project_member_update
  BEFORE UPDATE ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_project_member_update();

-- Project Members RLS Policies
DROP POLICY IF EXISTS "project_members: user can apply" ON public.project_members;
CREATE POLICY "project_members: user can apply"
  ON public.project_members FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'applied'
    AND NOT EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_members.project_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "project_members: owner can update status" ON public.project_members;
CREATE POLICY "project_members: owner can update status"
  ON public.project_members FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id AND projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "project_members: applicant or owner can delete" ON public.project_members;
CREATE POLICY "project_members: applicant or owner can delete"
  ON public.project_members FOR DELETE TO authenticated
  USING (
    (auth.uid() = user_id AND status = 'applied')
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id AND projects.owner_id = auth.uid()
    )
  );
