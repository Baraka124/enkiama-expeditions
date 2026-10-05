# Enkiama Expeditions

The website for Enkiama — curated premium journeys through Tanzania.

A static site at runtime: plain HTML, JavaScript and compiled CSS. The public
site still deploys directly to GitHub Pages, but the design system is now built
with Tailwind CSS v4. The compiled stylesheet is committed to the repository,
so the host does not need Node or a server-side build step.

## Tailwind design system

The public design system lives in `src/enkiama.css` and compiles to
`assets/css/enkiama.css`.

The Enkiama signature tokens are defined with Tailwind `@theme static`:
warm paper/ivory, bone, clay, sage, olive, forest, brass and ink, together with
Fraunces and Instrument Sans. During migration, Tailwind utilities use the
`tw:` prefix so they cannot collide with existing editorial component names.

For local development:

```bash
npm install
npm run watch:css
```

For a production build:

```bash
npm run build:css
```

The generated `assets/css/enkiama.css` is committed. A GitHub Actions workflow
also recompiles it whenever the Tailwind source, landing page, package metadata
or workflow changes.

### Migration rule

Do not redesign while migrating a page. Preserve the current rendered result,
move reusable layout/spacing/typography into Tailwind first, and keep custom CSS
only for genuinely art-directed components such as the hero, Six Worlds and
media cropping. JavaScript behaviour should target IDs or `data-*` hooks
rather than styling classes.

## Structure

```
/                         (public site — these become the live URLs)
  index.html              →  enkiama.com
  tanzania.html           →  enkiama.com/tanzania
  how.html                →  enkiama.com/how
  family.html             →  enkiama.com/family
  notes.html              →  enkiama.com/notes
  stories.html            →  enkiama.com/stories
  journeys.html           →  enkiama.com/journeys   (public teaser gallery)
  begin.html              →  enkiama.com/begin

/journeys/                (private — unlisted, not linked from the public site)
  styles.css              (stylesheet for the itinerary documents)
  marina-2026-ea47e70a.html
```

## The privacy model

The public site never links to anything inside `/journeys/`. The
`journeys.html` page is a public teaser that shows the *shape* of past trips
(route, nights, worlds) but no guest names and no link to any live document.

Each guest's full itinerary lives at an unlisted URL with a random token,
e.g. `enkiama.com/journeys/marina-2026-ea47e70a`. Nothing public points to it,
so a visitor browsing the site will never find it. The link is sent directly
to the travelling group.

This is "unlisted," not password-locked: anyone with the link can open it.
That is the right level for an itinerary. If genuine password protection is
ever needed, add it at the host level (e.g. Netlify, Cloudflare Pages both
offer per-folder password protection) — no change to these files is required.

## Adding a new guest itinerary

1. Copy an existing itinerary in `/journeys/` to a new file with a fresh
   random token: `journeys/<name>-<year>-<token>.html`.
   Generate a token with: `python3 -c "import secrets; print(secrets.token_hex(4))"`
2. Edit its content for the new group.
3. Confirm it links its stylesheet as `href="styles.css"` (same folder) and
   that its logo links home as `href="../index.html"`.
4. Send the group the direct link. Do **not** link it from any public page.
5. Optionally add the trip's *shape* (no names) as a card on `journeys.html`.

## Deploying with GitHub Pages

The `.nojekyll` file is included so GitHub Pages serves all files and folders
as-is (without it, Jekyll can ignore some files). In the repo settings, enable
GitHub Pages from the `main` branch, root folder. The site will be live at
`https://baraka124.github.io/enkiama-expeditions/` — or point a custom domain
(enkiama.com) at it.

## Fonts

Fraunces and Instrument Sans load from Google Fonts on the public pages. The
itinerary documents additionally use EB Garamond, Cormorant Garamond, Playfair
Display, and Outfit. All load over the network; no local font files needed.
