# SEO checklist for www.datapulsesocial.com

Canonical host: `https://www.datapulsesocial.com/` (non-www 301-redirects to www via `vercel.json`).

Manual steps for the owner:

1. **Vercel domains**: confirm both `datapulsesocial.com` and `www.datapulsesocial.com` are assigned to the DataPulse Social project, then verify `curl -I https://datapulsesocial.com/` returns a 301 to www. Do not reuse the Tremonix project/domains (see `PRODUCT_SEPARATION.md`).
2. **Google Search Console**: add and verify both the www and non-www properties (a Domain property via DNS is easiest).
3. **Submit sitemap**: submit `https://www.datapulsesocial.com/sitemap.xml`.
4. **Request indexing**: use URL Inspection on `/` and `/privacy`, then "Request indexing".
5. **Bing Webmaster Tools**: add the site (import from Search Console) and submit the sitemap.
6. **Google Business Profile**: create/verify a profile using the business address and link it to the website.
7. **Social profiles**: once real profile URLs exist, add them to `sameAs` in the JSON-LD in `index.html` (see TODO there).
8. **Backlinks**: link to the site from LinkedIn, directories, guest posts, partner sites, and your email signature.
9. **Check**: view-source on the live site and confirm the `<title>` and canonical are the DataPulse ones; re-test the OG image in a social debugger.
