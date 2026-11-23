# PulseOS isolated web build

Run `npm run build:pulseos` from the repository root. This uses a PulseOS-only
HTML shell, React entry, and public asset directory. The post-build guard rejects
Tremonix content and verifies the tab title, icon, and manifest. Other businesses
continue to use `npm run build` and are not imported by this entry.

PulseOS's Vercel project uses `npm run build:pulseos`. Its shared Git integration
is disconnected to prevent another business's commits from replacing production.
Deploy explicitly to `pulse-os` in `datapulse-social`, using the isolated
`vercel.pulseos.json` configuration (`--local-config vercel.pulseos.json`).
The shared root `vercel.json` belongs to the multi-product build and must not be
used for a PulseOS release. Verify the resolved project before deploying.

The public home page and `/construction-workforce-readiness` are learner-facing
program pages, each with a dedicated HTML metadata entry. Existing workforce
tools remain available at `/competency-library`; course-builder and foreman
routes are unchanged. Role Builder is available at `/role-builder`. The public
`/ojt-compliance` page explains field evidence; `/ojt-workspace` retains the
administrator sign-in and restricted records. Private workspace routes are
excluded from the sitemap and receive noindex headers. The PulseOS-only `public` directory owns this site's
`sitemap.xml`, `robots.txt`, and `llms.txt`.
Do not reconnect the shared repository without establishing an isolated production
branch or dedicated repository. Do not deploy this build to other businesses.

Florida standards entry remains source-assisted; no complete benchmark catalog
has been imported. Existing backend and authentication are unchanged; build and
release separation does not constitute database or infrastructure isolation.
