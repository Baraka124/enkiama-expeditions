# Enkiama — Deploy Manifest

## This batch: Backend hardening + The Ledger admin + premium paper writing surfaces

### Live in Supabase already (no push needed — these were DB migrations)
1. Operator read/update/delete on enquiries, letters, companions locked to
   Baraka's user id alone. Public submission unchanged.
2. Analytics views revoked from anon.
3. Table-level SELECT revoked from anon on enquiries & companions.

### Changed files in this zip (push these)
- **admin.html** — "The Ledger": each arrival is a warm paper leaf on a deep
  tent-interior ground; sender names in Fraunces italic; threshold login.
  All backend logic unchanged.
- **barua.html** — the letter is now written on a **paper leaf** (warm cream,
  stitched brass spine, faint ruled lines) — the same material the admin reads
  it on. Premium focus lift, richer send button. Dead payload fields removed.
- **companions.html** — the "journey you imagine" field is the same paper leaf;
  floating label tuned for legibility on paper. Insert unchanged.
- **begin.html** — atmospheric ground (layered glows + vignette) matching the
  ledger. Form logic untouched.
- **assets/js/enkiama.js** — analytics failures now warn (not silent); each
  path recorded once per session.

### Verified end to end (RLS-enforced, as browser + admin)
- Anon can submit letters/companions/enquiries; correct default statuses
  (private / pending / new).
- Admin (as operator) can read, approve, transition statuses, autosave notes.
- Consent double-gate holds: a letter forced to 'approved' WITHOUT consent
  stays invisible to the public. Only approved+consented letters appear.
- Anon cannot read enquiries or companions (denied at grant level).
- Test rows inserted and cleaned; DB left pristine.

### Responsive
- Paper leaves clear the spine on all widths; form rows wrap on narrow screens;
  no horizontal scroll (existing 640/820 breakpoints + overflow guards).
- NOTE: I could not render screenshots in this environment. Please eyeball
  barua.html and companions.html on a phone once after deploy.

### Still parked (by request)
- notify Edge Function secrets (RESEND_API_KEY etc.)
- Disable open sign-ups in Supabase Auth settings (dashboard toggle) — seals
  admin access fully.
- letters place/lat/lng columns exist for map pins; forms don't collect them.

### After deploying — verify
1. admin.html — sign in, confirm ledger + your entries as paper leaves.
2. barua.html on a phone — confirm the letter reads as paper, no sideways scroll.
3. companions.html — confirm the journey field is paper and the label is legible.
4. Submit one of each; confirm they land in admin.
