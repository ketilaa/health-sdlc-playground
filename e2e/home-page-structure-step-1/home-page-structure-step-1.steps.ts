import { Given, Then } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';
import assert from 'assert';

let browser: Browser;
let page: Page;

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
// Next.js basePath is /health-sdlc-playground
const HOME_URL = `${APP_URL}/health-sdlc-playground/`;

Given('the user navigates to the home page', async function () {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto(HOME_URL, { waitUntil: 'domcontentloaded' });
  // Store on world for teardown access
  this.page = page;
  this.browser = browser;
});

Then('the text {string} is visible on the page', async function (text: string) {
  const locator = page.getByText(text, { exact: false });
  await locator.waitFor({ state: 'visible' });
  const isVisible = await locator.isVisible();
  assert.ok(isVisible, `Expected text "${text}" to be visible on the page`);
});

Then('an element with data-testid {string} is visible', async function (testId: string) {
  const locator = page.locator(`[data-testid="${testId}"]`);
  await locator.waitFor({ state: 'visible' });
  const isVisible = await locator.isVisible();
  assert.ok(isVisible, `Expected element with data-testid="${testId}" to be visible`);
});

Then(
  'an element with data-testid {string} is visible within data-testid {string}',
  async function (childTestId: string, parentTestId: string) {
    const locator = page.locator(`[data-testid="${parentTestId}"] [data-testid="${childTestId}"]`);
    await locator.waitFor({ state: 'visible' });
    const isVisible = await locator.isVisible();
    assert.ok(
      isVisible,
      `Expected element with data-testid="${childTestId}" to be visible within data-testid="${parentTestId}"`
    );
  }
);

Then(
  'the element with data-testid {string} appears before the element with data-testid {string}',
  async function (firstTestId: string, secondTestId: string) {
    // Use compareDocumentPosition to verify DOM ordering
    const result: boolean = await page.evaluate(
      ({ first, second }: { first: string; second: string }) => {
        const firstEl = document.querySelector(`[data-testid="${first}"]`);
        const secondEl = document.querySelector(`[data-testid="${second}"]`);
        if (!firstEl || !secondEl) return false;
        // DOCUMENT_POSITION_FOLLOWING = 4 means secondEl follows firstEl in document order
        return !!(firstEl.compareDocumentPosition(secondEl) & Node.DOCUMENT_POSITION_FOLLOWING);
      },
      { first: firstTestId, second: secondTestId }
    );
    assert.ok(
      result,
      `Expected element with data-testid="${firstTestId}" to appear before data-testid="${secondTestId}" in the DOM`
    );
  }
);

Then(
  'the text {string} is visible within the element with data-testid {string}',
  async function (text: string, testId: string) {
    const container = page.locator(`[data-testid="${testId}"]`);
    await container.waitFor({ state: 'visible' });
    const textLocator = container.getByText(text, { exact: false });
    await textLocator.waitFor({ state: 'visible' });
    const isVisible = await textLocator.isVisible();
    assert.ok(
      isVisible,
      `Expected text "${text}" to be visible within element with data-testid="${testId}"`
    );
  }
);

// Teardown after each scenario
import { After } from '@cucumber/cucumber';

After(async function () {
  if (this.browser) {
    await this.browser.close();
  } else if (browser) {
    await browser.close();
  }
});