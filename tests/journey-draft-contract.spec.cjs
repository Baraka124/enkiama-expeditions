const { test, expect } = require('@playwright/test');

test.describe('Phase 30A · canonical journey draft contract', () => {
  test('Compose writes one shared journey draft and hands off by reference', async ({ page }) => {
    await page.goto('/compose.html',{waitUntil:'domcontentloaded'});
    await page.evaluate(() => {
      window.EnkiamaJourneyDraft.write({
        source:'compose',
        preferences:{pull:'spectacle',time:'mid',season:'jun-oct',pace:'balanced',coast:'yes',who:'couple'},
        labels:{pull:'Wildlife',time:'~10 days',season:'Jun–Oct',pace:'Balanced',coast:'Coast included',who:'Two travellers'},
        route:['Tarangire','Ngorongoro','Serengeti','Zanzibar'],
        message:'A composed first direction'
      });
    });
    const draft=await page.evaluate(()=>window.EnkiamaJourneyDraft.read());
    expect(draft.schema).toBe('enkiama.journey.draft.v1');
    expect(draft.route).toHaveLength(4);
    expect(draft.preferences.pull).toBe('spectacle');
  });

  test('Experience Preview reads the canonical draft', async ({ page }) => {
    await page.goto('/compose.html',{waitUntil:'domcontentloaded'});
    await page.evaluate(() => window.EnkiamaJourneyDraft.write({
      source:'compose',
      preferences:{pull:'people',time:'mid',season:'unsure',pace:'slow',coast:'maybe',who:'family'},
      labels:{pull:'People & culture',time:'~10 days',season:'Timing open',pace:'Slow',coast:'Coast optional',who:'Family'},
      route:['Arusha','Tarangire','Ngorongoro'],
      message:'Family draft'
    }));
    await page.goto('/experience-view.html?from=compose',{waitUntil:'domcontentloaded'});
    await expect(page.locator('.ev')).toHaveClass(/composed-mode/);
    await expect(page.locator('.ev-scene[data-scene-role="opening"]')).toHaveAttribute('data-route',/Arusha.*Tarangire.*Ngorongoro/);
  });

  test('legacy composition updates are promoted during migration', async ({ page }) => {
    await page.goto('/compose.html',{waitUntil:'domcontentloaded'});
    await page.evaluate(() => window.EnkiamaJourneyDraft.write({
      source:'compose',
      preferences:{pull:'stillness',time:'mid',season:'unsure',pace:'slow',coast:'yes',who:'couple'},
      labels:{pull:'Space & quiet',time:'~10 days',season:'Timing open',pace:'Slow',coast:'Coast yes',who:'Two travellers'},
      route:['Tarangire','Ngorongoro','Zanzibar'],
      message:'Canonical first'
    }));
    await page.evaluate(() => sessionStorage.setItem('enkiama.composition', JSON.stringify({
      version:1,
      preferences:{pull:'spectacle',time:'short',season:'jun-oct',pace:'full',coast:'no',who:'friends'},
      labels:{pull:'Wildlife',time:'About a week',season:'Jun–Oct',pace:'Active',coast:'Mainland only',who:'Friends'},
      route:['Tarangire','Serengeti'],
      message:'Legacy changed later'
    })));
    const draft=await page.evaluate(()=>window.EnkiamaJourneyDraft.read());
    expect(draft.preferences.coast).toBe('no');
    expect(draft.route).toEqual(['Tarangire','Serengeti']);
    const canonical=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('enkiama.journey.draft')));
    expect(canonical.preferences.coast).toBe('no');
  });

  test('Begin reads the same draft without a giant composed URL payload', async ({ page }) => {
    await page.goto('/compose.html',{waitUntil:'domcontentloaded'});
    await page.evaluate(() => window.EnkiamaJourneyDraft.write({
      source:'compose',
      preferences:{pull:'stillness',time:'short',season:'unsure',pace:'slow',coast:'no',who:'couple'},
      labels:{pull:'Space & quiet',time:'About a week',season:'Timing open',pace:'Slow',coast:'Mainland focus',who:'Two travellers'},
      route:['Tarangire','Ngorongoro'],
      message:'Quiet first direction'
    }));
    await page.goto('/begin.html?draft=1',{waitUntil:'domcontentloaded'});
    await expect(page.locator('#lfCarried')).toBeVisible();
    await expect(page.locator('#lfCarriedRoute')).toContainText('Tarangire');
    await expect(page.locator('#lfCarriedRoute')).toContainText('Ngorongoro');
    await expect(page).toHaveURL(/begin\.html\?draft=1$/);
  });
});
