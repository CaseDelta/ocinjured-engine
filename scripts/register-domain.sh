#!/usr/bin/env bash
# Register ocinjured.com via AWS Route 53.
# Requires admin/registrant/tech contact info — DO NOT commit your filled version.
#
# Alternative: register at Cloudflare ($10-15/yr + integrated Pages hosting).
#   cloudflare.com → Register Domain → ocinjured.com
#   Then add the domain to your Cloudflare Pages project for the landing page.
#
# This Route 53 path is documented for completeness.

set -euo pipefail

DOMAIN="ocinjured.com"

# Verify availability first (idempotent — costs nothing)
echo "Checking availability for ${DOMAIN}..."
AVAIL=$(aws route53domains check-domain-availability \
  --domain-name "${DOMAIN}" \
  --region us-east-1 \
  --query Availability --output text)
echo "Availability: ${AVAIL}"

if [ "${AVAIL}" != "AVAILABLE" ]; then
  echo "Not available — abort."
  exit 1
fi

# Fill in your contact info. Same contact used for admin/registrant/tech in this template.
cat <<'JSON' > /tmp/contact.json
{
  "FirstName": "FILL_IN",
  "LastName": "FILL_IN",
  "ContactType": "PERSON",
  "OrganizationName": "CaseDelta",
  "AddressLine1": "FILL_IN",
  "City": "FILL_IN",
  "State": "CA",
  "CountryCode": "US",
  "ZipCode": "FILL_IN",
  "PhoneNumber": "+1.FILL_IN",
  "Email": "FILL_IN@casedelta.com"
}
JSON

echo "Edit /tmp/contact.json with your actual info before continuing."
echo "Press Enter to continue, Ctrl-C to abort."
read -r

aws route53domains register-domain \
  --domain-name "${DOMAIN}" \
  --duration-in-years 1 \
  --auto-renew \
  --admin-contact "file:///tmp/contact.json" \
  --registrant-contact "file:///tmp/contact.json" \
  --tech-contact "file:///tmp/contact.json" \
  --privacy-protect-admin-contact \
  --privacy-protect-registrant-contact \
  --privacy-protect-tech-contact \
  --region us-east-1

rm /tmp/contact.json
echo "Registration submitted. Allow 10-30 minutes for processing."
echo "Check status: aws route53domains get-operation-detail --operation-id <id> --region us-east-1"
