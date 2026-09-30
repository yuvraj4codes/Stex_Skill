import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[STEX Security Notice] Supabase environment variables missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in .env.'
  );
}

// Client initialized strictly using the public anonymous key.
// NEVER expose the service-role key in client-side code.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
