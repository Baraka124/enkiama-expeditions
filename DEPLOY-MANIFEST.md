# Enkiama — Deploy Manifest

## This batch: correcting my own mistake + a hover-effect judgment

### 1. I WAS WRONG about "never more than eight travellers"
You were right to question it. When I checked, the ONLY place on the entire
site that made that claim was the sentence I had written. Everywhere else —
meta descriptions, schema, body copy — says "one group at a time", "your group
alone", "private", "small groups".

So I had invented a hard commercial constraint that isn't your policy. A family
of ten or twelve friends reads "never more than eight" and concludes you can't
serve them, then leaves. My "specificity is premium" instinct overreached:
specificity is premium when it is EVOCATIVE ("coffee farms at 1,700 metres"),
not when it is a RESTRICTION.

FIXED — hero now reads:
  "...We compose a single journey through it for your group alone — private
   from first morning to last, and never composed twice."
Leads with exclusivity (the stronger luxury signal) and caps nothing.

ALSO FIXED — the stat card had the identical flaw and predated my work:
  was:  8  "Guests: always"   (caps you; also reads oddly)
  now:  1  "Group at a time"  (your actual, consistently-stated promise)
Stats now read:  5 Worlds in one country · 0 Journeys from a catalogue ·
                 1 Group at a time

### 2. Hover effects — honest judgment
GENUINELY PREMIUM (kept, untouched):
- Letter-spacing expansion on hover (.btn-ghost, .ask-lnk, .wn-btn:
  0.16em -> 0.2em). A real editorial designer's move; very few sites do it.
  This is the most sophisticated thing in your interaction design.
- cubic-bezier(.16,1,.3,1) — a proper expo-out curve, used 54 times.
- Button inversions and restrained border-colour shifts.

NOT PREMIUM (fixed):
- **Logo scaled up and glowed on hover** (scale(1.04) + brass drop-shadow).
  The weakest thing on the site. Luxury marks are fixed and authoritative;
  a logo that grows and glows reads playful and is a dated 2015-era effect.
  -> Replaced site-wide with a restrained opacity shift (.72) on the site's
     own premium easing curve. The mark stays still; only its presence changes.
  -> Also corrected the transition, which still targeted transform/filter and
     would have made the new opacity change snap.
- **Double glow on the WhatsApp button** (a 3px halo AND a 14px outer glow).
  Glows read "web app", not luxury print. -> Reduced to a single subtle ring.

REMAINING INCONSISTENCY (noted, not changed):
70 uses of generic `ease` vs 54 of the good custom curve. Unifying them would
be a genuine refinement, but it touches a lot of rules — worth doing
deliberately rather than in a sweep.

### Verified
Style tags and sections balanced on every edited page; JS valid on all
interactive pages; 12 pages updated for the hover changes.

### Still parked (by request)
- notify Edge Function secrets; disable open sign-ups toggle.
