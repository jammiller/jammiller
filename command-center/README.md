# DATAPULSE COMMAND CENTER

Dark business-intelligence dashboard (Next.js 16, TypeScript, Tailwind, Supabase, Recharts) for DataPulse Social, PulseOS, Tremonix and VoltEcho.

This is a standalone app in `command-center/`, separate from the Vite site in the repo root. It is **not** wired to any Vercel project or domain; per `../PRODUCT_SEPARATION.md`, confirm the intended project/domain with the owner before deploying.

## Setup
1. Create a dedicated Supabase project and run `supabase/schema.sql` in the SQL editor (tables are prefixed `cc_`).
2. `cp .env.local.example .env.local` and fill in the URL and anon key.
3. `npm install && npm run dev` → http://localhost:3000

## Notes
- RLS allows only `authenticated` users. There is no login page yet: add Supabase Auth, or temporarily enable the commented dev-only anon policy in the schema (never in production).
- `components/ResourcePage.tsx` is a generic list/add/delete page; each entity page only declares its fields.
- MRR = sum of Active clients' monthly value; Active Opportunities = leads not Won/Lost; Domain Health = % Healthy; Agent Health = average score.
