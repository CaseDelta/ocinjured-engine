# OCInjured Engine

Consumer-facing personal-injury lead-generation brand for Orange County, CA. Operated by CaseDelta.

## What it does

1. Scrapes Orange County news + social channels for fresh accident incidents (Playwright).
2. Generates per-incident AI ad creative (Claude).
3. Spins up hyperlocal Meta ad campaigns geo-fenced to incident location.
4. Captures qualified leads via `ocinjured.com`.
5. Routes leads into CaseDelta intake infrastructure.

## Read this first

- **`BACKGROUND.md`** — exhaustive strategic context, full reasoning chain, all decisions captured.
- **`CLAUDE.md`** — operational instructions for the AI/human building this.

## Quick start

```bash
npm install
cp .env.example .env
# Fill in Anthropic, Supabase, Meta Marketing API credentials
npm run dev
```

## Current phase: MVP (2-week sprint)

Validate AI-personalized hyperlocal PI ads beat generic on cost-per-qualified-lead in Orange County.

**Success criteria:** CPL < $50, qualification > 40%, ≥10 qualified leads in 14 days.

## Stack

TypeScript / Node 20+ / Supabase / Playwright / Anthropic API / Meta Marketing API / Cloudflare Pages.

## Repo structure

See `CLAUDE.md` for the file-by-file map.
