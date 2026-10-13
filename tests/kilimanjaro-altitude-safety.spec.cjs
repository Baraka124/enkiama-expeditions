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


const operations = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'kilimanjaro-operations.json'), 'utf8')
);

test('Kilimanjaro premium operations registry preserves verification boundary', async () => {
  expect(operations.schema).toBe('enkiama.kilimanjaro.operations.v1');
  expect(operations.public_standard).toHaveLength(6);
  expect(operations.continuity_standard).toHaveLength(5);
  expect(operations.partner_specification.verification_status).toBe('pending_partner_verification');
  expect(operations.partner_specification.public_render).toBe(false);

  const groups = ['sleep','dining','sanitation','water','food','private_support'];
  for (const group of groups) {
    expect(operations.partner_specification[group]).toBeTruthy();
    for (const value of Object.values(operations.partner_specification[group])) {
      expect(value).toBeNull();
    }
  }
});

test('Kilimanjaro flagship renders six inspectable premium-operation dimensions', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#operations')).toBeVisible();
  await expect(page.locator('#operations .km-operation')).toHaveCount(6);
  await expect(page.getByText('Specific enough to inspect.')).toBeVisible();
  await expect(page.getByText('What does the climber actually sleep in and on?')).toBeVisible();
  await expect(page.getByText('What actually changes when the climb is private?')).toBeVisible();

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('supplemental oxygen provided');
  expect(body).not.toContain('private toilet provided');
  expect(body).not.toContain('hot shower provided');
  expect(body).not.toContain('luxury camp');
});

test('KILELE dossier renders five-stage expedition continuity', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/kilimanjaro-expedition.html?expedition=kilele-2027-machame', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#expPage')).toBeVisible();
  await expect(page.locator('.exp-continuity')).toBeVisible();
  await expect(page.locator('.exp-continuity__rail article')).toHaveCount(5);
  await expect(page.getByText('Briefing & gear check')).toBeVisible();
  await expect(page.getByText('Onward Tanzania')).toBeVisible();
});

test('27D operations and continuity remain contained at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/kilimanjaro.html', { waitUntil: 'domcontentloaded' });
  let width = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    right: document.querySelector('#operations')?.getBoundingClientRect().right,
  }));
  expect(width.scrollWidth).toBeLessThanOrEqual(width.viewport + 2);
  expect(width.right).toBeLessThanOrEqual(width.viewport + 1);

  await page.goto('/kilimanjaro-expedition.html?expedition=kilele-2027-machame', { waitUntil: 'domcontentloaded' });
  width = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    right: document.querySelector('.exp-continuity')?.getBoundingClientRect().right,
  }));
  expect(width.scrollWidth).toBeLessThanOrEqual(width.viewport + 2);
  expect(width.right).toBeLessThanOrEqual(width.viewport + 1);
});
