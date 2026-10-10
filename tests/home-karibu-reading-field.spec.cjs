const { test, expect } = require('@playwright/test');

test('Karibu section protects copy from photographic collision on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(() => {
    const stack=document.querySelector('.lp-welcome-stack');
    const photo=document.querySelector('.lp-welcome-photo');
    const plate=document.querySelector('.lp-welcome-plate');
    const sr=stack.getBoundingClientRect();
    const pr=photo.getBoundingClientRect();
    const cr=plate.getBoundingClientRect();
    const ps=getComputedStyle(plate);
    return {
      stackDisplay:getComputedStyle(stack).display,
      copyRight:cr.right,
      photoLeft:pr.left,
      background:ps.backgroundColor,
      position:ps.position,
      overlap:Math.max(0,cr.right-pr.left)
    };
  });

  expect(result.stackDisplay).toBe('grid');
  expect(result.position).toBe('relative');
  expect(result.background).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  expect(result.overlap).toBeLessThanOrEqual(2);
});

test('Karibu section detaches copy beneath image on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(() => {
    const photo=document.querySelector('.lp-welcome-photo').getBoundingClientRect();
    const plate=document.querySelector('.lp-welcome-plate').getBoundingClientRect();
    return {
      photoBottom:photo.bottom,
      plateTop:plate.top,
      viewport:window.innerWidth,
      plateRight:plate.right,
      plateLeft:plate.left
    };
  });

  expect(result.plateTop).toBeGreaterThanOrEqual(result.photoBottom - 2);
  expect(result.plateLeft).toBeGreaterThanOrEqual(-1);
  expect(result.plateRight).toBeLessThanOrEqual(result.viewport + 1);
});
