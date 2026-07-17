# Enkiama — Deployment Manifest

Everything in this folder is the current, complete state of the site. It is a
drop-in replacement for your repo. Deploy it as one batch.

## What's in this batch (all 11 pages + support)

**Pages (12):**
index · tanzania · how · family · notes · stories · journeys · begin · parks · faq · compose · 404

**What changed since the last live version:**
- New brand palette (ink & bone + muted olive, antique brass; no emerald)
- Grand 100px header condensing to 68px on scroll, no content intersection
- 10 header refinements (outline Begin button, drawn hairline, dropdown, WhatsApp glyph, a11y)
- Hero motion, breath section, animated route map on the home page
- Copy tightening across all pages (em-dash overuse cut, negation tic reduced to one)
- NEW: Wild Tanzania parks page (parks.html)
- NEW: Safari FAQ page (faq.html) with FAQPage schema
- NEW: The Composer (compose.html) — interactive journey-shaping tool
- Full technical SEO: schema.org on every page, hreflang, geo, robots, enhanced sitemap
- Photography system: every image slot wired to assets/images/ with graceful fallback
- Fixed: placeholder WhatsApp number on begin.html (now +34 659 447 627 everywhere)

**Support files:** CNAME (enkiama.com), robots.txt, sitemap.xml, .nojekyll,
.gitignore, README.md, assets/ (logo, favicons, share image), assets/images/
(empty except the naming guide — drop photos here).

## How to deploy (clean sequence)

Replace your repo folder contents with everything here (keep your .git folder).
Easiest: copy all files in, choosing "replace all" when asked.

```
cd C:\Users\barak\OneDrive\Documents\aaaaaaENKIAMA
git add -A
git status
```

`git status` should show the modified pages plus NEW files: parks.html, faq.html,
compose.html, assets/images/. If that looks right:

```
git commit -m "Major update: new palette, parks + FAQ + Composer pages, full SEO, photo system"
git push
```

No --force needed. CNAME is tracked, so your domain stays bound.

## After deploying — verify
1. Open enkiama.com and hard-refresh (Ctrl+F5). Check the new palette + header.
2. Open enkiama.com/compose.html and click through the Composer.
3. Load enkiama.com/sitemap.xml (should list all pages).
4. Test rich results: search.google.com/test/rich-results → paste enkiama.com
5. THEN do the SEO homework: submit sitemap in Google Search Console (see
   Enkiama-SEO-Playbook.docx).

## Your ongoing homework
- Drop real photos into assets/images/ (see PHOTO-NAMING-GUIDE.md) — biggest quality lever
- Google Search Console + Bing + Business Profile (see the SEO Playbook)
- Confirm the two computed times in Marina's private itinerary (Day 12 arrival/transfer)

## Still parked for a future session (not in this batch)
- Spanish /es/ pages (partial start exists in enkiama-site/es/, NOT deployed)
- Lead-capture email form, 404 page, English WhatsApp option in Composer
