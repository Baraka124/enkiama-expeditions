# Kilimanjaro Product System

This milestone compresses the Kilimanjaro rebuild into four phases.

## Phase 1 — Mountain hub + governed data
- `kilimanjaro.html` becomes the authority layer rather than a single destination article.
- `data/kilimanjaro-routes.json` governs route stance, days, approach, overnight format, acclimatisation profile, crowding, scenery, cautions and stage sequence.
- `data/kilimanjaro-standards.json` separates public operational promises from items that still require partner verification.

## Phase 2 — Route intelligence
- Seven established ascent routes remain visible: Lemosho, Northern Circuit, Machame, Rongai, Marangu, Shira and Umbwe.
- The system is deliberately opinionated: available does not mean recommended.
- `kilimanjaro-route.html?route=<slug>` provides a reusable route dossier.
- The route atlas and mountain composer use the same data source.

## Phase 3 — Expedition product
- `data/kilimanjaro-specialisations.json` defines private, couple, family/adult-family, small-group and mountain-plus-Tanzania formats.
- Research, film and charity expeditions are capability-dependent and must not be marketed until the technical/medical/logistics capability is verified.
- `data/kilimanjaro-expeditions.json` keeps operated/past records separate from upcoming records.
- Unverified past couple/family records are not publicly renderable.
- `kilimanjaro-expedition.html?expedition=kilele-2027-machame` exposes the August 2027 father-and-adult-son Machame climb as an **in preparation** dossier.

## Phase 4 — Mountain composer + wider journey
- Four inputs: mountain days, priority, altitude experience and camping/hut preference.
- Output is a first route direction, not a medical or fitness clearance.
- Result explains why the route ranked highest and gives an alternate comparison.
- Kilimanjaro connects onward into the wider Enkiama Tanzania journey instead of ending at a generic enquiry CTA.

## Benchmark lessons retained
- Premium operators make safety systems concrete: guide qualifications, health monitoring, oxygen/emergency provision and descent protocols.
- Strong route specialists distinguish acclimatisation, route geometry, crowding, camping/hut format and days rather than calling every route equally suitable.
- High-end operators describe actual provision—sleeping system, tents, meals, toilets, guide support—rather than relying on the word “luxury”.
- Enkiama should only publish operational standards that its appointed mountain partner can document consistently.

## Publication discipline
Do not publish:
- claimed summit-success percentages without an auditable Enkiama dataset,
- precise guide ratios without operational confirmation,
- medical-equipment claims that are not guaranteed on every applicable departure,
- historical expedition outcomes that have not been recovered from the actual trip record,
- crew-wage claims beyond what can be documented for the specific operating partner.
