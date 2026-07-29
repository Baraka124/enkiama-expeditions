# Enkiama — Deploy Manifest

## This batch: removing AI/SEO tells (evidence-based, voice preserved)

### What I found (audited, not guessed)
The "AI tell" was real but concentrated in the INVISIBLE meta/SEO layer, not
the visible copy — which turned out to be genuinely good writing.

### Fixed
1. **Removed keyword-stuffed <meta name="keywords"> from 12 pages.**
   ("Tanzania safari, curated Tanzania safari, bespoke safari Tanzania,
   private Serengeti safari…") This was the single biggest tell AND an SEO
   liability — Google has ignored the keywords meta since ~2009 and treats
   stuffing as spam. Removing it eliminated ~40 filler-word instances at once,
   invisibly to visitors, and improves SEO hygiene.
   → "curated" dropped from 119 uses to 23 (all legitimate visible ones).

2. **Rewrote the doubled-adjective JSON-LD description on 11 pages.**
   "Curated, bespoke Tanzania safari journeys…" (reads like SEO copy) →
   "Private Tanzania safari journeys, composed for one group at a time…
   Written with you." Reads human; still accurate for search engines.

### Deliberately NOT changed (and why)
- The **visible copy is good** and mostly human. The "not X, but Y" lines are
  meaningful ("your budget is not a hurdle to clear: it is the cloth the
  journey is cut from"), not hollow AI contrast. Stripping them would remove
  the voice, not a tell.
- The **em-dashes** are doing real syntactic work (parenthetical asides:
  "The people I met — guides, families, partners — who showed me…").
  Mechanically swapping for commas would introduce errors and read worse.
- The visible <meta name="description"> ("Bespoke Tanzania journeys… Curated,
  never sold.") is natural and uses the real brand line. Kept.
- "Tanzania, curated" recurring signature and "curated by hand, never a
  marketplace" — deliberate brand voice. Kept.

### Verified
- All pages well-formed after edits; every JSON-LD block still valid JSON;
  visible description meta intact on public pages.

### The honest takeaway
The genuine AI tell was invisible keyword-stuffing, now gone. The visible
writing is a strength — the right move was to protect it, not sand it down.

### Still parked (by request)
- notify Edge Function secrets; disable open sign-ups toggle.
