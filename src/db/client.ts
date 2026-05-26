import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const schema = process.env.SUPABASE_SCHEMA ?? 'ocinjured';
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY required');
  cached = createClient(url, key, { db: { schema }, auth: { persistSession: false } });
  return cached;
}
