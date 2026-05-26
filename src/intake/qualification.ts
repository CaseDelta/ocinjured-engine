import { Lead, QualificationScore } from './schema.js';

const PASS_THRESHOLD = 50;

export function scoreLead(lead: Pick<Lead,
  | 'incident_description'
  | 'injuries_described'
  | 'treated_by_doctor'
  | 'has_attorney'
  | 'incident_date'
>): QualificationScore {
  const severity = severitySignal(lead.incident_description, lead.injuries_described, lead.treated_by_doctor);
  const defendant = defendantDeepPocketSignal(lead.incident_description);
  const liability = liabilityClaritySignal(lead.incident_description);
  const sol = solSignal(lead.incident_date);
  const representation = representationSignal(lead.has_attorney);

  const score = severity + defendant + liability + sol + representation;

  const notes: string[] = [];
  if (severity < 10) notes.push('low severity signal');
  if (defendant < 10) notes.push('weak defendant signal');
  if (liability < 8) notes.push('liability unclear');
  if (sol < 10) notes.push('SOL concern');
  if (representation < 10) notes.push('already represented');

  return {
    score,
    is_qualified: score >= PASS_THRESHOLD,
    signals: {
      severity_signal: severity,
      defendant_deep_pocket_signal: defendant,
      liability_clarity_signal: liability,
      sol_signal: sol,
      representation_signal: representation,
    },
    notes: notes.join('; ') || 'all signals positive',
  };
}

function severitySignal(description: string, injuries: string | null, treated: boolean | null): number {
  const text = `${description} ${injuries ?? ''}`.toLowerCase();
  let s = 0;
  if (treated === true) s += 10;
  if (/hospital|er|emergency|ambulance|surgery|broken|fracture|concussion|tbi|spinal|paralyz|coma|icu/.test(text)) s += 12;
  else if (/whiplash|sprain|injured|pain|bruise|swelling|stitches/.test(text)) s += 6;
  else if (/sore|stiff|uncomfortable/.test(text)) s += 2;
  return Math.min(s, 25);
}

function defendantDeepPocketSignal(description: string): number {
  const text = description.toLowerCase();
  if (/uber|lyft|amazon|fedex|ups|usps|government|city of|county of|state of|18[- ]wheeler|semi[- ]truck|commercial|delivery truck|big rig|bus/.test(text)) return 25;
  if (/truck|van|company vehicle|construction|rideshare/.test(text)) return 18;
  if (/business|store|property|premises|hotel|restaurant|mall/.test(text)) return 15;
  return 8;
}

function liabilityClaritySignal(description: string): number {
  const text = description.toLowerCase();
  if (/rear[- ]ended|t[- ]boned|drunk|dui|red light|stop sign|hit and run|other driver/.test(text)) return 20;
  if (/their fault|wasn'?t my fault|not my fault/.test(text)) return 16;
  if (/both|my fault|may have been|not sure/.test(text)) return 5;
  return 10;
}

function solSignal(incidentDate: string | null): number {
  if (!incidentDate) return 8;
  const days = (Date.now() - new Date(incidentDate).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 0;
  if (days < 30) return 15;
  if (days < 180) return 14;
  if (days < 365) return 12;
  if (days < 365 * 2) return 8;
  return 2; // CA PI SOL is 2 years
}

function representationSignal(hasAttorney: boolean): number {
  return hasAttorney ? 0 : 15;
}
