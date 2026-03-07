import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

let supabaseAdminClient: SupabaseClient<Database> | undefined;

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseServerEnv();
    supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdminClient;
}
