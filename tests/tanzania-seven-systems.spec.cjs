const { test, expect } = require('@playwright/test');

test('Seven Systems renders seven editorial entries', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/tanzania.html', { waitUntil: 'networkidle' });

  const entries = page.locator('#tzSystems .tz-system-entry');
  await expect(entries).toHaveCount(7);

  const labels = await entries.evaluateAll(nodes => nodes.map(n => n.getAttribute('data-system')));
  expect(labels).toEqual(['mountain','north','rift','south','west','coast','people']);
});

test('Seven Systems is asymmetric and not a fixed-height card catalogue on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/tanzania.html', { waitUntil: 'networkidle' });

  const metrics = await page.evaluate(() => {
    const entries=[...document.querySelectorAll('#tzSystems .tz-system-entry')];
    return entries.map(el => {
      const r=el.getBoundingClientRect();
      const s=getComputedStyle(el);
      const meta=el.querySelector('.tz-system-entry__meta');
      const mr=meta ? meta.getBoundingClientRect() : null;
      return {
        width:r.width,
        height:r.height,
        top:r.top,
        minHeight:s.minHeight,
        display:s.display,
        borderRight:s.borderRightWidth,
        trailingSpace:mr ? Math.max(0,r.bottom-mr.bottom) : null
      };
    });
  });

  expect(metrics).toHaveLength(7);
  expect(new Set(metrics.map(x=>Math.round(x.width))).size).toBeGreaterThan(2);
  expect(new Set(metrics.map(x=>Math.round(x.top))).size).toBeGreaterThan(3);

  for(const m of metrics){
    expect(m.display).toBe('grid');
    expect(parseFloat(m.minHeight || '0')).toBeLessThanOrEqual(1);
    expect(parseFloat(m.borderRight || '0')).toBe(0);
    expect(m.trailingSpace).not.toBeNull();
    expect(m.trailingSpace).toBeLessThanOrEqual(32);
  }
});

test('Seven Systems gives primary families more visual authority', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/tanzania.html', { waitUntil: 'networkidle' });

  const sizes = await page.evaluate(() => {
    const font = slug => parseFloat(getComputedStyle(document.querySelector('[data-system="'+slug+'"] h3')).fontSize);
    return {
      mountain:font('mountain'),
      north:font('north'),
      rift:font('rift'),
      west:font('west')
    };
  });

  expect(sizes.mountain).toBeGreaterThan(sizes.rift);
  expect(sizes.north).toBeGreaterThan(sizes.west);
});

test('Seven Systems collapses to readable single-column flow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tanzania.html', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const grid=document.getElementById('tzSystems');
    const entries=[...grid.querySelectorAll('.tz-system-entry')];
    return {
      columns:getComputedStyle(grid).gridTemplateColumns,
      viewport:window.innerWidth,
      entries:entries.map(el=>el.getBoundingClientRect())
    };
  });

  expect(result.entries).toHaveLength(7);
  for(const r of result.entries){
    expect(r.left).toBeGreaterThanOrEqual(-1);
    expect(r.right).toBeLessThanOrEqual(result.viewport + 1);
  }
  for(let i=1;i<result.entries.length;i++){
    expect(result.entries[i].top).toBeGreaterThan(result.entries[i-1].top);
  }
});
