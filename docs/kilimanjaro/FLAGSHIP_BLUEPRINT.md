# Enkiama Kilimanjaro Flagship Blueprint

**Version:** 1.0  
**Status:** source of truth for Phase 27A–27G  
**Date:** 13 October 2026

## North star

**Editorial front end. Specialist depth. Verified operations. Seven routes, clearly judged.**

Kilimanjaro is a distinct Enkiama product vertical, not another destination page. Premium means control, clarity, comfort, evidence and individual decision support—not repeated use of the word “luxury”.

The public experience should remain calm and selective while the underlying product behaves like a specialist mountain system: route-aware, acclimatisation-aware, operationally explicit and evidence-led.

## Product principles

1. **The mountain before the summit.** Route geometry, altitude sequence, time and recovery are part of the product.
2. **More time is a design choice.** Extra mountain days mean acclimatisation, recovery and decision margin—not indulgence.
3. **Premium means less friction.** Private planning, small operating units, clear logistics, concrete camp provision and strong guide attention.
4. **Route choice is structured but not medical.** Show days, approach, overnight type, crowd pattern, acclimatisation character and trade-offs. Never imply medical clearance.
5. **Safety is a system.** Guide competence, monitoring, descent decisions, communications, oxygen/medical equipment and evacuation must eventually be verified against the operating partner.
6. **Tanzania is not an add-on.** The mountain can connect into Chagga foothills, Arusha/Meru, safari, Rift and coast.
7. **Evidence before storytelling.** Case studies appear only when the underlying record is publishable.

## Reading architecture

| Layer | Reader job | Rule |
| --- | --- | --- |
| Flagship landing | Emotion + decision frame | Identity, altitude, route philosophy, operating standard, evidence, route direction. No day-by-day overload. |
| Route atlas | Comparison | All seven routes visible in one instrument with stance, four key metrics, why/trade-off, trace and dossier link. |
| Route dossier | Decision depth | Full route sequence, acclimatisation logic, terrain/crowd character, operations, cautions and two nearest alternatives. |
| Expedition dossier | Real plan | Status, party format, route, mountain days, period, preparation state and wider Tanzania context. |
| Preparation centre | After intent | Training, gear, insurance/medical guidance, briefing, porter/tipping and verified camp details. |

## Seven-route taxonomy

| Route | Stance | Baseline | Decision frame |
| --- | --- | ---: | --- |
| **Lemosho** | Preferred | 8 days | Default first choice when time allows: gradual western opening, strong scenery and good acclimatisation margin. |
| **Northern Circuit** | Preferred | 9 days | Best when the mountain itself is the expedition: more time, quieter northern traverse and broad mountain context. |
| **Machame** | Recommended | 7 days | Strong seven-day choice when time is the ceiling and the climber accepts a busier southern route. |
| **Rongai** | Selective | 7 days | Quieter northern approach and different mountain character; useful when that route logic matters more than classic southern scenery. |
| **Marangu** | Available for fit | 6 days | Offer when huts are a decisive preference and the traveller understands the direct/same-corridor trade-offs. |
| **Shira** | Conditional | 8 days | Specialist western alternative whose high vehicle-assisted start removes Lemosho’s gradual opening advantage. |
| **Umbwe** | Specialist only | 7 days | For experienced high-altitude trekkers with a specific reason to accept steep early gain and reduced acclimatisation margin. |

All seven routes must be accurate and equally complete in schema, but **must not receive equal recommendation weight**.

## Full route dossier contract

Every route dossier must use the same sequence:

1. **Opening** — route name, stance, one-sentence fit.
2. **Decision frame** — recommended days, variants, approach, descent, overnight, acclimatisation, crowds, scenery.
3. **Route position** — who it suits and what makes it different.
4. **Why choose / trade-off** — equal editorial weight; no sales euphemism.
5. **Acclimatisation logic** — explain the route pattern in plain language without medical certainty.
6. **Trail character** — terrain, visual character, crowd convergence and summit approach.
7. **Operational notes** — start/finish logistics, camp/hut format, descent corridor and verified route mechanics.
8. **Ascent sequence** — continuous connected trace; on mobile it becomes vertical.
9. **Compare** — exactly two nearest alternatives and why they test the decision.
10. **Continue** — composer, enquiry and wider Tanzania journey.

## Route data model

Current core fields remain:

`slug · name · stance · badge · recommended_days · variants · approach · descent · overnight · acclimatisation · crowds · scenery · profile[] · summary · why_enkiama · caution · stages[] · fit`

Phase 27B adds:

- `public_status`
- `source_refs[]`
- `source_updated_at`
- `start_gate`
- `start_altitude_m` (null until authoritative verification)
- `summit_approach`
- `route_merge_notes`
- `season_notes`
- `transfer_notes`
- `camp_profile`
- `acclimatisation_logic`
- `trail_character`
- `operational_notes`
- `comparison_peers[]`
- `stage_trace[]`
- `verification_notes`

### Source-of-truth rule

A benchmark operator’s claim **never becomes Enkiama operational truth**. Benchmark research informs product design. Public Enkiama claims come from authoritative park/medical sources, verified Enkiama records, or the actual operating partner’s documented procedures.

Exact start altitudes, safety equipment, guide ratios, oxygen, medical systems, porter-welfare certification and premium camp specifications must remain unclaimed until verified.

## Benchmark synthesis

Premium travel brands are strongest at low-friction planning, private support, concrete comfort specification, strong imagery and pre/post-trip continuity.

Specialist Kilimanjaro operators are strongest at route comparison, acclimatisation strategy, guide decisions, safety systems, preparation depth and route-specific detail.

**Enkiama’s position:** combine the calm confidence of the first category with the operational competence of the second.

### Reference set

- Abercrombie & Kent — premium private Kilimanjaro operation
- Jacada Travel — editorial private-climb framing
- Tusker Trail — Kilimanjaro operating-system model
- Ultimate Kilimanjaro — seven-route comparison / route taxonomy
- Altezza Travel — operational safety transparency
- IMEC / KPAP — verifiable porter-treatment standards
- CDC Yellow Book — altitude-risk and acclimatisation principles
- TANAPA / Kilimanjaro National Park — official park context and rules
- Team Kilimanjaro — explicit high-support camp specification benchmark

## Visual system

- Palette: basalt / near-black green, glacier bone, ash grey, muted alpine sage, restrained earth-gold.
- Hero: scale and atmosphere, not a posed summit portrait.
- Typography: editorial serif for mountain/route names; precise sans-serif for altitude, days and operating data.
- Imagery sequence: mountain scale → ecological zone/trail → camp operations → guide/crew → route-specific terrain → summit/descent.
- Diagrams: altitude scale, continuous route traces, comparison register and decision pathways.
- Motion: slow route-line reveal and subtle altitude progression; no gamified summit progress.
- Controls: rectilinear, quiet, label-led; avoid pill-heavy systems.
- Mobile: vertical ascent traces, 2×2 comparison metrics, readable route register and no squeezed tables.

## Operational verification backlog

Before Phase 27C/27D claims go public, confirm with the actual climbing partner:

- lead/assistant guide qualifications and refresher cadence
- health monitoring frequency and decision authority
- oxygen provision and control
- medical equipment
- communications
- descent and evacuation procedure
- porter welfare / KPAP or equivalent status
- load, wage, food, equipment and tipping rules
- tent/sleep/toilet/dining specifications
- food and water systems
- guide/crew ratios
- airport / briefing / gear-check / lodge continuity
- insurance and health requirements
- exact route timing and camp variants
- evidence from past operated climbs

Until confirmed: **do not overclaim**.

## Roadmap

| Phase | Deliverable |
| --- | --- |
| **27A · Flagship foundation** | Clean public language; dossier index; flagship route-atlas hierarchy; editorial formats/standards; credible expedition evidence; composer reframing. |
| **27B · Seven-route intelligence** | Normalize all seven route dossiers, comparison peers, continuous stage traces, data provenance and route-level content QA. |
| **27C · Altitude & safety operating system** | After partner verification: guide qualification, monitoring, oxygen, medical kits, communications, descent and evacuation. |
| **27D · Premium mountain operations** | After camp/partner verification: sleep, dining, toilet, water, food and private-support specifications; pre/post mountain continuity. |
| **27E · Preparation & expedition evidence** | KILELE 2027 preparation milestones, training/gear/briefing structure and future operated case-study framework. |
| **27F · Mountain composer & enquiry continuity** | Improve route-direction logic, preserve state into enquiry, add season/group format only when supported by data. |
| **27G · Flagship immersion QA** | End-to-end video review, short laptops, mobile landscape, JSON failure handling, performance, reduced motion and readability. |

## Definition of done

- All seven routes exist, are differentiated and use the same decision schema.
- Any one route can be understood without reading the other six.
- The flagship can be scanned without fatigue; deeper content is one interaction away.
- No internal-development language is public.
- No unverified case-study placeholders are public.
- No safety, porter-welfare or premium-camp claim is public without evidence.
- Kilimanjaro feels distinct from safari pages while remaining recognizably Enkiama.
- Mobile route sequences remain legible.
- Composer explains why and remains explicitly non-medical.
- Focused CI + full regression pass, followed by real end-to-end video review.

---

**Final product thesis:** Enkiama should make Kilimanjaro feel quieter and more intelligent than a mass-market climb, more operationally credible than a luxury travel landing page, and more editorially disciplined than a specialist information portal.
