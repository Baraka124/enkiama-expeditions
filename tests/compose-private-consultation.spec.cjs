const { test, expect } = require('@playwright/test');

test.describe('Phase 28C · Compose private consultation', () => {
  test('turns sequential choices into a living working brief', async ({ page }) => {
    await page.goto('/compose.html', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#cmpConsultRead')).toContainText('listening for shape');
    await page.locator('.cmp-opt[data-k="pull"][data-v="people"]').click();

    await expect(page.locator('.cmp-step[data-step="1"]')).toHaveClass(/active/);
    await expect(page.locator('#cmpConsultRead')).toContainText('human journey');
    await expect(page.locator('#cmpMemory')).toContainText('People & culture');

    await page.locator('.cmp-opt[data-k="time"][data-v="mid"]').click();
    await expect(page.locator('#cmpSeason')).toHaveClass(/show/);
    await page.locator('.cmp-season-opt[data-k="season"][data-v="unsure"]').click();

    await expect(page.locator('.cmp-step[data-step="2"]')).toHaveClass(/active/);
    await expect(page.locator('#cmpConsultRead')).toContainText('room for contrast');

    await page.locator('.cmp-opt[data-k="pace"][data-v="balanced"]').click();
    await expect(page.locator('.cmp-step[data-step="3"]')).toHaveClass(/active/);
    await page.locator('.cmp-opt[data-k="coast"][data-v="maybe"]').click();
    await expect(page.locator('.cmp-step[data-step="4"]')).toHaveClass(/active/);

    await page.locator('.cmp-opt[data-k="who"][data-v="couple"]').click();
    await expect(page.locator('#cmpResult')).toHaveClass(/show/, { timeout: 2500 });
    await expect(page.locator('#cmpResult')).toContainText('Private brief');
    await expect(page.locator('#cmpChoiceLedger')).toContainText('People & culture');
    await expect(page.locator('#cmpViewRoute')).not.toHaveText('Your first route');
  });

  test('keeps the consultation contained on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/compose.html', { waitUntil: 'domcontentloaded' });

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);

    const box = await page.locator('.cmp-consultation').boundingBox();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(391);
  });
});
