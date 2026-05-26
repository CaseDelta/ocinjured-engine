import { getSupabase } from '../db/client.js';
import { generateCreatives } from './creative-gen.js';
import { spinCampaign, activateCampaign } from './meta-api.js';

const args = parseArgs(process.argv.slice(2));
const incidentId = args['incident-id'];
const autoActivate = args['activate'] === 'true';
const dailyBudget = Number(args['budget'] ?? process.env.MAX_PER_CAMPAIGN_USD ?? 30);
const radiusMiles = Number(args['radius'] ?? process.env.DEFAULT_GEO_RADIUS_MILES ?? 5);

if (!incidentId) {
  console.error('Usage: tsx src/ad-engine/cli.ts --incident-id=<uuid> [--budget=30] [--radius=5] [--activate=false]');
  process.exit(1);
}

const sb = getSupabase();
const { data: incident, error } = await sb
  .from('incidents')
  .select('*')
  .eq('incident_id', incidentId)
  .single();

if (error || !incident) {
  console.error('Incident not found:', error?.message);
  process.exit(1);
}

if (!incident.lat || !incident.lng) {
  console.error('Incident missing lat/lng — geocode before spinning campaign');
  process.exit(1);
}

console.log(`Generating creatives for incident ${incidentId}...`);
const creatives = await generateCreatives(incident, 3);
console.log(`Generated ${creatives.length} variants:\n`);
creatives.forEach((c) => {
  console.log(`  [${c.creative_id}] ${c.headline}`);
  console.log(`    ${c.primary_text}`);
  console.log(`    CTA: ${c.cta} | Reasoning: ${c.reasoning}\n`);
});

if (!autoActivate) {
  console.log('Dry run complete. Pass --activate=true to spin live (will be PAUSED initially).');
  process.exit(0);
}

for (const creative of creatives) {
  const result = await spinCampaign({
    incident,
    creative,
    geo: { lat: incident.lat, lng: incident.lng, radius_miles: radiusMiles },
    daily_budget_usd: dailyBudget,
  });
  await sb.from('campaigns').insert({
    incident_id: incidentId,
    meta_campaign_id: result.meta_campaign_id,
    creative_id: creative.creative_id,
    ad_copy: creative.primary_text,
    landing_page_url: result.landing_page_url,
    geo_center_lat: incident.lat,
    geo_center_lng: incident.lng,
    geo_radius_miles: radiusMiles,
    daily_budget_usd: dailyBudget,
    status: 'pending_approval',
  });
  console.log(`Spun campaign ${result.meta_campaign_id} (PAUSED). Approve in Meta Ads Manager to activate.`);
}

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}
