const { test, expect } = require('@playwright/test');

test.describe('Phase 29C · Kilimanjaro decision usefulness', () => {
  test('decision shortcuts expose the practical route distinctions before the atlas', async ({ page }) => {
    await page.goto('/kilimanjaro.html#routes',{waitUntil:'domcontentloaded'});
    const ledger=page.locator('.km-decision-ledger');
    await expect(ledger).toBeVisible();
    await expect(ledger.locator('button')).toHaveCount(6);
    await expect(ledger).toContainText('7 mountain days');
    await expect(ledger).toContainText('8 mountain days');
    await expect(ledger).toContainText('9 mountain days');
    await expect(ledger).toContainText('Huts matter');
    await expect(ledger).toContainText('Quieter at 7 days');
    await expect(ledger).toContainText('Specialist profile');
    await expect(ledger).toContainText('Shira');
  });

  test('shortcut selects the same route in the canonical atlas and URL', async ({ page }) => {
    await page.goto('/kilimanjaro.html#routes',{waitUntil:'domcontentloaded'});
    await page.locator('[data-route-focus="marangu"]').click();
    await expect(page).toHaveURL(/\?route=marangu#routes$/);
    await expect(page.locator('.km-route[data-slug="marangu"]')).toHaveClass(/active/);
    await expect(page.locator('#kmRoutePanel h3')).toHaveText('Marangu');
  });

  test('decision ledger remains compact and contained at 390px', async ({ page }) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/kilimanjaro.html#routes',{waitUntil:'domcontentloaded'});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const rows=await page.locator('.km-decision-ledger__rows button').all();
    expect(rows.length).toBe(6);
  });
});
