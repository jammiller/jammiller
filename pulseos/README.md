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

## SEO and indexing

- `pulseos/index.html` holds the default title/description, Open Graph/Twitter
  tags, canonical link, JSON-LD (`Organization` + `WebSite`), and a small inline
  script that sets per-route title, description, and canonical for the SPA routes.
  Non-production hosts (previews) get `noindex, nofollow`; production
  (`www.pulseosplatform.com`) is indexable.
- `pulseos/public/robots.txt` and `pulseos/public/sitemap.xml` are static files
  rooted at `https://www.pulseosplatform.com`.
- When adding a public page, add it to the `pages` map in `index.html` and to
  `sitemap.xml`; add private paths to `robots.txt` Disallow.
