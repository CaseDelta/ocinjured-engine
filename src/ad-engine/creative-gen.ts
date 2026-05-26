import Anthropic from '@anthropic-ai/sdk';
import { Incident } from '../intake/schema.js';

const MODEL = 'claude-opus-4-7';

export interface AdCreative {
  creative_id: string;
  headline: string;
  primary_text: string;
  description: string;
  cta: 'LEARN_MORE' | 'CONTACT_US' | 'GET_QUOTE';
  reasoning: string;
}

export async function generateCreatives(
  incident: Partial<Incident>,
  variantCount = 3,
): Promise<AdCreative[]> {
  const client = new Anthropic();
  const prompt = buildPrompt(incident, variantCount);

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  return parseCreatives(text);
}

function buildPrompt(incident: Partial<Incident>, variantCount: number): string {
  return `You are an ad copywriter for OCInjured, a consumer-facing personal injury help service in Orange County, CA.

Generate ${variantCount} Meta (Facebook + Instagram) ad creative variants targeting people who may have been involved in or affected by a recent incident.

INCIDENT CONTEXT:
- Location: ${incident.city ?? 'Orange County'}, ${incident.location_text ?? 'unknown specific location'}
- Vehicle type: ${incident.vehicle_type ?? 'unknown'}
- Severity: ${incident.severity ?? 'unknown'}
- Summary: ${incident.raw_summary ?? '(none)'}

HARD RULES (compliance):
- Do NOT name the victim, even if known.
- Do NOT identify a specific named incident in a way that singles out one event/person.
- Describe in pattern terms ("a crash on the 405 this week", "an accident near South Coast Plaza") rather than naming specific dates+streets+victims that could only mean one event.
- Lead with help, not legal services. Use "help", "support", "answers", "free consultation". Avoid "attorney", "law firm", "sue", "lawsuit" in the headline.
- Tone: empathetic, fast, action-oriented. "We're here. We pick up. We help."
- Call to action must be soft: "talk to someone now", "get free answers", "see if you have a case".

For each variant return JSON:
{
  "creative_id": "<short slug>",
  "headline": "<max 40 chars>",
  "primary_text": "<max 125 chars>",
  "description": "<max 30 chars>",
  "cta": "LEARN_MORE" | "CONTACT_US" | "GET_QUOTE",
  "reasoning": "<one sentence on the targeting hypothesis>"
}

Return a JSON array of ${variantCount} variants. No prose outside the JSON.`;
}

function parseCreatives(text: string): AdCreative[] {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array found in model output');
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed)) throw new Error('Model output is not an array');
  return parsed as AdCreative[];
}
