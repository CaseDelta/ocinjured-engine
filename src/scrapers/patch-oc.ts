import { chromium, Browser } from 'playwright';
import { Incident } from '../intake/schema.js';

const SOURCE = 'patch_oc';

const PATCH_CITIES = [
  'anaheim', 'irvine', 'santa-ana', 'newport-beach', 'huntington-beach',
  'costa-mesa', 'fullerton', 'orange', 'tustin', 'mission-viejo',
  'lake-forest', 'san-clemente', 'dana-point', 'laguna-niguel', 'laguna-beach',
  'yorba-linda', 'la-habra', 'brea', 'buena-park', 'cypress',
];

export async function scrape(): Promise<Partial<Incident>[]> {
  const browser: Browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const incidents: Partial<Incident>[] = [];

  try {
    for (const city of PATCH_CITIES) {
      const url = `https://patch.com/california/${city}`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        const articles = await page.$$eval('a[href*="/california/"]', (links) =>
          links.slice(0, 50).map((a) => ({
            href: (a as HTMLAnchorElement).href,
            title: (a.textContent ?? '').trim(),
          })),
        );
        for (const a of articles) {
          if (!a.title || !looksLikeIncident(a.title)) continue;
          incidents.push({
            source: SOURCE,
            source_url: a.href,
            raw_summary: a.title,
            metro: 'orange_county',
            city: city.replace(/-/g, ' '),
            scraped_at: new Date().toISOString(),
          });
        }
      } catch {
        // continue past per-city errors
      }
    }
  } finally {
    await browser.close();
  }

  return dedupe(incidents);
}

function looksLikeIncident(title: string): boolean {
  const t = title.toLowerCase();
  return /accident|crash|injured|killed|fatal|struck|hit|collision|rollover|pedestrian|hospitalized/.test(t);
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
    console.log(`\n${rows.length} candidate OC Patch incidents`);
  });
}
