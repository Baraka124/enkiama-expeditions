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
