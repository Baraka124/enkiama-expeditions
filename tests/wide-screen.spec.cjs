const { test, expect } = require('@playwright/test');

const pages = {
  'index.html': {
    hero: '.hero',
    copy: '.hero-content',
    headline: '.hero-hed',
  },
  'journeys.html': {
    hero: '.ph',
    copy: '.journey-cover__copy',
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
    copy: '.c-title',
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
  { name: 'desktop-1792', width: 1792, height: 1120 },
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

          const masthead = document.querySelector('#ehBar');
          const heroImage = document.querySelector('#heroFrame img');
          const worldImages = [...document.querySelectorAll('#worlds .wp-photo-film img')];

          return {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            scrollWidth: root.scrollWidth,
            hero: rect(heroEl),
            copy: rect(copyEl),
            headline: rect(headlineEl),
            headlineFontSize: headlineEl ? parseFloat(getComputedStyle(headlineEl).fontSize) : 0,
            masthead: rect(masthead),
            heroObjectPosition: heroImage ? getComputedStyle(heroImage).objectPosition : null,
            worldObjectPositions: worldImages.map(img => getComputedStyle(img).objectPosition),
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

        if (path === 'index.html') {
          expect(metrics.masthead, 'Home masthead should exist at wide desktop widths').not.toBeNull();
          expect(
            metrics.copy.top,
            `Home hero copy collides with the masthead at ${viewport.name}`
          ).toBeGreaterThanOrEqual(metrics.masthead.bottom + 20);

          expect(
            metrics.copy.width,
            `Home hero reading field becomes too wide at ${viewport.name}`
          ).toBeLessThanOrEqual(620);

          expect(
            metrics.heroObjectPosition,
            `Home hero should resolve the wide editorial focal crop at ${viewport.name}`
          ).toBe('62% 58%');

          expect(
            metrics.worldObjectPositions,
            `All Six Worlds images should resolve at ${viewport.name}`
          ).toHaveLength(6);
          for (const position of metrics.worldObjectPositions) {
            expect(position, `Six Worlds image fell back to an undefined crop at ${viewport.name}`).not.toBe('');
          }

          const masthead = page.locator('#ehBar');
          await page.evaluate(() => {
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, 60);
          });
          await page.waitForFunction(() => Math.abs(window.scrollY - 60) <= 2);
          await expect(
            masthead,
            `Home masthead should remain integrated with the hero at ${viewport.name}`
          ).not.toHaveClass(/scrolled/);

          await page.evaluate(() => {
            const hero = document.getElementById('home');
            const target = Math.max(0, (hero?.offsetTop || 0) + (hero?.offsetHeight || window.innerHeight) + 90);
            window.scrollTo(0, target);
          });
          await page.waitForFunction(() => {
            const hero = document.getElementById('home');
            return !!hero && window.scrollY > hero.offsetTop + hero.offsetHeight;
          });
          await expect(
            masthead,
            `Home masthead should condense after leaving the hero at ${viewport.name}`
          ).toHaveClass(/scrolled/);
          await expect(
            masthead,
            `Home masthead should yield during downward reading at ${viewport.name}`
          ).toHaveClass(/eh-scroll-away/);

          await page.evaluate(() => window.scrollBy(0, -2));
          await page.waitForFunction(() => {
            const bar = document.getElementById('ehBar');
            return !!bar && !bar.classList.contains('eh-scroll-away');
          });
          await expect(
            masthead,
            `Home masthead should return on gentle upward intent at ${viewport.name}`
          ).not.toHaveClass(/eh-scroll-away/);

          await page.evaluate(() => {
            window.scrollTo(0, 0);
            document.documentElement.style.scrollBehavior = '';
          });
        }

        expect(runtimeErrors, `${path} emitted runtime JS errors at ${viewport.name}`).toEqual([]);
        expect(badLocalResponses, `${path} requested missing local resources at ${viewport.name}`).toEqual([]);
      });
    }
  });
}
