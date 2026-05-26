# OCInjured — Strategic Background

This document is the exhaustive strategic context for the OCInjured project. It captures the full reasoning chain behind every architectural and go-to-market decision, so that any future operator (human or AI) can pick up the work without losing context.

---

## 1. Origin & Thesis

### 1.1 The CaseDelta parent business

CaseDelta is an AI associate (**Delta**) that connects to a law firm's existing tools — case management, email, drive, billing — and does the cognitive work eating their billable time. The primary ICP is Mass Tort, Personal Injury, and Medical Malpractice firms (5-50 attorneys). The product moats are (a) integrations, (b) AI-generated chronologies on large document sets, (c) security architecture, (d) compounding institutional memory, and (e) per-firm pricing.

CaseDelta has spun up automated outbound email marketing, is hiring an outbound sales representative, and is running Meta ads. These are traditional sales channels and are flooded by other operators. The thesis driving OCInjured is that **traditional outbound is a commodity; we need to invent channels nobody else is using to win**.

### 1.2 The pool guy story (the originating insight)

A startup founder used Google Earth to photograph homeowners' backyards, fed the images through ChatGPT to insert AI-generated pools, then sent the augmented images to the homeowners with "look how nice your home looks with a pool installed out back — would you like a consultation?" He forwarded the qualified leads to a real pool installation company and took a fee on top.

The brilliance of this play has three layers most people miss:

1. **The artifact WAS the deliverable, not a description of it.** He didn't *tell* homeowners "imagine a pool" — he *handed* them a pool. A degraded version, but the actual thing. The marketing collapsed into the product demo.
2. **He inverted the buyer.** He didn't sell pool installers harder. He sold homeowners, then sold the resulting qualified leads. The B2B sale became "buy this lead" instead of "buy my service" — a much easier yes.
3. **The personalization was the hook AND proof of effort.** A generic pool render is stock. A render of *their* backyard is a gift, a flex (look what we already did for you), and a signal you did homework — all in one artifact.

Most "creative marketing" advice optimizes for (1) only. The compounding magic is all three stacked.

### 1.3 Translating the pool model to PI

For PI law firms, the dream outcome is *receiving a case with clear liability, deep-pocket defendant, and badly-injured plaintiff for a huge settlement*. The pool-equivalent play is:

- **Sourcing the lead is the artifact.** A qualified PI lead is worth $300-$10K+ depending on case type. Handing a partner a real, retainable lead is the literal pool render.
- **Funnel inversion.** Instead of selling CaseDelta seats to PI firms, we sell them leads. The B2B sale becomes "buy this qualified lead" not "buy this subscription."
- **AI personalization at scale.** Per-incident ad creative, AI voice intake, AI-augmented qualification — the same AI we built for CaseDelta becomes the engine for a lead-gen consumer brand.

OCInjured is the operationalization of this pool play, scoped initially to Orange County.

### 1.4 Why a separate brand from CaseDelta

CaseDelta is a B2B brand. A consumer who was just rear-ended on the 405 isn't going to click "CaseDelta.com." The landing page brand has to feel like consumer help. Hence OCInjured — a consumer-recognizable, geo-specific brand that telegraphs "this is for people who got hurt in Orange County."

CaseDelta and OCInjured share infrastructure (AWS, Supabase, Bedrock, the Delta agent stack), but operate as distinct product surfaces with distinct branding.

---

## 2. ICP & Customer Identity

### 2.1 Two-sided market

OCInjured is a two-sided market by design, even if MVP only operationalizes one side:

**Consumer side (the lead source):**
- People injured in motor vehicle accidents, premises liability incidents, commercial vehicle crashes, dog attacks, slip-and-falls, and similar PI events in Orange County.
- They typically discover us within 24-72 hours of incident via Meta ads, Google ads, or organic search.
- They are in a high-emotion state, mobile-first, and looking for fast help.
- Their dream outcome is: someone who actually picks up the phone, takes their case seriously, and gets them a fair settlement without them having to fight.

**Firm side (the lead buyer / partner):**
- Personal injury law firms in Orange County (eventually nationwide).
- 5-50 attorney shops are the sweet spot — large enough to handle volume, small enough that one new partner relationship is meaningful revenue.
- Their dream outcome is: a steady flow of pre-qualified, signed cases with deep-pocket defendants and clear liability that they can take through to settlement at standard 33% contingency.

### 2.2 MVP routing decision (CaseDelta-direct)

For MVP we route leads to CaseDelta directly (not external partner firms) for several reasons:

1. **Regulatory simplicity.** Until we have a PLLC with intake counsel of record, fee-splitting with external firms is gray. Routing to CaseDelta-owned infrastructure is just data collection.
2. **Quality validation.** We need to know what a "qualified lead" actually looks like before we promise partners.
3. **No partner-firm negotiations blocking ship.** We can iterate fast without external dependencies.
4. **Optionality.** Once we have lead volume + quality data, we can decide whether to (a) sign exclusive partners per metro, (b) sell on open market, (c) operate our own PLLC.

### 2.3 Orange County selection

We chose Orange County over Houston (initial recommendation), LA, or other Texas metros because:

- **Local firm relationships are achievable in-person.** The founder lives nearby; relationship density compounds.
- **OC has high case value.** Affluent demo + premises liability against big retailers + commercial vehicle from PCH/405 corridor + med-mal from major hospitals (Hoag, UCI Health) = average PI case values above national average.
- **OC ad CPCs are lower than LA.** LA PI keywords run $300-500+ per click; OC is $50-150. Same demand-side AI advantage, lower cost-side burn.
- **Smaller competitive field.** LA is saturated by massive operators (Wilshire Law Firm, Pacific Attorney Group); OC has fewer dominant players, easier to become the de facto lead source.
- **Path to scale is clean.** OC → expand to LA with proof points → national.

---

## 3. The Dream Outcomes Framework

A core operating principle from the pool story: the most powerful marketing artifacts ARE the dream outcome, not descriptions of it. To design OCInjured well we have to be specific about whose dream and what version.

### 3.1 PI partner dream outcomes (ranked by visceral impact)

1. **A lead worth $100K-$10M in fees** (an accident, a class member, a referral) — top of list by an order of magnitude.
2. **An MDL / mass tort opening** where filing this week vs. next month decides lead counsel position.
3. **A finished work product** they were going to staff to a $250/hr associate.
4. **Talent walking in their door** they didn't have to recruit.
5. **A defendant dossier or judge memo** that materially changes a current case.
6. **Status** — press, awards, ranking, podcast features.
7. **Inside info on a peer / competitor** (acquisition target, hiring movement, malpractice).

What is NOT a dream outcome: data analyses, competitive teardowns, intake-call audits, SEO reports. Partners already know that stuff or could ask their COO to pull it. **The wedges that work are delivered work or delivered opportunity, not delivered insight.**

### 3.2 Consumer dream outcomes (PI victims)

1. **Someone picks up the phone immediately.** 24/7. Empathetic. Knows what to ask.
2. **Free advice that doesn't feel like a pitch.** They want to know if they have a case before they commit.
3. **A clear next step.** Most victims have no idea what to do after an accident; we provide the script.
4. **Fast progress.** They feel taken care of, not stuck in a queue.
5. **Maximum settlement.** Long-term goal but emotional driver.

### 3.3 How OCInjured delivers both

For consumers: AI voice intake that answers within 60 seconds, conducts a real conversation (not a form), and warm-transfers to a partner firm. The dream outcome IS the product surface.

For firms: pre-qualified case files (not names) handed over with all preliminary work done. The dream outcome IS the lead handoff.

---

## 4. The Three Paths to PI Lead Sourcing

We identified three distinct mechanisms for sourcing PI leads. Each has different volume, cost, and regulatory characteristics.

### 4.1 Path 1 — Hyperlocal incident-triggered advertising

**Mechanic:**
1. Scrape public sources (police reports, local news, fire/EMS feeds) for serious-injury incidents in OC within 4-6 hours of occurrence.
2. AI generates a unique ad creative + landing page per incident, referencing the actual incident (location, vehicle type, severity, likely defendant if commercial).
3. Geo-fenced Meta + Google ad campaign serves to the 5-mile radius around the incident, targeted to the demographic the report implies.
4. Victim sees the ad in their Facebook feed within 24-48 hours of the incident ("Were you involved in the multi-vehicle crash on the 405 northbound Tuesday morning?").
5. Click → Delta-powered landing page → AI voice/chat intake within 60 seconds → qualified lead routes to receiving firm.

**Why it works:** We're never the contact initiator. We're broadcast advertising — same legal posture as a TV billboard. But the ad is aimed with surgical precision competitors can't match because they're using demographic targeting; we're using actual incident data. The personalization makes CTR 5-10× generic PI ads.

**Why it's the MVP target:** Fastest path to validating the core thesis (AI-personalized hyperlocal ads beat generic PI ads). Highest AI edge. Cleanest regulatory posture. No PLLC required. No external partner negotiations.

### 4.2 Path 2 — Digital direct-response (post-30-day digital equivalent of mail)

**Mechanic:**
1. Same public-record scraping as Path 1.
2. After 30 days (most state bar rules permit written solicitation after this window with "ADVERTISEMENT" labels):
   - Skip-trace the victim's email + cell phone from name/address via TLO, IDI, or BatchSkipTracing (~$2-5/lookup).
   - AI generates a personalized email with proper labels referencing the specific incident, likely defendant, SOL clock.
   - Upload email + phone to Meta Custom Audience + Google Customer Match — narrow-cast retargeting follows the victim around the internet.
   - SMS only after the victim has provided express consent via landing page or email click.
3. Multi-touch sequence over 14-30 days.

**Why it's deferred:** Requires skip-trace setup, more complex compliance (TCPA exposure on SMS), and 30-day delay window means slower iteration. Adds value as a complement to Path 1, not a substitute. Plan: ship as v1 add-on after Path 1 MVP proves out.

### 4.3 Path 3 — Public-post engagement (NYSBA Opinion 1049 unlock)

**Mechanic:**
1. AI-monitor Reddit (r/Insurance, r/legaladvice — though hostile, r/CarAccidents, city subs like r/AskLosAngeles + r/AskOrangeCounty), Twitter/X, public Facebook Groups, NextDoor (where accessible) for posts matching "I was in an accident, can anyone recommend a PI lawyer in [city]" patterns.
2. AI responds on-platform (the channel the OP invited) with a helpful comment or DM introducing a partner firm.
3. Op 1049 protection: NYSBA Ethics Opinion 1049 explicitly holds that responding to a public invitation is NOT solicitation under Rule 7.3 — the consumer initiated by publicly asking.

**Critical nuance:** Op 1049 protects responses in *the channel the OP invited*. They posted on Reddit → comment on Reddit. They said "DM me" → you can DM. If you scrape the post and then text or call them, you're back in Rule 7.3 + TCPA hell. The substrate must enforce channel-respect.

**Why it's deferred:** Requires PLLC with intake counsel of record to fully invoke Op 1049 protection (technically the protection covers *lawyers* responding — operating through a non-law-firm entity is murkier). Volume is modest (~500-1500 qualifying public Reddit posts/week nationally per the recon agent's findings). Plan: ship as v2 after PLLC formation.

**Recon highlights (Path 3 viability validation):**
- ~500-1500 qualifying public Reddit posts/week nationally; Facebook public groups probably 2-3× that.
- r/Insurance is the dark horse, not r/legaladvice (which bans referrals via AutoMod).
- Texas Tier-1 metros (Houston) and OC/LA punch above weight on volume × case-value intersection.
- Channel is LESS competitor-saturated than published marketing copy suggests — no operator has actually scaled it because manual lawyer ops get shadowbanned within weeks.
- The per-state response-permission matrix is itself defensible IP; nobody has built it.
- Freshness window: 1-4 hours in high-traffic city subs; 12-48 hours in r/Insurance.

### 4.4 Why all three paths together (eventual end-state)

- **Path 1** = primary volume engine. Scales to every metro with public-record API. Most defensible AI edge (per-incident creative).
- **Path 2** = long-tail capture. Recovers leads that didn't engage with Path 1 within the 14-day window.
- **Path 3** = highest-margin, lowest-volume, also doubles as the compliance-substrate moat (the per-state matrix benefits all three paths).

MVP ships only Path 1. v1 adds Path 2. v2 adds Path 3 (gated on PLLC formation).

---

## 5. MVP Scope & The Path 1 Bet

### 5.1 What's IN for MVP

The thesis to validate: *AI-generated, hyperlocal, incident-aware ads beat generic PI ads on cost-per-qualified-lead.*

Minimum stack to prove or kill this:

1. **One source**: OC local-news scraping (OC Register, KTLA, KCAL, Patch OC, fire/EMS Twitter accounts, local OC Facebook community pages) via Playwright. Skip the police-report API for v0 (setup overhead — Texas DPS CRIS exists, California is more fragmented). News is fresher anyway.
2. **One channel**: Meta hyperlocal ads, geo-fenced to incident location.
3. **One AI creative engine**: template with variables (location, incident type, vehicle, severity) — Claude generates copy + Meta API spins up campaign within 4 hours of incident.
4. **One landing page**: ocinjured.com, single page, mobile-first, 5-question intake form (or simple AI chatbot if cheap to wire).
5. **One database**: Supabase table with full provenance per lead.
6. **One report**: daily email with leads count, cost, qualification rate.

### 5.2 What's CUT for MVP

- Matrix testing (4-5 cells across metro × vertical × channel) → ONE cell only.
- GoFundMe scraping → defer to v1.
- Mass tort vertical → defer (different funnel mechanics).
- National wide-funnel → defer (commodity channel, weaker AI edge).
- Skip-trace / enrichment → not needed (consumer fills own contact on landing page).
- Defendant lookup / insurance research → defer (needed for premium case-file handoff, not for lead validation).
- AI voice callback → defer (chat intake is enough to test conversion).
- Outcome tracking webhooks → no partner firms yet, no outcomes to track.
- Compliance substrate → not needed (marketing-only ops, no Rule 7.3 exposure).
- Cross-channel continuity → one channel for MVP.
- Per-state response matrix → not applicable in marketing-only mode.

### 5.3 MVP build sequence (2 weeks)

- **Days 1-3**: repo scaffold + Supabase + Playwright news scraper for OC + landing page deployed at ocinjured.com.
- **Days 4-7**: Meta Marketing API integration + AI creative generation + first campaign goes live.
- **Days 8-10**: intake form → qualification scoring → lead storage with full provenance.
- **Days 11-14**: daily dashboard email + iterate on creative quality.

### 5.4 MVP success criteria

- Cost-per-lead (CPL) under $50.
- Qualification rate (leads passing minimum bar) above 40%.
- At least 10 qualified leads in first 14 days.
- Demonstrable creative-quality lift over generic PI Meta ads (compare CTR).

If these hit: thesis validated, scale to matrix in v1.
If they don't: kill or pivot before sinking more ad spend.

### 5.5 MVP budget

$5-10K total ad spend allocated as:
- ~$2K on hyperlocal Meta campaigns
- ~$1.5K on creative iteration / A/B testing
- ~$500 on Anthropic API + Supabase + infrastructure
- ~$1K reserve for retargeting or expanded geos
- Remainder held back for v1 transition

---

## 6. The Compliance Reality

### 6.1 What we can do without a PLLC (marketing-only mode)

OCInjured for MVP operates as a marketing entity (under CaseDelta or as a standalone LLC). We:
- Run consumer-facing ads (Meta, Google) — same regulatory posture as a TV billboard.
- Operate a landing page where consumers self-identify and self-consent.
- Collect contact info through forms with explicit consent capture (TCPA-compliant for follow-up).
- Pass leads to a downstream entity (CaseDelta for MVP) for further action.

We do NOT:
- Cold-contact accident victims by name.
- Solicit specific accidents directly.
- Operate as a referral service that takes fee splits from law firms (this requires lawyer-side compliance).

### 6.2 What we cannot do without a PLLC

- Path 3 (public post response) — Op 1049 protects *lawyers* responding to invitations; non-lawyer entities responding is murkier and varies by state.
- Take Rule 7.2(b) referral fees from receiving law firms.
- Hold ourselves out as legal advisors.

### 6.3 The PLLC structure (planned for v1-v2)

The structural unlock that collapses most regulatory friction:

**Register CaseDelta Legal Services PLLC** (or similar) as a single-attorney law firm owned/operated by one licensed California attorney. This is exactly how Morgan & Morgan, Sokolove, Reeves Law Group, and the big national PI shops operate.

Mechanism:
- The PLLC is a registered law firm with bar admission.
- It acquires leads through advertising (its own ads, subject to its own bar rules).
- It qualifies leads and either keeps the case (rare) or refers to network firms under Rule 7.2(b), which permits inter-firm fee splitting with client consent in nearly every state.
- The PLLC collects a referral fee (typically 25-40% of the contingency) when the network firm wins.

Why this changes everything:
- We're no longer a third-party solicitor — we're a law firm.
- Network firms aren't taking ethical risk; they're accepting Rule 7.2(b) referrals.
- Fee economics flip: a single retained case at 33% contingency on a $300K settlement = $100K fees, of which our referral fee is $25-40K. That's 50-100× richer than per-lead pricing.
- Path 3 becomes ironclad protected.

Plan: hire intake counsel (~$150-300K/yr fully loaded) and form the PLLC after MVP validates unit economics. ~60-90 day setup.

### 6.4 Key legal touchpoints to understand

- **ABA Model Rule 7.3** — direct contact with prospective clients. State variations are sharp. Florida (4-7.18), New York (DR 2-103), California are key.
- **NYSBA Ethics Opinion 1049** — explicit carve-out for response-to-public-invitation. Load-bearing precedent for Path 3.
- **TCPA** — $500-1500 per unconsented cell call/text. Post-*Facebook v. Duguid* (2020) the autodialer ban narrowed significantly; manually-initiated calls likely escape. Still risky.
- **CAN-SPAM** — email compliance, much more permissive than TCPA.
- **DPPA (Driver's Privacy Protection Act)** — restricts use of state DMV data for marketing. Permissible-purpose exemptions exist but are litigated.
- **State runner/capper statutes** — Florida, California, Louisiana, Texas. Criminalize paying for case referrals. Lawyer-side risk; structures around it (PLLC, Rule 7.2(b) referrals) are well-established.

---

## 7. The AI Edge (Where Outsized Returns Live)

The lead-gen industry is dominated by 2015-era ad-buying houses with humans pretending to be modern. Where AI gives 10×, ordered by durability of moat:

### 7.1 Pre-qualified case file, not "a name"

By the time the firm sees the lead, AI has already:
- Pulled the police report
- Identified the defendant
- Looked up the defendant's insurance carrier + asset depth + prior litigation
- Drafted a preliminary demand calculation
- Assembled a one-page "this case is worth ~$X" intake brief

Competitors hand over name+phone; we hand over a half-built case. 10× willingness to pay, AND filters out junk before it embarrasses the receiving firm.

### 7.2 Per-incident ad creative + landing page

Most ad ops generate 10-50 creatives and A/B test. We generate a *unique* ad + landing page per incident — referencing the actual crash, the actual intersection, the actual defendant if commercial. Tens of thousands of creatives instead of dozens. Click-through 5-10× generic.

### 7.3 60-second AI voice intake, 24/7

Industry callback time is 30+ minutes. Conversion drops 78% past 5 minutes. Sub-minute callback with real qualification (not "an attorney will reach out") = 3-5× conversion lift before any other edge.

### 7.4 Cross-channel conversation continuity

The same lead talks to us on a Meta ad landing page → SMS → voice → email over 14 days, and the AI maintains full context the whole time. Manual operators lose state at every handoff.

### 7.5 Outcome-backpropagated targeting

Most lead-gen optimizes for lead acquisition (CPL). We optimize for retained-case revenue. Every settlement outcome feeds back into which incident features actually convert to retainable cases — a moat that compounds with every closed case and is invisible to competitors.

### 7.6 Cross-incident mass-tort pattern detection

AI watches the full firehose (police, OSHA, FDA, news, social posts) and flags clusters indicating an emerging mass tort 6-12 months early. First to spot the next Camp Lejeune = $50M+ alone.

### 7.7 Compliance-aware response generation

Every outbound response generated against a per-state Rule 7.3 / TCPA / channel-policy matrix, so it's lawful by construction. This is the moat against scale-clones — a competitor can clone the AI, can't easily clone hand-built lawyer-reviewed compliance routing.

### 7.8 Negative selection

AI actively *kills* leads that won't convert (already represented, weak liability, expired SOL). Hurts gross volume; massively improves customer firm satisfaction; raises premium pricing.

### 7.9 Intent-graph crawl

Continuous scrape of every public expression of post-accident intent across 8-10 channels, deduped, geo-bucketed, ranked. Nobody has this real-time graph.

### 7.10 AI-aimed channel arbitrage

Hour-by-hour reallocation of effort across Meta / Google / TikTok / Reddit / direct mail / SMS based on real-time CPL × conversion × case value. Manual operators react in weeks; we react in minutes.

---

## 8. Under-Looked Sources Nobody Mines

Playwright unlocks scraping of sources that have meaningful volume but no operator presence today. Ranked by signal-to-noise:

### 8.1 GoFundMe (the goldmine nobody mines)

People publicly create campaigns saying "*help my husband after his motorcycle accident*" with:
- Date of accident
- Location (often specific)
- Severity / treatment status
- Family contact (campaign organizer)
- Defendant if commercial
- Pre-demonstrated financial distress (makes settlement compelling)
- **Self-consented public disclosure** (the family chose to make this public)

Probably thousands of US injury-related campaigns per week. Basically zero operator presence. Playwright scrapes clean.

### 8.2 Workers' comp denial registries

Denied workers' comp claimants often have viable third-party PI claims (defective equipment, subcontractor negligence). Almost nobody connects these dots. State boards publish denials.

### 8.3 State insurance commissioner complaint logs

Consumers who complained to the state about an insurer denial are *actively* shopping for legal help. Public, scrapable, near-zero competitor presence.

### 8.4 Local news Facebook page comments

When local TV posts about a major accident, victims' families comment in the thread. Public, geo-tagged by station, scrapable via Playwright.

### 8.5 PACER bankruptcy filings filtered for medical-debt patterns

Medical bankruptcy is the #1 US bankruptcy cause — most filers had injuries they didn't litigate. Cross-reference with prior accident reports → unrepresented case identification.

### 8.6 Spanish-language everything

Almost zero operators farming Spanish-language Facebook groups in Texas/Florida/California, Latino community forums, Univision local-news comments. Massive underserved market — translation barrier collapses with AI.

### 8.7 Reddit historical posts within SOL

People posted 6-18 months ago "should I get a lawyer?" Most got bad advice and never followed up. SOL often still open. Op 1049 protects DM responses (they invited contact when they posted).

### 8.8 Police scanner + social media correlation

Public police scanner feeds (legal to monitor in most states) identify serious incidents in real time. Then 24-48 hours later, AI-search social media for the named parties or location. When the victim posts publicly about what happened, that's a consented moment — they're broadcasting it.

### 8.9 Tow yards + body shops (offline partnerships)

Every car-accident victim goes through one within 48 hours. Sponsor them. Put QR codes on every tow receipt. The owners already refer to lawyers informally — formalize it with a tech-enabled split. Not scrapable but ridiculously high-yield once operationalized.

### 8.10 Chiropractor / PT clinic networks

PI-injured patients flood these. Many already have informal lawyer referral arrangements. Build the API.

---

## 9. The Matrix Testing Approach (v1+)

Once MVP validates the core thesis, scale via matrix testing. Dimensions:

- **Geography**: OC × LA × SoCal × national
- **Vertical**: commercial truck × general MVA × premises liability × med-mal × mass tort opt-in
- **Channel**: Meta hyperlocal × Google national intent × Reddit (post-PLLC) × digital outreach × organic SEO
- **Creative type**: AI per-incident × AI generic-but-personalized × industry-template

Architecturally, every lead must carry `(geo, vertical, channel, creative_id, source)` provenance from ingestion through qualification through outcome. The whole stack instruments by these dimensions. The dashboard compares any 2 cells on cost-per-qualified-lead, qualification rate, time-to-qualify, intake-quality-score.

This is cheap to build if instrumented from day one, painful to retrofit — so we bake it in even in MVP.

Recommended initial matrix cells (v1, post-MVP):

- **Cell A**: OC hyperlocal × commercial truck (highest-value vertical, AI per-incident creative)
- **Cell B**: OC hyperlocal × general MVA (volume baseline)
- **Cell C**: National wide-funnel × "truck accident lawyer" intent keywords (Google Ads)
- **Cell D**: National wide-funnel × mass tort opt-in (pick one active tort)
- **Cell E**: Free / near-free organic — GoFundMe + local news Facebook scraping → email outreach (zero ad spend, tests "underlooked source" thesis)

---

## 10. Build Architecture (Full + MVP Cut)

### 10.1 Full architecture (eventual end-state)

Eight core services:

1. **Ingestion** — scrapers + APIs for: police reports, OSHA, FDA, JPML, news, Reddit, Twitter, GoFundMe, local news Facebook pages
2. **Enrichment** — skip-trace, defendant lookup, insurance carrier identification, prior litigation lookup
3. **Qualification** — AI scoring engine (severity, liability, defendant deep-pocket, SOL, representation check)
4. **Ad orchestration** — Meta Marketing API + Google Ads API + TikTok Ads, per-incident creative generation, geo-fenced campaigns, auto-pause on budget
5. **Intake** — landing page + AI chatbot + AI voice callback within 60s
6. **Compliance substrate** — per-state Rule 7.3 / TCPA matrix, channel-respect enforcement, every outbound action gated
7. **Handoff** — structured case file delivery to partner firms (PDF + JSON + Clio API push)
8. **Outcome tracking** — webhook from partner firms when cases retain/settle, feeds back into ranking models

Stack:
- **Language**: TypeScript/Node throughout (reuses CaseDelta Delta voice agent)
- **Data**: Supabase Postgres (matches CaseDelta)
- **Compute**: AWS Lambda for scrapers + orchestration
- **AI**: Anthropic API (Claude Opus 4.7 for creative + qualification; potentially Bedrock for cost-sensitive bulk)
- **Crawling**: Playwright MCP for sources without APIs; Brave Search API for indexed content
- **Landing page**: static-first (Vite + plain HTML), Cloudflare Pages or AWS S3+CloudFront
- **Voice**: Twilio + AI voice agent (defer to v1)
- **Ads**: Meta Marketing API SDK + Google Ads API SDK

### 10.2 MVP cut

Strip to bare minimum:

- **Ingestion**: Playwright scraper for OC Register, KTLA, KCAL, Patch OC, OC fire/EMS Twitter, OC Facebook community pages.
- **Enrichment**: NONE. Consumer fills own contact on landing page.
- **Qualification**: simple rules-based scoring (severity keywords + defendant deep-pocket signal + SOL check). AI scoring v1.
- **Ad orchestration**: Meta Marketing API only. One creative template with variables. Manual campaign approval for MVP (auto-spin in v1).
- **Intake**: static HTML landing page with 5-field form. Optional: lightweight Claude-powered chatbot if cheap to wire.
- **Compliance substrate**: NONE (marketing-only mode).
- **Handoff**: Email + Supabase row.
- **Outcome tracking**: NONE.

Stack for MVP:
- TypeScript/Node
- Supabase Postgres (free tier sufficient for MVP)
- Plain Node scripts for scrapers (Lambda packaging deferred to v1)
- Anthropic API (Claude Opus 4.7 — direct from Node, no CLI complexity for MVP)
- Playwright MCP (available in dev environment) — for MVP we can also use direct Playwright Node SDK or third-party services like Bright Data / Apify if Playwright MCP isn't packageable
- Static HTML landing page, Cloudflare Pages for hosting (free, fast deploys)
- Meta Marketing API direct (no orchestration framework for MVP)

---

## 11. Orange County Metro Selection

### 11.1 Why OC over Houston (original recommendation) or LA

| Factor | OC | LA | Houston |
|--------|-----|-----|---------|
| In-person founder access | ✅ | ⚠️ | ❌ |
| Per-case avg value | High | Medium | Medium-High |
| Ad CPC | $50-150 | $300-500 | $80-200 |
| Competitive saturation | Low-Med | Very High | High |
| Volume of incidents | Med | Very High | High |
| Demographic for premium PI | Affluent | Mixed | Mixed |
| Path to scale | Clean | Hard | Clean |

OC wins on the dimensions that matter for MVP. LA wins on raw volume; we'll get there.

### 11.2 OC-specific incident sources

Priority sources for the scraper:

1. **OC Register** (ocregister.com) — primary local newspaper, comprehensive accident coverage
2. **KTLA 5** (ktla.com) — LA-area but covers OC
3. **KCAL 9 / CBS LA** — LA-area, OC coverage
4. **NBC LA**
5. **OC Patch sites** — Anaheim Patch, Irvine Patch, Santa Ana Patch, Newport Beach Patch, etc.
6. **OC Fire Authority Twitter** (@OCFireAuthority) — real-time incident dispatches
7. **CHP Newport Beach / Santa Ana / Westminster** — California Highway Patrol divisions covering OC
8. **OC Facebook community groups** — Newport, Irvine, Anaheim, Huntington community pages (public posts)
9. **NextDoor OC** — neighborhood incident posts (login-gated; may need to defer)

### 11.3 OC vertical priorities

Based on case value × volume × ease of identification:

1. **Commercial vehicle accidents on PCH / 405 / 5 corridor** — high case value ($100K-$1M+), clear deep-pocket defendant, easy to identify from news.
2. **General MVA in OC** — volume baseline.
3. **Premises liability at major OC venues** (Disneyland, Knott's, South Coast Plaza, John Wayne Airport) — concentrated deep-pocket defendants, distinct fact patterns.
4. **Med-mal at major OC hospitals** (Hoag, UCI Medical Center, Mission Hospital) — long-tail, lower volume, very high case value.
5. **Dog bites in HOA neighborhoods** — homeowner insurance pays, clean liability.

---

## 12. Brand & Domain Selection

### 12.1 Why ocinjured.com

Selected via Route 53 availability check across ~70 candidates. Top finalists:

- **ocinjured.com** ✅ chosen
- callaftercrash.com (parked for future national brand)
- injurycall24.com
- mycaseradar.com
- injuredfast.com

**Reasoning for ocinjured.com:**
- **Geo-specificity is the single highest CTR lever for consumer landing pages.** An Anaheim resident seeing "ocinjured.com" thinks "this is for me locally." Generic brands don't get that bump.
- Easy SEO ownership for "Orange County injury" queries.
- Cheap to brand around.
- Short, memorable, action-implied.

**Downside:** doesn't scale to LA or national without rebrand. Mitigation: park callaftercrash.com as the future national brand; OCInjured is one geo brand in an eventual multi-geo portfolio (OCInjured / LAInjured / etc., all routing to the same backend).

### 12.2 Brand voice (consumer-facing)

- **Tone**: empathetic, fast, action-oriented. "We're here. We pick up. We help."
- **Not lawyer-coded**: do not lead with "attorney," "law firm," "legal representation." Lead with "help," "support," "answers," "free advice."
- **Mobile-first design**: most victims will click from their phone in the hours/days after incident.
- **Trust signals**: 24/7 availability, free consultation, no obligation.

### 12.3 Domain registration

Domain registration is a billable action that requires admin/registrant contact info. See `scripts/register-domain.sh` for the Route 53 registration command template — the founder runs this with personal contact info.

Alternative: register via existing registrar (GoDaddy, Cloudflare, Namecheap) for $10-15/yr. Cloudflare is recommended for DNS + Pages hosting integration.

---

## 13. Unit Economics

### 13.1 MVP unit economics targets

- **Cost per click (CPC)**: $1-5 hyperlocal Meta (way below national PI Google Ads at $100-500).
- **Click-to-form-submit rate**: target 20-40% (hyperlocal personalized creative + mobile-first form).
- **Form-submit-to-qualified-lead**: target 40-60% (qualification filter on severity, defendant, SOL).
- **Effective cost-per-qualified-lead**: target sub-$50 (much better than industry $150-1000 baseline).
- **Lead value (when sold or referred)**: $300-1000 standard PI, $500-3000 mass tort, $1500-10K pre-screened deposition-ready, $25-40K per retained case via Rule 7.2(b) referral.

### 13.2 Three monetization paths (post-MVP)

1. **Per-lead sale** — $300-1000/lead, exclusive or shared, sold to multiple firms.
2. **Per-retained-case** — $1000-25K when firm signs the client.
3. **Rule 7.2(b) referral fee** (requires PLLC) — 25-40% of contingency, highest-value model.

### 13.3 The Morgan & Morgan model (long-term endgame)

Morgan & Morgan's structure is the proof point. They run massive consumer advertising, qualify leads through centralized intake, take the cases that fit (often mass torts), and refer the rest to local network firms for Rule 7.2(b) fees. Estimated $2B+ revenue with this model. OCInjured is structurally similar at scale.

### 13.4 CaseDelta synergy

Firms that buy leads from OCInjured are 90% pre-sold on CaseDelta-the-platform. The funnel literally pre-sells the CaseDelta product:
- They've seen Delta's AI intake on the landing page.
- They've received pre-built case files generated by Delta.
- They're already routing OCInjured leads into their case management.
- Selling Delta-the-platform becomes a $0-CAC expansion sale.

---

## 14. Operational Mechanics

### 14.1 MVP daily ops loop

1. **6:00 AM** — Scrapers run (OC Register + KTLA + KCAL + Patch + Twitter + Facebook groups). Yesterday's incidents flow into Supabase.
2. **8:00 AM** — AI reviews new incidents, scores severity + defendant + viability. Creates draft ad creatives for top-scoring incidents.
3. **9:00 AM** — Human reviews drafts (MVP only — auto-spin in v1). Approves campaigns. Meta API spins up geo-fenced campaigns.
4. **9:00 AM - 11:00 PM** — Campaigns serve. Inbound clicks land on ocinjured.com. Form submits flow into Supabase with full provenance.
5. **Throughout day** — AI qualification scoring runs on new submits. High-score leads notified to operator (Slack/email).
6. **11:00 PM** — Daily report generates: leads count, cost, qualification rate, CPL.

### 14.2 v1+ daily ops (when scaled)

- Scrapers run continuously (not daily batch).
- Auto-spin campaigns within 4 hours of incident, no human review.
- AI voice callback within 60 seconds of form submit.
- Multi-touch SMS / email sequences over 14 days for un-engaged leads.
- Outcome tracking webhooks from partner firms.
- Per-cell matrix dashboard live.

---

## 15. Risks & Mitigation

### 15.1 Regulatory

- **Risk**: Meta or Google ad-policy violation on PI ads (some platforms have heightened review for "legal services" category).
- **Mitigation**: Build creative templates that pass policy review; ensure landing page has proper disclaimers; route through Meta Business verification.

- **Risk**: TCPA exposure if SMS / voice scaling crosses into autodialer territory.
- **Mitigation**: Every outbound communication gated on express consent capture on landing page or prior message. Compliance substrate enforces.

- **Risk**: State bar advertising violations if landing page or ad copy implies attorney-client relationship.
- **Mitigation**: Marketing-only positioning. Clear "we connect you with attorneys" framing. No legal advice given.

### 15.2 Channel

- **Risk**: Meta ads underperform on hyperlocal creative because audience is too narrow.
- **Mitigation**: Widen geo radius if needed; test multiple creative styles; have national wide-funnel as backup.

- **Risk**: Local news scrapers break frequently due to site changes.
- **Mitigation**: Multiple sources for redundancy; Playwright can adapt via DOM heuristics; fall back to manual entry for high-value incidents.

### 15.3 Quality

- **Risk**: Leads are low-quality, qualified leads don't actually retain.
- **Mitigation**: MVP routes through CaseDelta-direct for quality validation before signing external partners. Iterate qualification scoring.

### 15.4 Competitive

- **Risk**: Existing operators (LeadingResponse, X Social Media, 4LegalLeads) react and clone the AI per-incident approach.
- **Mitigation**: 18+ month lead time on (a) creative engine, (b) compliance substrate, (c) outcome-backpropagated targeting, (d) multi-channel continuity. Their infrastructure is human-staffed and can't pivot fast.

### 15.5 Founder bandwidth

- **Risk**: OCInjured pulls focus from CaseDelta core.
- **Mitigation**: MVP is 2 weeks of focused work, then iterate part-time. If it works, it's a parallel revenue stream that funds CaseDelta growth; if it doesn't, kill quickly.

---

## 16. Connection to CaseDelta Parent

### 16.1 Shared infrastructure

OCInjured runs on the same AWS account, Supabase instance (separate schema), and AI providers as CaseDelta. No need to provision new accounts for MVP.

### 16.2 Shared technology

- **Delta voice agent** (when we add voice in v1) — same agent stack as CaseDelta.
- **AI creative generation** — same Anthropic/Bedrock infrastructure.
- **Intake chatbot** — adaptation of CaseDelta intake patterns.

### 16.3 Synergy mechanics

- **Lead → CaseDelta seat sale**: every firm that receives OCInjured leads is a warm prospect for CaseDelta seats.
- **CaseDelta firm → OCInjured customer**: every CaseDelta firm in OC is a candidate to receive leads.
- **Data flywheel**: outcome data from OCInjured (retained cases, settlements) trains better qualification models, which improve both products.

### 16.4 Brand separation

OCInjured operates as a consumer brand. The connection to CaseDelta is back-office only:
- Landing page does not mention CaseDelta.
- Ads do not mention CaseDelta.
- Lead routing internally goes to CaseDelta-managed inbox (for MVP); future PLLC will replace this.
- Customer firms purchasing leads do see OCInjured-as-CaseDelta affiliation; this is fine for B2B.

---

## 17. Path to Scale

### 17.1 Phase 1 — MVP (weeks 1-2)

- OCInjured.com live, OC hyperlocal Meta campaigns running, leads flowing into CaseDelta.
- Validate: CPL < $50, qualification > 40%, >10 qualified leads in 14 days.

### 17.2 Phase 2 — OC v1 (weeks 3-8)

- Add AI voice callback within 60s.
- Add Google Ads national wide-funnel as Cell C of matrix.
- Sign first exclusive OC partner firm.
- Start tracking retained cases as outcome signal.
- Begin GoFundMe + workers' comp scraping (Path 1 + Path 2 hybrid).

### 17.3 Phase 3 — SoCal expansion (months 3-6)

- Launch LAInjured.com (or SoCalInjured.com) on same engine.
- Sign 2-3 partner firms across SoCal metros.
- Form PLLC (CaseDelta Legal Services) and hire intake counsel.
- Activate Path 3 (public-post engagement) with full Op 1049 protection.

### 17.4 Phase 4 — National (months 6-18)

- Multi-metro portfolio: OC / LA / SF / Houston / Dallas / Miami / NYC / Atlanta / Chicago.
- One-brand-per-metro structure (geo-specific CTR advantage) routing to shared backend.
- Premium pricing via Rule 7.2(b) referral fees, not per-lead sales.
- Mass tort early-warning engine running national.

### 17.5 Phase 5 — Endgame

- Morgan & Morgan-style hybrid: keep the highest-value cases in-house through the PLLC, refer the rest for fees, sell CaseDelta-the-platform to every firm in the referral network. Three revenue streams compounding.

---

## 18. Open Questions & Decisions Pending

1. **Domain registration**: ocinjured.com not yet registered. Founder to register via Route 53 or Cloudflare with personal contact info.
2. **Meta Business Manager setup**: need to provision a Meta Business account for ad-buying (may use CaseDelta's existing if available).
3. **Supabase schema separation**: decide on `ocinjured` schema in existing CaseDelta Supabase vs. separate Supabase project. MVP: separate schema in existing project.
4. **Voice agent timing**: voice intake is high-value but adds complexity. Decision: chat-only for MVP, voice in v1 (Phase 2).
5. **Partner firm strategy**: when do we start signing external partners? Decision: after MVP validates lead quality (Phase 2 latest).
6. **PLLC formation start date**: when do we begin entity registration + intake counsel recruitment? Decision: Phase 2 (weeks 3-8) parallel to OC v1 buildout.
7. **Specific California bar rules**: California Rule of Professional Conduct 7.3 + relevant CA case law. Needs counsel review before any Path 3 activation.

---

## 19. Quick Reference for Future Sessions

- **Goal**: validate AI-personalized hyperlocal PI ads beat generic on CPL in OC.
- **Brand**: OCInjured (consumer-facing, separate from CaseDelta B2B brand).
- **Target metro**: Orange County, CA.
- **Target vertical**: all PI initially, prioritize commercial vehicle (PCH/405 corridor).
- **Channels**: Meta hyperlocal (MVP) → +Google national (v1) → +Reddit (v2 post-PLLC).
- **Routing**: CaseDelta-direct for MVP → external partner firms for v1+ → Rule 7.2(b) PLLC referrals for v2+.
- **Budget**: $5-10K MVP ad spend.
- **Timeline**: 2-week MVP, 8-week OC v1, 6-month SoCal expansion, 18-month national.
- **Success criteria**: CPL < $50, qualification > 40%, >10 qualified leads in 14 days.

---

*This document is the strategic source of truth. It should be updated as decisions evolve. The CLAUDE.md is the operational source of truth for ongoing development.*
