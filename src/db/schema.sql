-- OCInjured schema in CaseDelta Supabase project
-- Run via Supabase SQL editor or `psql` against the project.

CREATE SCHEMA IF NOT EXISTS ocinjured;

SET search_path TO ocinjured, public;

CREATE TABLE IF NOT EXISTS ocinjured.incidents (
  incident_id        uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  source             text NOT NULL,
  source_url         text NOT NULL,
  source_published_at timestamptz NOT NULL,
  scraped_at         timestamptz NOT NULL DEFAULT now(),
  occurred_at        timestamptz,
  metro              text NOT NULL DEFAULT 'orange_county',
  city               text,
  zip                text,
  location_text      text,
  lat                double precision,
  lng                double precision,
  vehicle_type       text,
  severity           text,
  injured_count      int,
  fatal_count        int,
  defendant_type     text,
  defendant_name     text,
  raw_summary        text NOT NULL,
  ai_summary         text,
  qualification_score int,
  is_qualified_for_ads boolean NOT NULL DEFAULT false,
  UNIQUE (source, source_url)
);

CREATE INDEX IF NOT EXISTS incidents_metro_qualified_idx
  ON ocinjured.incidents (metro, is_qualified_for_ads, source_published_at DESC);

CREATE TABLE IF NOT EXISTS ocinjured.campaigns (
  campaign_id        uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  meta_campaign_id   text,
  incident_id        uuid NOT NULL REFERENCES ocinjured.incidents(incident_id),
  creative_id        text NOT NULL,
  ad_copy            text NOT NULL,
  landing_page_url   text NOT NULL,
  geo_center_lat     double precision NOT NULL,
  geo_center_lng     double precision NOT NULL,
  geo_radius_miles   numeric NOT NULL,
  daily_budget_usd   numeric NOT NULL,
  status             text NOT NULL CHECK (status IN ('draft','pending_approval','active','paused','completed','failed')),
  created_at         timestamptz NOT NULL DEFAULT now(),
  activated_at       timestamptz,
  ended_at           timestamptz,
  spend_usd          numeric NOT NULL DEFAULT 0,
  impressions        int NOT NULL DEFAULT 0,
  clicks             int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS campaigns_status_idx ON ocinjured.campaigns (status, created_at DESC);

CREATE TABLE IF NOT EXISTS ocinjured.leads (
  lead_id            uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  captured_at        timestamptz NOT NULL DEFAULT now(),
  source             text NOT NULL DEFAULT 'ocinjured.com',
  campaign_id        uuid REFERENCES ocinjured.campaigns(campaign_id),
  incident_id        uuid REFERENCES ocinjured.incidents(incident_id),
  creative_id        text,
  metro              text NOT NULL,
  vertical           text NOT NULL,
  channel            text NOT NULL,
  utm_source         text,
  utm_medium         text,
  utm_campaign       text,
  first_name         text NOT NULL,
  last_name          text,
  phone              text NOT NULL,
  email              text,
  incident_date      date,
  incident_description text NOT NULL,
  injuries_described text,
  treated_by_doctor  boolean,
  has_attorney       boolean NOT NULL,
  consent_to_contact boolean NOT NULL,
  consent_captured_at timestamptz NOT NULL,
  user_agent         text,
  ip_address         inet,
  qualification_score int,
  is_qualified       boolean NOT NULL DEFAULT false,
  qualification_notes text,
  routed_to          text NOT NULL DEFAULT 'casedelta_internal',
  routed_at          timestamptz
);

CREATE INDEX IF NOT EXISTS leads_qualified_captured_idx
  ON ocinjured.leads (is_qualified, captured_at DESC);

CREATE INDEX IF NOT EXISTS leads_campaign_idx ON ocinjured.leads (campaign_id);

-- Daily rollup view for the daily report
CREATE OR REPLACE VIEW ocinjured.daily_metrics AS
SELECT
  date_trunc('day', l.captured_at AT TIME ZONE 'America/Los_Angeles')::date AS day,
  l.metro,
  l.vertical,
  l.channel,
  count(*)                                                       AS leads_total,
  count(*) FILTER (WHERE l.is_qualified)                         AS leads_qualified,
  round(100.0 * count(*) FILTER (WHERE l.is_qualified) / nullif(count(*), 0), 1) AS qualification_pct,
  coalesce(sum(c.spend_usd), 0)                                  AS ad_spend_usd,
  round(coalesce(sum(c.spend_usd), 0) / nullif(count(*) FILTER (WHERE l.is_qualified), 0), 2)
                                                                  AS cost_per_qualified_lead_usd
FROM ocinjured.leads l
LEFT JOIN ocinjured.campaigns c ON c.campaign_id = l.campaign_id
GROUP BY 1, 2, 3, 4
ORDER BY 1 DESC, 2, 3, 4;
