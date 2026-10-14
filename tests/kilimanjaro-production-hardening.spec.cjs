const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const routes = JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','kilimanjaro-routes.json'),'utf8')).routes;

test.describe('Phase 29D · Kilimanjaro production hardening', () => {
  test('atlas exposes a single semantic selected route', async ({ page }) => {
    await page.goto('/kilimanjaro.html?route=lemosho#routes',{waitUntil:'domcontentloaded'});
    await expect(page.locator('.km-route[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('.km-route[data-slug="lemosho"]')).toHaveAttribute('aria-pressed','true');

    await page.locator('.km-route[data-slug="rongai"]').click();
    await expect(page.locator('.km-route[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('.km-route[data-slug="rongai"]')).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.km-route[data-slug="lemosho"]')).toHaveAttribute('aria-pressed','false');
  });

  test('invalid route and expedition URLs fail safely', async ({ page }) => {
    await page.goto('/kilimanjaro-route.html?route=not-a-route',{waitUntil:'domcontentloaded'});
    await expect(page.locator('#routePage')).toBeHidden();
    await expect(page.locator('#routeError')).toBeVisible();

    await page.goto('/kilimanjaro-expedition.html?expedition=not-an-expedition',{waitUntil:'domcontentloaded'});
    await expect(page.locator('#expPage')).toBeHidden();
    await expect(page.locator('#expError')).toBeVisible();
  });

  test('unknown atlas route query falls back to a valid canonical route', async ({ page }) => {
    await page.goto('/kilimanjaro.html?route=not-a-route#routes',{waitUntil:'domcontentloaded'});
    await expect(page.locator('.km-route[aria-pressed="true"]')).toHaveCount(1);
    const selected=await page.locator('.km-route[aria-pressed="true"]').getAttribute('data-slug');
    expect(routes.some(r=>r.slug===selected)).toBeTruthy();
  });

  test('keyboard can traverse decision shortcuts and atlas controls', async ({ page }) => {
    await page.goto('/kilimanjaro.html#routes',{waitUntil:'domcontentloaded'});
    const shortcut=page.locator('[data-route-focus="machame"]');
    await shortcut.focus();
    await expect(shortcut).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('.km-route[data-slug="machame"]')).toHaveAttribute('aria-pressed','true');

    const atlas=page.locator('.km-route[data-slug="lemosho"]');
    await atlas.focus();
    await expect(atlas).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(atlas).toHaveAttribute('aria-pressed','true');
  });

  test('public Kilimanjaro surfaces avoid unsupported outcome promises', async ({ page }) => {
    const urls=[
      '/kilimanjaro.html',
      '/kilimanjaro-route.html?route=lemosho',
      '/kilimanjaro-expedition.html?expedition=kilele-2027-machame'
    ];
    for(const url of urls){
      await page.goto(url,{waitUntil:'domcontentloaded'});
      const text=(await page.locator('body').innerText()).toLowerCase();
      expect(text).not.toContain('guaranteed summit');
      expect(text).not.toContain('summit guaranteed');
      expect(text).not.toMatch(/\b\d{2,3}%\s+summit success/);
      expect(text).not.toContain('oxygen provided as standard');
      expect(text).not.toContain('luxury camp included');
    }
  });

  for (const width of [390,640,768,1366]) {
    test('Kilimanjaro chain stays horizontally contained at '+width+'px', async ({ page }) => {
      await page.setViewportSize({width,height:900});
      for(const url of [
        '/kilimanjaro.html?route=machame#routes',
        '/kilimanjaro-route.html?route=machame',
        '/kilimanjaro-expedition.html?expedition=kilele-2027-machame'
      ]){
        await page.goto(url,{waitUntil:'domcontentloaded'});
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(2);
      }
    });
  }
});
