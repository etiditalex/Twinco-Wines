import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let clientKey = "";

function supabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
}

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = supabaseKey();
  if (!url || !key) return null;
  const stamp = `${url}:${key}`;
  if (client && clientKey === stamp) return client;
  clientKey = stamp;
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && supabaseKey());
}
