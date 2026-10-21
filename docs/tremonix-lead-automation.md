# Tremonix lead capture and automation

The Tremonix audit inquiry form writes to `public.tremonix_audit_leads` through the `tremonix-lead-capture` Supabase Edge Function. Submissions include the audit quiz, campaign attribution, marketing consent, and an engagement score (30 points for the inquiry plus 10 per quiz answer, capped at 100). The table is only accessible to the function's service role.

## Configure the approved Tremonix Supabase project

Tremonix and DataPulse Social are separate products. Before applying the migration, deploying the function, or setting production credentials, confirm with the owner which Supabase project serves Tremonix. Do not use the command-center project's separate database or assume the repository's historical hosting configuration identifies the correct production project.

1. Apply `supabase/migrations/20261021130000_tremonix_audit_leads.sql` to the owner-approved Tremonix project.
2. Deploy `supabase/functions/tremonix-lead-capture` to that same project. The function uses the platform-provided `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; keep the service-role key server-side.
3. Configure the Tremonix site's `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with that same approved project's public URL and anon key.
4. Set the following Edge Function secrets:

   - `CRM_WEBHOOK_URL`: HTTPS Make, Zapier, or CRM webhook endpoint.
   - `CRM_WEBHOOK_SECRET`: optional shared secret sent as `x-webhook-secret`.
   - `RESEND_API_KEY` and `RESEND_FROM_EMAIL`: optional Resend credentials for the immediate acknowledgement and owner notification.
   - `LEAD_NOTIFICATION_EMAIL`: optional recipient for the new-lead notification.
   - `TREMONIX_ALLOWED_ORIGINS`: optional comma-separated site origins for approved Tremonix previews/custom domains. The function already allows `https://tremonix.com` and `https://www.tremonix.com`.

## Configure the CRM workflow

Configure the HTTPS webhook to accept the `lead.created` JSON event. It contains `lead` contact details, quiz results, source/campaign fields, `tags`, `engagement_score`, and `marketing_consent`. The function sends the event synchronously and records whether the CRM accepted it.

In the CRM/Make/Zapier workflow, create or update the lead, notify the owner, and enroll only leads with `lead.marketing_consent = true` in the `tremonix_welcome` email sequence. The function sends a one-time audit-request acknowledgement through Resend when configured; the CRM sequence supplies the automated follow-up emails. Do not enroll people who did not opt in.

If the CRM webhook or email credentials are not configured, the lead is still saved, but the corresponding `*_status` column remains `not_configured` (or `failed` on delivery errors). Confirm the migration, approved project, webhook, sender domain, and CRM workflow before describing production automation as active.
