# DATAPULSE COMMAND CENTER

Dark business-intelligence dashboard (Next.js 16, TypeScript, Tailwind, Supabase, Recharts) for DataPulse Social, PulseOS, Tremonix and VoltEcho.

This is a standalone app in `command-center/`, separate from the Vite site in the repo root. It is **not** wired to any Vercel project or domain; per `../PRODUCT_SEPARATION.md`, confirm the intended project/domain with the owner before deploying.

## Setup
1. Create a dedicated Supabase project, run `supabase/schema.sql`, then apply the SQL files in `supabase/migrations/` in timestamp order (tables are prefixed `cc_`).
2. `cp .env.local.example .env.local` and fill in the Supabase URL, anon key, server-only service-role key, and a long random webhook secret.
3. `npm install && npm run dev` → http://localhost:3000

## Notes
- RLS allows only `authenticated` users. There is no login page yet: add Supabase Auth, or temporarily enable the commented dev-only anon policy in the schema (never in production).
- `components/ResourcePage.tsx` is a generic list/add/edit/delete page; each entity page only declares its fields.
- MRR = sum of Active clients' monthly value; Active Opportunities = leads not Won/Lost; Domain Health = % Healthy; Agent Health = average score.
- Lead scores are recalculated by a database trigger whenever a lead is inserted or updated. Company size contributes up to 20 points (the higher of employee-count or revenue bands), industry fit 20, budget 15, purchase intent 20, and engagement 25. Engagement weights email opens (30%), pages visited (25%), time on site (25%), and form completeness (20%), capped at 10 opens, 5 pages, and 300 seconds.
- Scores route to High (75–100, immediate sales outreach), Medium (50–74, extended email sequence), Low (25–49, content nurture), or Unqualified (0–24, suppress from sequences). The dashboard surfaces new high-intent leads and marks leads still New after two hours as overdue.
- Company enrichment and behavior metrics are collected as lead fields; connecting ZoomInfo/Apollo, behavioral tracking, and Slack/email delivery requires provider credentials and an ingestion/notification integration, which this app does not currently configure.
- The Conversion Funnel report records CRM lead creation, qualification, and customer-won transitions from the database. Trusted `email_open` events linked to a lead update its CRM engagement score; linked `payment_completed` events move the lead to Won. Page views, form submissions, audit, booking, payment, and email events require a trusted provider integration; do not write events from an unauthenticated client. The drop-alert view compares the current and preceding seven-day counts and can be used by a scheduled reporting integration.
- Trusted systems can post idempotent events to `POST /api/conversion-events` with a bearer token in the `Authorization` header and a JSON body containing `event_name`, `source`, `external_event_id`, optional `lead_id`, and optional `metadata`. Configure the service-role key and a long random webhook secret on the server only. Do not place either secret in `NEXT_PUBLIC_*` variables or send personal data in event metadata. Daily email delivery and provider-specific GA4, email, booking, payment, and audit hooks still require their respective credentials and scheduler/webhook configuration.
- The score bands are initial heuristics, not an accuracy-validated prediction model; compare them against closed lead outcomes before relying on the 80% accuracy target.
