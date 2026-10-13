const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const safety = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'kilimanjaro-safety.json'), 'utf8')
);

test('Kilimanjaro safety registry preserves verification boundary', async () => {
  expect(safety.schema).toBe('enkiama.kilimanjaro.safety.v1');
  expect(safety.public_status).toBe('authoritative-principles-only');
  expect(safety.public_principles).toHaveLength(3);

  for (const principle of safety.public_principles) {
    expect(principle.statement.length).toBeGreaterThan(70);
    expect(safety.authoritative_sources[principle.source_ref]).toBeTruthy();
  }

  expect(safety.operator_protocol.verification_status).toBe('pending_partner_verification');
  expect(safety.operator_protocol.public_render).toBe(false);

  const protectedFields = [
    'guide_qualification',
    'assistant_guide_qualification',
    'monitoring_cadence',
    'pulse_oximetry_protocol',
    'supplemental_oxygen',
    'medical_kit',
    'communications',
    'descent_protocol',
    'evacuation_protocol',
    'rescue_coordination',
    'guide_to_climber_ratio',
  ];

  for (const field of protectedFields) {
    expect(safety.operator_protocol[field]).toBeNull();
  }
});

test('Kilimanjaro public page exposes altitude principles without partner claims', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#altitude')).toBeVisible();
  await expect(page.getByText('Symptoms change the plan')).toBeVisible();
  await expect(page.getByText('Descent is a safety decision')).toBeVisible();
  await expect(page.getByText('Medical boundary')).toBeVisible();
  await expect(page.getByText('Protocol before promise')).toBeVisible();

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('pulse oximetry protocol');
  expect(body).not.toContain('supplemental oxygen provided');
  expect(body).not.toContain('guide-to-climber ratio');
  expect(body).not.toContain('evacuation provider');
});

test('Kilimanjaro altitude and safety copy remains contained at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    intro: document.querySelector('.km-intro')?.getBoundingClientRect(),
    standards: document.querySelector('.km-standards')?.getBoundingClientRect(),
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport + 2);
  expect(metrics.intro.right).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.standards.right).toBeLessThanOrEqual(metrics.viewport + 1);
});
