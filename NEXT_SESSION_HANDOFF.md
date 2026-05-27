# OCInjured — Handoff for Next Session (2026-05-27 v2)

This supersedes the V1 handoff from earlier today. State has changed materially: new BM, new ad account, new Page, new Pixel, slim form, OpenAI spam filter, Slack alerts, and a sharpened strategic frame that pivots us away from the original hyperlocal-AI-first approach toward a manual-PoC-first approach. Read end-to-end before acting.

---

## 0. The 30-Second Version

OCInjured is now a **marketing-front operation for CaseDelta platform sales.** Leads are the wedge — we hand qualified PI leads to general PI firms, build trust over weeks/months, then upsell the CaseDelta platform (matter management, chronologies, AI memory, integrations). The leads themselves don't have to be a profitable business; they have to make a partner firm say *"who is this person sending me retainers — what else have they got?"*

Three remaining steps to first ad live:

1. **You make 4 creative variants** in Canva (~2-3 hrs of your time)
2. **You add a payment method** to ad account `act_120247798467300529` in Meta Billing
3. **You create one campaign** directly in Meta Ads Manager UI (skip the `campaign:create` CLI for MVP)

Everything else is in place: landing page, form, spam filter, Slack alerts, Pixel firing, the whole funnel. We're three human-loop tasks away from serving impressions to OC consumers.

---

## 1. What's Different from V1 (2026-05-27 morning)

| Area | V1 state | V2 state (now) |
|---|---|---|
| Meta business | Using existing CaseDelta BM (`1523525049382179`) — permission-blocked | New **OCInjured BM** (`1309589517813873`), user is full admin |
| Meta ad account | `act_238417253` (CaseDelta law-firm; couldn't add OCInjured Page) | New **`act_120247798467300529`** (clean, OCInjured-owned) |
| Facebook Page | None (ads would have said "Sponsored by CaseDelta") | New **OCInjured Page** (`61590225939905`), category "Local service" |
| Meta Pixel | Empty placeholder in landing page | **`949501294563991`** — live and firing PageView + Lead events |
| Vercel deploys | Stuck in `BLOCKED` (git author email mismatch) | Working — repo-local `user.email = camren@casedelta.com` |
| Intake form | 5 required + 3 optional fields, ~3 min to submit | **4 fields total** (name, phone, what-happened, consent), ~30 sec |
| Spam protection | None | Honeypot + 20/hr IP rate-limit + GPT-4o-mini classifier |
| Lead alerting | Silent inserts to DB; nobody knew | **Slack alert** to `#pi-lead-connector` on every qualified inbound |
| Strategic model | Lead-gen business with AI-hyperlocal moat | Marketing front for platform sales; hyperlocal is Phase 2 |
| Creative strategy | AI-generated per scraped incident (`campaign:create` CLI) | Manual creation by you in Canva (skip CLI for MVP) |

The strategic pivot is the biggest change. We went deep on niche-selection economics and the right read is: **prove the basic loop works first, layer hyperlocal as an optimization later.** All the scraping/orchestrator/CLI/incident-geocoding infrastructure stays in the repo but isn't on the MVP critical path.

---

## 2. Strategic Frame (Read This Before You Make Decisions)

The reframe that anchors everything else:

**Leads are the wedge, the CaseDelta platform is the product.** This implies:

- Lead **quality** > lead volume (one impressive case > 10 mediocre ones)
- Only metric that matters is **retain rate × case value × volume** (in that order — retain rate dwarfs everything)
- Niches should be ones **any general PI firm can absorb in-house**, not specialist work (don't refer to truck-specialty or med-mal specialists)
- Don't build dashboards/AI-provenance theater for the firm — they don't care; they care about retainer counts at month-end
- Speed-to-call is the single biggest conversion lever (within 5 min vs. within 60 min = 5-10x difference)

The umbrella niche is **vehicular-collision personal injury** with six sub-niches that all collapse into "auto-accident case" for the partner firm:

1. **Standard auto** (rear-ends, intersections, lane-changes) — bread and butter
2. **Rideshare** (Uber/Lyft passenger/driver) — corporate $1M+ policy
3. **Commercial-vehicle** (Amazon Flex, FedEx Ground, UPS, DoorDash, work trucks) — corporate defendant
4. **Hit-and-run with identifiable vehicle** — UM claim, sympathy-rich, very high retain rate
5. **Pedestrian/cyclist struck by vehicle** — highest case-value × retain product
6. **Motorcycle** — high severity, medium retain (liability sometimes contested)

**Explicitly excluded** (don't entertain at MVP scale): slip-and-fall, dog bites, premises liability, med-mal, mass tort, workers' comp, wrongful death (Meta-policy risk), big-rig 18-wheelers (specialist referral), catastrophic injury (wrong stage for hyperlocal ads), aviation/maritime.

For MVP, run **one wide-funnel campaign** ("car accident in OC?") that the AI Meta delivery algorithm will optimize across all six sub-niches via the Pixel + Lead event signal. No niche-specific creative yet — that's Phase 2 hyperlocal optimization.

---

## 3. What's Live and Verified

### Infrastructure

- **Domain**: `ocinjured.com` + `www.ocinjured.com`, Route 53, Vercel-hosted, valid SSL
- **Landing page**: live at `https://ocinjured.com`, slim 4-field form, Pixel firing, fbq Lead event wired on form-success
- **Intake pipeline**: form → `/api/intake` (Vercel edge) → honeypot check → rate-limit → OpenAI spam classifier → HMAC sign → CaseDelta webhook → Supabase `ocinjured.leads` → Slack alert
- **CaseDelta endpoint**: `POST https://qa-api.casedelta.com/v1/internal/leads/ingest`, HMAC-signed, working
- **Database**: Supabase QA `eawdsvitewlhhcctowqk`, schema `ocinjured`, table `leads` clean (0 rows)
- **Slack alerts**: posting to `#pi-lead-connector` on every qualified inbound, visually confirmed working
- **Spam filter**: GPT-4o-mini classifier active (tested: blocked "John SEO" promo with fake 200, no DB write)

### Meta assets (all in OCInjured BM)

- **Business Portfolio**: `1309589517813873` ("OCInjured"), email verified to `camren@casedelta.com`
- **Ad account**: `act_120247798467300529` (USD, America/Chicago, NO payment method yet)
- **Facebook Page**: `61590225939905` (category: Local service)
- **Meta Pixel**: `949501294563991` (firing PageView; will fire Lead on form-submit)
- **System user**: "Camren Hall" (`61590337145367`), Admin role, Page + Ad account assigned, **token NOT generated** (requires app registration first; Phase 2 task)

---

## 4. Critical Path to First Ad Live (3 Tasks)

### Task 1 — Make 4 creative variants (you, ~2-3 hrs in Canva)

For each variant: one image, one headline (≤40 chars), one primary text (≤125 chars in first line, full text expandable). All four use the same destination URL `https://ocinjured.com?utm_source=meta&utm_campaign=oc_v1&utm_content=<variant_slug>` so the form's `channel` field captures which variant drove the lead.

**Variant 1 — PAIN:**
- Headline: `Still hurting from your OC accident?`
- Primary: `Headaches, neck pain, back pain after a crash often get worse — not better. Talk to a local Orange County accident specialist before they do. Free, no obligation, 30 seconds.`
- Image direction: someone (back of head visible) holding neck/back, dim indoor. Unsplash: `neck pain` / `back pain`
- UTM content: `pain`

**Variant 2 — BENEFIT:**
- Headline: `Focus on healing. We'll handle the rest.`
- Primary: `Hurt in an Orange County accident? Get free, no-pressure answers about your case — and let someone else deal with the insurance company. Local OC team. No fees unless you win.`
- Image: warm sunlit / person looking peaceful. Unsplash: `recovery`, `peaceful`, `california beach calm`
- UTM content: `benefit`

**Variant 3 — CHALLENGE (this is the one I'd bet on):**
- Headline: `The insurance company is already calling.`
- Primary: `After your OC accident, the insurance company has a 48-hour head start. Get free guidance from a local specialist before you say anything you can't take back.`
- Image: a phone ringing on a table, abstract. Unsplash: `phone call concerned`, `decision`
- UTM content: `challenge`

**Variant 4 — URGENCY:**
- Headline: `Hurt in OC in the last 30 days?`
- Primary: `The first month after an accident matters more than the rest combined. Free guidance from a local OC accident specialist. 24/7. No pressure.`
- Image: subtle clock/calendar/sunset. Unsplash: `calendar`, `sunset urgency`
- UTM content: `urgency`

**Creative rules to keep:**
- No literal dollar amounts (Meta flags)
- No specific incident references (generic creative — incident-specific is Phase 2)
- Soft CTAs only ("Learn More", "Get Free Answers", "Get Help") — never "Sue Now"
- No "lawyer / attorney / law firm / lawsuit" in copy — keep consumer-help-coded
- Image text overlay <20% (Meta de-prioritizes ads with more)

**Meta Ad Library research** (look at what's already working before you make your own):
- `https://www.facebook.com/ads/library/?active_status=active&country=US&q=personal%20injury%20orange%20county`
- Browse top-spending PI ads in CA, see image style, copy structure, CTA conventions

### Task 2 — Add payment method to ad account

- Go to Meta Business Suite → Billing & payments → `act_120247798467300529` → Add payment method
- Credit card or business debit
- This unblocks the ad account from delivering impressions; without it the campaign spins but never serves

### Task 3 — Create one campaign in Ads Manager UI

- Ads Manager → New campaign
- **Objective**: Sales (with `Lead` Pixel event as conversion) OR Leads (Meta's lead-gen objective). Sales-with-Lead-event is cleaner because it uses the existing Pixel firing rather than Meta's lead-form-on-platform flow which sends to a Meta-native form, not our landing page.
- **Ad set**:
  - Audience: Orange County radius (Anaheim center, 25mi covers all of OC)
  - Demographics: 22-65, all genders
  - Detailed targeting: leave it broad to start — let Meta's algorithm + the Pixel learn. Or layer "interests = personal injury / auto insurance / lawyer" if you want narrower
  - Daily budget: $100
  - **Lifetime cap: $300** (defense-in-depth so a runaway can't blow past your weekly intent)
- **Ads**: all 4 variants in one ad set
- Launch in PAUSED state, review the Preview, then activate

Watch Slack. First lead should land within a few hours if anything's working.

---

## 5. Intake Call Script (for when Slack fires)

When Slack pings, drop everything and call within 5 minutes. 24/7 commitment for MVP (later AI/VA assisted). Calling from your KS number is fine for now; provision a 949 Twilio number once volume justifies (~30% pickup-rate lift).

**Script — ask in this order, branching to disqualifiers fast:**

1. *"Hey [Name], this is [Camren] from OCInjured — saw your message about [paraphrase incident from form]. Are you free to talk for a few minutes?"* (Establishes context, gives them an out if bad timing)

2. *"First and most important — do you currently have an attorney representing you for this?"* → **Binary disqualifier.** If yes, thank them, wish them luck, end. Don't probe.

3. *"Have you seen a doctor about your injuries — or are you planning to?"* → **#1 retain-rate predictor.** If no and no plan to: gently explain why that matters (your case is much weaker without medical documentation), recommend they see a doctor regardless of legal action, soft-disqualify.

4. *"Walk me through what happened — date, where, who was involved."* → Get the facts. Listen for: clear at-fault party, deep-pocket defendant (rideshare, commercial vehicle, hit-and-run with ID), severity of injuries.

5. *"Did the police come out? Is there a police report number? Did you take any photos at the scene?"* → Quality signals; firms LOVE leads with police reports + photos.

6. *"Has the other driver's insurance company contacted you yet? Have you said anything to them?"* → If yes and they've given a recorded statement, flag it for the firm but not disqualifying.

7. *"How are you feeling now — is the pain getting better, the same, or worse?"* → Severity proxy. "Worse" is high case value.

8. *"Last question — are you OK if I connect you today with a local Orange County personal injury attorney who can review your case for free? They'll take it from here, no pressure to sign anything."* → **The consent-to-refer ask. Load-bearing.** If they say no, document that and exit gracefully.

**At end of qualifying call:**
- If qualified + consent given: warm-transfer to partner firm if you have one available, OR text the firm's intake line the summary and hand off. Warm-transfer converts 5-10x better than email handoff.
- If disqualified: thank them, no obligation, end. Tag the lead in `ocinjured.leads` with `disposition: not_qualified_<reason>` so we can track disqualification patterns.

---

## 6. What's Parked (Phase 2+)

Explicitly NOT on the MVP critical path. Each of these has been considered and deliberately deferred:

- **`campaign:create` CLI** (and Meta access token, and Meta app registration) — only needed for automated incident-driven campaign creation. Manual ads-manager UI is faster for one campaign.
- **Hyperlocal incident-targeted creative** — the AI moat. Build after we prove basic CPL economics work generically. Until then, the scrapers/incidents/geocoding/orchestrator are all dead code.
- **Scraper fixes** (KTLA, OC Fire Twitter) — irrelevant when not running incident-specific creative
- **Orchestrator scheduling** — manual run only; the orchestrator doesn't matter when scrapes aren't being consumed
- **AI creative generation** (Anthropic OR OpenAI image gen) — you make creative manually. Anthropic key in SSM is 401, OpenAI key only used by spam filter, both are fine
- **Anthropic key rotation** — not needed; you said you'd generate creative yourself
- **Partner-firm dashboard / weekly digest / AI-provenance reporting** — they don't care; retain count is the only metric they read
- **CRM integrations with partner firms** — over-engineered for MVP
- **Conversions API (vs. just Pixel)** — Phase 2 optimization, ~17% CPL lift, not load-bearing
- **Twilio 949 callback number** — wait until volume justifies; calling from your KS cell is fine for the first 10-20 leads
- **Geocoding remaining 21 incidents** — only matters if we run incident-specific creative
- **Re-engagement of non-converters** — premature for MVP

---

## 7. Credentials & Access (Current State)

All values are in `.env` (gitignored). Vercel production has its own copies — `OPENAI_API_KEY`, `SLACK_WEBHOOK_URL`, `INTAKE_WEBHOOK_URL`, `INTAKE_WEBHOOK_SECRET` are set.

**Meta (OCInjured BM):**
- `META_BUSINESS_ID=1309589517813873`
- `META_AD_ACCOUNT_ID=act_120247798467300529`
- `META_PAGE_ID=61590225939905`
- `META_PIXEL_ID=949501294563991`
- `META_APP_ID=1871334880162905` (still CaseDelta app — needs swap when we register an OCInjured app)
- `META_APP_SECRET=...` (still CaseDelta app secret)
- `META_ACCESS_TOKEN=...` (STALE — was from old CaseDelta BM, not valid for new ad account. Regenerate when needed via Phase 2 app-registration flow)

**OpenAI** (intake spam filter, active in prod):
- `OPENAI_API_KEY=sk-proj-HK-iK2bx1...`

**Slack** (#pi-lead-connector channel webhook):
- `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T09JZLPD7TK/B0B6CJDJP6F/...`

**Anthropic**: key in `.env` matches SSM `/casedelta/qa/ai/anthropic-api-key` but returns 401 — rotated externally. Not needed for current flow.

**Supabase QA** (CaseDelta DB; `ocinjured` schema):
- PG: `aws-1-us-east-2.pooler.supabase.com:5432`, user `postgres.eawdsvitewlhhcctowqk`, password in `.env`

**Vercel** (project linked):
- Project ID: `prj_2ZAAft8E3W0E4Uq9oPRu6Y3LbnP6`
- Team ID: `team_kcpdbORjmzWQboWoEa4FgucJ`
- CLI authed as `camren-casedelta`

---

## 8. Hard-Won Gotchas (Don't Re-Learn These)

1. **Vercel git author email enforcement.** Vercel blocks deploys where the commit author email isn't associated with the linked GitHub account. Repo-local `git config user.email "camren@casedelta.com"` is set; do NOT switch back to `camrenhall@gmail.com` or deploys silently BLOCK. The CLI calls this state "UNKNOWN" which is misleading — the MCP `get_deployment` reveals state `BLOCKED` and project `live: false`.

2. **Meta Page-name and System-User-name policies are strict.** Hyphens get rejected ("too many hyphens"), capitals get rejected ("too many capital letters"), names like "Ads Bot" or "Site Manager" get rejected as "invalid System User name." Real human-sounding names ("Camren Hall") pass on first try. If creating new system users, use a human-style name.

3. **Meta won't let you create a Web Pixel from a BM where your user has limited perms.** The Web data-source row in the Connect-Data dialog goes `aria-disabled="true"` silently — no tooltip explaining why. The only fix is being a full admin of a BM you own. Hence the new OCInjured BM.

4. **`Generate token` button stays disabled until the BM has a Meta App registered.** System user assignments to assets aren't enough by themselves. To unlock the button, register an app at developers.facebook.com → add it to the BM → configure Marketing API product. Skipped for MVP.

5. **CaseDelta backend qualification scoring drops if you remove form fields.** We send `null` / `false` for dropped fields from the edge function to keep the contract stable. Auto-qualification score will be lower than it was pre-slim (no checkbox signals) but that's fine — qualification is now manual via phone anyway.

6. **The OpenAI spam filter fails open.** No `OPENAI_API_KEY` set, OR classifier API errors → submission is allowed through. Better to let 1% spam land than block real victims when OpenAI hiccups. Same fail-open behavior for the Slack alert.

7. **Per-Lambda-instance in-memory rate-limiting is weak.** The 20/hr IP cap in `api/intake.ts` resets on Vercel cold-start and is per-instance. Adequate for MVP scale; upgrade to Vercel KV (Redis) when bot traffic justifies.

8. **All test leads are deleted.** `ocinjured.leads` is empty as of handoff. The first row to land will be a real consumer ad-click (or your own smoke test if you do one before launch — tag it `channel='smoke_test'` and clean up after).

9. **Anthropic key is dead.** SSM `/casedelta/qa/ai/anthropic-api-key` and the value in `.env` both return 401. Whoever rotated it didn't update SSM. Not needed unless you go back to AI creative generation.

10. **Secrets in chat transcripts.** OpenAI key + Slack webhook URL were pasted in cleartext during this session, so they're in the chat history. Lower-blast-radius (Slack webhook is just a write-to-channel URL; the OpenAI key bills your account but has hard spend limits). Rotate if the transcript ever sees third-party eyes.

---

## 9. Open Items (Not Critical Path, Worth Tracking)

- **Partner PI firm**: you said "I'll hand it off to a random firm when I feel like it" — no formal partner agreement needed for MVP. But before retainer outcomes can be tracked, the receiving firm needs to commit to reporting back which leads signed. Bake into the first conversation.
- **Hours/SLA**: you said "we will ALWAYS call back. 24/7." Manual for MVP; later AI/VA. Holds.
- **Lifetime budget cap per ad set**: you said you'd set manually at launch. Make sure to actually do this — Meta's daily cap can be exceeded ~25% on high-volume days.
- **First-lead Slack message format**: currently shows name, phone, what-happened, auto-score, qualified flag, lead ID. Tune wording when you see the first one land — what extra context would help you call faster?
- **Outbound dialer**: when manual calling stops scaling (probably ~20+ leads/day), evaluate Twilio Voice / Aircall / a VA service.

---

## 10. Repo State at Handoff

- Branch: `main`
- Latest commit: `8251b90` (slim form + honeypot + spam filter + Slack alerts)
- Vercel prod alias: `https://ocinjured.com` → deployment `4tsj1y9mg` (with `OPENAI_API_KEY` + `SLACK_WEBHOOK_URL` active)
- Working tree: clean (no uncommitted changes at handoff time)
- Local `.env`: contains all current Meta IDs, OpenAI key, Slack webhook URL, Anthropic key (dead), Supabase creds

---

## 11. References

- V1 handoff (historical, this file replaces it): see git log for prior state of `NEXT_SESSION_HANDOFF.md`
- `BACKGROUND.md` — strategic origin (still valid; the marketing-front pivot is a refinement, not a contradiction)
- `CLAUDE.md` — operational instructions for AI/dev sessions in this repo
- `docs/ARCHITECTURE.md` — component diagram + evolution
- `casedelta-cloud/CLAUDE.md` — hard rules for the backend (consult before touching that repo)

---

*Update this document as state changes. The future-you reading this depends on it being current. Specifically: when the first ad goes live, when first lead lands, when first retainer signs — update §0 and §3 at minimum.*
