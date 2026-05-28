// MVP intake submission. Posts to the CaseDelta intake webhook with full provenance.
// In v1 this will switch to AI chat with voice-callback handoff.

const INTAKE_ENDPOINT = window.OCINJURED_INTAKE_ENDPOINT ?? '/api/intake';

document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('intake-form');
const thanks = document.getElementById('thanks');

const params = new URLSearchParams(window.location.search);
const utm = {
  utm_source: params.get('utm_source'),
  utm_medium: params.get('utm_medium'),
  utm_campaign: params.get('utm_campaign'),
  utm_content: params.get('utm_content'),
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);

  const payload = {
    source: 'ocinjured.com',
    metro: 'orange_county',
    vertical: 'pi_general',
    channel: utm.utm_source ?? 'direct',
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    creative_id: utm.utm_content,
    first_name: (fd.get('first_name') ?? '').toString().trim(),
    phone: (fd.get('phone') ?? '').toString().trim(),
    incident_description: (fd.get('incident_description') ?? '').toString().trim(),
    incident_date: null,
    injuries_described: null,
    treated_by_doctor: false,
    has_attorney: false,
    consent_to_contact: fd.get('consent_to_contact') === 'true',
    consent_captured_at: new Date().toISOString(),
    user_agent: navigator.userAgent,
    captured_at: new Date().toISOString(),
    website: (fd.get('website') ?? '').toString(),
  };

  if (!payload.consent_to_contact) {
    alert('Please confirm consent to contact you so we can follow up.');
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const res = await fetch(INTAKE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Intake failed: ${res.status}`);
    form.hidden = true;
    thanks.hidden = false;
    thanks.scrollIntoView({ behavior: 'smooth' });
    if (typeof fbq === 'function') {
      fbq('track', 'Lead');
      fbq('track', 'Contact');
    }
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('lead_submitted', 'true');
    history.replaceState(null, '', newUrl.toString());
    if (typeof fbq === 'function') fbq('track', 'PageView');
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Get my free answers';
    alert('Something went wrong. Please try again in a moment.');
    console.error(err);
  }
});
