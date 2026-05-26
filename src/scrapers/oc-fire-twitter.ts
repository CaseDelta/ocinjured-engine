import { chromium, Browser } from 'playwright';
import { Incident } from '../intake/schema.js';

// OC Fire Authority + key OC CHP / police agency Twitter accounts.
// Twitter/X gates many features behind auth; for MVP we use Nitter mirrors
// or scrape the unauthenticated public profile view.

const SOURCE = 'oc_fire_twitter';
const HANDLES = [
  'OCFireAuthority',
  'AnaheimPD',
  'IrvinePolice',
  'SantaAnaPD',
  'NewportBeachPD',
  'HBPD_PIO',
  'CostaMesaPD',
  'CHPSantaAna',
];

const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
];

export async function scrape(): Promise<Partial<Incident>[]> {
  const browser: Browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const incidents: Partial<Incident>[] = [];

  try {
    for (const handle of HANDLES) {
      for (const instance of NITTER_INSTANCES) {
        const url = `${instance}/${handle}`;
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15_000 });
          const tweets = await page.$$eval('.timeline-item', (items) =>
            items.slice(0, 20).map((el) => ({
              text: (el.querySelector('.tweet-content')?.textContent ?? '').trim(),
              link: (el.querySelector('a.tweet-link') as HTMLAnchorElement | null)?.href ?? '',
              when: (el.querySelector('.tweet-date a')?.getAttribute('title') ?? '').trim(),
            })),
          );
          for (const t of tweets) {
            if (!t.text || !looksLikeIncident(t.text)) continue;
            incidents.push({
              source: SOURCE,
              source_url: t.link || `${url}#${Date.now()}`,
              raw_summary: `@${handle}: ${t.text}`,
              metro: 'orange_county',
              scraped_at: new Date().toISOString(),
              source_published_at: t.when ? new Date(t.when).toISOString() : undefined,
            });
          }
          break; // one working instance per handle is enough
        } catch {
          // try next mirror
        }
      }
    }
  } finally {
    await browser.close();
  }

  return dedupe(incidents);
}

function looksLikeIncident(text: string): boolean {
  const t = text.toLowerCase();
  return /accident|crash|injured|injury|fatal|killed|struck|collision|rollover|vehicle|mva|rescue|trauma/.test(t);
}

function dedupe(arr: Partial<Incident>[]): Partial<Incident>[] {
  const seen = new Set<string>();
  return arr.filter((i) => {
    if (!i.source_url || seen.has(i.source_url)) return false;
    seen.add(i.source_url);
    return true;
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scrape().then((rows) => {
    console.log(JSON.stringify(rows, null, 2));
    console.log(`\n${rows.length} candidate OC fire/police incidents from Twitter mirrors`);
  });
}
