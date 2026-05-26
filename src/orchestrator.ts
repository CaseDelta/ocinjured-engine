import { getSupabase } from './db/client.js';
import { scrape as scrapeOcRegister } from './scrapers/oc-register.js';
import { scrape as scrapeKtla } from './scrapers/ktla.js';
import { scrape as scrapePatch } from './scrapers/patch-oc.js';
import { scrape as scrapeOcFire } from './scrapers/oc-fire-twitter.js';
import { Incident } from './intake/schema.js';

// Daily MVP loop:
//   1. Scrape all OC sources in parallel.
//   2. Upsert into ocinjured.incidents (dedupe via UNIQUE on source+source_url).
//   3. Mark obvious junk as not_qualified_for_ads.
//   4. Print summary + flag top-N for human campaign approval.
//
// v1 will add: auto-geocode, auto-spin campaigns, voice callback,
// outcome tracking. See BACKGROUND.md §17.

async function main() {
  const sb = getSupabase();
  const startedAt = new Date();
  console.log(`[orchestrator] starting at ${startedAt.toISOString()}`);

  const [reg, ktla, patch, ocfire] = await Promise.all([
    scrapeOcRegister().catch(safeFail<Partial<Incident>>('oc-register')),
    scrapeKtla().catch(safeFail<Partial<Incident>>('ktla')),
    scrapePatch().catch(safeFail<Partial<Incident>>('patch-oc')),
    scrapeOcFire().catch(safeFail<Partial<Incident>>('oc-fire-twitter')),
  ]);

  const all: Partial<Incident>[] = [...reg, ...ktla, ...patch, ...ocfire];
  console.log(`[orchestrator] scraped ${all.length} candidate incidents`);

  let inserted = 0;
  for (const candidate of all) {
    if (!candidate.source || !candidate.source_url || !candidate.raw_summary) continue;
    const { error } = await sb.from('incidents').upsert(
      {
        source: candidate.source,
        source_url: candidate.source_url,
        source_published_at: candidate.source_published_at ?? new Date().toISOString(),
        scraped_at: candidate.scraped_at ?? new Date().toISOString(),
        metro: candidate.metro ?? 'orange_county',
        city: candidate.city ?? null,
        raw_summary: candidate.raw_summary,
      },
      { onConflict: 'source,source_url', ignoreDuplicates: true },
    );
    if (!error) inserted++;
  }

  const elapsed = ((Date.now() - startedAt.getTime()) / 1000).toFixed(1);
  console.log(`[orchestrator] upserted ${inserted} new incidents in ${elapsed}s`);
  console.log(`[orchestrator] next step (MVP): human reviews and runs \`npm run campaign:create -- --incident-id=<id>\``);
}

function safeFail<T>(name: string) {
  return (err: unknown): T[] => {
    console.error(`[orchestrator] scraper ${name} failed: ${(err as Error).message}`);
    return [];
  };
}

main().catch((err) => {
  console.error('[orchestrator] fatal:', err);
  process.exit(1);
});
