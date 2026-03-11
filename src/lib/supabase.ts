import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client — used for all operations
// RLS is permissive on nick_ tables; auth is handled at API route level
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — uses service role key if available (bypasses RLS for storage etc.)
export function getAdminClient() {
  if (supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}
