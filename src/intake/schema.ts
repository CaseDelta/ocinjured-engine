import { z } from 'zod';

export const IncidentSeverity = z.enum(['minor', 'moderate', 'serious', 'critical', 'fatal']);
export type IncidentSeverity = z.infer<typeof IncidentSeverity>;

export const VehicleType = z.enum([
  'passenger_car',
  'motorcycle',
  'commercial_truck',
  'delivery_van',
  'rideshare',
  'pedestrian',
  'bicycle',
  'bus',
  'other',
]);
export type VehicleType = z.infer<typeof VehicleType>;

export const DefendantType = z.enum([
  'individual',
  'commercial_vehicle_operator',
  'corporation',
  'government',
  'rideshare_platform',
  'unknown',
]);
export type DefendantType = z.infer<typeof DefendantType>;

export const IncidentSchema = z.object({
  incident_id: z.string().uuid(),
  source: z.string(),
  source_url: z.string().url(),
  source_published_at: z.string().datetime(),
  scraped_at: z.string().datetime(),
  occurred_at: z.string().datetime().nullable(),
  metro: z.string().default('orange_county'),
  city: z.string().nullable(),
  zip: z.string().nullable(),
  location_text: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  vehicle_type: VehicleType.nullable(),
  severity: IncidentSeverity.nullable(),
  injured_count: z.number().int().nullable(),
  fatal_count: z.number().int().nullable(),
  defendant_type: DefendantType.nullable(),
  defendant_name: z.string().nullable(),
  raw_summary: z.string(),
  ai_summary: z.string().nullable(),
  qualification_score: z.number().min(0).max(100).nullable(),
  is_qualified_for_ads: z.boolean().default(false),
});
export type Incident = z.infer<typeof IncidentSchema>;

export const CampaignSchema = z.object({
  campaign_id: z.string().uuid(),
  meta_campaign_id: z.string().nullable(),
  incident_id: z.string().uuid(),
  creative_id: z.string(),
  ad_copy: z.string(),
  landing_page_url: z.string().url(),
  geo_center_lat: z.number(),
  geo_center_lng: z.number(),
  geo_radius_miles: z.number(),
  daily_budget_usd: z.number(),
  status: z.enum(['draft', 'pending_approval', 'active', 'paused', 'completed', 'failed']),
  created_at: z.string().datetime(),
  activated_at: z.string().datetime().nullable(),
  ended_at: z.string().datetime().nullable(),
  spend_usd: z.number().default(0),
  impressions: z.number().int().default(0),
  clicks: z.number().int().default(0),
});
export type Campaign = z.infer<typeof CampaignSchema>;

export const LeadSchema = z.object({
  lead_id: z.string().uuid(),
  captured_at: z.string().datetime(),
  source: z.literal('ocinjured.com'),
  campaign_id: z.string().uuid().nullable(),
  incident_id: z.string().uuid().nullable(),
  creative_id: z.string().nullable(),
  metro: z.string(),
  vertical: z.string(),
  channel: z.string(),
  utm_source: z.string().nullable(),
  utm_medium: z.string().nullable(),
  utm_campaign: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string().nullable(),
  phone: z.string(),
  email: z.string().email().nullable(),
  incident_date: z.string().date().nullable(),
  incident_description: z.string(),
  injuries_described: z.string().nullable(),
  treated_by_doctor: z.boolean().nullable(),
  has_attorney: z.boolean(),
  consent_to_contact: z.boolean(),
  consent_captured_at: z.string().datetime(),
  user_agent: z.string().nullable(),
  ip_address: z.string().nullable(),
  qualification_score: z.number().min(0).max(100).nullable(),
  is_qualified: z.boolean().default(false),
  qualification_notes: z.string().nullable(),
  routed_to: z.string().default('casedelta_internal'),
  routed_at: z.string().datetime().nullable(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const QualificationScoreSchema = z.object({
  score: z.number().min(0).max(100),
  is_qualified: z.boolean(),
  signals: z.object({
    severity_signal: z.number().min(0).max(25),
    defendant_deep_pocket_signal: z.number().min(0).max(25),
    liability_clarity_signal: z.number().min(0).max(20),
    sol_signal: z.number().min(0).max(15),
    representation_signal: z.number().min(0).max(15),
  }),
  notes: z.string(),
});
export type QualificationScore = z.infer<typeof QualificationScoreSchema>;
