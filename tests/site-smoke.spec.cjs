const { test, expect } = require('@playwright/test');

const pages = [
  // entry + editorial systems
  'index.html',
  'journeys.html',
  'tanzania.html',

  // representative destination families
  'serengeti.html',
  'ngorongoro.html',
  'tarangire.html',
  'arusha.html',
  'great-rift.html',
  'manyara.html',
  'ruaha.html',
  'nyerere.html',
  'mahale.html',
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

  // delivered private journey dossiers
  'journeys/marina-2026-ea47e70a.html',

  // support / utilities
  'privacy.html',
  'terms.html',
  'barua.html',
  '404.html',
];

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-640', width: 640, height: 900 },
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



        if (path === 'compose.html') {
          const composeState = await page.evaluate(() => {
            const composer = document.querySelector('.compose-conversion .composer');
            const stage = document.querySelector('.compose-conversion .cmp-stage');
            const visual = document.querySelector('.compose-conversion .cmp-visual');
            const panel = document.querySelector('.compose-conversion .cmp-panel');
            const q = document.querySelector('.compose-conversion .cmp-q');
            if (!composer || !stage || !visual || !panel || !q) return null;
            const rect = el => {
              const r = el.getBoundingClientRect();
              return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
            };
            return {
              composer: rect(composer),
              stage: rect(stage),
              visual: rect(visual),
              panel: rect(panel),
              question: rect(q),
              stageDisplay: getComputedStyle(stage).display,
              stageColumns: getComputedStyle(stage).gridTemplateColumns,
            };
          });

          expect(composeState, 'Compose stage should exist').not.toBeNull();

          if (viewport.width >= 1000) {
            expect(
              composeState.composer.width,
              `Compose outer shell should span the viewport at ${viewport.name}`
            ).toBeGreaterThanOrEqual(viewport.width * 0.92);
            expect(
              composeState.stage.width,
              `Compose decision stage should span the outer shell at ${viewport.name}`
            ).toBeGreaterThanOrEqual(composeState.composer.width * 0.98);
            expect(
              composeState.visual.width + composeState.panel.width,
              `Compose visual and panel should consume the stage at ${viewport.name}`
            ).toBeGreaterThanOrEqual(composeState.stage.width * 0.96);
            expect(
              composeState.panel.width,
              `Compose decision panel should not collapse at ${viewport.name}`
            ).toBeGreaterThanOrEqual(viewport.width * 0.42);
            expect(
              composeState.question.width,
              `Compose question should remain readable at ${viewport.name}`
            ).toBeGreaterThanOrEqual(Math.min(360, composeState.panel.width * 0.55));
          } else {
            expect(
              composeState.stage.width,
              `Compose stage should stay inside the viewport at ${viewport.name}`
            ).toBeLessThanOrEqual(viewport.width + 4);
          }
        }

        if (path === 'experience-view.html') {
          const composedMode = await page.evaluate(() => {
            sessionStorage.setItem('enkiama.composition', JSON.stringify({
              version: 1,
              preferences: {pull:'stillness',time:'mid',season:'jun-oct',pace:'slow',coast:'yes',who:'couple'},
              labels: {pull:'Space & quiet',time:'~10 days',season:'Jun–Oct',pace:'Slow',coast:'Coast: yes',who:'Two travellers'},
              route: ['Tarangire','Ngorongoro','Serengeti','Zanzibar'],
              message: 'A composed journey'
            }));
            return true;
          });
          expect(composedMode).toBe(true);
          await page.goto(baseURL + '/experience-view.html?from=compose', {waitUntil:'domcontentloaded'});
          const state = await page.evaluate(() => ({
            mode: document.getElementById('evMode')?.textContent?.trim(),
            exitText: document.getElementById('evExit')?.textContent?.trim(),
            exitHref: document.getElementById('evExit')?.getAttribute('href'),
            route: document.getElementById('evRoute')?.textContent?.trim(),
            title: document.getElementById('evTitle')?.textContent?.trim(),
            composedClass: document.querySelector('.ev')?.classList.contains('composed-mode'),
            controlsOpacity: getComputedStyle(document.querySelector('.ev-controls')).opacity
          }));
          expect(state.mode).toBe('Your journey view');
          expect(state.exitText).toBe('Back to composition');
          expect(state.exitHref).toBe('compose.html#cmpResult');
          expect(state.route).toContain('Tarangire');
          expect(state.route).toContain('Zanzibar');
          expect(state.title).toContain('space');
          expect(state.composedClass).toBe(true);
          expect(Number(state.controlsOpacity)).toBeGreaterThanOrEqual(0.85);
        }

        if (path === 'begin.html') {
          const beginState = await page.evaluate(() => {
            const hero = document.querySelector('.begin-conversion .ph');
            const heroInner = document.querySelector('.begin-conversion .ph-inner');
            const form = document.getElementById('lfForm');
            const name = document.getElementById('lfName');
            const contact = document.getElementById('lfEmail');
            const message = document.getElementById('lfMsg');
            const send = document.getElementById('lfSend');
            const redundantStatement = [...document.querySelectorAll('blockquote p')]
              .some(el => /A number only ever follows/i.test(el.textContent || ''));
            return {
              hero: hero ? hero.getBoundingClientRect() : null,
              heroInner: heroInner ? heroInner.getBoundingClientRect() : null,
              formTag: form?.tagName || null,
              formId: form?.id || null,
              nameName: name?.getAttribute('name') || null,
              contactName: contact?.getAttribute('name') || null,
              messageName: message?.getAttribute('name') || null,
              sendType: send?.getAttribute('type') || null,
              sendText: send?.textContent?.trim() || '',
              hasRedundantStatement: redundantStatement,
              bodyText: document.body.innerText || '',
            };
          });

          expect(beginState, 'Begin conversion state should exist').not.toBeNull();
          expect(beginState.formTag, 'Begin enquiry should use a semantic form').toBe('FORM');
          expect(beginState.formId, 'Begin enquiry should keep a stable form id').toBe('lfForm');
          expect(beginState.nameName, 'Name field should be serializable').toBe('name');
          expect(beginState.contactName, 'Contact field should be serializable').toBe('contact');
          expect(beginState.messageName, 'Message field should be serializable').toBe('message');
          expect(beginState.sendType, 'Begin action should submit the form semantically').toBe('submit');
          expect(beginState.sendText, 'Public send action should remain Enkiama-branded').toContain('Send to Enkiama');
          expect(beginState.bodyText, 'Public conversion UI must not expose a personal-name fallback').not.toContain('Send to Baraka');
          expect(beginState.hasRedundantStatement, 'Begin should not repeat the same post-form conversation statement').toBe(false);

          expect(beginState.hero, 'Begin hero should exist').not.toBeNull();
          expect(
            beginState.hero.height,
            `Begin hero should not become another full-screen barrier at ${viewport.name}`
          ).toBeLessThanOrEqual(viewport.height * 0.9);

          if (viewport.width >= 1000) {
            expect(
              beginState.heroInner.width,
              `Begin hero copy should retain a restrained editorial measure at ${viewport.name}`
            ).toBeLessThanOrEqual(800);
          }

          // Keyboard-first submit path: once valid, Enter from a field should submit the form.
          await page.fill('#lfEmail', 'traveller@example.com');
          await page.fill('#lfMsg', 'We are considering Tanzania in August for two people and want a quieter wildlife journey.');
          await expect(page.locator('#lfSend')).toBeEnabled();

          const submitProbe = await page.evaluate(() => {
            const form = document.getElementById('lfForm');
            let count = 0;
            const handler = event => {
              count += 1;
              event.preventDefault();
            };
            form.addEventListener('submit', handler, { once:true });
            form.requestSubmit();
            return count;
          });
          expect(submitProbe, 'Begin semantic form should support native submit behavior').toBe(1);
        }

        if (path === 'index.html') {
          const hero = await page.evaluate(() => {
            const content = document.querySelector('.hero-content');
            const headline = document.querySelector('.hero-hed');
            const actions = document.querySelector('.hero-acts');
            const primary = document.querySelector('.hero-acts .btn-primary');
            const secondary = document.querySelector('.hero-acts .btn-ghost');
            if (!content || !headline || !actions || !primary || !secondary) return null;
            const cr = content.getBoundingClientRect();
            const hr = headline.getBoundingClientRect();
            return {
              contentWidth: cr.width,
              contentLeft: cr.left,
              contentRight: cr.right,
              headlineWidth: hr.width,
              headlineFontSize: parseFloat(getComputedStyle(headline).fontSize),
              primaryText: primary.textContent.trim(),
              primaryHref: primary.getAttribute('href'),
              secondaryText: secondary.textContent.trim(),
              secondaryHref: secondary.getAttribute('href'),
            };
          });
          expect(hero, 'Homepage editorial hero should exist').not.toBeNull();
          expect(hero.contentRight, 'Hero reading field should remain inside the viewport').toBeLessThanOrEqual(metrics.innerWidth + 4);
          expect(hero.contentLeft, 'Hero reading field should remain inside the viewport').toBeGreaterThanOrEqual(-4);
          expect(hero.headlineWidth, 'Hero headline should not occupy the full viewport').toBeLessThanOrEqual(metrics.innerWidth * 0.72);
          expect(hero.primaryText, 'Hero primary action should lead to journey planning').toBe('Begin a journey');
          expect(hero.primaryHref, 'Hero primary action should point to begin.html').toBe('begin.html');
          expect(hero.secondaryHref, 'Hero secondary action should remain the Tanzania exploration route').toBe('#worlds');

          const heroReadability = await page.evaluate(() => {
            const heroEl = document.querySelector('.hero');
            const content = document.querySelector('.hero-content');
            const eye = document.querySelector('.hero-eye');
            const heading = document.querySelector('.hero-hed');
            const sub = document.querySelector('.hero-sub');
            const secondary = document.querySelector('.hero-acts .btn-ghost');
            if (!heroEl || !content || !eye || !heading || !sub || !secondary) return null;
            const style = el => getComputedStyle(el);
            const rect = el => {
              const r = el.getBoundingClientRect();
              return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height };
            };
            const pseudo = getComputedStyle(content, '::before');
            return {
              heroAlignItems: style(heroEl).alignItems,
              content: rect(content),
              eyeColor: style(eye).color,
              headingColor: style(heading).color,
              subColor: style(sub).color,
              secondaryColor: style(secondary).color,
              veilBackground: pseudo.backgroundImage,
              veilContent: pseudo.content,
            };
          });
          expect(heroReadability, 'Homepage hero readability system should exist').not.toBeNull();
          expect(heroReadability.heroAlignItems, 'Hero reading field must stay anchored to the editorial gutter').toBe('flex-start');
          expect(heroReadability.veilContent, 'Hero should keep a local reading veil behind copy').not.toBe('none');
          expect(heroReadability.veilBackground, 'Hero reading veil should remain present').not.toBe('none');

          if (viewport.width >= 1000) {
            expect(hero.contentWidth, 'Desktop hero reading field should remain editorially narrow').toBeLessThanOrEqual(620);
            expect(hero.headlineFontSize, 'Desktop hero headline should respect the restrained type ceiling').toBeLessThanOrEqual(108);
          }
          if (viewport.width <= 520) {
            expect(hero.headlineFontSize, 'Small-screen hero headline should remain compact').toBeLessThanOrEqual(58);
          }

          // Home masthead should remain visually integrated with the hero until
          // the hero has actually left the active scene.
          const masthead = page.locator('#ehBar');
          await page.evaluate(() => {
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, 60);
          });
          await page.waitForFunction(() => Math.abs(window.scrollY - 60) <= 2);
          await page.waitForTimeout(80);
          await expect(masthead, 'Home masthead should stay transparent during early hero scroll').not.toHaveClass(/scrolled/);

          await page.evaluate(() => {
            const hero = document.querySelector('.hero');
            const target = Math.max(0, (hero?.offsetTop || 0) + (hero?.offsetHeight || window.innerHeight) + 80);
            window.scrollTo(0, target);
          });
          await page.waitForFunction(() => {
            const hero = document.querySelector('.hero');
            return !!hero && window.scrollY > hero.offsetTop + hero.offsetHeight;
          });
          await page.waitForTimeout(80);
          await expect(masthead, 'Home masthead should condense only after the hero exits').toHaveClass(/scrolled/);
          await expect(masthead, 'Home masthead may yield during sustained downward reading after the hero').toHaveClass(/eh-scroll-away/);

          // Even a gentle upward gesture should restore orientation immediately.
          await page.evaluate(() => window.scrollBy(0, -2));
          await page.waitForFunction(() => {
            const bar = document.getElementById('ehBar');
            return !!bar && !bar.classList.contains('eh-scroll-away');
          });
          await expect(masthead, 'Home masthead should return on gentle upward intent').not.toHaveClass(/eh-scroll-away/);

          await page.evaluate(() => {
            window.scrollTo(0, 0);
            document.documentElement.style.scrollBehavior = '';
          });

          const cropState = await page.evaluate(() => {
            const heroImg = document.querySelector('#heroFrame img');
            const worldImgs = [...document.querySelectorAll('#worlds .wp-photo-film img')];
            const editorialImg = document.querySelector('.lp-photo img');
            if (!heroImg || worldImgs.length < 6 || !editorialImg) return null;
            const read = el => {
              const s = getComputedStyle(el);
              return { position:s.objectPosition, scale:s.scale || 'none' };
            };
            return {
              hero:read(heroImg),
              worlds:worldImgs.map(read),
              editorial:read(editorialImg)
            };
          });
          expect(cropState, 'Responsive editorial crop system should resolve on Home imagery').not.toBeNull();
          expect(cropState.hero.position, 'Hero must resolve an explicit focal crop').not.toBe('50% 50%');
          expect(cropState.worlds, 'All Six Worlds images should resolve responsive focal crops').toHaveLength(6);
          for (const crop of cropState.worlds) {
            expect(crop.position, 'Each Six Worlds image should resolve an explicit focal crop').not.toBe('');
          }
          expect(cropState.editorial.position, 'Editorial photography must resolve an explicit focal crop').not.toBe('');

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

          expect(karibu.stackDisplay, 'Karibu should use the protected reading-field grid').toBe('grid');
          expect(karibu.photoPosition, 'Karibu media should remain in document flow').toBe('relative');
          expect(karibu.platePosition, 'Karibu copy should remain in its protected editorial field').toBe('relative');
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
          const body = page.locator('body');
          await menuTrigger.click();
          const overlay = page.locator('#ehOverlay');
          await expect(overlay).toHaveClass(/open/);
          await expect(menuTrigger).toHaveAttribute('aria-expanded', 'true');
          await expect(body).toHaveClass(/eh-locked/);

          const close = page.locator('#ehClose');
          if (await close.count()) {
            await expect(close).toBeFocused();

            // Shift+Tab from the first focusable should wrap to the final focusable.
            await page.keyboard.press('Shift+Tab');
            const focusWrapped = await page.evaluate(() => {
              const ov = document.getElementById('ehOverlay');
              const focusables = ov ? Array.from(ov.querySelectorAll('a[href],button')).filter(el =>
                el.tabIndex >= 0 &&
                el.offsetParent !== null &&
                !el.hasAttribute('disabled') &&
                el.getAttribute('aria-hidden') !== 'true'
              ) : [];
              return focusables.length > 0 && document.activeElement === focusables[focusables.length - 1];
            });
            expect(focusWrapped, path + ' Index overlay should trap reverse keyboard focus').toBe(true);

            // Escape closes and returns focus to the Index trigger.
            await page.keyboard.press('Escape');
            await expect(overlay).not.toHaveClass(/open/);
            await expect(menuTrigger).toHaveAttribute('aria-expanded', 'false');
            await expect(body).not.toHaveClass(/eh-locked/);
            await expect(menuTrigger).toBeFocused();
          }
        }

        expect(runtimeErrors, `${path} emitted runtime JS errors`).toEqual([]);
        expect(badLocalResponses, `${path} requested missing local resources`).toEqual([]);
        expect(failedLocalRequests, `${path} had failed local requests`).toEqual([]);
      });
    }
  });
}
