const { test, expect } = require('@playwright/test');

const pages = {
  'index.html': {
    hero: '.hero',
    copy: '.hero-content',
    headline: '.hero-hed',
  },
  'journeys.html': {
    hero: '.ph',
    copy: '.ph-inner',
    headline: '.ph-hed',
  },
  'tanzania.html': {
    hero: '.tz-hero',
    copy: '.tz-hero__copy',
    headline: '.tz-hero__copy h1',
  },
  'family.html': {
    hero: '.ph',
    copy: '.ph-inner',
    headline: '.ph-hed',
  },
  'companions.html': {
    hero: '.c-hero',
    copy: '.c-hero',
    headline: '.c-title',
  },
  'compose.html': {
    hero: '.compose-cover',
    copy: '.compose-cover__copy',
    headline: '.compose-cover__title',
  },
  'society-and-culture.html': {
    hero: '.culture-hero',
    copy: '.culture-hero__copy',
    headline: '.culture-hero__copy h1',
  },
};

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'wide-2048', width: 2048, height: 1152 },
];

function isLocal(url) {
  try {
    return new URL(url).origin === 'http://127.0.0.1:4173';
  } catch {
    return false;
  }
}

for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const [path, selectors] of Object.entries(pages)) {
      test(path, async ({ page }) => {
        const runtimeErrors = [];
        const badLocalResponses = [];

        page.on('pageerror', error => runtimeErrors.push(error.message));
        page.on('response', response => {
          if (isLocal(response.url()) && response.status() >= 400) {
            badLocalResponses.push(`${response.status()} ${response.url()}`);
          }
        });

        await page.route('**/*', async route => {
          const url = route.request().url();
          if (isLocal(url) || url.startsWith('data:') || url.startsWith('blob:')) {
            await route.continue();
          } else {
            await route.abort('blockedbyclient');
          }
        });

        const response = await page.goto('/' + path, { waitUntil: 'domcontentloaded' });
        expect(response, `${path} should return a document response`).not.toBeNull();
        expect(response.status(), `${path} should load successfully`).toBeLessThan(400);

        await page.waitForTimeout(120);

        const metrics = await page.evaluate(({ hero, copy, headline }) => {
          const root = document.documentElement;
          const heroEl = document.querySelector(hero);
          const copyEl = document.querySelector(copy);
          const headlineEl = document.querySelector(headline);

          const rect = el => {
            const box = el?.getBoundingClientRect();
            return box ? {
              left: box.left,
              right: box.right,
              top: box.top,
              bottom: box.bottom,
              width: box.width,
              height: box.height,
            } : null;
          };

          return {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            scrollWidth: root.scrollWidth,
            hero: rect(heroEl),
            copy: rect(copyEl),
            headline: rect(headlineEl),
            headlineFontSize: headlineEl ? parseFloat(getComputedStyle(headlineEl).fontSize) : 0,
          };
        }, selectors);

        expect(metrics.hero, `${path} wide-screen hero should exist`).not.toBeNull();
        expect(metrics.copy, `${path} wide-screen copy block should exist`).not.toBeNull();
        expect(metrics.headline, `${path} wide-screen headline should exist`).not.toBeNull();

        expect(
          metrics.scrollWidth,
          `${path} has horizontal overflow at ${viewport.name}`
        ).toBeLessThanOrEqual(metrics.innerWidth + 4);

        // Typography should scale deliberately, not indefinitely with viewport width.
        expect(
          metrics.headlineFontSize,
          `${path} headline exceeds the wide-screen typography ceiling at ${viewport.name}`
        ).toBeLessThanOrEqual(150);

        // Editorial copy must retain a readable measure on large displays.
        expect(
          metrics.copy.width,
          `${path} hero copy becomes too wide at ${viewport.name}`
        ).toBeLessThanOrEqual(1020);

        expect(
          metrics.headline.width,
          `${path} headline occupies too much of the wide viewport at ${viewport.name}`
        ).toBeLessThanOrEqual(metrics.innerWidth * 0.78);

        // Heroes may be cinematic, but must not create an accidental >1.2 viewport
        // empty field before the next chapter begins.
        expect(
          metrics.hero.height,
          `${path} hero over-expands vertically at ${viewport.name}`
        ).toBeLessThanOrEqual(metrics.innerHeight * 1.2);

        // Nor should the hero collapse into a shallow banner on large screens.
        expect(
          metrics.hero.height,
          `${path} hero loses editorial scale at ${viewport.name}`
        ).toBeGreaterThanOrEqual(metrics.innerHeight * 0.58);

        expect(
          metrics.copy.left,
          `${path} hero copy escapes the left viewport edge at ${viewport.name}`
        ).toBeGreaterThanOrEqual(-4);
        expect(
          metrics.copy.right,
          `${path} hero copy escapes the right viewport edge at ${viewport.name}`
        ).toBeLessThanOrEqual(metrics.innerWidth + 4);

        expect(runtimeErrors, `${path} emitted runtime JS errors at ${viewport.name}`).toEqual([]);
        expect(badLocalResponses, `${path} requested missing local resources at ${viewport.name}`).toEqual([]);
      });
    }
  });
}
