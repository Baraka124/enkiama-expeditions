const { test, expect } = require('@playwright/test');

const semanticPages = [
  'index.html',
  'journeys.html',
  'begin.html',
  'compose.html',
  'tanzania.html',
  'trip.html?slug=july-five-travellers-2026',
  'kilimanjaro-route.html?route=machame',
  'kilimanjaro-expedition.html?expedition=kilele-2027-machame',
  'experience-view.html',
];

for (const path of semanticPages) {
  test(path + ' semantic baseline', async ({ page }) => {
    await page.goto('/' + path, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);

    const unnamedButtons = await page.locator('button').evaluateAll(buttons =>
      buttons.filter(button => {
        const text = (button.textContent || '').trim();
        const label = button.getAttribute('aria-label') || '';
        const labelledBy = button.getAttribute('aria-labelledby') || '';
        return !text && !label && !labelledBy;
      }).length
    );
    expect(unnamedButtons, path + ' contains unnamed buttons').toBe(0);

    const unnamedControls = await page.locator('input, select, textarea').evaluateAll(controls =>
      controls.filter(control => {
        if (control.getAttribute('type') === 'hidden') return false;
        if (control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')) return false;
        if (control.id && document.querySelector('label[for="' + CSS.escape(control.id) + '"]')) return false;
        return !control.closest('label');
      }).length
    );
    expect(unnamedControls, path + ' contains form controls without an accessible name').toBe(0);

    const dialog = page.locator('#ehOverlay');
    if (await dialog.count()) {
      await expect(dialog).toHaveAttribute('role', 'dialog');
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      const hasName = await dialog.evaluate(el =>
        Boolean((el.getAttribute('aria-label') || '').trim() || (el.getAttribute('aria-labelledby') || '').trim())
      );
      expect(hasName, path + ' Index dialog must have an accessible name').toBe(true);
    }
  });
}

for (const path of ['index.html', 'journeys.html', 'begin.html', 'compose.html']) {
  test(path + ' skip link reaches primary content', async ({ page }) => {
    await page.goto('/' + path, { waitUntil: 'domcontentloaded' });
    const skip = page.locator('a[href="#main"]').first();
    await expect(skip).toBeAttached();
    await skip.focus();
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator('main#main')).toHaveCount(1);
  });
}
