const { test, expect } = require('@playwright/test');

test('Home narrative chapters keep editorial but not empty spacing', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const checks = await page.evaluate(() => {
    function gap(aSel,bSel){
      const a=document.querySelector(aSel), b=document.querySelector(bSel);
      if(!a||!b) return null;
      const ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
      return br.top-ar.bottom;
    }
    function style(sel,prop){
      const el=document.querySelector(sel);
      return el ? getComputedStyle(el)[prop] : null;
    }
    return {
      routeToProof: gap('.lp-archive','.lp-proof'),
      proofHeadToSystem: gap('.lp-proof-head','.lp-proof-system'),
      staysHeadToStage: gap('.lp-stays-head','.lp-stay-stage'),
      peopleHeadToStage: gap('.lp-people-head','.lp-network-stage'),
      proofVisibility: style('.lp-proof','contentVisibility'),
      staysVisibility: style('.lp-stays','contentVisibility'),
      peopleVisibility: style('.lp-people','contentVisibility'),
    };
  });

  expect(checks.routeToProof).not.toBeNull();
  expect(Math.abs(checks.routeToProof)).toBeLessThanOrEqual(2);

  expect(checks.proofHeadToSystem).toBeGreaterThanOrEqual(0);
  expect(checks.proofHeadToSystem).toBeLessThanOrEqual(64);

  expect(checks.staysHeadToStage).toBeGreaterThanOrEqual(0);
  expect(checks.staysHeadToStage).toBeLessThanOrEqual(64);

  expect(checks.peopleHeadToStage).toBeGreaterThanOrEqual(0);
  expect(checks.peopleHeadToStage).toBeLessThanOrEqual(64);

  expect(checks.proofVisibility).toBe('visible');
  expect(checks.staysVisibility).toBe('visible');
  expect(checks.peopleVisibility).toBe('visible');
});

test('Home remains compact at laptop height', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const metrics = await page.evaluate(() => {
    const proof=document.querySelector('.lp-proof');
    const people=document.querySelector('.lp-people');
    const stays=document.querySelector('.lp-stays');
    const rect = el => el ? el.getBoundingClientRect().height : null;
    return {
      proof:rect(proof),
      stays:rect(stays),
      people:rect(people),
    };
  });

  expect(metrics.proof).not.toBeNull();
  expect(metrics.stays).not.toBeNull();
  expect(metrics.people).not.toBeNull();

  // These chapters should remain substantial, but not consume several empty viewports.
  expect(metrics.proof).toBeLessThan(1400);
  expect(metrics.stays).toBeLessThan(1400);
  expect(metrics.people).toBeLessThan(1400);
});
