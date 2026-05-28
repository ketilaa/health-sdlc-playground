import { Before, After, BeforeAll, AfterAll, Given, When, Then } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import assert from 'assert';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Rewrite bare http://localhost:3000/ to include the Next.js basePath
// (consistent with all prior feature tester patterns)
function resolveUrl(raw: string): string {
  return raw.replace('http://localhost:3000', APP_URL).replace(/\/$/, '') + '/health-sdlc-playground/';
}

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

// ---------------------------------------------------------------------------
// Background steps
// ---------------------------------------------------------------------------

Given('the application is running at {string}', async (_url: string) => {
  // No-op: the app is started externally by run-e2e.sh; this step documents
  // the precondition only.
});

Given('the user navigates to {string}', async (url: string) => {
  const resolved = resolveUrl(url);
  await page.goto(resolved, { waitUntil: 'domcontentloaded' });
});

// ---------------------------------------------------------------------------
// Visibility: nav-menu is NOT present / visible
// ---------------------------------------------------------------------------

Then('no element with data-testid {string} is visible on the page', async (testId: string) => {
  const locator = page.locator(`[data-testid="${testId}"]`);

  // Give React a moment to finish hydration, then assert absence
  await page.waitForTimeout(500);

  const count = await locator.count();
  if (count === 0) {
    // Element is not in the DOM at all — satisfies "not visible"
    return;
  }

  // Element exists in DOM — it must not be visible
  for (let i = 0; i < count; i++) {
    const visible = await locator.nth(i).isVisible();
    assert.strictEqual(
      visible,
      false,
      `Expected element with data-testid="${testId}" to not be visible, but it is visible.`
    );
  }
});

// ---------------------------------------------------------------------------
// Action: clicking an element
// ---------------------------------------------------------------------------

When('the user clicks the element with data-testid {string}', async (testId: string) => {
  const locator = page.locator(`[data-testid="${testId}"]`);
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  await locator.click();
});

// ---------------------------------------------------------------------------
// Visibility: element IS present and visible
// ---------------------------------------------------------------------------

Then('an element with data-testid {string} is visible on the page', async (testId: string) => {
  const locator = page.locator(`[data-testid="${testId}"]`);
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  const visible = await locator.isVisible();
  assert.strictEqual(
    visible,
    true,
    `Expected element with data-testid="${testId}" to be visible, but it is not.`
  );
});

// ---------------------------------------------------------------------------
// Text content assertion
// ---------------------------------------------------------------------------

Then('the element with data-testid {string} contains the text {string}', async (testId: string, text: string) => {
  const locator = page.locator(`[data-testid="${testId}"]`);
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  const innerText = await locator.innerText();
  assert.ok(
    innerText.includes(text),
    `Expected element with data-testid="${testId}" to contain text "${text}", but got: "${innerText}"`
  );
});