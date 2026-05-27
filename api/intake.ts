import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'node:crypto';
import OpenAI from 'openai';

// Vercel function that proxies intake form submissions from ocinjured.com
// → CaseDelta `/v1/internal/leads/ingest`, adding the HMAC-SHA256
// signature server-side so the secret never touches the browser.
//
// Pipeline order matters: honeypot → rate limit → spam classifier →
// HMAC sign → forward → Slack alert. Spam/honeypot rejections return
// a fake 200 so bots get no feedback about what tripped the filter.

const ALLOWED_ORIGINS = new Set([
  'https://ocinjured.com',
  'https://www.ocinjured.com',
  'https://ocinjured.vercel.app',
  'https://ocinjured-engine.vercel.app',
]);

const FAKE_SUCCESS = {
  success: true,
  data: { lead_id: null, is_qualified: false, qualification_score: 0 },
};

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitMap = new Map<string, number[]>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    setCors(req, res);
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const origin = (req.headers.origin ?? '') as string;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ error: 'origin_not_allowed' });
  }
  setCors(req, res);

  const webhookUrl = process.env.INTAKE_WEBHOOK_URL;
  const webhookSecret = process.env.INTAKE_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) {
    console.error('INTAKE_WEBHOOK_URL or INTAKE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'misconfigured' });
  }

  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
    req.socket.remoteAddress ??
    null;
  const userAgent = (req.headers['user-agent'] as string | undefined) ?? null;

  const submitted = (req.body ?? {}) as Record<string, unknown>;

  if (typeof submitted.website === 'string' && submitted.website.length > 0) {
    console.warn('honeypot tripped', { ip, ua: userAgent?.slice(0, 60) });
    return res.status(200).json(FAKE_SUCCESS);
  }
  delete submitted.website;

  if (ip && isRateLimited(ip)) {
    console.warn('rate limited', { ip });
    return res.status(200).json(FAKE_SUCCESS);
  }

  const firstName = typeof submitted.first_name === 'string' ? submitted.first_name : '';
  const phone = typeof submitted.phone === 'string' ? submitted.phone : '';
  const incident = typeof submitted.incident_description === 'string' ? submitted.incident_description : '';

  if (await isSpam(firstName, phone, incident)) {
    console.warn('spam rejected', { ip, name: firstName.slice(0, 20) });
    return res.status(200).json(FAKE_SUCCESS);
  }

  const enriched = {
    ...submitted,
    user_agent: userAgent,
    ip_address: ip,
  };

  const body = JSON.stringify(enriched);
  const signature = createHmac('sha256', webhookSecret).update(body).digest('hex');

  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OCInjured-Signature': signature,
      },
      body,
    });

    const text = await upstream.text();

    if (upstream.ok) {
      // Best-effort Slack alert; never block the response on it.
      notifySlack(firstName, phone, incident, text).catch((err) => {
        console.error('slack notify failed', err);
      });
    }

    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
    return res.send(text);
  } catch (err) {
    console.error('intake forward failed', err);
    return res.status(502).json({ error: 'upstream_unreachable' });
  }
}

function setCors(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin ?? '') as string;
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// Per-Lambda-instance in-memory rate limit. Weak across cold-starts / multiple
// concurrent instances, but adequate at MVP scale; upgrade to Vercel KV when
// traffic justifies.
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const hits = (rateLimitMap.get(ip) ?? []).filter((t) => t > cutoff);
  hits.push(now);
  rateLimitMap.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

// Fails open: no key → allow, OpenAI error → allow. Better to let through 1%
// spam than block real PI victims when the classifier hiccups.
async function isSpam(firstName: string, phone: string, incident: string): Promise<boolean> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return false;

  const prompt = `You are reviewing a personal-injury intake form submission for OCInjured, a consumer-facing lead-gen brand serving Orange County, CA. Classify the submission as either SPAM or LEGITIMATE.

LEGITIMATE indicators:
- A real-sounding name and a US phone number
- A first-person description of an injury, accident, or incident (even if brief or grammatically poor)
- A coherent narrative referencing physical events, vehicles, locations, body parts, treatment, etc.

SPAM indicators:
- Promotional content (SEO, web design, marketing, crypto, loans, lead-gen services, link building)
- Bot or stress-test patterns (random characters, all-caps gibberish, copy-pasted templates, repeated chars)
- Off-topic content unrelated to an accident or injury
- Test/dummy data (names like "Test User", "asdf", famous people's names)
- URLs, multiple emails, or contact methods embedded in the description
- Empty or trivial descriptions ("hi", "test", a single character)

When in doubt, lean LEGITIMATE — false positives turn away real victims.

Name: ${firstName.slice(0, 200)}
Phone: ${phone.slice(0, 50)}
What happened: ${incident.slice(0, 2000)}

Respond with exactly one word: SPAM or LEGITIMATE.`;

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 5,
      temperature: 0,
    });
    const verdict = completion.choices[0]?.message?.content?.trim().toUpperCase() ?? '';
    return verdict.startsWith('SPAM');
  } catch (err) {
    console.error('spam classifier failed', err);
    return false;
  }
}

async function notifySlack(
  firstName: string,
  phone: string,
  incident: string,
  upstreamText: string,
): Promise<void> {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;

  let leadId: string | null = null;
  let qualified: boolean | null = null;
  let score: number | null = null;
  try {
    const parsed = JSON.parse(upstreamText);
    leadId = parsed?.data?.lead_id ?? null;
    qualified = parsed?.data?.is_qualified ?? null;
    score = parsed?.data?.qualification_score ?? null;
  } catch {
    // Non-JSON upstream response; surface whatever we can.
  }

  const text = [
    ':rotating_light: *New OCInjured lead — call ASAP*',
    `*Name:* ${firstName || '(missing)'}`,
    `*Phone:* ${phone || '(missing)'}`,
    `*What happened:* ${incident.slice(0, 500) || '(missing)'}`,
    qualified !== null ? `*Auto-score:* ${score} (${qualified ? 'qualified' : 'needs review'})` : null,
    leadId ? `*Lead ID:* \`${leadId}\`` : null,
  ]
    .filter(Boolean)
    .join('\n');

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}
