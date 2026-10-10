const { test, expect } = require('@playwright/test');

test('Karibu sequence remains vertical and readable on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(() => {
    const rows=[...document.querySelectorAll('.lp-welcome-plate .em-sequence__row')];
    return rows.map(row => {
      const body=row.querySelector('.em-sequence__body');
      const p=row.querySelector('p');
      const rs=getComputedStyle(row);
      const ps=getComputedStyle(p);
      const rr=row.getBoundingClientRect();
      const pr=p.getBoundingClientRect();
      return {
        display:rs.display,
        columns:rs.gridTemplateColumns,
        top:rr.top,
        width:pr.width,
        color:ps.color,
        lineHeight:parseFloat(ps.lineHeight),
        fontSize:parseFloat(ps.fontSize)
      };
    });
  });

  expect(result).toHaveLength(3);
  expect(result[1].top).toBeGreaterThan(result[0].top);
  expect(result[2].top).toBeGreaterThan(result[1].top);

  for (const row of result) {
    expect(row.display).toBe('grid');
    expect(row.width).toBeGreaterThan(180);
    expect(row.lineHeight).toBeGreaterThan(row.fontSize * 1.4);
    expect(row.color).not.toMatch(/rgba\([^)]*,\s*0\)/);
  }
});

test('Karibu sequence stays readable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const widths=await page.locator('.lp-welcome-plate .em-sequence__body p').evaluateAll(nodes =>
    nodes.map(el => el.getBoundingClientRect().width)
  );

  for(const width of widths){
    expect(width).toBeGreaterThan(220);
  }
});
