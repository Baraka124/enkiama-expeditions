# Enkiama — Deploy Manifest

## This batch: transition easing unified — but not the way I first framed it

### I was wrong about the diagnosis, and corrected it
Last batch I flagged "70 uses of generic `ease` vs 54 of the custom curve" as
an inconsistency. When I actually looked at WHAT each transition animates, the
dominant pattern was:

    transform 1.2s cubic-bezier(.16,1,.3,1), filter 1s ease
    opacity 1.5s ease, transform 1.5s cubic-bezier(.16,1,.3,1)

Movement gets the expo-out curve; fades get a gentle ease. That is not
inconsistency — it is correct, deliberate craft. My earlier count was wrong
because I counted occurrences without checking what they animated.

### What was ACTUALLY wrong (and is now fixed)
A smaller set where MOVEMENT itself was using plain `ease` — so those elements
moved with a soft, slightly mushy feel while the rest of the site moved
decisively. Fixed across 35 pages:
  - transform .3s ease            -> expo-out  (quick UI movement, 12x)
  - dropdown/menu reveals          -> expo-out  (36x across three variants)
  - card hover lift (.45s)         -> expo-out
  - reveal animations (.5s/.8s/1.1s) -> expo-out
  - one JS-driven step reveal (cssText string) -> expo-out

### What I deliberately did NOT change
- **transform 7s ease (32x) and transform 8s ease (6x)** — slow ken-burns
  image drifts. Expo-out would rush the first second then crawl; plain `ease`
  is the right curve for slow ambient motion. Left alone on purpose.
- **Every `opacity`/`color`/`background` fade on `ease`** — expo-out makes
  fades feel abrupt at the start. These were already correct.

This is exactly why I refused to bulk find-replace this last batch: a blind
sweep would have wrecked the image drifts and the fades.

### Result
Movement is now consistently decisive across the site; ambient drift and fades
keep the softer curve that suits them. Remaining `transform ... ease` uses: 38,
all of them the intentional slow drifts.

### Verified
- No malformed transitions (checked for doubled curves and stray commas).
- CSS braces balanced on every edited page (index 825/825, begin 448/448,
  how 440/440, tanzania 500/500, reflections 268/268, companions 246/246).
- JS valid on index, begin, reflections, companions, journey, barua.

### Still parked (by request)
- notify Edge Function secrets; disable open sign-ups toggle.
