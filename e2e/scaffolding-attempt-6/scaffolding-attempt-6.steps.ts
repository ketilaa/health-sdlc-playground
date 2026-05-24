import {
  Before,
  After,
  Given,
  When,
  Then,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import {
  chromium,
  request as playwrightRequest,
} from '@playwright/test';
import { expect } from '@playwright/test';
import type { ScaffoldingWorld } from './world';

// Allow up to 30 s per step
setDefaultTimeout(30_000);

// ── Hooks ─────────────────────────────────────────────────────────────────────

Before(async function (this: ScaffoldingWorld) {
  // Browser
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();

  // API request context (no browser)
  this.apiRequest = await playwrightRequest.newContext({
    baseURL: this.appUrl,
    // Do NOT follow redirects so we capture the raw status
    ignoreHTTPSErrors: true,
  });

  this.lastResponse = null;
});

After(async function (this: ScaffoldingWorld) {
  await this.apiRequest.dispose();
  await this.context.close();
  await this.browser.close();
});

// ── Background steps ──────────────────────────────────────────────────────────

Given(
  'the repository is checked out',
  async function (this: ScaffoldingWorld) {
    // No-op: assumed satisfied by CI / run-e2e.sh
  },
);

Given(
  'dependencies have been installed with {string}',
  async function (this: ScaffoldingWorld, _command: string) {
    // No-op: satisfied by run-e2e.sh which runs npm install before tests
  },
);

// ── Shared "When" steps ───────────────────────────────────────────────────────

When(
  'a GET request is made to {string} on the running development server',
  async function (this: ScaffoldingWorld, path: string) {
    this.lastResponse = await this.apiRequest.get(path, {
      // Prevent automatic redirect following so 404 is captured as-is
      failOnStatusCode: false,
    });
  },
);

When(
  'the home page {string} is loaded in a browser',
  async function (this: ScaffoldingWorld, path: string) {
    await this.page.goto(`${this.appUrl}${path}`, {
      waitUntil: 'domcontentloaded',
    });
  },
);

// ── "Then" — HTTP assertions ──────────────────────────────────────────────────

Then(
  'the response has HTTP status {int}',
  async function (this: ScaffoldingWorld, expectedStatus: number) {
    if (!this.lastResponse) {
      throw new Error('No HTTP response captured. Did a "When" step run first?');
    }
    expect(this.lastResponse.status()).toBe(expectedStatus);
  },
);

// ── "Then" — UI assertions ────────────────────────────────────────────────────

Then(
  'an element with data-testid {string} is visible',
  async function (this: ScaffoldingWorld, testId: string) {
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    await locator.waitFor({ state: 'visible' });
    await expect(locator).toBeVisible();
  },
);

Then(
  'the text {string} is visible inside the element with data-testid {string}',
  async function (
    this: ScaffoldingWorld,
    text: string,
    testId: string,
  ) {
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    await locator.waitFor({ state: 'visible' });
    await expect(locator).toContainText(text);
  },
);

Then(
  'an element with data-testid {string} is present inside the element with data-testid {string}',
  async function (
    this: ScaffoldingWorld,
    childTestId: string,
    parentTestId: string,
  ) {
    // Use a CSS descendant selector to assert nesting
    const locator = this.page.locator(
      `[data-testid="${parentTestId}"] [data-testid="${childTestId}"]`,
    );
    // "present" means in the DOM — it does not need to be visible
    await locator.waitFor({ state: 'attached' });
    expect(await locator.count()).toBeGreaterThan(0);
  },
);

Then(
  'the document title equals {string}',
  async function (this: ScaffoldingWorld, expectedTitle: string) {
    // Title may be set asynchronously; poll until it matches
    await expect(this.page).toHaveTitle(expectedTitle);
  },
);