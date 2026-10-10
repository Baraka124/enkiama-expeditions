const { test, expect } = require('@playwright/test');

const pages = [
  // entry + editorial systems
  'index.html',
  'journeys.html',
  'tanzania.html',

  // representative destination families
  'serengeti.html',
  'ngorongoro.html',
  'kilimanjaro.html',
  'zanzibar.html',
  'stonetown.html',

  // trust / operating system
  'family.html',
  'companions.html',
  'society-and-culture.html',
  'why.html',
  'how.html',
  'partners.html',
  'practical.html',
  'faq.html',
  'stories.html',
  'reflections.html',
  'notes.html',

  // conversion / product interfaces
  'begin.html',
  'compose.html',
  'journey.html',
  'experience-view.html',
  'trip.html',
  'kilimanjaro-route.html',
  'kilimanjaro-expedition.html',

  // support / utilities
  'privacy.html',
  'terms.html',
  'barua.html',
  '404.html',
];

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1366', width: 1366, height: 900 },
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

    for (const path of pages) {
      test(path, async ({ page }) => {
        const runtimeErrors = [];
        const badLocalResponses = [];
        const failedLocalRequests = [];

        page.on('pageerror', error => runtimeErrors.push(error.message));
        page.on('response', response => {
          if (isLocal(response.url()) && response.status() >= 400) {
            badLocalResponses.push(`${response.status()} ${response.url()}`);
          }
        });
        page.on('requestfailed', request => {
          if (isLocal(request.url())) {
            failedLocalRequests.push(`${request.url()} — ${request.failure()?.errorText || 'failed'}`);
          }
        });

        // Keep smoke deterministic: local site resources are tested; third-party
        // fonts, analytics, embeds and APIs are not allowed to make CI flaky.
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

        await page.evaluate(() => {
          document.querySelectorAll('img').forEach(img => {
            img.loading = 'eager';
            if (!img.src && img.dataset?.src) img.src = img.dataset.src;
          });
        });

        await page.evaluate(async () => {
          const step = Math.max(450, Math.floor(window.innerHeight * 0.75));
          for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise(resolve => setTimeout(resolve, 18));
          }
          window.scrollTo(0, 0);
        });

        await page.waitForTimeout(200);

        const metrics = await page.evaluate(() => {
          const root = document.documentElement;
          const localBrokenImages = Array.from(document.images)
            .filter(img => {
              try { return new URL(img.currentSrc || img.src, location.href).origin === location.origin; }
              catch { return false; }
            })
            .filter(img => !img.complete || img.naturalWidth === 0)
            .map(img => img.getAttribute('src') || img.getAttribute('data-src') || '(unknown)');

          const h1 = document.querySelector('h1');
          const h1Box = h1 ? h1.getBoundingClientRect() : null;
          const h1FontSize = h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0;

          return {
            innerWidth: window.innerWidth,
            scrollWidth: root.scrollWidth,
            localBrokenImages,
            h1Box: h1Box && {
              left: h1Box.left,
              right: h1Box.right,
              width: h1Box.width,
            },
            h1FontSize,
          };
        });

        expect(
          metrics.scrollWidth,
          `${path} has horizontal overflow at ${viewport.name}`
        ).toBeLessThanOrEqual(metrics.innerWidth + 4);

        expect(
          metrics.localBrokenImages,
          `${path} has broken local images at ${viewport.name}`
        ).toEqual([]);

        if (metrics.h1Box) {
          expect(
            metrics.h1Box.right,
            `${path} H1 escapes the right viewport edge at ${viewport.name}`
          ).toBeLessThanOrEqual(metrics.innerWidth + 4);
          expect(
            metrics.h1Box.left,
            `${path} H1 escapes the left viewport edge at ${viewport.name}`
          ).toBeGreaterThanOrEqual(-4);
        }

        if (viewport.width <= 640 && metrics.h1FontSize) {
          expect(
            metrics.h1FontSize,
            `${path} mobile H1 exceeds the Enkiama typography ceiling`
          ).toBeLessThanOrEqual(82);
        }

        if (path === 'index.html') {
          const karibu = await page.evaluate(() => {
            const stack = document.querySelector('.lp-welcome-stack');
            const photo = document.querySelector('.lp-welcome-photo');
            const plate = document.querySelector('.lp-welcome-plate');
            if (!stack || !photo || !plate) return null;
            return {
              stackDisplay: getComputedStyle(stack).display,
              photoPosition: getComputedStyle(photo).position,
              platePosition: getComputedStyle(plate).position,
            };
          });
          expect(karibu, 'Homepage Karibu composition should exist').not.toBeNull();

          if (viewport.width <= 860) {
            expect(karibu.stackDisplay, 'Karibu should stack below laptop width').toBe('grid');
            expect(karibu.photoPosition, 'Karibu media should join document flow below laptop width').toBe('relative');
            expect(karibu.platePosition, 'Karibu copy should join document flow below laptop width').toBe('relative');
          } else {
            expect(karibu.photoPosition, 'Karibu media should overlay at laptop width').toBe('absolute');
            expect(karibu.platePosition, 'Karibu copy should overlay at laptop width').toBe('absolute');
          }
        }

        if (path === 'family.html') {
          const familyContinuity = await page.evaluate(() => {
            const section = document.querySelector('.family-continuity');
            const copy = document.querySelector('.family-continuity__copy');
            if (!section || !copy) return null;
            const copyStyle = getComputedStyle(copy);
            return {
              display: getComputedStyle(section).display,
              transform: copyStyle.transform,
              top: copyStyle.top,
              bottom: copyStyle.bottom,
            };
          });
          expect(familyContinuity, 'Family continuity signature should exist').not.toBeNull();
          if (viewport.width <= 820) {
            expect(familyContinuity.transform, 'Family continuity copy should stop vertical centering below 820px').toBe('none');
            expect(familyContinuity.bottom, 'Family continuity copy should use its mobile/tablet bottom anchor').not.toBe('auto');
          }
        }

        if (path === 'companions.html') {
          const heroDisplay = await page.evaluate(() => {
            const hero = document.querySelector('.c-hero');
            return hero ? getComputedStyle(hero).display : null;
          });
          expect(heroDisplay, 'Companions hero should exist').not.toBeNull();
          if (viewport.width <= 860) {
            expect(heroDisplay, 'Companions hero should switch to flex below 860px').toBe('flex');
          } else {
            expect(heroDisplay, 'Companions hero should use editorial grid at laptop width').toBe('grid');
          }
        }

        const menuTrigger = page.locator('#ehTrigger');
        if (await menuTrigger.count()) {
          await menuTrigger.click();
          const overlay = page.locator('#ehOverlay');
          await expect(overlay).toHaveClass(/open/);
          await expect(menuTrigger).toHaveAttribute('aria-expanded', 'true');

          const close = page.locator('#ehClose');
          if (await close.count()) {
            await close.click();
            await expect(overlay).not.toHaveClass(/open/);
          }
        }

        expect(runtimeErrors, `${path} emitted runtime JS errors`).toEqual([]);
        expect(badLocalResponses, `${path} requested missing local resources`).toEqual([]);
        expect(failedLocalRequests, `${path} had failed local requests`).toEqual([]);
      });
    }
  });
}
