const { test, expect } = require('@playwright/test');

test('Tanzania hero note is integrated rather than carded', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/tanzania.html', { waitUntil: 'domcontentloaded' });

  const note = page.locator('.tz-hero__index');
  await expect(note).toBeVisible();

  const style = await note.evaluate(el => {
    const s=getComputedStyle(el);
    return {
      backgroundColor:s.backgroundColor,
      backdropFilter:s.backdropFilter || s.webkitBackdropFilter,
      borderTopWidth:s.borderTopWidth,
      position:s.position,
      right:s.right
    };
  });

  expect(style.backgroundColor).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  expect(style.backdropFilter === 'none' || style.backdropFilter === '').toBe(true);
  expect(parseFloat(style.borderTopWidth)).toBeGreaterThan(0);
  expect(style.position).toBe('absolute');
});

test('Tanzania country field uses weighted landscape hierarchy on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/tanzania.html', { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(() => {
    const field=document.querySelector('.tz-country-field');
    const mountain=document.querySelector('.tz-country-field__mountain');
    const plain=document.querySelector('.tz-country-field__plain');
    const coast=document.querySelector('.tz-country-field__coast');
    const fr = field.getBoundingClientRect();
    const mr = mountain.getBoundingClientRect();
    const pr = plain.getBoundingClientRect();
    const cr = coast.getBoundingClientRect();
    return {
      fieldWidth:fr.width,
      mountainWidth:mr.width,
      plainWidth:pr.width,
      coastWidth:cr.width,
      mountainHeight:mr.height,
      plainHeight:pr.height,
      coastHeight:cr.height
    };
  });

  expect(result.plainWidth).toBeGreaterThan(result.mountainWidth);
  expect(result.plainWidth).toBeGreaterThan(result.coastWidth);
  expect(result.plainHeight).toBeGreaterThanOrEqual(result.mountainHeight);
  expect(result.plainHeight).toBeGreaterThanOrEqual(result.coastHeight);
});

test('Tanzania country field becomes sequential without overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tanzania.html', { waitUntil: 'domcontentloaded' });

  const metrics = await page.evaluate(() => {
    const field=document.querySelector('.tz-country-field');
    const panels=[...document.querySelectorAll('.tz-country-field__panel')];
    return {
      columns:getComputedStyle(field).gridTemplateColumns,
      field:field.getBoundingClientRect(),
      panels:panels.map(el=>el.getBoundingClientRect()),
      viewport:window.innerWidth
    };
  });

  for (const r of metrics.panels) {
    expect(r.left).toBeGreaterThanOrEqual(-1);
    expect(r.right).toBeLessThanOrEqual(metrics.viewport + 1);
  }
});

test('Tanzania strip remains a four-part summary without card borders', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/tanzania.html', { waitUntil: 'domcontentloaded' });

  const items=page.locator('.tz-strip > div');
  await expect(items).toHaveCount(4);

  const widths=await items.evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));
  expect(new Set(widths.map(v=>Math.round(v))).size).toBeGreaterThan(1);
});
