# Enkiama — Deploy Manifest

## This batch: crawl/SEO hygiene — fixed what the analysis actually found

### Analysis first (what you have vs. what's missing)
Your technical SEO foundation is genuinely strong — better than most small
operators: valid sitemap.xml, well-written robots.txt, CNAME, .nojekyll,
favicons (SVG+PNG+Apple), JSON-LD, and admin.html correctly noindexed and out
of the sitemap. Only a few real gaps existed.

### Fixed
1. **PRIVACY FIX — private itinerary was indexable.**
   journeys/marina-2026-ea47e70a.html contains real travellers' names but had
   NO noindex. A leaked URL could have been indexed by Google. Added
   `<meta name="robots" content="noindex, nofollow, noarchive">`.
   (Left robots.txt as-is deliberately: a Disallow there would BLOCK Google
   from crawling the page to SEE the noindex — the meta tag is the correct,
   stronger protection, and robots.txt already keeps the folder unlisted.)

2. **Sitemap lastmod refreshed** on the 14 pages genuinely changed this
   session (the SEO title/description rewrites + the site-wide meta cleanup),
   set to today's date so Google knows to re-crawl the improvements. Left the
   unchanged pages' dates alone — honest signalling, not a blanket reset.

### Checked and found FINE (no change needed)
- The private client page journey.html (singular) is NOT in the sitemap — an
  earlier loose check gave a false positive; verified it's correctly absent.
- robots.txt is well-formed and correctly points to the sitemap.
- All referenced favicon files exist.

### Skipped (per your call)
- manifest.json / PWA — not needed for a brochure-style site.

### Verified
- sitemap.xml still valid XML, still 32 URLs.
- Private itinerary noindex confirmed.

### The honest bottom line
Crawl infrastructure was already good; these were small real gaps (one a
genuine privacy fix). This is NOT your bottleneck. The needle-movers remain:
submit the sitemap in Google Search Console (to MEASURE), wire the Resend key,
and add real photography.

### Still parked (by request)
- notify Edge Function secrets; disable open sign-ups toggle.
