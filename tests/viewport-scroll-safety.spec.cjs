const { test, expect } = require('@playwright/test');

const surfaces = [
  {
    path: 'index.html',
    headings: [
      '.lp-proof h2',
      '.lp-people h2',
      '.lp-compose h2',
    ],
  },
  {
    path: 'tanzania.html',
    headings: [
      '.tz-atlas h2',
      '.tz-section.light h2',
      '.tz-section:not(.light) h2',
    ],
  },
];

for (const surface of surfaces) {
  test(surface.path + ' fixed header yields during downward reading', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/' + surface.path, { waitUntil: 'domcontentloaded' });

    const bar = page.locator('#ehBar');
    await expect(bar).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(100);
    await expect(bar).toHaveClass(/eh-scroll-away/);

    await page.evaluate(() => window.scrollBy(0, -180));
    await page.waitForTimeout(100);
    await expect(bar).not.toHaveClass(/eh-scroll-away/);
  });

  for (const selector of surface.headings) {
    test(surface.path + ' protects ' + selector + ' from fixed-header collision', async ({ page }) => {
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.goto('/' + surface.path, { waitUntil: 'domcontentloaded' });

      const heading = page.locator(selector).first();
      await expect(heading).toBeVisible();

      await heading.evaluate(el => {
        const y = el.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo(0, Math.max(0, y));
      });
      await page.waitForTimeout(100);

      const geometry = await page.evaluate(sel => {
        const heading = document.querySelector(sel);
        const bar = document.getElementById('ehBar');
        if (!heading || !bar) return null;
        const hr = heading.getBoundingClientRect();
        const br = bar.getBoundingClientRect();
        return {
          headingTop: hr.top,
          headerBottom: br.bottom,
          headerYielded: bar.classList.contains('eh-scroll-away'),
        };
      }, selector);

      expect(geometry).not.toBeNull();
      expect(
        geometry.headerYielded || geometry.headingTop >= geometry.headerBottom + 8,
        selector + ' should never sit beneath the fixed Index bar'
      ).toBe(true);
    });
  }
}

test('home anchor targets retain a safe landing offset', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  for (const id of ['archive', 'people', 'compose-preview']) {
    await page.evaluate(targetId => {
      document.getElementById(targetId).scrollIntoView({ block: 'start' });
    }, id);
    await page.waitForTimeout(80);

    const top = await page.locator('#' + id).evaluate(el => el.getBoundingClientRect().top);
    expect(top, '#' + id + ' should land below the header-safe zone').toBeGreaterThanOrEqual(100);
  }
});

test('Experience View yields to reading and footer content', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const launcher = page.locator('.ev-launch');
  await expect(launcher).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 1100));
  await page.waitForTimeout(100);
  await expect(launcher).toHaveClass(/ev-quiet/);

  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  await expect(launcher).toHaveClass(/ev-hidden/);
});
