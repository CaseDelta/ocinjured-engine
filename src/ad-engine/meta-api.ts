// @ts-expect-error — facebook-nodejs-business-sdk ships no types
import bizSdk from 'facebook-nodejs-business-sdk';
import { Incident, Campaign } from '../intake/schema.js';
import { AdCreative } from './creative-gen.js';

const { FacebookAdsApi, AdAccount, Campaign: MetaCampaign } = bizSdk;

export interface CampaignSpinResult {
  meta_campaign_id: string;
  meta_adset_id: string;
  meta_creative_id: string;
  meta_ad_id: string;
  landing_page_url: string;
}

export async function spinCampaign(opts: {
  incident: Partial<Incident> & { incident_id: string };
  creative: AdCreative;
  geo: { lat: number; lng: number; radius_miles: number };
  daily_budget_usd: number;
}): Promise<CampaignSpinResult> {
  const token = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  const pageId = process.env.META_PAGE_ID;
  const landingBase = process.env.LANDING_PAGE_URL ?? 'https://ocinjured.com';
  if (!token || !adAccountId || !pageId) {
    throw new Error('META_ACCESS_TOKEN, META_AD_ACCOUNT_ID, and META_PAGE_ID required');
  }

  FacebookAdsApi.init(token);
  const account = new AdAccount(adAccountId);

  const utm = new URLSearchParams({
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: `incident_${opts.incident.incident_id}`,
    utm_content: opts.creative.creative_id,
  });
  const landing_page_url = `${landingBase}/?${utm.toString()}`;

  const campaign = await account.createCampaign(
    [],
    {
      name: `OCInjured incident:${opts.incident.incident_id} creative:${opts.creative.creative_id}`,
      objective: 'OUTCOME_LEADS',
      status: 'PAUSED',
      special_ad_categories: [],
    },
  );

  const adset = await account.createAdSet(
    [],
    {
      name: `AdSet ${opts.creative.creative_id}`,
      campaign_id: campaign.id,
      daily_budget: Math.round(opts.daily_budget_usd * 100),
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'OFFSITE_CONVERSIONS',
      bid_amount: 200,
      targeting: {
        geo_locations: {
          custom_locations: [
            { latitude: opts.geo.lat, longitude: opts.geo.lng, radius: opts.geo.radius_miles, distance_unit: 'mile' },
          ],
        },
        age_min: 18,
        age_max: 75,
      },
      status: 'PAUSED',
    },
  );

  const metaCreative = await account.createAdCreative(
    [],
    {
      name: `Creative ${opts.creative.creative_id}`,
      object_story_spec: {
        page_id: pageId,
        link_data: {
          link: landing_page_url,
          message: opts.creative.primary_text,
          name: opts.creative.headline,
          description: opts.creative.description,
          call_to_action: { type: opts.creative.cta, value: { link: landing_page_url } },
        },
      },
    },
  );

  const ad = await account.createAd(
    [],
    {
      name: `Ad ${opts.creative.creative_id}`,
      adset_id: adset.id,
      creative: { creative_id: metaCreative.id },
      status: 'PAUSED',
    },
  );

  return {
    meta_campaign_id: campaign.id,
    meta_adset_id: adset.id,
    meta_creative_id: metaCreative.id,
    meta_ad_id: ad.id,
    landing_page_url,
  };
}

export async function activateCampaign(meta_campaign_id: string): Promise<void> {
  const token = process.env.META_ACCESS_TOKEN!;
  FacebookAdsApi.init(token);
  const c = new MetaCampaign(meta_campaign_id);
  await c.update([], { status: 'ACTIVE' });
}

export async function pauseCampaign(meta_campaign_id: string): Promise<void> {
  const token = process.env.META_ACCESS_TOKEN!;
  FacebookAdsApi.init(token);
  const c = new MetaCampaign(meta_campaign_id);
  await c.update([], { status: 'PAUSED' });
}

export async function fetchCampaignMetrics(meta_campaign_id: string): Promise<Partial<Campaign>> {
  const token = process.env.META_ACCESS_TOKEN!;
  FacebookAdsApi.init(token);
  const c = new MetaCampaign(meta_campaign_id);
  const insights = await c.getInsights(['spend', 'impressions', 'clicks']);
  const row = insights[0]?._data ?? {};
  return {
    meta_campaign_id,
    spend_usd: Number(row.spend ?? 0),
    impressions: Number(row.impressions ?? 0),
    clicks: Number(row.clicks ?? 0),
  };
}
