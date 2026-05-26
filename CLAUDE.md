# OCInjured Engine — Project Instructions for Claude

## What This Is

OCInjured is a consumer-facing personal-injury lead-generation brand operated by CaseDelta. It runs hyperlocal AI-personalized advertising against fresh accident incidents in Orange County, captures qualified leads through `ocinjured.com`, and routes them into CaseDelta's intake infrastructure.

**Read `BACKGROUND.md` for exhaustive strategic context before making any architectural or product decisions.** This file is the operational instruction set.

## North Star

> Validate that AI-personalized, hyperlocal, incident-aware ads beat generic PI ads on cost-per-qualified-lead in Orange County.

Success criteria for MVP (2-week sprint):
- Cost-per-lead (CPL) under $50.
- Qualification rate above 40%.
- At least 10 qualified leads in 14 days.

If these hit: thesis validated, scale to matrix testing in v1.
If not: kill or pivot before sinking more ad spend.

## MVP Scope (What's IN vs. CUT)

**IN for MVP:**
- One source: Playwright scraping of OC local news + Twitter + Facebook community pages.
- One channel: Meta hyperlocal ads.
- One AI creative engine: template + variables → Claude generates per-incident copy.
- One landing page: `ocinjured.com`, mobile-first, 5-field intake form.
- One database: Supabase with full lead provenance.
- One daily report: leads count, cost, qualification rate.

**CUT for MVP** (deferred to v1+):
- Matrix testing (multiple cells).
- GoFundMe / workers'-comp / insurance-commissioner scraping.
- National wide-funnel ads.
- Skip-trace enrichment.
- Defendant lookup / insurance research.
- AI voice callback (chat-only for MVP).
- Outcome tracking webhooks.
- Compliance substrate (not needed in marketing-only mode).
- Cross-channel continuity.

## Architecture

```
ocinjured-engine/
├── BACKGROUND.md         # Exhaustive strategy (READ FIRST)
├── CLAUDE.md             # This file
├── README.md             # Quick start
├── src/
│   ├── scrapers/         # Playwright scrapers for OC news + social
│   ├── ad-engine/        # Meta Marketing API + AI creative gen
│   ├── landing-page/     # Static HTML/CSS/JS for ocinjured.com
│   ├── intake/           # Qualification scoring + schema
│   ├── db/               # Supabase schema + client
│   └── orchestrator.ts   # Daily loop: scrape → score → spin campaigns → report
├── scripts/
│   └── register-domain.sh
└── docs/
    └── ARCHITECTURE.md
```

## Tech Stack (MVP)

- **Language**: TypeScript / Node 20+
- **Database**: Supabase Postgres (separate schema in the existing CaseDelta Supabase project — keeps infra simple).
- **Compute**: plain Node scripts for MVP (Lambda packaging deferred to v1).
- **AI**: Anthropic API directly (Claude Opus 4.7 for creative + qualification). No CLI complexity for MVP.
- **Crawling**: Playwright (Node SDK) for sources without APIs. Playwright MCP works in dev; production uses direct Playwright.
- **Landing page**: plain HTML/CSS/JS, deployed via Cloudflare Pages (free, instant deploys, simple DNS).
- **Ads**: Meta Marketing API direct (Facebook Business SDK for Node).
- **Domain**: `ocinjured.com` (registration in flight — see `scripts/register-domain.sh`).

## Hard Rules

### Brand & Voice
- **OCInjured is consumer-facing, not lawyer-coded.** Lead copy with "help," "support," "answers," "free advice." Do not lead with "attorney" or "law firm."
- **Mobile-first.** Every UI choice optimizes for a victim clicking from their phone hours after an accident.
- **No legal advice given.** Marketing-only positioning. Clear "we connect you with attorneys" framing.
- **The OCInjured brand does not mention CaseDelta on consumer surfaces.** Back-office only.

### Compliance (marketing-only mode)
- **Consumer-initiated only.** Never cold-contact accident victims by name from public records.
- **Express consent capture** on every form for TCPA compliance on follow-up SMS / voice.
- **Geo-fenced ads are broadcast advertising**, same legal posture as a TV billboard. Do not name specific incidents in ad copy; describe pattern (location, time, vehicle type) without identifying the victim.
- **No fee splits with law firms in MVP.** Routing is into CaseDelta-owned infrastructure only. Fee splits require PLLC formation (Phase 2+).
- **California bar rules apply** to any ad targeting OC consumers. When in doubt, route through outside counsel review.

### Data
- **Every lead carries full provenance**: `(source, geo, vertical, channel, creative_id, incident_id, captured_at)`. This is non-negotiable — instrumented from day one to make matrix testing in v1 trivial.
- **Supabase schema**: use `ocinjured` schema in the existing CaseDelta Supabase project. Do not pollute the main `public` schema.
- **PII handling**: standard CaseDelta practices apply. KMS-encrypted at rest, no logging of full PII to CloudWatch / Sentry.

### Code
- **No premature abstraction.** This is an MVP. Three similar lines is better than a premature abstraction. No design for hypothetical future requirements.
- **No comments unless WHY is non-obvious.** Well-named identifiers do the work of WHAT.
- **Default to no error handling beyond system boundaries.** Trust internal code; validate at scraper / API / form boundaries.
- **TypeScript strict mode.** No `any` without justification.

### Git & CI/CD
- **Direct commits to `main` allowed for MVP.** No PR ceremony for a 2-week solo sprint. Reassess when 2nd contributor joins.
- **Never commit secrets.** `.env` is gitignored; `.env.example` shows the shape.
- **Commit often, push often.** This repo is the work log.

## Quick Reference

### Local dev setup
```bash
cd /Users/camrenhall/Documents/CaseDelta/Github/ocinjured-engine
npm install
npx playwright install chromium
cp .env.example .env
# Fill in .env with Anthropic key, Supabase URL/key, Meta Marketing API token
npm run dev
```

### One-time DB setup (already done for QA — Supabase `eawdsvit...`)
```bash
# 1. Apply schema (creates ocinjured.{incidents,campaigns,leads} + daily_metrics view)
psql "$QA_DB_CONNECTION_STRING" -f src/db/schema.sql

# 2. Expose ocinjured schema in PostgREST (REQUIRED — Supabase only exposes `public` by default)
psql "$QA_DB_CONNECTION_STRING" <<SQL
ALTER ROLE authenticator SET pgrst.db_schemas TO 'public,graphql_public,scribe,ocinjured';
GRANT USAGE ON SCHEMA ocinjured TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA ocinjured TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ocinjured TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA ocinjured GRANT ALL ON TABLES TO anon, authenticated, service_role;
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
SQL
```

### Run a scraper
```bash
npm run scrape:oc-register
npm run scrape:ktla
npm run scrape:patch
```

### Spin a campaign (manual MVP approval)
```bash
npm run campaign:create -- --incident-id=<uuid>
```

### Daily orchestrator (cron in v1)
```bash
npm run orchestrator
```

### Deploy landing page (Cloudflare Pages)
```bash
npm run deploy:landing
```

## Key Files

- **`src/orchestrator.ts`** — main daily loop. Scrape → score → draft creatives → (human approve in MVP) → spin campaigns → write to DB.
- **`src/scrapers/`** — one file per source. Each exports `async function scrape(): Promise<Incident[]>`.
- **`src/ad-engine/creative-gen.ts`** — takes an Incident + ad template, returns ad creative variants via Claude API.
- **`src/ad-engine/meta-api.ts`** — Meta Marketing API wrapper. `createCampaign(incident, creative)`, `pauseCampaign(id)`, `getMetrics(id)`.
- **`src/intake/qualification.ts`** — scores a lead on severity / defendant / liability / SOL / representation. Returns a `QualificationScore` and `is_qualified: boolean`.
- **`src/intake/schema.ts`** — `Lead`, `Incident`, `Campaign`, `QualificationScore` types. Single source of truth for shape.
- **`src/db/schema.sql`** — Supabase DDL. Run once via Supabase SQL editor.
- **`src/landing-page/index.html`** — the actual `ocinjured.com` page. Mobile-first, single-page, form submit to `/api/intake`.

## Common Pitfalls

- **Don't add features beyond MVP scope** without re-reading `BACKGROUND.md` §5. Every feature creep delays validation.
- **Don't deploy landing page changes without testing on mobile first.** Most consumer traffic is mobile-first; desktop is a rounding error.
- **Don't generate ad creative that names specific incidents or victims.** Compliance line. Pattern-based language only ("involved in a crash on the 405 this week?") not victim-identifying.
- **Don't skip provenance fields.** Even in MVP. Retrofitting matrix attribution is painful.
- **Don't route leads anywhere besides CaseDelta-direct in MVP.** External partner routing requires PLLC. Wait for Phase 2.

## Project Phase Map

- **Phase 1 (current)**: MVP, 2-week sprint. OC + Meta only. Validate CPL + qualification thesis.
- **Phase 2**: OC v1, 6-week extension. Add voice intake, Google Ads, first partner firm, outcome tracking, GoFundMe scraping. Begin PLLC formation.
- **Phase 3**: SoCal expansion. LAInjured + others. PLLC operational. Path 3 (Reddit) live.
- **Phase 4**: National multi-metro portfolio.
- **Phase 5**: Morgan & Morgan-style hybrid endgame.

See `BACKGROUND.md` §17 for full phase plan.

## When in Doubt

1. **Read `BACKGROUND.md`.** The "why" lives there.
2. **Ask: is this in MVP scope?** If unclear, default to "no, defer to v1."
3. **Ask: does this need a PLLC?** If yes, defer to Phase 2+.
4. **Ask: would a partner firm trust this lead?** If no, fix qualification before adding more sources.
5. **Run cheap experiments before expensive builds.** A 1-day A/B test beats a 1-week feature build.

## Connection to CaseDelta Parent

CaseDelta is the parent product (B2B AI for law firms). OCInjured is a parallel consumer brand under the same operator. Shared infrastructure (AWS, Supabase, Anthropic). Separate consumer-facing brand. Lead handoff is internal-to-CaseDelta for MVP.

When working on OCInjured, do not assume CaseDelta context is loaded. This repo stands alone.

When CaseDelta-side changes are needed (intake-receiving endpoint, lead-storage table in CaseDelta DB, etc.), reference the CaseDelta repo at `/Users/camrenhall/Documents/CaseDelta/Github/casedelta-cloud` and treat that as a separate codebase with its own conventions.
