import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { getSupabase } from './client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const sb = getSupabase();
  const sql = readFileSync(resolve(__dirname, 'schema.sql'), 'utf8');

  console.log('[migrate] applying schema.sql via Supabase RPC (requires service role)');
  console.log('[migrate] NOTE: Supabase JS client cannot run arbitrary DDL directly.');
  console.log('[migrate] Copy the SQL below into the Supabase SQL editor and run manually for MVP.');
  console.log('---');
  console.log(sql);
  console.log('---');
  console.log('[migrate] After running, verify schema with: select count(*) from ocinjured.incidents;');
  void sb; // referenced for env validation
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
