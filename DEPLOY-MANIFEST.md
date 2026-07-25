# Enkiama — Deploy Manifest

## This batch: the 9 premium-polish items (forms + admin + reflections)

### Forms — advanced, premium feel
- **#3 Submit states**: barua/companions/begin now show a real in-progress
  state — an animated spinner on the send (barua), a wait state (companions/
  begin) — instead of a plain "Sending…" text swap.
- **#4 Success moments**: the thank-you panels are now designed moments — a
  slow rise, a brass seal-line that draws itself, refined rhythm — rather than
  static text blocks.
- **#8 Error states**: fields now show a felt error state (red-clay border +
  soft glow; the letter's paper spine turns clay) — visual, not just a message.

### Reflections — the public reading experience
- **#1 Letters map**: replaced the crude 10-point blob with a refined Tanzania
  silhouette, the great lakes as faint negative space, elegant pins that
  cluster repeat places into one mark with a count, a legend line, and a
  softer pulse. A real cartographic moment now.
- **#7 Anthology typography**: each letter opens with an elegant italic
  drop-cap, so reading feels like a published anthology piece.
- **#5 Open-journey cards**: richer material, a lift + glow + corner flourish
  on hover — they read like fine invitations, not plain cards.

### Admin — premium ops tool
- **#2 Empty & loading states**: considered, context-aware empty copy
  ("The desk is quiet — no enquiries yet…" vs "No enquiries match that
  search."), plus a shimmering skeleton loader while Supabase responds.
- **#6 Toolbar polish**: search focus now has a soft brass glow + deepened
  field.
- **#9 Analytics premium**: stat cards lift on hover, refined accents.

### Verified
- admin module JS valid; begin/barua/companions/reflections JS parse; all
  style tags balanced.
- Empty-state calls have their scope variables; map clustering logic tested
  (repeat places collapse to one pin with a count).
- No backend logic touched — all inserts/reads/auth unchanged.

### Honest limits
- Still no screenshots possible here. Please eyeball after deploy: the three
  form success/error states, the reflections map (needs at least one approved
  letter with a mapped place to show pins), and the admin loading shimmer.
- The map silhouette is a stylised approximation of Tanzania, not a survey-
  accurate outline — intentional, in keeping with the hand-made feel.

### Still parked (by request)
- notify Edge Function secrets; disable open sign-ups toggle.
