# Enkiama — Deploy Manifest

## This batch: visitor data — you already had it, plus the missing piece

### You already have privacy-first analytics (self-hosted, no third party)
197 views / 85 unique visitors recorded 24–30 July. No cookies, no Google, no
third-party tracker — it stays true to your privacy promise.

### THE GAP I FIXED
The `country` column existed but the tracking script never populated it — every
row was empty. So "where are visitors from" was unanswerable.

Fixed WITHOUT breaking the privacy promise: no IP geolocation, no third-party
lookup. The script now reads the visitor's OWN browser language setting
(navigator.language → e.g. "es-ES"), derives a country code from its region
suffix, and falls back to the timezone region when the language carries none.
- Added a `lang` column (+ length guard and indexes).
- Verified anon can write it under RLS; test row inserted and removed.
- Added a "Language & region" chart to the admin Analytics tab so you can
  actually see it.

This is especially useful for you: it will show directly how much of your
traffic is Spanish-speaking — the market most Tanzanian operators can't serve.

### Files changed
assets/js/enkiama.js (tracking), admin.html (new chart). Both JS-validated.
DB migration is already live — no push needed for that part.

### NOTE
Language/country data starts accumulating from the moment you deploy. The
existing 197 rows stay blank; that's expected.

### Still parked (by request)
- notify Edge Function secrets; disable open sign-ups toggle.
