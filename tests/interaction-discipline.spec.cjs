const { test, expect } = require('@playwright/test');

const surfaces = [
  { path: 'trip.html', selector: '.trip-nav a[href]' },
  { path: 'kilimanjaro-route.html?route=machame', selector: '.route-nav a[href]' },
  { path: 'kilimanjaro-expedition.html?expedition=kilele-2027', selector: '.exp-nav a[href]' },
  { path: 'experience-view.html', selector: '.ev button, .ev a[href]' },
];

for (const surface of surfaces) {
  test(surface.path + ' keyboard focus', async ({ page }) => {
    await page.goto('/' + surface.path, { waitUntil: 'domcontentloaded' });
    const target = page.locator(surface.selector).first();
    await expect(target).toBeVisible();
    await target.focus();

    const focusStyle = await target.evaluate(el => {
      const s = getComputedStyle(el);
      return {
        outlineStyle: s.outlineStyle,
        outlineWidth: s.outlineWidth,
        outlineColor: s.outlineColor,
        outlineOffset: s.outlineOffset,
      };
    });

    expect(focusStyle.outlineStyle).not.toBe('none');
    expect(parseFloat(focusStyle.outlineWidth || '0')).toBeGreaterThan(0);
  });
}

test('experience viewer reduced-motion scene transitions are disabled', async ({ page }) => {
  await page.goto('/experience-view.html', { waitUntil: 'domcontentloaded' });
  const scene = page.locator('.ev-scene').first();
  await expect(scene).toBeVisible();
  const duration = await scene.evaluate(el => getComputedStyle(el).transitionDuration);
  expect(duration.split(',').every(v => parseFloat(v) === 0)).toBe(true);
});
