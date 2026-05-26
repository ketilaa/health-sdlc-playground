import { Given, When, Then, Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import assert from 'assert';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const BASE_PATH = '/health-sdlc-playground';

let browser: Browser;
let context: BrowserContext;
let page: Page;

BeforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});

AfterAll(async () => {
  await browser.close();
});

Before(async () => {
  context = await browser.newContext();
  page = await context.newPage();
});

After(async () => {
  await context.close();
});

// Background steps

Given('the application is running at {string}', async (_url: string) => {
  // Verified by the server startup in run-e2e.sh; no action needed here.
});

Given('the test fixture dataset is loaded', async () => {
  // Fixture data is baked into the static bundle at build time.
  // No runtime injection required — this step is a no-op.
});

// Navigation

When('the user navigates to {string}', async (url: string) => {
  // Replace bare localhost:3000 with the basePath-aware URL
  const targetUrl = url.replace('http://localhost:3000/', `${APP_URL}${BASE_PATH}/`);
  await page.goto(targetUrl);
  await page.waitForLoadState('networkidle');
});

// Click week-row containing specific text

When(
  'the user clicks the element with data-testid {string} containing the text {string}',
  async (testId: string, text: string) => {
    // Find all elements with the given testid that contain the specified text
    const locator = page.locator(`[data-testid="${testId}"]`, { hasText: text });
    await locator.first().waitFor({ state: 'visible', timeout: 10000 });
    await locator.first().click();
  }
);

// Visibility assertion

Then('an element with data-testid {string} is visible', async (testId: string) => {
  const locator = page.locator(`[data-testid="${testId}"]`);
  await locator.first().waitFor({ state: 'visible', timeout: 10000 });
});

// Each activity-row within week-activities has a non-empty data-activity-type

Then(
  'each element with data-testid {string} within {string} has a {string} attribute with a non-empty value',
  async (childTestId: string, parentTestId: string, attributeName: string) => {
    const parentLocator = page.locator(`[data-testid="${parentTestId}"]`).first();
    await parentLocator.waitFor({ state: 'visible', timeout: 10000 });

    const childLocator = parentLocator.locator(`[data-testid="${childTestId}"]`);
    const count = await childLocator.count();
    assert.ok(count > 0, `Expected at least one [data-testid="${childTestId}"] within [data-testid="${parentTestId}"], but found 0`);

    for (let i = 0; i < count; i++) {
      const el = childLocator.nth(i);
      const attrValue = await el.getAttribute(attributeName);
      assert.ok(
        attrValue && attrValue.trim().length > 0,
        `Element [data-testid="${childTestId}"] at index ${i} has empty or missing ${attributeName} attribute (got: ${JSON.stringify(attrValue)})`
      );
    }
  }
);

// activity-row with specific data-activity-type is visible within parent

Then(
  'an element with data-testid {string} and data-activity-type {string} is visible within {string}',
  async (childTestId: string, activityType: string, parentTestId: string) => {
    const parentLocator = page.locator(`[data-testid="${parentTestId}"]`).first();
    await parentLocator.waitFor({ state: 'visible', timeout: 10000 });

    const targetLocator = parentLocator.locator(
      `[data-testid="${childTestId}"][data-activity-type="${activityType}"]`
    );
    await targetLocator.first().waitFor({ state: 'visible', timeout: 10000 });

    const count = await targetLocator.count();
    assert.ok(
      count > 0,
      `Expected at least one [data-testid="${childTestId}"][data-activity-type="${activityType}"] within [data-testid="${parentTestId}"], but found 0`
    );
  }
);

// skipped-activity within week-activities has data-activity-type="skipped"

Then(
  'the element with data-testid {string} within {string} has a {string} attribute with value {string}',
  async (childTestId: string, parentTestId: string, attributeName: string, expectedValue: string) => {
    const parentLocator = page.locator(`[data-testid="${parentTestId}"]`).first();
    await parentLocator.waitFor({ state: 'visible', timeout: 10000 });

    const childLocator = parentLocator.locator(`[data-testid="${childTestId}"]`).first();
    await childLocator.waitFor({ state: 'visible', timeout: 10000 });

    const attrValue = await childLocator.getAttribute(attributeName);
    assert.strictEqual(
      attrValue,
      expectedValue,
      `Expected [data-testid="${childTestId}"] ${attributeName} to be "${expectedValue}" but got "${attrValue}"`
    );
  }
);