import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Public Supabase client for dashboard authentication and real-time subscription.
 * Safe for client-side use with anon public key.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
