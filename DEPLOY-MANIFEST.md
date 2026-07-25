# Enkiama — Deploy Manifest

## This batch: deep input-quality pass + strengthened round-one features

### Live in Supabase already (DB migration — no push needed)
- #5 Server-side length & shape guards (CHECK constraints) on enquiries,
  letters, companions: message 1–5000, letter 1–8000, journey 1–3000, plus
  name/contact/place/journey ceilings. Verified: a 9000-char letter is
  rejected; a normal letter is accepted. No real submission is ever refused.

### Changed files in this zip (push these)
- **begin.html** — maxlength on all fields (name 120, contact 200, message 5000).
  Already had strong live validation; now length-bounded too.
- **barua.html** — maxlength everywhere + a live, humane character hint
  (only speaks up when too short or near the ceiling). Extended map gazetteer
  (30+ Tanzania places) with fuzzy matching and graceful "unmapped" handling.
- **companions.html** — deepened validation with warm inline messages (contact
  shape, journey length) instead of a silent disabled button; maxlength,
  inputmode, autocomplete added. Removed a dead payload field.
- **admin.html**:
  - #7 "Recent activity" — the audit trail is now visible on the Today tab.
  - #8 reply-log entries are deletable (a living log you can tend), with the
    removal itself audited.
  - (fixed a self-inflicted regression mid-build: the "Log it" insert handler
    was briefly removed and restored — verified working.)

### Accessibility (#10) across all inputs
- Every field has a bound <label>; inputs carry aria-describedby to their hints
  and live messages (aria-live="polite"); focus-visible outlines already present.
- Proper input types: inputmode="email"/autocomplete on contact fields so
  phones show the right keyboard.

### Verified (RLS-enforced)
- Server guards reject oversized input, accept normal input.
- Operator can read the audit log, write and delete reply-log entries;
  anon still sealed out of both support tables.
- All edited files: every real JS block parses; admin module valid; new IDs present.
- Test rows inserted and cleaned; DB pristine.

### Honest limits
- The map still pins only gazetteer places (now 30+). Unlisted places save fine,
  just don't pin until added.
- No screenshots possible in this environment — please eyeball barua,
  companions, and the admin Today tab on desktop and phone after deploy.

### Still parked (by request)
- notify Edge Function secrets (RESEND_API_KEY etc.)
- Disable open sign-ups in Supabase Auth settings (dashboard toggle)

### After deploying — verify
1. barua.html — type a very short letter; confirm the gentle "a little more"
   hint; paste something huge; confirm it caps at the limit.
2. companions.html — type a malformed email; confirm the warm inline message.
3. admin Today tab — confirm "Recent activity" lists your recent actions.
4. On an enquiry, log a touch, then remove it; confirm both work.
