# Architecture (MVP)

## One-line summary

Scrape OC accident incidents → Claude generates per-incident Meta ads → geo-fenced campaigns drive traffic to ocinjured.com → form submits qualify against rules → leads flow to CaseDelta intake.

## Component diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ORCHESTRATOR                                │
│                       (npm run orchestrator)                         │
└─────────────────────────────────────────────────────────────────────┘
            │
            │ parallel scrape
            ▼
┌────────────────┬────────────────┬────────────────┬────────────────┐
│  OC Register   │     KTLA       │   Patch OC     │  OC Fire/Twit  │
│   (Playwright) │  (Playwright)  │  (Playwright)  │   (Nitter)     │
└────────────────┴────────────────┴────────────────┴────────────────┘
            │
            │ upsert (dedupe on source+source_url)
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│             Supabase: ocinjured.incidents                            │
└─────────────────────────────────────────────────────────────────────┘
            │
            │ human selects top-scoring incidents (MVP) / auto in v1
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│       AD ENGINE: npm run campaign:create -- --incident-id=<id>      │
│   1. creative-gen.ts: Claude → 3 ad variants                         │
│   2. meta-api.ts: spin Meta campaign (PAUSED until human approval)  │
│   3. write to ocinjured.campaigns                                    │
└─────────────────────────────────────────────────────────────────────┘
            │
            │ human approves in Meta Ads Manager (MVP)
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│   Meta serves geo-fenced ads → consumer clicks → ocinjured.com      │
└─────────────────────────────────────────────────────────────────────┘
            │
            │ form submit
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│   intake.js POST /api/intake → CaseDelta intake webhook              │
│   (also writes to Supabase ocinjured.leads with full provenance)    │
└─────────────────────────────────────────────────────────────────────┘
            │
            │ qualification.ts scores
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│   Supabase: ocinjured.leads (is_qualified flag)                      │
└─────────────────────────────────────────────────────────────────────┘
            │
            │ daily report (cron in v1)
            ▼
                  Slack / email summary
```

## Why this shape

- **Pull-based scraping** (cron-like daily orchestrator) is simpler than push-based webhook listening. No infra to maintain. Fine for MVP.
- **Human-in-the-loop campaign approval** keeps ad spend safe during MVP. Auto-spin in v1 once we trust qualification.
- **Static landing page on Cloudflare Pages** has zero cold-start, zero ops cost. Form submits POST to CaseDelta's existing API.
- **Supabase schema separation** (`ocinjured.*` tables) avoids polluting the main CaseDelta schema while sharing infrastructure.
- **All routing through CaseDelta** during MVP means no PLLC required, no external partner negotiations, no regulatory exposure.

## v1 evolution

- Scrapers run continuously (every 15 min) via Lambda + EventBridge.
- Auto-spin campaigns within 4 hours of qualifying incidents.
- AI voice callback within 60s of form submit (Twilio + Delta agent).
- Multi-touch SMS / email sequences for non-responsive leads.
- Outcome tracking webhooks from partner firms.
- Per-cell matrix dashboard (geo × vertical × channel).

## v2 evolution

- Path 2: digital direct-response after 30-day window (skip-trace → personalized email + custom-audience retargeting).
- Path 3: public-post engagement (Reddit + Facebook Groups, post-PLLC).
- GoFundMe + workers' comp + insurance commissioner scraping.
- Mass tort early-warning engine.
- Compliance substrate (per-state Rule 7.3 matrix).

See `BACKGROUND.md` §17 for full phase plan.
