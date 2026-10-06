# Enkiama journey content architecture

## Purpose

The public journey experience and the private booked-journey experience should share one content model without exposing private booking data.

### Public
- `data/journeys.json` — public, anonymised operated-journey examples.
- `assets/js/journey-repository.js` — content adapter. Reads JSON today and can use Supabase RPC later.
- `trip.html?slug=...` — public editorial reader for an operated journey.
- `compose.html` — recommends a relevant operated journey after a visitor composes a first route.

### Private
- `journey.html?k=...` — existing tokenised private booking reader.
- `assets/js/enkiama.js` — existing Supabase REST/RPC client.

The public and private views must remain separate: public examples are anonymised editorial records; private journeys may contain names, dates, documents and booking state.

## Migration switch

Static JSON remains the default:

```js
window.ENKIAMA_USE_SUPABASE_JOURNEYS = false;
```

After the SQL migration is deployed and public journey rows are seeded:

```js
window.ENKIAMA_USE_SUPABASE_JOURNEYS = true;
```

The UI continues calling `EnkiamaJourneys.loadCatalog()`, `getBySlug()` and `recommend()`; no page rewrite is required.

Composition capture is deliberately off until the RPC and abuse protections are deployed:

```js
window.ENKIAMA_CAPTURE_COMPOSITIONS = false;
```

No PII should be stored by the anonymous composition endpoint. Contact details remain in the existing enquiry flow.
