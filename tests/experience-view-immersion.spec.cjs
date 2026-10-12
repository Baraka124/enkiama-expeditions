const { test, expect } = require('@playwright/test');

const cases = [
  { name:'phone-portrait', width:390, height:844 },
  { name:'phone-landscape', width:844, height:390 },
  { name:'short-laptop', width:1366, height:650 },
];

for (const viewport of cases) {
  test.describe(viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('Experience View preserves immersive safe zones', async ({ page }) => {
      await page.goto('/experience-view.html', { waitUntil:'domcontentloaded' });
      const state = await page.evaluate(() => {
        const rect = el => {
          const r = el?.getBoundingClientRect();
          return r ? {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height} : null;
        };
        return {
          innerWidth:innerWidth,
          innerHeight:innerHeight,
          scrollWidth:document.documentElement.scrollWidth,
          copy:rect(document.querySelector('.ev-copy')),
          controls:rect(document.querySelector('.ev-controls')),
          rail:rect(document.querySelector('.ev-rail')),
          top:rect(document.querySelector('.ev-top')),
        };
      });

      expect(state.scrollWidth).toBeLessThanOrEqual(state.innerWidth + 4);
      expect(state.copy).not.toBeNull();
      expect(state.controls).not.toBeNull();
      expect(state.rail).not.toBeNull();
      expect(state.top).not.toBeNull();
      expect(state.copy.left).toBeGreaterThanOrEqual(-4);
      expect(state.copy.right).toBeLessThanOrEqual(state.innerWidth + 4);
      expect(state.copy.top).toBeGreaterThanOrEqual(-4);
      expect(state.copy.bottom).toBeLessThanOrEqual(state.innerHeight + 4);
      expect(state.controls.bottom).toBeLessThanOrEqual(state.innerHeight + 4);
      expect(state.rail.bottom).toBeLessThanOrEqual(state.innerHeight + 4);
    });

    test('Long composed route remains readable without page overflow', async ({ page }) => {
      await page.goto('/experience-view.html', { waitUntil:'domcontentloaded' });
      await page.evaluate(() => {
        sessionStorage.setItem('enkiama.composition', JSON.stringify({
          version:1,
          preferences:{pull:'spectacle',time:'mid',season:'jun-oct',pace:'slow',coast:'yes',who:'couple'},
          labels:{pull:'Wildlife',time:'~10 days',season:'Jun–Oct',pace:'Slow',coast:'Coast: yes',who:'Two travellers'},
          route:[
            'Tarangire National Park',
            'Ngorongoro Conservation Area',
            'Central Serengeti',
            'Northern Serengeti',
            'Stone Town, Zanzibar'
          ],
          message:'Long composed route'
        }));
      });
      await page.goto('/experience-view.html?from=compose', { waitUntil:'domcontentloaded' });

      // Advance to the route chapter without relying on animation timing.
      // Wildlife-led compositions intentionally place route immediately after opening.
      await page.keyboard.press('ArrowRight');

      const route = await page.evaluate(() => {
        const band=document.getElementById('evRouteDirector');
        const controls=document.querySelector('.ev-controls');
        const rail=document.querySelector('.ev-rail');
        const copy=document.querySelector('.ev-copy');
        const active=document.querySelector('.ev-scene.active');
        const r = el => {
          const b=el?.getBoundingClientRect();
          return b ? {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height} : null;
        };
        return {
          role:active?.dataset.sceneRole,
          scrollWidth:document.documentElement.scrollWidth,
          viewport:innerWidth,
          band:r(band),
          bandScrollWidth:band?.scrollWidth || 0,
          bandClientWidth:band?.clientWidth || 0,
          controls:r(controls),
          rail:r(rail),
          copy:r(copy),
          labels:[...document.querySelectorAll('#evRouteDirector .ev-route-stop span')].map(el=>el.textContent.trim())
        };
      });

      expect(route.role).toBe('route');
      expect(route.scrollWidth).toBeLessThanOrEqual(route.viewport + 4);
      expect(route.labels).toHaveLength(5);
      expect(route.labels[1]).toContain('Ngorongoro');
      expect(route.band).not.toBeNull();
      expect(route.band.left).toBeGreaterThanOrEqual(-4);
      expect(route.band.right).toBeLessThanOrEqual(viewport.width + 4);

      if (viewport.width <= 900 && viewport.height <= 520) {
        expect(route.copy.right).toBeLessThanOrEqual(viewport.width * .54);
        expect(route.band.left).toBeGreaterThanOrEqual(viewport.width * .50);
      }
      if (viewport.width <= 760 && viewport.height > viewport.width) {
        expect(route.bandScrollWidth).toBeGreaterThan(route.bandClientWidth);
        expect(route.band.bottom).toBeLessThanOrEqual(route.controls.top + 4);
      }
    });
  });
}
