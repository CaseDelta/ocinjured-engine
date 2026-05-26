import { createClient } from '@supabase/supabase-js';

// MVP: typed `any` so callers can address the ocinjured.* tables without
// a generated Database type. Tighten when we add codegen in v1.
type Client = ReturnType<typeof createClient<any, any, any>>;

let cached: Client | null = null;

export function getSupabase(): Client {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const schema = process.env.SUPABASE_SCHEMA ?? 'ocinjured';
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY required');
  cached = createClient<any, any, any>(url, key, {
    db: { schema },
    auth: { persistSession: false },
  });
  return cached;
}
