const { test, expect } = require('@playwright/test');

test.describe('Phase 28D · Kilimanjaro claim and evidence discipline', () => {
  test('public Kilimanjaro language describes inspectable provision', async ({ page }) => {
    await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#operations')).toContainText('Documented mountain operations');
    await expect(page.locator('#operations')).toContainText('Provision should be inspectable');
    await expect(page.locator('#operations')).not.toContainText('Premium mountain operations');
    await expect(page.locator('#formats')).not.toContainText('Best when');
    await expect(page.locator('#expeditions')).toContainText('Publish the state of the evidence');
  });

  test('preparation dossier separates known, preparing and not-yet-evidenced states', async ({ page }) => {
    await page.goto('/kilimanjaro-expedition.html?expedition=kilele-2027-machame', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.exp-evidence-state')).toBeVisible();
    await expect(page.locator('.exp-evidence-state')).toContainText('Known now');
    await expect(page.locator('.exp-evidence-state')).toContainText('Being prepared');
    await expect(page.locator('.exp-evidence-state')).toContainText('Not yet evidenced');
    await expect(page.locator('.exp-evidence-state')).toContainText('summit outcome', { ignoreCase: true });
  });

  test('evidence-state strip remains contained at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/kilimanjaro-expedition.html?expedition=kilele-2027-machame', { waitUntil: 'domcontentloaded' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const box = await page.locator('.exp-evidence-state').boundingBox();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(391);
  });
});
