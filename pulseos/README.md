# PulseOS isolated web build

Run `npm run build:pulseos` from the repository root. This uses a PulseOS-only
HTML shell, React entry, and public asset directory. The post-build guard rejects
Tremonix content and verifies the tab title, icon, and manifest. Other businesses
continue to use `npm run build` and are not imported by this entry.

PulseOS's Vercel project uses `npm run build:pulseos`. Its shared Git integration
is disconnected to prevent another business's commits from replacing production.
Deploy explicitly with `vercel deploy --project pulse-os --scope datapulse-social --prod`.
Do not reconnect the shared repository without establishing an isolated production
branch or dedicated repository. Do not deploy this build to other businesses.

Florida standards entry remains source-assisted; no complete benchmark catalog
has been imported. Existing backend and authentication are unchanged; build and
release separation does not constitute database or infrastructure isolation.

## Trust Center / Integrity Engine

A PulseOS-wide service that logs every monitored event, scores entities 0-100,
detects anomalies, and exposes an investigation queue. UI routes: `/trust-center`,
`/trust-center/risk-monitor`, `/trust-center/investigations`,
`/trust-center/audit-logs`, `/trust-center/integrity-ai` (stub).

Code: `src/lib/trust-center/` (`IntegrityMonitor`, `TrustScoreService`,
`AnomalyDetectionService`, investigation queue, API handler, stores) and
`src/components/pulseos/TrustCenter.tsx`.

**MVP scoring.** Start at 100 and subtract per rule (configurable in
`DEFAULT_TRUST_RULES`): not verified -15, unverified source -20, credential missing
expiration -18, expired -30, duplicate -68, open high-severity non-duplicate
anomaly -25. Bands: `low` >= 80, `medium` 50-79, `high` < 50. Examples: clean
credential = 100; missing expiration + unverified source = 62; duplicate = 32.

**Anomalies.** Duplicate `metadata.entityKey` on another entity; behavioral spike
(default 500 events by one actor in 2 minutes); document hooks (hash mismatch,
modified after approval, missing signature, version mismatch).

**Setup.** Apply `supabase/migrations/20261021120000_pulseos_trust_center.sql`
(`supabase db push`) and deploy `supabase functions deploy pulseos-trust-center`.
Endpoints (`/functions/v1/pulseos-trust-center/<route>`): GET `overview`,
`trust-scores`, `anomalies`, `investigations`, `audit-logs` (PulseOS admin session);
POST `events` (service-role key or admin only). Tables are admin-read via RLS.

**Seed/demo.** If the tables are empty or unreadable, the UI shows dev-only sample
data generated through the real monitor (`seedTrustCenter`), labelled as sample data.

**Test locally.** `npm run test:trust-center` (Node >= 22), then `npm run build:pulseos`.
