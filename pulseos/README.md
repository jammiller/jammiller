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
