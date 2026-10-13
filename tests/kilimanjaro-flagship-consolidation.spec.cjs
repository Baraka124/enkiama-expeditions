const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const preparation = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'kilimanjaro-preparation.json'), 'utf8')
);
const expeditions = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'kilimanjaro-expeditions.json'), 'utf8')
);

test('Kilimanjaro atlas is one controlled seven-route decision surface on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1792, height: 1000 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  const atlas = page.locator('.km-atlas__inner');
  const register = page.locator('#kmRouteNav');
  const panel = page.locator('#kmRoutePanel');

  await expect(register.locator('.km-route')).toHaveCount(7);
  await expect(panel.locator('.km-route__identity')).toHaveCount(1);
  await expect(panel.locator('.km-route__detail')).toHaveCount(1);

  const geometry = await page.evaluate(() => {
    const a = document.querySelector('.km-atlas__inner').getBoundingClientRect();
    const p = document.querySelector('#kmRoutePanel').getBoundingClientRect();
    const nav = document.querySelector('#kmRouteNav').getBoundingClientRect();
    const computed = getComputedStyle(document.querySelector('#kmRoutePanel'));
    return {
      atlasWidth: a.width,
      viewport: window.innerWidth,
      panelWidth: p.width,
      navWidth: nav.width,
      panelPosition: computed.position,
    };
  });

  expect(geometry.atlasWidth).toBeLessThanOrEqual(1500);
  expect(geometry.atlasWidth).toBeLessThan(geometry.viewport * 0.92);
  expect(geometry.panelWidth).toBeLessThanOrEqual(geometry.atlasWidth + 1);
  expect(geometry.navWidth).toBeLessThanOrEqual(geometry.atlasWidth + 1);
  expect(geometry.panelPosition).not.toBe('sticky');
});

test('all seven Kilimanjaro routes retain meaningful visible authority', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  const routes = page.locator('#kmRouteNav .km-route');
  await expect(routes).toHaveCount(7);

  await expect(page.locator('.km-route-group')).toHaveCount(2);
  await expect(page.locator('.km-route-group--primary .km-route')).toHaveCount(3);
  await expect(page.locator('.km-route-group--specific .km-route')).toHaveCount(4);

  for (let i = 0; i < 7; i++) {
    const route = routes.nth(i);
    await expect(route.locator('.km-route__name')).not.toBeEmpty();
    await expect(route.locator('.km-route__days')).not.toBeEmpty();
    const box = await route.boundingBox();
    expect(box.width).toBeGreaterThan(180);
    expect(box.height).toBeGreaterThan(55);
  }
});

test('selected route uses a clear middle typographic tier and structured ascent trace', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  const title = page.locator('#kmRoutePanel h3');
  const summary = page.locator('#kmRoutePanel .km-route__summary');
  const metric = page.locator('#kmRoutePanel .km-route__stat strong').first();

  const sizes = await page.evaluate(() => ({
    title: parseFloat(getComputedStyle(document.querySelector('#kmRoutePanel h3')).fontSize),
    summary: parseFloat(getComputedStyle(document.querySelector('#kmRoutePanel .km-route__summary')).fontSize),
    metric: parseFloat(getComputedStyle(document.querySelector('#kmRoutePanel .km-route__stat strong')).fontSize),
  }));

  expect(sizes.title).toBeGreaterThan(sizes.summary * 1.8);
  expect(sizes.summary).toBeGreaterThan(sizes.metric * 1.25);

  const traceCount = await page.locator('#kmRoutePanel .km-route__line span').count();
  expect(traceCount).toBeGreaterThanOrEqual(5);
  expect(traceCount).toBeLessThanOrEqual(7);
  await expect(page.locator('#kmRoutePanel .km-route__line span[data-phase="summit"]')).toHaveCount(1);
  await expect(page.locator('#kmRoutePanel .km-route__line span[data-phase="finish"]')).toHaveCount(1);
});

test('Kilimanjaro visual language uses more than the summit hero image', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.km-mountain-scenes')).toBeVisible();
  await expect(page.locator('.km-mountain-scene')).toHaveCount(2);

  const backgrounds = await page.locator('.km-mountain-scene__media').evaluateAll(nodes =>
    nodes.map(node => getComputedStyle(node).backgroundImage)
  );
  expect(backgrounds.some(bg => bg.includes('kilimanjaro-highland-table.webp'))).toBeTruthy();
  expect(backgrounds.some(bg => bg.includes('kilimanjaro-coffee-blossoms.webp'))).toBeTruthy();
});

test('Kilimanjaro atlas remains contained and readable at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    panel: document.querySelector('#kmRoutePanel').getBoundingClientRect(),
    register: document.querySelector('#kmRouteNav').getBoundingClientRect(),
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport + 2);
  expect(metrics.panel.right).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.panel.left).toBeGreaterThanOrEqual(-1);
  expect(metrics.register.right).toBeLessThanOrEqual(metrics.viewport + 1);
});


test('capture Kilimanjaro visual diagnostics', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1792, height: 1000 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'networkidle' });
  await page.screenshot({
    path: testInfo.outputPath('kilimanjaro-desktop-full.png'),
    fullPage: true,
  });
  await page.locator('#routes').screenshot({
    path: testInfo.outputPath('kilimanjaro-desktop-atlas.png'),
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'networkidle' });
  await page.screenshot({
    path: testInfo.outputPath('kilimanjaro-mobile-full.png'),
    fullPage: true,
  });
  await page.locator('#routes').screenshot({
    path: testInfo.outputPath('kilimanjaro-mobile-atlas.png'),
  });
});


test('Kilimanjaro header yields during downward reading and returns on upward intent', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => window.scrollTo(0, document.querySelector('#routes').offsetTop + 260));
  await page.waitForTimeout(180);
  await expect(page.locator('#ehBar')).toHaveClass(/km-yield/);

  await page.evaluate(() => window.scrollBy(0, -180));
  await page.waitForTimeout(180);
  await expect(page.locator('#ehBar')).not.toHaveClass(/km-yield/);
});


test('KILELE preparation registry preserves evidence-led lifecycle', async () => {
  expect(preparation.schema).toBe('enkiama.kilimanjaro.preparation.v1');

  const record = preparation.expeditions['kilele-2027-machame'];
  expect(record).toBeTruthy();
  expect(record.status).toBe('in_preparation');
  expect(record.tracks).toHaveLength(5);
  expect(record.milestone_rules.no_percentage_complete).toBe(true);
  expect(record.milestone_rules.no_summit_probability).toBe(true);
  expect(record.milestone_rules.completed_state_requires_evidence).toBe(true);

  const ids = record.tracks.map(track => track.id);
  expect(ids).toEqual(['training','gear','health_admin','briefing','continuity']);

  const evidence = record.post_expedition_evidence;
  expect(evidence.public_render).toBe(false);
  expect(evidence.status).toBe('not_operated');
  expect(evidence.actual_dates).toBeNull();
  expect(evidence.guide_team).toBeNull();
  expect(evidence.route_used).toBeNull();
  expect(evidence.summit_outcome).toBeNull();
  expect(evidence.altitude_events).toBeNull();
  expect(evidence.testimonials_cleared_for_publication).toEqual([]);

  const expedition = expeditions.expeditions.find(e => e.slug === 'kilele-2027-machame');
  expect(expedition.preparation_record).toBe('kilele-2027-machame');
  expect(expedition.evidence_status).toBe('not_operated');
  expect(expedition.case_study_publishable).toBe(false);
});

test('KILELE dossier renders five-track preparation ledger without gamified readiness', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro-expedition.html?expedition=kilele-2027-machame', { waitUntil: 'networkidle' });

  await expect(page.locator('#expPage')).toBeVisible();
  await expect(page.locator('.exp-readiness')).toBeVisible();
  await expect(page.locator('.exp-track')).toHaveCount(5);
  await expect(page.locator('.exp-track[data-track="training"]')).toBeVisible();
  await expect(page.locator('.exp-track[data-track="gear"]')).toBeVisible();
  await expect(page.locator('.exp-track[data-track="health_admin"]')).toBeVisible();
  await expect(page.locator('.exp-track[data-track="briefing"]')).toBeVisible();
  await expect(page.locator('.exp-track[data-track="continuity"]')).toBeVisible();

  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/\b\d{1,3}%\s*(ready|complete|prepared)/i);
  expect(body).not.toMatch(/summit\s+(chance|probability|odds)/i);
});

test('KILELE public evidence contract contains no pre-written outcome', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro-expedition.html?expedition=kilele-2027-machame', { waitUntil: 'networkidle' });

  await expect(page.locator('.exp-evidence')).toBeVisible();
  await expect(page.locator('.exp-evidence__register article')).toHaveCount(4);
  await expect(page.getByText('The story follows the record.')).toBeVisible();

  const evidenceText = await page.locator('.exp-evidence').innerText();
  expect(evidenceText).not.toMatch(/summited|reached uhuru|successful summit|summit success/i);
});

test('27E preparation and evidence sections remain contained at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/kilimanjaro-expedition.html?expedition=kilele-2027-machame', { waitUntil: 'networkidle' });

  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    readinessRight: document.querySelector('.exp-readiness')?.getBoundingClientRect().right,
    evidenceRight: document.querySelector('.exp-evidence')?.getBoundingClientRect().right,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport + 2);
  expect(metrics.readinessRight).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.evidenceRight).toBeLessThanOrEqual(metrics.viewport + 1);
});


test('27F carries mountain composer direction into Begin without repetition', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro.html#mountain-composer', { waitUntil: 'networkidle' });

  await page.locator('.km-question[data-key="days"] button[data-v="8"]').click();
  await page.locator('.km-question[data-key="priority"] button[data-v="acclimatisation"]').click();
  await page.locator('.km-question[data-key="experience"] button[data-v="first"]').click();
  await page.locator('.km-question[data-key="camp"] button[data-v="camping"]').click();

  await expect(page.locator('#kmResult h3')).toHaveText('8-day Lemosho');
  await expect(page.locator('#kmResult .km-result__continue')).toBeVisible();

  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('enkiama.kilimanjaro.direction')));
  expect(stored.type).toBe('kilimanjaro_route_direction');
  expect(stored.recommended.slug).toBe('lemosho');
  expect(stored.alternative.slug).toBe('northern-circuit');
  expect(stored.labels.days).toBe('8 mountain days');
  expect(stored.labels.priority).toBe('Acclimatisation');
  expect(stored.labels.experience).toBe('First high-altitude trek');
  expect(stored.labels.camp).toBe('Camping');
  expect(stored.score).toBeUndefined();

  await page.locator('#kmResult .km-result__continue').click();
  await page.waitForURL(/begin\.html\?kilimanjaro=direction/);

  await expect(page.locator('#beginHeroIssue')).toHaveText('Your Kilimanjaro direction');
  await expect(page.locator('#lfCarried')).toBeVisible();
  await expect(page.locator('#lfCarriedTitle')).toHaveText('8-day Lemosho');
  await expect(page.locator('#lfCarriedRoute')).toContainText('Lemosho · compare Northern Circuit');
  await expect(page.locator('#lfCarriedMeta span')).toHaveCount(4);
  await expect(page.locator('#lfCarriedReturn')).toHaveAttribute('href','kilimanjaro.html#mountain-composer');
  await expect(page.locator('#lfMsg')).toHaveValue('');
  await expect(page.locator('#lfMsgLabel')).toContainText('Approximate dates');
});

test('27F serializes Kilimanjaro direction through the existing enquiry schema', async ({ page }) => {
  let saved = null;
  await page.route('https://trhwjbavwiiqujcsjppo.supabase.co/rest/v1/enquiries', async route => {
    saved = JSON.parse(route.request().postData() || '{}');
    await route.fulfill({ status: 201, body: '' });
  });

  await page.goto('/kilimanjaro.html#mountain-composer', { waitUntil: 'networkidle' });
  await page.locator('.km-question[data-key="days"] button[data-v="8"]').click();
  await page.locator('.km-question[data-key="priority"] button[data-v="acclimatisation"]').click();
  await page.locator('.km-question[data-key="experience"] button[data-v="first"]').click();
  await page.locator('.km-question[data-key="camp"] button[data-v="camping"]').click();
  await page.locator('#kmResult .km-result__continue').click();
  await page.waitForURL(/begin\.html\?kilimanjaro=direction/);

  await page.locator('#lfEmail').fill('traveller@example.com');
  await page.locator('#lfMsg').fill('We are considering late August and would like to understand the preparation sequence.');
  await page.locator('#lfSend').click();

  await expect.poll(() => saved).not.toBeNull();
  expect(saved.source_page).toBe('begin');
  expect(saved.composed_journey).toContain('KILIMANJARO_DIRECTION_V1');
  expect(saved.composed_journey).toContain('Recommended: Lemosho | 8 days | preferred');
  expect(saved.composed_journey).toContain('Alternative: Northern Circuit | 9 days');
  expect(saved.composed_journey).toContain('Acclimatisation');
  expect(saved).not.toHaveProperty('kilimanjaro_direction');
});


test('27G public metadata contains no unverified legacy Kilimanjaro claims', async ({ page }) => {
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  const head = await page.locator('head').innerText().catch(() => '');
  const html = await page.locator('head').evaluate(node => node.innerHTML);

  expect(html).not.toMatch(/crew paid fairly and named/i);
  expect(html).not.toMatch(/fairly paid, fairly loaded/i);
  expect(html).not.toMatch(/matched to your fitness, time and season/i);
  expect(html).not.toMatch(/ethical, unhurried kilimanjaro climb/i);

  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /seven Kilimanjaro routes/i
  );
});

test('27G flagship remains composed on a short 1366x650 laptop', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 650 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'networkidle' });

  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    atlas: document.querySelector('#routes')?.getBoundingClientRect(),
    operations: document.querySelector('#operations')?.getBoundingClientRect(),
    composer: document.querySelector('#mountain-composer')?.getBoundingClientRect(),
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport + 2);
  expect(metrics.atlas.right).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.operations.right).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.composer.right).toBeLessThanOrEqual(metrics.viewport + 1);

  await page.locator('#mountain-composer').scrollIntoViewIfNeeded();
  await expect(page.locator('#mountain-composer .km-question')).toHaveCount(4);
  await expect(page.locator('#kmResult')).toBeVisible();
});

test('27G flagship remains readable in 844x390 mobile landscape', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'networkidle' });

  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    routeGroups: document.querySelectorAll('.km-route-group').length,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport + 2);
  expect(metrics.routeGroups).toBe(2);

  await page.locator('#routes').scrollIntoViewIfNeeded();
  await expect(page.locator('#kmRouteNav .km-route')).toHaveCount(7);
});

test('27G route catalogue failure degrades without breaking the flagship shell', async ({ page }) => {
  await page.route('**/data/kilimanjaro-routes.json', route =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
  );
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#kmRouteNav')).toContainText('Route catalogue could not be loaded.');
  await expect(page.locator('.km-hero')).toBeVisible();
  await expect(page.locator('#mountain-composer')).toBeVisible();
});

test('27G route dossier exposes a clear fallback when route data fails', async ({ page }) => {
  await page.route('**/data/kilimanjaro-routes.json', route =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
  );
  await page.goto('/kilimanjaro-route.html?route=lemosho', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#routePage')).toBeHidden();
  await expect(page.locator('#routeError')).toBeVisible();
  await expect(page.locator('#routeError')).toContainText('could not be loaded');
});

test('27G expedition dossier exposes a clear fallback when preparation data fails', async ({ page }) => {
  await page.route('**/data/kilimanjaro-preparation.json', route =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
  );
  await page.goto('/kilimanjaro-expedition.html?expedition=kilele-2027-machame', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#expPage')).toBeHidden();
  await expect(page.locator('#expError')).toBeVisible();
  await expect(page.locator('#expError')).toContainText('not available for public viewing');
});

test('27G reduced-motion mode removes flagship reveal dependency', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'networkidle' });

  const state = await page.evaluate(() => {
    const reveal = document.querySelector('.reveal');
    const header = document.querySelector('#ehBar');
    return {
      revealOpacity: reveal ? getComputedStyle(reveal).opacity : null,
      revealTransform: reveal ? getComputedStyle(reveal).transform : null,
      headerTransition: header ? getComputedStyle(header).transitionDuration : null,
    };
  });

  if (state.revealOpacity !== null) expect(Number(state.revealOpacity)).toBeGreaterThan(0.99);
  if (state.revealTransform !== null) expect(state.revealTransform).toBe('none');
  expect(state.headerTransition === '0s' || state.headerTransition === '0s, 0s').toBeTruthy();
});

test('27G capture flagship release surfaces', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/kilimanjaro.html#mountain-composer', { waitUntil: 'networkidle' });

  await page.locator('.km-question[data-key="days"] button[data-v="8"]').click();
  await page.locator('.km-question[data-key="priority"] button[data-v="acclimatisation"]').click();
  await page.locator('.km-question[data-key="experience"] button[data-v="first"]').click();
  await page.locator('.km-question[data-key="camp"] button[data-v="camping"]').click();
  await page.locator('#mountain-composer').screenshot({
    path: testInfo.outputPath('27g-composer-desktop.png'),
  });

  await page.locator('#kmResult .km-result__continue').click();
  await page.waitForURL(/begin\.html\?kilimanjaro=direction/);
  await page.locator('#enquire').screenshot({
    path: testInfo.outputPath('27g-begin-kilimanjaro-desktop.png'),
  });

  await page.goto('/kilimanjaro-expedition.html?expedition=kilele-2027-machame', { waitUntil: 'networkidle' });
  await page.locator('.exp-readiness').screenshot({
    path: testInfo.outputPath('27g-kilele-preparation-desktop.png'),
  });

  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'networkidle' });
  await page.locator('#routes').screenshot({
    path: testInfo.outputPath('27g-atlas-mobile-landscape.png'),
  });
});


test('27G flagship preloads hero and defers heavy below-fold rendering', async ({ page }) => {
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('link[rel="preload"][as="image"][href="assets/images/kilimanjaro.jpg"]')).toHaveCount(1);

  const visibility = await page.evaluate(() => ({
    operations: getComputedStyle(document.querySelector('.km-operations')).contentVisibility,
    composer: getComputedStyle(document.querySelector('.km-composer')).contentVisibility,
  }));
  expect(visibility.operations).toBe('auto');
  expect(visibility.composer).toBe('auto');
});


test('27G short landscape lets the Kilimanjaro header scroll away instead of cutting content', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'networkidle' });

  const position = await page.locator('#ehBar').evaluate(el => getComputedStyle(el).position);
  expect(position).toBe('absolute');

  await page.locator('#routes').scrollIntoViewIfNeeded();
  const headerBox = await page.locator('#ehBar').boundingBox();
  expect(headerBox).not.toBeNull();
  expect(headerBox.y + headerBox.height).toBeLessThanOrEqual(1);
});

test('27G expedition header yields during preparation-ledger reading', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro-expedition.html?expedition=kilele-2027-machame', { waitUntil: 'networkidle' });

  const ledgerY = await page.locator('.exp-readiness').evaluate(el => el.offsetTop + 220);
  await page.evaluate(y => window.scrollTo(0,y), ledgerY);
  await page.waitForTimeout(180);
  await expect(page.locator('.exp-nav')).toHaveClass(/km-yield/);
});

test('27G Kilimanjaro Begin intro acknowledges the carried route instead of restarting discovery', async ({ page }) => {
  await page.goto('/kilimanjaro.html#mountain-composer', { waitUntil: 'networkidle' });
  await page.locator('.km-question[data-key="days"] button[data-v="8"]').click();
  await page.locator('.km-question[data-key="priority"] button[data-v="acclimatisation"]').click();
  await page.locator('.km-question[data-key="experience"] button[data-v="first"]').click();
  await page.locator('.km-question[data-key="camp"] button[data-v="camping"]').click();
  await page.locator('#kmResult .km-result__continue').click();
  await page.waitForURL(/begin\.html\?kilimanjaro=direction/);

  await expect(page.locator('#lfIntroEye')).toHaveText('Continue from the mountain');
  await expect(page.locator('#lfIntroTitle')).toHaveText('Dates. People. What changes the route.');
  await expect(page.locator('#lfIntroCopy')).toContainText('route direction is already attached');
  await expect(page.locator('#lfIntroCopy')).not.toContainText('The route can wait');
});


test('28A direct route hash lands below the Kilimanjaro reading header', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro.html#routes', { waitUntil: 'networkidle' });
  await page.waitForTimeout(220);

  const geometry = await page.evaluate(() => {
    const target = document.querySelector('#routes').getBoundingClientRect();
    const heading = document.querySelector('#routes .km-atlas__head').getBoundingClientRect();
    const header = document.querySelector('#ehBar').getBoundingClientRect();
    return {
      targetTop: target.top,
      headingTop: heading.top,
      headerBottom: header.bottom,
      headerYielded: document.querySelector('#ehBar').classList.contains('km-yield')
    };
  });

  expect(geometry.targetTop).toBeGreaterThanOrEqual(70);
  expect(geometry.headingTop).toBeGreaterThanOrEqual(70);
  expect(geometry.headerYielded).toBeFalsy();
});

test('28A composer hash returns as a composed section rather than under the masthead', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro.html#mountain-composer', { waitUntil: 'networkidle' });
  await page.waitForTimeout(220);

  const top = await page.locator('#mountain-composer').evaluate(el => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(70);
  await expect(page.locator('#mountain-composer .km-question')).toHaveCount(4);
});

test('28A route dossier decision frame is dense, non-sticky and four-across on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/kilimanjaro-route.html?route=lemosho', { waitUntil: 'networkidle' });

  const state = await page.evaluate(() => {
    const grid = document.querySelector('.route-grid').getBoundingClientRect();
    const aside = document.querySelector('.route-aside');
    const stat = document.querySelector('.route-stat').getBoundingClientRect();
    const stats = [...document.querySelectorAll('.route-stat')].map(el => el.getBoundingClientRect());
    const distinctRows = [...new Set(stats.map(r => Math.round(r.top)))];
    return {
      gridHeight: grid.height,
      asidePosition: getComputedStyle(aside).position,
      firstStatHeight: stat.height,
      rows: distinctRows.length
    };
  });

  expect(state.asidePosition).not.toBe('sticky');
  expect(state.rows).toBe(2);
  expect(state.gridHeight).toBeLessThan(420);
  expect(state.firstStatHeight).toBeLessThan(140);
});

test('28A route dossier trims billboard-scale body sections without losing readability', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/kilimanjaro-route.html?route=lemosho', { waitUntil: 'networkidle' });

  const metrics = await page.evaluate(() => ({
    routeSections: [...document.querySelectorAll('.route-section')].map(el => el.getBoundingClientRect().height),
    intelligenceRows: [...document.querySelectorAll('.route-intelligence article')].map(el => el.getBoundingClientRect().height),
    compareHeight: document.querySelector('.route-compare').getBoundingClientRect().height
  }));

  for (const height of metrics.routeSections) expect(height).toBeLessThan(500);
  for (const height of metrics.intelligenceRows) expect(height).toBeLessThan(330);
  expect(metrics.compareHeight).toBeLessThan(620);
});

test('28A route density remains contained at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/kilimanjaro-route.html?route=lemosho', { waitUntil: 'networkidle' });

  const geometry = await page.evaluate(() => ({
    viewport: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    gridRight: document.querySelector('.route-grid').getBoundingClientRect().right,
    compareRight: document.querySelector('.route-compare').getBoundingClientRect().right
  }));

  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport + 2);
  expect(geometry.gridRight).toBeLessThanOrEqual(geometry.viewport + 1);
  expect(geometry.compareRight).toBeLessThanOrEqual(geometry.viewport + 1);
});

test('28A capture reading-flow release surfaces', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/kilimanjaro.html#routes', { waitUntil: 'networkidle' });
  await page.waitForTimeout(220);
  await page.screenshot({
    path: testInfo.outputPath('28a-routes-anchor-desktop.png'),
    fullPage: false
  });

  await page.goto('/kilimanjaro-route.html?route=lemosho', { waitUntil: 'networkidle' });
  await page.locator('.route-grid').screenshot({
    path: testInfo.outputPath('28a-route-decision-desktop.png')
  });
  await page.locator('.route-intelligence').screenshot({
    path: testInfo.outputPath('28a-route-intelligence-desktop.png')
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/kilimanjaro.html#routes', { waitUntil: 'networkidle' });
  await page.waitForTimeout(220);
  await page.screenshot({
    path: testInfo.outputPath('28a-routes-anchor-mobile.png'),
    fullPage: false
  });
});
