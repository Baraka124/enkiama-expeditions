const { test, expect } = require('@playwright/test');

test.describe('Phase 29A · Kilimanjaro cross-page continuity', () => {
  test('route dossier returns to the same route in the atlas', async ({ page }) => {
    await page.goto('/kilimanjaro-route.html?route=machame', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#routePage')).toBeVisible();
    await expect(page.locator('#routeBackToAtlas')).toHaveAttribute('href', 'kilimanjaro.html?route=machame#routes');
    await page.locator('#routeBackToAtlas').click();
    await expect(page).toHaveURL(/kilimanjaro\.html\?route=machame#routes$/);
    await expect(page.locator('.km-route[data-slug="machame"]')).toHaveClass(/active/);
    await expect(page.locator('#kmRoutePanel h3')).toHaveText('Machame');
  });

  test('atlas selection persists in URL and survives reload', async ({ page }) => {
    await page.goto('/kilimanjaro.html#routes', { waitUntil: 'domcontentloaded' });
    await page.locator('.km-route[data-slug="rongai"]').click();
    await expect(page).toHaveURL(/\?route=rongai#routes$/);
    await expect(page.locator('#kmRoutePanel h3')).toHaveText('Rongai');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.km-route[data-slug="rongai"]')).toHaveClass(/active/);
    await expect(page.locator('#kmRoutePanel h3')).toHaveText('Rongai');
  });

  test('expedition dossier hands back to its actual route', async ({ page }) => {
    await page.goto('/kilimanjaro-expedition.html?expedition=kilele-2027-machame', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#expPage')).toBeVisible();
    await expect(page.locator('#expRouteLink')).toHaveAttribute('href', 'kilimanjaro-route.html?route=machame');
    await expect(page.locator('#expComposerLink')).toHaveAttribute('href', 'kilimanjaro.html?route=machame#mountain-composer');
  });
});
