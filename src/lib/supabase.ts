import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — used for all operations
// RLS is permissive on nick_ tables; auth is handled at API route level
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — same as public (RLS allows all on nick_ tables)
export function getAdminClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
