# jammiller

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-ffqzxvcq)

## Tremonix lead capture

Tremonix audit inquiries are stored in the separate Supabase `tremonix_leads` table with `source` and `campaign` tags, then submitted to the `tremonix-lead-capture` Edge Function for CRM and email delivery. The table tracks CRM, welcome-email, and notification delivery statuses and grants access only to the Edge Function's service role. Apply the new migration and deploy the function to the Supabase project configured for Tremonix before enabling the form; verify the project's product assignment before deployment.

Configure these Edge Function secrets in Supabase:

- `CRM_WEBHOOK_URL`: Zapier/Make incoming webhook that syncs the lead to the CRM and starts the `tremonix-audit-welcome` follow-up automation when marketing consent is true. Use the provided `tags`, `source`, and `campaign` fields to categorize each lead.
- `RESEND_API_KEY` and `LEAD_EMAIL_FROM`: send the immediate audit-request welcome email.
- `LEAD_NOTIFICATION_EMAIL`: destination for instant lead notifications.

The CRM workflow should only enroll a lead in the optional follow-up sequence when `marketing_consent` is `true`; the immediate audit-request email is transactional. The function records inquiries even when an integration is not configured; its logs report integrations requiring attention.
