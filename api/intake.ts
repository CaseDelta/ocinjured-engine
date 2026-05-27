import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'node:crypto';

// Vercel function that proxies intake form submissions from ocinjured.com
// → CaseDelta `/v1/internal/leads/ingest`, adding the HMAC-SHA256
// signature server-side so the secret never touches the browser.
//
// CaseDelta is the source of truth: it runs qualification scoring, writes
// to ocinjured.leads, and owns the API surface. This function is a thin
// edge proxy that handles CORS + Origin allowlist + HMAC signing.

const ALLOWED_ORIGINS = new Set([
  'https://ocinjured.com',
  'https://www.ocinjured.com',
  'https://ocinjured.vercel.app',
  'https://ocinjured-engine.vercel.app',
]);

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

  const enriched = {
    ...(req.body ?? {}),
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
