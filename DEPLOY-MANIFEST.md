# Enkiama — Deploy Manifest

## This batch: Ten "living system" features (lighter builds) + prior work

### Live in Supabase already (DB migrations — no push needed)
- Prior: operator access locked to Baraka's uid; analytics + private tables
  sealed from anon.
- New support tables (operator-only, verified sealed from anon):
  - contact_log — reply/contact history per enquiry & companion (#5)
  - admin_audit — every status change / approval / deletion, logged (#10)
  - contact indexes for fast per-person grouping (#1)

### Changed files in this zip (push these)
- **admin.html** — seven of the ten features:
  - #2 "Today" dashboard as the landing tab (warm lede, tappable stat cards)
  - #4 gentle enquiry ageing ("Gently ageing", 3+ days, soft mark)
  - #1 traveller timeline (history thread on each card)
  - #5 reply-log ("log it": replied/called/met/note + a gist)
  - #10 audit trail on every consequential action
  - #9 "Download a copy of everything" — full JSON backup, anytime
- **reflections.html** — #6 letters map: a privacy-first stylised SVG map of
  Tanzania with brass pins where travellers wrote from. No external tiles,
  no tracking — true to "no cookies, no third parties."
- **barua.html** — optional "a place this letter belongs to" field with a
  built-in Tanzania gazetteer (local, no external geocoding) so known places
  pin on the map automatically. Consent double-gate unchanged.
- **companions.html** — #7 journeys already breathe (live reads); #8 adds a
  subtle "Newly opened" badge on journeys opened within 10 days.

### Verified (RLS-enforced, as browser + operator)
- Operator can write reply-logs and audit entries; anon cannot read either.
- Anon can read approved+consented letters' map fields; private data stays sealed.
- Test rows inserted and cleaned; DB pristine.
- All edited files: every real JS block parses; admin module valid; IDs present.

### Feature notes / honest limits
- The map plots letters whose named place is in the built-in gazetteer
  (Serengeti, Ngorongoro, Zanzibar, Kilimanjaro, Arusha, Tarangire, Manyara,
  Ruaha, Nyerere/Selous, Mahale, Mikumi, Moshi, Dar, Pemba, Stone Town).
  A letter with a place not in the list still saves — it just won't pin until
  you add coordinates. Easy to extend the gazetteer later.
- I could not render screenshots in this environment. Please eyeball
  reflections.html (map), companions.html (badge), and the admin Today tab
  once after deploy.

### Still parked (by request)
- notify Edge Function secrets (RESEND_API_KEY etc.)
- Disable open sign-ups in Supabase Auth settings (dashboard toggle)

### After deploying — verify
1. admin.html → Today tab shows the lede + cards; try "Download a copy of
   everything" (a JSON file should download).
2. Log a touch on an enquiry; confirm it appears in the history thread.
3. barua.html → write a test letter with place "Serengeti" + consent; approve
   it in admin; confirm a pin appears on reflections.html.
4. Open a journey in admin; confirm "Newly opened" shows on companions.html.
