const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const catalogue = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'kilimanjaro-routes.json'), 'utf8')
);

const expectedSlugs = [
  'lemosho',
  'northern-circuit',
  'machame',
  'rongai',
  'marangu',
  'shira',
  'umbwe',
];

test('Kilimanjaro catalogue contains exactly seven normalized route dossiers', async () => {
  expect(catalogue.schema).toBe('enkiama.kilimanjaro.routes.v2');
  expect(catalogue.routes.map(r => r.slug)).toEqual(expectedSlugs);

  const slugs = new Set(expectedSlugs);
  for (const route of catalogue.routes) {
    expect(route.public_status).toBe('verified');
    expect(route.source_refs.length).toBeGreaterThanOrEqual(2);
    expect(route.source_updated_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(route.start_gate.length).toBeGreaterThan(3);
    expect(route.summit_approach.length).toBeGreaterThan(3);
    expect(route.acclimatisation_logic.length).toBeGreaterThan(80);
    expect(route.trail_character.length).toBeGreaterThan(60);
    expect(route.operational_notes.length).toBeGreaterThan(60);
    expect(route.stage_trace.length).toBeGreaterThanOrEqual(7);
    expect(route.comparison_peers).toHaveLength(2);

    for (const peer of route.comparison_peers) {
      expect(slugs.has(peer.slug)).toBeTruthy();
      expect(peer.slug).not.toBe(route.slug);
      expect(peer.reason.length).toBeGreaterThan(45);
    }

    expect(route.stage_trace[0].phase).toBe('start');
    expect(route.stage_trace.some(stage => stage.phase === 'summit')).toBeTruthy();
    expect(route.stage_trace.at(-1).phase).toBe('finish');
  }
});

for (const route of catalogue.routes) {
  test(`${route.name} dossier renders normalized route intelligence`, async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/kilimanjaro-route.html?route=' + encodeURIComponent(route.slug), {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.locator('#routePage')).toBeVisible();
    await expect(page.locator('#routeTitle')).toHaveText(route.name);
    await expect(page.locator('.route-stat')).toHaveCount(8);
    await expect(page.locator('.route-intelligence article')).toHaveCount(3);
    await expect(page.locator('#routeAcclimatisation')).not.toBeEmpty();
    await expect(page.locator('#routeCharacter')).not.toBeEmpty();
    await expect(page.locator('#routeOperations')).not.toBeEmpty();
    await expect(page.locator('#routeLine span')).toHaveCount(route.stage_trace.length);
    await expect(page.locator('#routeCompare .route-peer')).toHaveCount(2);

    const peerHrefs = await page.locator('#routeCompare .route-peer').evaluateAll(nodes =>
      nodes.map(node => node.getAttribute('href'))
    );
    for (const peer of route.comparison_peers) {
      expect(peerHrefs.some(href => href && href.includes('route=' + encodeURIComponent(peer.slug)))).toBeTruthy();
    }
  });
}

test('all seven route dossiers stay contained at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const route of catalogue.routes) {
    await page.goto('/kilimanjaro-route.html?route=' + encodeURIComponent(route.slug), {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('#routePage')).toBeVisible();

    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      compare: [...document.querySelectorAll('.route-peer')].map(el => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right };
      }),
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport + 2);
    for (const r of metrics.compare) {
      expect(r.left).toBeGreaterThanOrEqual(-1);
      expect(r.right).toBeLessThanOrEqual(metrics.viewport + 1);
    }
  }
});

test('flagship atlas exposes all seven routes and selected-route peers', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#kmRouteNav .km-route')).toHaveCount(7);
  await expect(page.locator('#kmRoutePanel .km-route__compare-links a')).toHaveCount(2);
  const atlasTraceCount = await page.locator('#kmRoutePanel .km-route__line span').count();
  expect(atlasTraceCount).toBeGreaterThanOrEqual(5);
  expect(atlasTraceCount).toBeLessThanOrEqual(7);
  await expect(page.locator('#kmRoutePanel .km-route__line span[data-phase="summit"]')).toHaveCount(1);
  await expect(page.locator('#kmRoutePanel .km-route__line span[data-phase="finish"]')).toHaveCount(1);
});
