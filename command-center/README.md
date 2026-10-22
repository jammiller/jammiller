# DATAPULSE COMMAND CENTER

Dark business-intelligence dashboard (Next.js 16, TypeScript, Tailwind, Supabase, Recharts) for DataPulse Social, PulseOS, Tremonix and VoltEcho.

This is a standalone app in `command-center/`, separate from the Vite site in the repo root. It is **not** wired to any Vercel project or domain; per `../PRODUCT_SEPARATION.md`, confirm the intended project/domain with the owner before deploying.

## Setup
1. Create a dedicated Supabase project and run `supabase/schema.sql` in the SQL editor (tables are prefixed `cc_`).
2. `cp .env.local.example .env.local` and fill in the URL and anon key.
3. `npm install && npm run dev` → http://localhost:3000

## Notes
- RLS allows only `authenticated` users. There is no login page yet: add Supabase Auth, or temporarily enable the commented dev-only anon policy in the schema (never in production).
- `components/ResourcePage.tsx` is a generic list/add/edit/delete page; each entity page only declares its fields.
- MRR = sum of Active clients' monthly value; Active Opportunities = leads not Won/Lost; Domain Health = % Healthy; Agent Health = average score.
- Lead scores are recalculated by a database trigger whenever a lead is inserted or updated. Company size contributes up to 20 points (the higher of employee-count or revenue bands), industry fit 20, budget 15, purchase intent 20, and engagement 25. Engagement weights email opens (30%), pages visited (25%), time on site (25%), and form completeness (20%), capped at 10 opens, 5 pages, and 300 seconds.
- Scores route to High (75–100, immediate sales outreach), Medium (50–74, extended email sequence), Low (25–49, content nurture), or Unqualified (0–24, suppress from sequences). The dashboard surfaces new high-intent leads and marks leads still New after two hours as overdue.
- For Tremonix leads, set Product to Tremonix, maintain the next follow-up date and audit status, and use the dashboard's audit request, paid audit, and conversion metrics to track the funnel. Lead records can be edited to keep follow-up and outcomes current. Tremonix website audit requests are not synced to this separate command center; enter them as leads manually.
- Company enrichment and behavior metrics are collected as lead fields; connecting ZoomInfo/Apollo, behavioral tracking, and Slack/email delivery requires provider credentials and an ingestion/notification integration, which this app does not currently configure.
- The score bands are initial heuristics, not an accuracy-validated prediction model; compare them against closed lead outcomes before relying on the 80% accuracy target.
