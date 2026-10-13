const { test, expect } = require('@playwright/test');

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
