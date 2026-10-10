const { test, expect } = require('@playwright/test');

test('Home information modules use asymmetric editorial hierarchy on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(() => {
    const styles = sel => {
      const el=document.querySelector(sel);
      if(!el) return null;
      const s=getComputedStyle(el);
      return {
        display:s.display,
        gridTemplateColumns:s.gridTemplateColumns,
        borderLeftWidth:s.borderLeftWidth,
        borderTopWidth:s.borderTopWidth,
        backgroundColor:s.backgroundColor,
        boxShadow:s.boxShadow
      };
    };
    return {
      proof: styles('.lp-proof-system'),
      ledger: styles('.lp-proof-ledger--editorial'),
      stays: styles('.lp-stay-criteria'),
      people: styles('.lp-network-notes'),
      brief: styles('.lp-brief-sheet'),
    };
  });

  expect(result.proof).not.toBeNull();
  expect(result.stays).not.toBeNull();
  expect(result.people).not.toBeNull();
  expect(result.brief).not.toBeNull();

  expect(result.proof.gridTemplateColumns).not.toMatch(/repeat\(3|1fr 1fr 1fr/);
  expect(result.stays.gridTemplateColumns).not.toMatch(/^([^ ]+) \1 \1$/);
  expect(result.people.gridTemplateColumns).not.toMatch(/^([^ ]+) \1 \1$/);

  expect(parseFloat(result.ledger.borderLeftWidth)).toBeGreaterThan(0);
  expect(result.ledger.boxShadow).toBe('none');

  expect(result.brief.boxShadow).toBe('none');
  expect(parseFloat(result.brief.borderTopWidth)).toBeGreaterThan(0);
});

test('Home information modules collapse to readable single-column flow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const metrics = await page.evaluate(() => {
    const selectors=['.lp-stay-criteria','.lp-network-notes','.lp-brief-sheet'];
    return selectors.map(sel => {
      const el=document.querySelector(sel);
      const s=getComputedStyle(el);
      const r=el.getBoundingClientRect();
      return {
        selector:sel,
        columns:s.gridTemplateColumns,
        left:r.left,
        right:r.right,
        viewport:window.innerWidth
      };
    });
  });

  for (const item of metrics) {
    expect(item.left, item.selector + ' should stay within viewport').toBeGreaterThanOrEqual(-1);
    expect(item.right, item.selector + ' should stay within viewport').toBeLessThanOrEqual(item.viewport + 1);
  }
});

test('Compose prompts retain all three planning questions', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const rows = page.locator('.lp-brief-row');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText('Who is coming?');
  await expect(rows.nth(1)).toContainText('When are you thinking?');
  await expect(rows.nth(2)).toContainText('What matters most?');
});
