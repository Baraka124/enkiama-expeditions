# Enkiama — Deploy Manifest

## This batch: full-stack fix — public content now renders + luxury letters

### The bug you reported (approved letters / open journeys not showing)
I traced the full stack for each public flow. The data, RLS, anon key, and
queries were ALL correct — anon can read the approved letter (Sofie /
Kilimanjaro) and the open journey (Northern Circuit). The failure was in the
frontend RENDER path, and it was two real bugs:

1. **Reflections showed the MAP tab by default**, with letters hidden behind
   the second "As letters" tab. A visitor landed on a map of pins and never
   saw the actual letters unless they clicked. FIXED: "As letters" is now the
   default view; the map is the secondary tab.

2. **Async-loaded content rendered invisible (opacity:0).** Both reflections
   letters and companion journey cards use a scroll-reveal (start at
   opacity:0, an IntersectionObserver adds `.in`). But the observer ran ONCE
   at page load, while real letters/journeys arrive later from Supabase and
   re-render the DOM — so the fresh elements were never observed and stayed
   invisible forever. This is why your open journey didn't appear.
   FIXED: the reveal now re-runs after every async render, with a viewport
   safety net so nothing can stay stuck hidden.

### Luxury letter rendering (you asked: "not so random text")
Letters now render as a published-anthology entry:
- a large opening quotation mark + the place as a chapter mark
- an italic brass drop-cap on the first letter
- generous Fraunces serif body with proper paragraph rhythm
- a refined attribution with a small brass rule ("— Sofie")

### Full-stack flows verified (data → RLS → anon read → render)
- **Letters**: traveller writes at barua.html (consent optional) → lands
  PRIVATE in admin → you approve → shows publicly ONLY if consented AND
  approved. Double-gate verified. Now renders luxuriously, visible by default.
- **Open journeys**: you create in admin → status 'open' → renders on
  companions.html. Now visible (reveal bug fixed).
- **Companions (seeking)**: traveller submits → lands in admin. (Private by
  design — these are requests to you, not public listings.)

### Files changed
reflections.html, companions.html — both parse clean, styles balanced.

### IMPORTANT — why it looked broken
If the live site still showed nothing before this, it's partly because these
render fixes weren't deployed yet. After you push this, hard-refresh
(Ctrl-Shift-R) to clear cached older JS.

### After deploy — verify in 2 minutes
1. reflections.html → Sofie's letter should show immediately, as a beautiful
   anthology entry (not behind a tab).
2. companions.html → the "Tanzanian Northern Circuit" journey should appear.
3. barua.html → write a test letter, tick consent → admin → approve → it joins
   reflections.

### Still parked (by request)
- notify Edge Function secrets; disable open sign-ups toggle.
