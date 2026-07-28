# Enkiama — Deploy Manifest

## This batch: image optimization pass (performance) + a pre-existing bug fix

### What changed (measured)
- **ngorongoro.jpg: 1433KB -> 268KB (81% smaller).** It was exported at 300 DPI
  print resolution and used on ~every page — the single biggest load-time win.
- **hero-dawn.jpg: 328KB -> 274KB**, resized from 2560px to 1920px (plenty for web).
- **enkiama-share.jpg: 72KB -> 49KB** (social-share image).
- **Deleted** assets/culture-table.jpg (280KB) — an orphan referenced nowhere
  (the assets/images/ copy is the live one).
- **WebP variants added** for the heaviest images (logo-full.webp is 42KB vs
  268KB PNG). Kept as optional assets; not forced into markup.
- **Total image weight: 3666KB -> 2713KB (saved ~950KB, 26%).**

### Pre-existing bug fixed (found during the audit)
- **great-rift.jpg was referenced on 33 pages but never existed** — a broken
  image link that predated this work (it drives the nav hover-preview for the
  Great Rift section). Created it from the Manyara image (a Rift Valley lake —
  thematically correct). All image references now resolve; no broken links.

### Left deliberately unchanged
- The assets/images/ set (27KB each) was already well-optimized — re-encoding
  made several *larger*, so those were restored to originals. Only genuine wins
  were kept.
- logo-full.png (268KB) is only in JSON-LD/social meta, never displayed to
  users, so optimizing it wouldn't change real page load. Left as-is; the
  lighter .webp exists if you ever want it for sharing.
- Images are already lazy-loaded site-wide via a custom IntersectionObserver
  (596 data-src images) — no change needed.

### Audit conclusion (from the full-system review)
The system is essentially complete and premium. The private client area (#18),
living-system features, secure backend, and contrast fixes were all already
built and verified working. What remains is not code:
- The Resend key (to close the notify/email loop) — parked, needs you.
- Content — real letters, guide profiles, Baraka's voice, photography — the
  vessels are built and waiting to be filled. This is the real Singita-beating
  work, and no build pass can produce it.

### Still parked (by request)
- notify Edge Function secrets; disable open sign-ups toggle.
