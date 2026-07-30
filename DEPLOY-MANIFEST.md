# Enkiama — Deploy Manifest

## This batch: the footer bug (real cause found) + social proof moved up

### THE FOOTER BUG — found the actual cause
Your screenshot showed the footer completely unstyled: default blue/purple
links, no grid, no typography. I checked and ruled out, in order: broken
markup (clean), unbalanced braces (840/840), unclosed CSS comments (all
balanced), missing CSS variables (all defined), footer outside <body> (it
isn't), and stale duplicate rules.

The real cause: **the footer CSS was loading ~42,000 characters AFTER the
footer markup.** The browser paints the footer, then finds its styles much
later in the document. On any non-instant load that produces exactly what you
photographed — a flash of unstyled footer. It was not a cache artifact and not
your browser; it was a genuine ordering bug, and it affected EVERY page
(gaps ranged from 2,234 to 41,781 characters).

FIXED: the essential footer layout CSS is now hoisted into <head> on 33 pages,
so the footer is styled the instant it paints. Verified: footer CSS now sits at
char 2,907, the markup at char 128,456.

Note: there is also dead legacy CSS (.f-links — 51 rules, zero uses in markup)
left from an older footer design. Harmless bytes, but it's what made the
diagnosis confusing. Flagged, not swept, to keep this change focused.

### LANDING PAGE — improvement #3 applied
**Marina's testimonial moved up.** It was buried past the halfway point;
it is now the third section, directly after the hero and thesis. Real words
from a real traveller ("Like we had been expected. Like we belonged.") now
arrive before the philosophy, instead of after four sections of it.

New order: hero -> thesis -> **story** -> already -> lw -> map -> curate -> ndugu

### NOT yet done — the bigger one (#1)
Merging the four overlapping philosophy sections (thesis / already / lw /
ndugu) into one. That is real surgery on ~4,000 characters of interwoven
markup, and it deserves its own pass rather than being tacked onto a bug fix.
It remains the single highest-impact change to the page — it would cut roughly
30% of the length and make the argument land once, hard.

### Verified
15 sections preserved (unchanged), divs 232/232, exactly one story section,
CSS braces 840/840, JS valid, JSON-LD valid. Backup kept of the pre-restructure
index.html.

### Still parked (by request)
- notify Edge Function secrets; disable open sign-ups toggle.
