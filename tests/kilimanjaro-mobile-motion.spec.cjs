const { test, expect } = require('@playwright/test');

test.describe('Phase 29B · Kilimanjaro mobile and motion stability', () => {
  test('small scroll jitter does not oscillate the reading header', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/kilimanjaro.html?route=machame#routes', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(180);

    await page.evaluate(() => window.scrollBy(0, 12));
    await page.waitForTimeout(80);
    await expect(page.locator('#ehBar')).not.toHaveClass(/km-yield/);

    await page.evaluate(() => window.scrollBy(0, 22));
    await page.waitForTimeout(120);
    await expect(page.locator('#ehBar')).toHaveClass(/km-yield/);

    await page.evaluate(() => window.scrollBy(0, -12));
    await page.waitForTimeout(80);
    await expect(page.locator('#ehBar')).toHaveClass(/km-yield/);

    await page.evaluate(() => window.scrollBy(0, -22));
    await page.waitForTimeout(120);
    await expect(page.locator('#ehBar')).not.toHaveClass(/km-yield/);
  });

  for (const path of [
    '/kilimanjaro.html',
    '/kilimanjaro-route.html?route=northern-circuit',
    '/kilimanjaro-expedition.html?expedition=kilele-2027-machame'
  ]) {
    test('390px containment: '+path, async ({ page }) => {
      await page.setViewportSize({ width:390,height:844 });
      await page.goto(path,{waitUntil:'domcontentloaded'});
      await page.waitForTimeout(150);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test('reduced motion disables smooth document scrolling', async ({ browser }) => {
    const context=await browser.newContext({ reducedMotion:'reduce', viewport:{width:390,height:844} });
    const page=await context.newPage();
    await page.goto('/kilimanjaro.html',{waitUntil:'domcontentloaded'});
    const behavior=await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior);
    expect(behavior).toBe('auto');
    await context.close();
  });
});
