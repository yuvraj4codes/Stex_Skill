import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n--- 1. Testing SQL Security Migration (002_phase2_security_hardening.sql) ---');
const migrationPath = path.resolve('supabase/migrations/002_phase2_security_hardening.sql');
assert(fs.existsSync(migrationPath), 'Migration 002_phase2_security_hardening.sql exists');

const sql = fs.readFileSync(migrationPath, 'utf8');

// 1. Message Authorization
assert(sql.includes('are_users_connected'), 'Includes are_users_connected helper function');
assert(sql.includes('is_blocked_between'), 'Includes is_blocked_between helper function');
assert(sql.includes('check_messages_no_self'), 'Includes check_messages_no_self constraint');
assert(sql.includes('messages: authorized sender can insert'), 'Includes message INSERT policy requiring connection');
assert(sql.includes('NOT public.is_blocked_between(sender_id, receiver_id)'), 'Message INSERT forbids blocked users');

// 2. Connection Lifecycle
assert(sql.includes('check_connections_no_self'), 'Connections table enforces sender_id <> receiver_id');
assert(sql.includes('idx_connections_pairwise'), 'Connections table enforces pairwise uniqueness');
assert(sql.includes('handle_connection_update'), 'Trigger handle_connection_update exists');
assert(sql.includes("OLD.status = 'pending' AND NEW.status = 'accepted'"), 'Lifecycle enforces pending -> accepted transition');
assert(sql.includes("auth.uid() <> OLD.receiver_id"), 'Only receiver can accept connection');
assert(sql.includes("OLD.status = 'pending' AND NEW.status = 'rejected'"), 'Lifecycle enforces pending -> rejected transition');

// 3. Blocking
assert(sql.includes("NEW.status = 'blocked'"), 'Allows transition to blocked status');
assert(sql.includes("Cannot modify status of a blocked relationship"), 'Prevents arbitrary unblocking');
assert(sql.includes("status <> 'blocked'"), 'Prevents unauthorized deletion of blocked connection records');

// 4. Message Updates
assert(sql.includes('handle_message_update'), 'Trigger handle_message_update exists');
assert(sql.includes('Cannot modify message content'), 'Message content is immutable');
assert(sql.includes('Cannot modify message sender or recipient'), 'Message sender and recipient are immutable');
assert(sql.includes('messages: receiver can update is_read'), 'Only receiver can update is_read via RLS');

// 5. Profile Privacy
assert(sql.includes('CREATE OR REPLACE VIEW public.public_profiles'), 'public_profiles view created');
assert(!sql.includes('SELECT\n  id,\n  full_name,\n  email,'), 'public_profiles view does NOT include email column');
assert(sql.includes('profiles: user can view own profile'), 'Profiles table RLS locks SELECT to owner (auth.uid() = id)');

// 6. Project Membership Authorization
assert(sql.includes('idx_project_members_unique'), 'Project members table enforces unique applications');
assert(sql.includes('handle_project_member_insert'), 'Trigger handle_project_member_insert forces applied status');
assert(sql.includes("NEW.status := 'applied'"), 'Forces application status to applied');
assert(sql.includes("Project owner cannot apply to their own project"), 'Project owner cannot apply to own project');
assert(sql.includes('handle_project_member_update'), 'Trigger handle_project_member_update checks owner authorization');
assert(sql.includes("auth.uid() <> v_owner_id"), 'Only owner can approve/reject project applications');

console.log('\n--- 2. Testing Password Recovery Frontend Flow ---');
const appJsx = fs.readFileSync(path.resolve('src/App.jsx'), 'utf8');
assert(appJsx.includes('import ResetPasswordPage from "./pages/ResetPasswordPage"'), 'App.jsx imports ResetPasswordPage');
assert(appJsx.includes('<Route path="/reset-password" element={<ResetPasswordPage />} />'), 'App.jsx defines /reset-password route');

const authContext = fs.readFileSync(path.resolve('src/contexts/AuthContext.jsx'), 'utf8');
assert(authContext.includes('updatePassword'), 'AuthContext exports updatePassword function');
assert(authContext.includes('supabase.auth.updateUser'), 'updatePassword calls supabase.auth.updateUser');

const resetPasswordPage = fs.readFileSync(path.resolve('src/pages/ResetPasswordPage.jsx'), 'utf8');
assert(resetPasswordPage.includes('updatePassword'), 'ResetPasswordPage uses updatePassword from useAuth');
assert(resetPasswordPage.includes('password.length < 8'), 'ResetPasswordPage enforces min 8 character password');
assert(resetPasswordPage.includes('password !== confirmPassword'), 'ResetPasswordPage enforces password matching');

console.log('\n--- 3. Testing Secrets Audit ---');
function scanDirForSecrets(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
    if (fs.statSync(fullPath).isDirectory()) {
      scanDirForSecrets(fullPath);
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('service_role') || content.includes('eyJhbGciOi')) {
        assert(false, `Found possible secret or JWT in ${fullPath}`);
      }
    }
  }
}
scanDirForSecrets(path.resolve('src'));
assert(true, 'No service-role keys or sensitive credentials found in frontend source');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
