# Enkiama — Deploy Manifest

## This batch: removing the "AI-designed" tells (de-templating journey.html)

### The observation (correct)
Some surfaces leaned too hard on three repeated motifs — the gold-bordered
box on a gradient fill, the small-caps brass eyebrow, and the uniform
rounded rectangle. Individually tasteful; over-repeated, they read as
"templated / AI-generated" rather than designed.

### Where it actually was (audited, not assumed)
- The tell concentrated in **journey.html** (the traveller's private page) and,
  less importantly, admin.html.
- The public content pages (tanzania, parks, etc.) already have good
  structural variety — no change needed.
- Eyebrows on begin.html / reflections.html turned out to be legitimate,
  distinct labels ("Curated, never sold", the four step-tags) doing real work
  — NOT redundant tells. Left them alone.

### Fixed — journey.html (the page that matters most: a paying traveller lives here)
1. **The status band**: was three identical gold-bordered gradient boxes in a
   row (the most "template" moment). Now an open, editorial ruled row — status,
   departs, returns breathe with hairline separators, a small olive status dot
   instead of a bordered pill. Reads designed, not boxed.
2. **Section headings**: each had a redundant eyebrow duplicating its heading
   ("Good to know" eyebrow + "Practical notes" heading — the classic AI
   over-labeling tell). Folded into single confident headings:
   "Your itinerary, day by day" / "The path so far" / "Good to know" /
   "Documents, for you to keep".

### Deliberately NOT changed
- The palette, Fraunces, and the shuka motif — those are BRAND; consistency
  there is correct, not a tell.
- admin.html's boxes — it's a private ops tool only Baraka sees; dashboard
  consistency is a virtue there, and no traveller judges the brand by it.

### Files changed
journey.html only. JS parses; styles balanced; secure booking flow untouched.

### Still parked (by request)
- notify Edge Function secrets; disable open sign-ups toggle.
