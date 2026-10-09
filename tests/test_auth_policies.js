/**
 * STEX — Phase 2 Authorization Policy Tests
 * ==========================================
 * These tests exercise ACTUAL PostgreSQL/Supabase RLS and trigger behavior
 * by making real requests through the Supabase client.
 *
 * PREREQUISITES
 * -------------
 * 1. A Supabase project with migrations 001, 002, and 003 applied.
 * 2. A .env file with:
 *      VITE_SUPABASE_URL=https://<project>.supabase.co
 *      VITE_SUPABASE_ANON_KEY=<anon-key>
 *    (Never use service-role key in tests.)
 * 3. Two pre-created test accounts in the Supabase Auth dashboard:
 *      TEST_USER_A_EMAIL / TEST_USER_A_PASSWORD
 *      TEST_USER_B_EMAIL / TEST_USER_B_PASSWORD
 *    and optionally:
 *      TEST_USER_C_EMAIL / TEST_USER_C_PASSWORD  (blocked user)
 *
 * RUNNING
 * -------
 *   node tests/test_auth_policies.js
 *
 * STATUS
 * ------
 * If Supabase credentials are not configured, all tests that require a live
 * database will be skipped and reported as "SKIPPED (no credentials)".
 * Tests that exercise static SQL content remain executable offline.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// ── Env (read .env manually since we have no dotenv dep) ──────────────────────
function loadEnv() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const USER_A_EMAIL  = env.TEST_USER_A_EMAIL || '';
const USER_A_PASS   = env.TEST_USER_A_PASSWORD || '';
const USER_B_EMAIL  = env.TEST_USER_B_EMAIL || '';
const USER_B_PASS   = env.TEST_USER_B_PASSWORD || '';

const HAS_CREDENTIALS =
  SUPABASE_URL && !SUPABASE_URL.includes('placeholder') &&
  SUPABASE_ANON && !SUPABASE_ANON.includes('placeholder') &&
  USER_A_EMAIL && USER_A_PASS && USER_B_EMAIL && USER_B_PASS;

// ── Test harness ─────────────────────────────────────────────────────────────
let passed = 0, failed = 0, skipped = 0;

function assert(condition, message) {
  if (condition) { console.log(`  ✓ ${message}`); passed++; }
  else           { console.error(`  ✗ FAIL: ${message}`); failed++; }
}

function skip(message) {
  console.log(`  ⚠ SKIP: ${message}`);
  skipped++;
}

function section(title) {
  console.log(`\n─── ${title} ───`);
}

// ── Supabase client factory ───────────────────────────────────────────────────
function makeClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false },
  });
}

async function signIn(client, email, password) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Sign-in failed for ${email}: ${error.message}`);
  return data.user;
}

async function signOut(client) {
  await client.auth.signOut();
}

// ── STATIC TESTS (offline, no DB required) ───────────────────────────────────
section('1. Static SQL Content Checks');

const sql002 = fs.readFileSync(
  path.join(root, 'supabase/migrations/002_phase2_security_hardening.sql'), 'utf8');
const sql003 = fs.readFileSync(
  path.join(root, 'supabase/migrations/003_phase2_security_fixes.sql'), 'utf8');

assert(sql002.includes('are_users_connected'),         '002: are_users_connected function defined');
assert(sql002.includes('is_blocked_between'),           '002: is_blocked_between function defined');
assert(sql002.includes('check_messages_no_self'),       '002: messages no-self constraint');
assert(sql002.includes('handle_project_member_update'), '002: handle_project_member_update defined');
assert(sql002.includes("auth.uid() <> v_owner_id"),    '002: owner check in project member update');

assert(sql003.includes('REVOKE ALL ON public.public_profiles FROM anon'),
  '003: anon grant revoked on public_profiles');
assert(sql003.includes('REVOKE ALL ON public.profiles FROM anon'),
  '003: anon grant revoked on profiles base table');
assert(sql003.includes('get_public_profiles'),
  '003: get_public_profiles SECURITY DEFINER function defined');
assert(sql003.includes('REVOKE EXECUTE ON FUNCTION public.get_public_profiles() FROM anon'),
  '003: anon cannot execute get_public_profiles');
assert(sql003.includes('DROP FUNCTION IF EXISTS public.update_project_member_count()'),
  '003: duplicate count function dropped');
assert(sql003.includes("OLD.status = 'accepted' AND NEW.status = 'rejected'"),
  '003: accepted->rejected path decrements count');
assert(sql003.includes('handle_project_member_delete'),
  '003: delete trigger function defined');
assert(sql003.includes('trg_on_project_member_delete'),
  '003: delete trigger registered');
assert(sql003.includes('chk_members_lte_team_size'),
  '003: CHECK current_members <= team_size');
assert(sql003.includes('chk_members_gte_one'),
  '003: CHECK current_members >= 1');

// Confirm email is NOT in view definition of 002 or 003
const viewMatch002 = sql002.match(/CREATE OR REPLACE VIEW public\.public_profiles[\s\S]*?FROM public\.profiles/);
assert(viewMatch002 && !viewMatch002[0].includes('email'),
  '002: public_profiles view does not expose email');
const viewMatch003 = sql003.match(/CREATE OR REPLACE VIEW public\.public_profiles[\s\S]*?FROM public\.profiles/);
assert(viewMatch003 && !viewMatch003[0].includes('email'),
  '003: public_profiles view does not expose email');

section('2. Frontend Secrets Audit');

function scanDir(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    if (entry.isDirectory()) { scanDir(full, found); continue; }
    if (!/\.(js|jsx|ts|tsx|json)$/.test(entry.name)) continue;
    const text = fs.readFileSync(full, 'utf8');
    // Look for service_role, but allow it inside SQL migration comments/strings
    const isMigration = full.includes('migrations');
    if (!isMigration && text.includes('service_role')) found.push(full);
    // Detect bare JWT secrets (base64 header eyJhbGciOi in a non-placeholder context)
    if (!isMigration && /eyJhbGciOi[A-Za-z0-9+/=]{20,}/.test(text)) found.push(full + ' (JWT)');
  }
  return found;
}

const leaked = scanDir(path.join(root, 'src'));
assert(leaked.length === 0,
  `No service-role key or raw JWT found in src/ (found: ${leaked.join(', ') || 'none'})`);

// ── LIVE DATABASE TESTS ───────────────────────────────────────────────────────
if (!HAS_CREDENTIALS) {
  console.log('\n⚠  Live database tests SKIPPED.');
  console.log('   To run them, add to .env:');
  console.log('     VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.log('     TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD');
  console.log('     TEST_USER_B_EMAIL, TEST_USER_B_PASSWORD');
  skipped += 10; // count the skipped live tests
} else {
  const clientA = makeClient();
  const clientB = makeClient();
  const anonClient = makeClient();

  try {
    section('3. Profile Privacy — Anonymous Access');

    // Anon should NOT be able to query public_profiles
    const { data: anonProfiles, error: anonErr } = await anonClient
      .from('public_profiles')
      .select('*')
      .limit(1);

    assert(
      anonErr !== null || (anonProfiles && anonProfiles.length === 0),
      'Anon cannot read public_profiles (RLS/grant blocks access)'
    );

    // Anon should NOT be able to call get_public_profiles RPC
    const { error: anonRpcErr } = await anonClient.rpc('get_public_profiles');
    assert(anonRpcErr !== null, 'Anon cannot call get_public_profiles() RPC');

    section('4. Sign In Test Users');
    const userA = await signIn(clientA, USER_A_EMAIL, USER_A_PASS);
    const userB = await signIn(clientB, USER_B_EMAIL, USER_B_PASS);
    assert(!!userA?.id, `User A signed in (id: ${userA?.id?.slice(0, 8)}...)`);
    assert(!!userB?.id, `User B signed in (id: ${userB?.id?.slice(0, 8)}...)`);

    section('5. Profile Discovery — Authenticated Users');

    // Authenticated user CAN call get_public_profiles
    const { data: profiles, error: profileErr } = await clientA.rpc('get_public_profiles');
    assert(!profileErr, `Authenticated user can call get_public_profiles (${profileErr?.message || 'ok'})`);
    // Confirm no email field in result
    if (profiles && profiles.length > 0) {
      assert(!('email' in profiles[0]), 'get_public_profiles result does not include email field');
    }

    section('6. Messages — Connection Required');

    // User A tries to message User B without any connection
    const { error: msgNoConnErr } = await clientA
      .from('messages')
      .insert({ sender_id: userA.id, receiver_id: userB.id, content: 'Hello without connection' });

    assert(msgNoConnErr !== null,
      'Message INSERT rejected when no accepted connection exists');

    section('7. Connections — Lifecycle');

    // A sends connection request to B
    const { data: connInsert, error: connErr } = await clientA
      .from('connections')
      .insert({ sender_id: userA.id, receiver_id: userB.id, status: 'pending' })
      .select()
      .single();

    // If already exists from a previous test run, fetch it
    let conn = connInsert;
    if (connErr && connErr.code === '23505') { // unique violation
      const { data: existing } = await clientA
        .from('connections')
        .select()
        .eq('sender_id', userA.id)
        .eq('receiver_id', userB.id)
        .single();
      conn = existing;
      // Reset to pending if needed
      if (conn && conn.status !== 'pending') {
        skip('Connection exists in non-pending state from previous run; skipping lifecycle test');
        conn = null;
      }
    } else {
      assert(!connErr, `User A can send connection request (${connErr?.message || 'ok'})`);
    }

    // A tries to accept own request (should fail)
    if (conn) {
      const { error: selfAcceptErr } = await clientA
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', conn.id);
      assert(selfAcceptErr !== null,
        'Sender cannot accept their own connection request');

      // B accepts legitimately
      const { error: acceptErr } = await clientB
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', conn.id);
      assert(!acceptErr, `Receiver (B) can accept connection request (${acceptErr?.message || 'ok'})`);

      section('8. Messages — Connected Users');

      // A can now message B
      const { error: msgConnErr } = await clientA
        .from('messages')
        .insert({ sender_id: userA.id, receiver_id: userB.id, content: 'Hello after connection' });
      assert(!msgConnErr, `Connected user can send message (${msgConnErr?.message || 'ok'})`);

      // A cannot modify sender/receiver/content
      const { data: msgs } = await clientA
        .from('messages')
        .select()
        .eq('sender_id', userA.id)
        .eq('receiver_id', userB.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (msgs && msgs.length > 0) {
        const { error: contentEditErr } = await clientA
          .from('messages')
          .update({ content: 'Tampered content' })
          .eq('id', msgs[0].id);
        assert(contentEditErr !== null, 'User cannot modify message content (immutable)');

        // B can mark as read
        const { error: readErr } = await clientB
          .from('messages')
          .update({ is_read: true })
          .eq('id', msgs[0].id);
        assert(!readErr, `Recipient can mark message as read (${readErr?.message || 'ok'})`);
      }

      section('9. Blocking — Blocked Users Cannot Message');

      // A blocks B
      const { error: blockErr } = await clientA
        .from('connections')
        .update({ status: 'blocked' })
        .eq('id', conn.id);
      assert(!blockErr, `User can block a connection (${blockErr?.message || 'ok'})`);

      // B tries to message A — should be blocked
      const { error: blockedMsgErr } = await clientB
        .from('messages')
        .insert({ sender_id: userB.id, receiver_id: userA.id, content: 'Message from blocked user' });
      assert(blockedMsgErr !== null, 'Blocked user cannot send messages');

      // A tries to read messages — blocked users cannot access conversation
      const { data: blockedRead } = await clientB
        .from('messages')
        .select()
        .eq('sender_id', userA.id)
        .eq('receiver_id', userB.id);
      assert(!blockedRead || blockedRead.length === 0,
        'Blocked user cannot read the conversation');

      // Blocked status cannot be downgraded
      const { error: unblockErr } = await clientA
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', conn.id);
      assert(unblockErr !== null, 'Cannot change status of blocked connection');
    }

    section('10. Project Membership');

    // Create a test project as User A (owner)
    const { data: proj, error: projErr } = await clientA
      .from('projects')
      .insert({
        owner_id: userA.id,
        title: 'Test Project Auth',
        description: 'Authorization test project',
        team_size: 2,
        status: 'open',
      })
      .select()
      .single();

    if (projErr) {
      skip(`Could not create test project: ${projErr.message}`);
    } else {
      assert(!!proj?.id, 'Owner can create a project');

      // Owner cannot apply to own project
      const { error: ownerApplyErr } = await clientA
        .from('project_members')
        .insert({ project_id: proj.id, user_id: userA.id, role: 'owner', status: 'applied' });
      assert(ownerApplyErr !== null, 'Project owner cannot apply to their own project');

      // User B applies
      const { data: memberRow, error: applyErr } = await clientB
        .from('project_members')
        .insert({ project_id: proj.id, user_id: userB.id, role: 'Developer', status: 'applied' })
        .select()
        .single();
      assert(!applyErr, `Non-owner can apply (${applyErr?.message || 'ok'})`);

      if (memberRow) {
        // B cannot approve own application
        const { error: selfApproveErr } = await clientB
          .from('project_members')
          .update({ status: 'accepted' })
          .eq('id', memberRow.id);
        assert(selfApproveErr !== null, 'Applicant cannot self-approve project membership');

        // A (owner) approves B
        const { error: approveErr } = await clientA
          .from('project_members')
          .update({ status: 'accepted' })
          .eq('id', memberRow.id);
        assert(!approveErr, `Owner can approve applicant (${approveErr?.message || 'ok'})`);

        // Verify current_members incremented to 2
        const { data: projAfter } = await clientA
          .from('projects').select('current_members').eq('id', proj.id).single();
        assert(projAfter?.current_members === 2,
          `current_members incremented to 2 after accept (got ${projAfter?.current_members})`);

        // Test: team is full (size=2, current=2); accepting another applicant should fail
        const { error: fullErr } = await clientA
          .from('project_members')
          .update({ status: 'accepted' })
          .eq('id', memberRow.id); // same row update (no-op transition)
        // Insert a 3rd applicant and try to accept
        // (if another test user existed we'd test this fully — document gap)

        // Owner rejects accepted member (correction path)
        const { error: rejectErr } = await clientA
          .from('project_members')
          .update({ status: 'rejected' })
          .eq('id', memberRow.id);
        assert(!rejectErr, `Owner can reject accepted member for correction (${rejectErr?.message || 'ok'})`);

        // Verify current_members decremented back to 1
        const { data: projAfterReject } = await clientA
          .from('projects').select('current_members').eq('id', proj.id).single();
        assert(projAfterReject?.current_members === 1,
          `current_members decremented to 1 after reject (got ${projAfterReject?.current_members})`);

        // Delete the member row (applicant withdrawal)
        await clientA.from('project_members').delete().eq('id', memberRow.id);
        const { data: projAfterDel } = await clientA
          .from('projects').select('current_members').eq('id', proj.id).single();
        assert(projAfterDel?.current_members === 1,
          `current_members stays at 1 after delete of rejected row (got ${projAfterDel?.current_members})`);
      }

      // Cleanup test project
      await clientA.from('projects').delete().eq('id', proj.id);
    }

    await signOut(clientA);
    await signOut(clientB);

  } catch (err) {
    console.error('\n  UNEXPECTED ERROR:', err.message);
    failed++;
  }
}

// ── Summary ────────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
console.log('='.repeat(60));

if (!HAS_CREDENTIALS) {
  console.log('\nNOTE: Live DB tests were skipped. To run them fully:');
  console.log('  1. Apply migrations 001, 002, 003 to your Supabase project.');
  console.log('  2. Create two test users in Supabase Auth dashboard.');
  console.log('  3. Add credentials to .env (see test file header).');
  console.log('  4. Run: node tests/test_auth_policies.js');
}

if (failed > 0) process.exit(1);
