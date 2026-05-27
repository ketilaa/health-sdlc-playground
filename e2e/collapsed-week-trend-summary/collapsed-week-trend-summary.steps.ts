import { Given, When, Then, Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import assert from 'assert';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Rewrite bare localhost URL to include the Next.js basePath (static export convention)
function resolveUrl(raw: string): string {
  return raw.replace('http://localhost:3000/', `${APP_URL}/health-sdlc-playground/`);
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
  // The server is started externally by run-e2e.sh — no action required here.
});

Given('the test fixture dataset is loaded', async () => {
  // Fixture data is compiled into the JS bundle at build time.
  // No runtime seeding mechanism exists. This step is intentionally a no-op.
  // If fixture data is incorrect, specific text-content assertions will fail with descriptive errors.
});

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

When('the user navigates to {string}', async (rawUrl: string) => {
  const url = resolveUrl(rawUrl);
  await page.goto(url);
  // Wait for at least one week-row to be visible before proceeding
  await page.locator('[data-testid="week-row"]').first().waitFor({ state: 'visible' });
});

// ---------------------------------------------------------------------------
// Scenario 1: Every week-row contains both trend indicators
// ---------------------------------------------------------------------------

Then('each element with data-testid {string} contains an element with data-testid {string}',
  async (parentTestId: string, childTestId: string) => {
    const parents = page.locator(`[data-testid="${parentTestId}"]`);
    const count = await parents.count();
    assert.ok(count > 0, `Expected at least one element with data-testid="${parentTestId}", found 0`);

    for (let i = 0; i < count; i++) {
      const parent = parents.nth(i);
      const child = parent.locator(`[data-testid="${childTestId}"]`);
      const childCount = await child.count();
      assert.ok(
        childCount > 0,
        `week-row[${i}] is missing an element with data-testid="${childTestId}"`
      );
    }
  }
);

// ---------------------------------------------------------------------------
// Scenario 2: Indicators visible without expanding; no week-activities visible
// ---------------------------------------------------------------------------

Then('an element with data-testid {string} is visible within the first element with data-testid {string}',
  async (childTestId: string, parentTestId: string) => {
    const firstParent = page.locator(`[data-testid="${parentTestId}"]`).first();
    await firstParent.waitFor({ state: 'visible' });
    const child = firstParent.locator(`[data-testid="${childTestId}"]`).first();
    await child.waitFor({ state: 'visible' });
    const isVisible = await child.isVisible();
    assert.ok(isVisible, `Expected [data-testid="${childTestId}"] to be visible within the first [data-testid="${parentTestId}"]`);
  }
);

Then('no element with data-testid {string} is visible on the page',
  async (testId: string) => {
    const elements = page.locator(`[data-testid="${testId}"]`);
    const count = await elements.count();

    if (count === 0) {
      // Not in DOM at all — correct
      return;
    }

    // Elements exist in DOM — verify none are visible
    for (let i = 0; i < count; i++) {
      const isVisible = await elements.nth(i).isVisible();
      assert.ok(
        !isVisible,
        `Expected no visible [data-testid="${testId}"] on page, but element[${i}] is visible`
      );
    }
  }
);

// ---------------------------------------------------------------------------
// Scenario 3, 4, 5: Trend indicator text within a specific week row
// ---------------------------------------------------------------------------

Then(
  'the element with data-testid {string} within the element with data-testid {string} containing the text {string} contains the text {string}',
  async (childTestId: string, parentTestId: string, parentText: string, expectedText: string) => {
    // Find the week-row whose visible text contains the week label (e.g. "Week 8")
    const parentRow = page
      .locator(`[data-testid="${parentTestId}"]`)
      .filter({ hasText: parentText })
      .first();

    await parentRow.waitFor({ state: 'visible' });

    const child = parentRow.locator(`[data-testid="${childTestId}"]`).first();
    await child.waitFor({ state: 'visible' });

    const actualText = await child.innerText();
    assert.ok(
      actualText.includes(expectedText),
      `Expected [data-testid="${childTestId}"] within "${parentText}" row to contain "${expectedText}", but got: "${actualText}"`
    );
  }
);