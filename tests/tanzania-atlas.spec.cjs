const { test, expect } = require('@playwright/test');

test('Tanzania atlas uses staggered editorial hierarchy on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/tanzania.html', { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(() => {
    const atlas=document.querySelector('.tz-atlas');
    const copy=document.querySelector('.tz-atlas__copy');
    const articles=[...document.querySelectorAll('.tz-atlas__routes article')];
    const heading=document.querySelector('.tz-atlas h2');
    const rect = el => el.getBoundingClientRect();
    return {
      atlas:rect(atlas),
      copy:rect(copy),
      heading:rect(heading),
      articles:articles.map(rect),
      widths:articles.map(el=>el.getBoundingClientRect().width),
      tops:articles.map(el=>el.getBoundingClientRect().top)
    };
  });

  expect(result.articles).toHaveLength(4);
  expect(result.heading.height).toBeLessThan(230);
  expect(new Set(result.tops.map(v=>Math.round(v))).size).toBeGreaterThan(2);
  expect(new Set(result.widths.map(v=>Math.round(v))).size).toBeGreaterThan(1);
});

test('Tanzania atlas route blocks are not table rows', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/tanzania.html', { waitUntil: 'domcontentloaded' });

  const styles = await page.locator('.tz-atlas__routes article').evaluateAll(nodes =>
    nodes.map(el => {
      const s=getComputedStyle(el);
      return {
        display:s.display,
        borderRightWidth:s.borderRightWidth,
        gridTemplateColumns:s.gridTemplateColumns
      };
    })
  );

  for (const style of styles) {
    expect(parseFloat(style.borderRightWidth)).toBe(0);
    expect(style.gridTemplateColumns === 'none' || style.gridTemplateColumns === '').toBe(true);
  }
});

test('Tanzania atlas remains readable and contained on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tanzania.html', { waitUntil: 'domcontentloaded' });

  const metrics = await page.evaluate(() => {
    const atlas=document.querySelector('.tz-atlas');
    const articles=[...document.querySelectorAll('.tz-atlas__routes article')];
    return {
      columns:getComputedStyle(atlas).gridTemplateColumns,
      articles:articles.map(el=>el.getBoundingClientRect()),
      viewport:window.innerWidth
    };
  });

  for(const r of metrics.articles){
    expect(r.left).toBeGreaterThanOrEqual(-1);
    expect(r.right).toBeLessThanOrEqual(metrics.viewport + 1);
  }
});
