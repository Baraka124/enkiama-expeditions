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


## Phase B media architecture

Journey copy and media art direction are intentionally separated:

- `data/journeys.json` keeps journey narrative, route, match profile and factual content.
- `data/journey-media.json` keeps editorial media decisions.
- `assets/js/journey-repository.js` merges both into one normalized journey object for consumers.
- Supabase migration `003_journey_media_architecture.sql` adds the equivalent `hero_media`, `layout` and `media` fields.

Normalized chapter media:

```json
{
  "layout": "photo-pair",
  "media": {
    "primary": {
      "src": "assets/images/example.jpg",
      "alt": "Descriptive alternative text",
      "focal_point": "52% 44%",
      "caption": "Editorial caption",
      "source_type": "owned"
    },
    "secondary": {
      "src": "assets/images/example-detail.jpg",
      "alt": "Descriptive alternative text",
      "focal_point": "50% 50%",
      "caption": "Secondary detail",
      "source_type": "owned"
    }
  }
}
```

Supported layout values are `split`, `cinematic`, `photo-pair`, `quiet`, `panorama`, and `human`. The current public reader renders the first three and falls back safely to `split` for unsupported layouts.

The media manifest is also where future synthetic-image sets should be swapped in. Replacing an asset or crop does not require changing journey narrative or matching logic.
