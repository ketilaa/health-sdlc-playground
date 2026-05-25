import '@playwright/test';
import {
  Given,
  When,
  Then,
  Before,
  After,
} from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { strict as assert } from 'assert';
import { RunnerWorld } from './world';

// ── Lifecycle ─────────────────────────────────────────────────────────────────

Before(async function (this: RunnerWorld) {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function (this: RunnerWorld) {
  await this.browser?.close();
});

// ── Background steps ──────────────────────────────────────────────────────────

Given(
  'the application is running with the test fixture dataset loaded',
  async function (this: RunnerWorld) {
    // The static export bundles the fixture; no setup action needed.
    // Verify the app is reachable.
    const response = await this.page.goto(this.appUrl, { waitUntil: 'domcontentloaded' });
    assert.ok(
      response && response.status() < 500,
      `App at ${this.appUrl} returned ${response?.status()}`
    );
  }
);

Given(
  'the test fixture dataset is named {string}',
  async function (this: RunnerWorld, _name: string) {
    // Declarative — the fixture name is verified in later assertion steps.
  }
);

// ── Navigation steps ──────────────────────────────────────────────────────────

When(
  'a user opens the application at the root path',
  async function (this: RunnerWorld) {
    await this.page.goto(this.appUrl, { waitUntil: 'networkidle' });
    // Wait for either week-rows or loading indicator to appear
    await this.page.waitForSelector('[data-testid="week-row"], [data-testid="dataset-loading"]', {
      timeout: 15000,
    });
    // Wait until week-rows are actually rendered (loading complete)
    await this.page.waitForSelector('[data-testid="week-row"]', { timeout: 15000 });
  }
);

When(
  'a user opens the application at the root path with a slow network simulated',
  async function (this: RunnerWorld) {
    // Intercept any JSON/data fetch to simulate latency.
    // The app uses setTimeout(0) so dataset-loading renders on first paint.
    // We navigate and immediately check for dataset-loading before week-rows appear.
    await this.page.route('**/*.json', async (route) => {
      // Delay JSON responses by 2 seconds to keep loading state visible longer
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });
    // Navigate without waiting for networkidle so we can observe intermediate states
    await this.page.goto(this.appUrl, { waitUntil: 'domcontentloaded' });
  }
);

When(
  'a user opens the element with data-testid {string}',
  async function (this: RunnerWorld, testId: string) {
    await this.page.goto(this.appUrl, { waitUntil: 'networkidle' });
    await this.page.waitForSelector(`[data-testid="${testId}"]`, { timeout: 15000 });
    await this.page.click(`[data-testid="${testId}"]`);
  }
);

When(
  'the user clicks the element with data-testid {string} containing the text {string}',
  async function (this: RunnerWorld, testId: string, text: string) {
    const locator = this.page
      .locator(`[data-testid="${testId}"]`)
      .filter({ hasText: text })
      .first();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.click();
  }
);

// ── Assertion steps ───────────────────────────────────────────────────────────

Then(
  'an element with data-testid {string} is visible in the top bar',
  async function (this: RunnerWorld, testId: string) {
    const el = this.page.locator(`[data-testid="${testId}"]`);
    await el.waitFor({ state: 'visible', timeout: 10000 });
    assert.ok(await el.isVisible(), `Expected [data-testid="${testId}"] to be visible`);
  }
);

Then(
  'the element with data-testid {string} displays the text {string}',
  async function (this: RunnerWorld, testId: string, expectedText: string) {
    const el = this.page.locator(`[data-testid="${testId}"]`);
    await el.waitFor({ state: 'visible', timeout: 10000 });
    const text = await el.innerText();
    assert.ok(
      text.includes(expectedText),
      `Expected [data-testid="${testId}"] to contain "${expectedText}", got "${text}"`
    );
  }
);

Then(
  'exactly {int} elements with data-testid {string} are visible',
  async function (this: RunnerWorld, count: number, testId: string) {
    await this.page.waitForSelector(`[data-testid="${testId}"]`, { timeout: 10000 });
    const elements = this.page.locator(`[data-testid="${testId}"]`);
    await elements.first().waitFor({ state: 'visible', timeout: 10000 });
    const actual = await elements.count();
    assert.equal(actual, count, `Expected ${count} [data-testid="${testId}"], found ${actual}`);
  }
);

Then(
  'the text {string} is visible on the page',
  async function (this: RunnerWorld, text: string) {
    await this.page.waitForSelector(`text=${text}`, { timeout: 10000 });
    const el = this.page.getByText(text, { exact: false }).first();
    assert.ok(await el.isVisible(), `Expected text "${text}" to be visible on the page`);
  }
);

Then(
  'the first element with data-testid {string} contains the text {string}',
  async function (this: RunnerWorld, testId: string, text: string) {
    const first = this.page.locator(`[data-testid="${testId}"]`).first();
    await first.waitFor({ state: 'visible', timeout: 10000 });
    const innerText = await first.innerText();
    assert.ok(
      innerText.includes(text),
      `Expected first [data-testid="${testId}"] to contain "${text}", got "${innerText}"`
    );
  }
);

Then(
  'the last element with data-testid {string} contains the text {string}',
  async function (this: RunnerWorld, testId: string, text: string) {
    const elements = this.page.locator(`[data-testid="${testId}"]`);
    await elements.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await elements.count();
    const last = elements.nth(count - 1);
    const innerText = await last.innerText();
    assert.ok(
      innerText.includes(text),
      `Expected last [data-testid="${testId}"] to contain "${text}", got "${innerText}"`
    );
  }
);

Then(
  'each element with data-testid {string} contains an element with data-testid {string}',
  async function (this: RunnerWorld, parentTestId: string, childTestId: string) {
    const parents = this.page.locator(`[data-testid="${parentTestId}"]`);
    await parents.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await parents.count();
    assert.ok(count > 0, `No [data-testid="${parentTestId}"] elements found`);
    for (let i = 0; i < count; i++) {
      const child = parents.nth(i).locator(`[data-testid="${childTestId}"]`);
      const childCount = await child.count();
      assert.ok(
        childCount > 0,
        `Element [data-testid="${parentTestId}"] at index ${i} missing [data-testid="${childTestId}"]`
      );
    }
  }
);

Then(
  'no element with data-testid {string} is present',
  async function (this: RunnerWorld, testId: string) {
    const count = await this.page.locator(`[data-testid="${testId}"]`).count();
    assert.equal(count, 0, `Expected no [data-testid="${testId}"], found ${count}`);
  }
);

Then(
  '{int} elements with data-testid {string} contain the text {string}',
  async function (this: RunnerWorld, expectedCount: number, testId: string, text: string) {
    const elements = this.page.locator(`[data-testid="${testId}"]`);
    await elements.first().waitFor({ state: 'visible', timeout: 10000 });
    const total = await elements.count();
    let matchCount = 0;
    for (let i = 0; i < total; i++) {
      const innerText = await elements.nth(i).innerText();
      if (innerText.includes(text)) matchCount++;
    }
    assert.equal(
      matchCount,
      expectedCount,
      `Expected ${expectedCount} [data-testid="${testId}"] elements to contain "${text}", found ${matchCount}`
    );
  }
);

Then(
  'exactly {int} element with data-testid {string} contains the text {string}',
  async function (this: RunnerWorld, expectedCount: number, testId: string, text: string) {
    const elements = this.page.locator(`[data-testid="${testId}"]`);
    await elements.first().waitFor({ state: 'visible', timeout: 10000 });
    const total = await elements.count();
    let matchCount = 0;
    for (let i = 0; i < total; i++) {
      const innerText = await elements.nth(i).innerText();
      if (innerText.includes(text)) matchCount++;
    }
    assert.equal(
      matchCount,
      expectedCount,
      `Expected exactly ${expectedCount} [data-testid="${testId}"] to contain "${text}", found ${matchCount}`
    );
  }
);

Then(
  'an element with data-testid {string} is visible',
  async function (this: RunnerWorld, testId: string) {
    const el = this.page.locator(`[data-testid="${testId}"]`);
    await el.waitFor({ state: 'visible', timeout: 10000 });
    assert.ok(await el.isVisible(), `Expected [data-testid="${testId}"] to be visible`);
  }
);

Then(
  '{int} elements with data-testid {string} are visible within {string}',
  async function (this: RunnerWorld, count: number, childTestId: string, parentTestId: string) {
    const parent = this.page.locator(`[data-testid="${parentTestId}"]`).first();
    await parent.waitFor({ state: 'visible', timeout: 10000 });
    const children = parent.locator(`[data-testid="${childTestId}"]`);
    await children.first().waitFor({ state: 'visible', timeout: 10000 });
    const actual = await children.count();
    assert.equal(
      actual,
      count,
      `Expected ${count} [data-testid="${childTestId}"] within [data-testid="${parentTestId}"], found ${actual}`
    );
  }
);

Then(
  'the text {string} is visible within {string}',
  async function (this: RunnerWorld, text: string, parentTestId: string) {
    const parent = this.page.locator(`[data-testid="${parentTestId}"]`).first();
    await parent.waitFor({ state: 'visible', timeout: 10000 });
    const el = parent.getByText(text, { exact: false }).first();
    await el.waitFor({ state: 'visible', timeout: 10000 });
    assert.ok(await el.isVisible(), `Expected text "${text}" to be visible within [data-testid="${parentTestId}"]`);
  }
);

Then(
  'an element with data-testid {string} is visible within {string}',
  async function (this: RunnerWorld, childTestId: string, parentTestId: string) {
    const parent = this.page.locator(`[data-testid="${parentTestId}"]`).first();
    await parent.waitFor({ state: 'visible', timeout: 10000 });
    const child = parent.locator(`[data-testid="${childTestId}"]`).first();
    await child.waitFor({ state: 'visible', timeout: 10000 });
    assert.ok(await child.isVisible(), `Expected [data-testid="${childTestId}"] to be visible within [data-testid="${parentTestId}"]`);
  }
);

Then(
  'the dropdown options visible to end users do not include any option with text {string}',
  async function (this: RunnerWorld, forbiddenText: string) {
    // After clicking dataset-selector, the dropdown should be open.
    // MUI Select renders options in a portal with role="option" or role="listbox".
    const listbox = this.page.locator('[role="listbox"], [role="menu"]');
    await listbox.waitFor({ state: 'visible', timeout: 10000 });
    const options = listbox.locator('[role="option"], li');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const optionText = await options.nth(i).innerText();
      assert.ok(
        !optionText.includes(forbiddenText),
        `Dropdown should not contain option with text "${forbiddenText}", but found: "${optionText}"`
      );
    }
  }
);

Then(
  'the test fixture used by automated tests is not selectable through the normal user interface',
  async function (this: RunnerWorld) {
    // The dropdown is still open from the previous step.
    // Re-confirm that no option contains "Test Fixture" text.
    const listbox = this.page.locator('[role="listbox"], [role="menu"]');
    // If already closed, re-open
    const isVisible = await listbox.isVisible();
    if (!isVisible) {
      await this.page.click('[data-testid="dataset-selector"]');
      await listbox.waitFor({ state: 'visible', timeout: 10000 });
    }
    const options = listbox.locator('[role="option"], li');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const optionText = await options.nth(i).innerText();
      assert.ok(
        !optionText.toLowerCase().includes('test fixture'),
        `Fixture option found in UI: "${optionText}"`
      );
    }
    // Dismiss dropdown
    await this.page.keyboard.press('Escape');
  }
);

// ── Loading state steps ───────────────────────────────────────────────────────

Then(
  'an element with data-testid {string} is visible before any element with data-testid {string} appears',
  async function (this: RunnerWorld, loadingTestId: string, contentTestId: string) {
    // After navigating with domcontentloaded, the loading indicator should be present
    // because the app renders dataset-loading on first paint (before setTimeout resolves).
    const loadingEl = this.page.locator(`[data-testid="${loadingTestId}"]`);

    // We check that dataset-loading is visible right after DOM content load.
    // The route intercept delays JSON by 2s, so loading state persists long enough.
    await loadingEl.waitFor({ state: 'visible', timeout: 5000 });
    const loadingVisible = await loadingEl.isVisible();
    assert.ok(
      loadingVisible,
      `Expected [data-testid="${loadingTestId}"] to be visible before [data-testid="${contentTestId}"] appears`
    );

    // Confirm no week-row exists yet
    const contentCount = await this.page.locator(`[data-testid="${contentTestId}"]`).count();
    assert.equal(
      contentCount,
      0,
      `Expected no [data-testid="${contentTestId}"] while [data-testid="${loadingTestId}"] is visible, found ${contentCount}`
    );
  }
);

Then(
  'the element with data-testid {string} is no longer visible once at least one element with data-testid {string} is rendered',
  async function (this: RunnerWorld, loadingTestId: string, contentTestId: string) {
    // Wait for content rows to appear (route intercept delay will expire)
    await this.page.waitForSelector(`[data-testid="${contentTestId}"]`, { timeout: 15000 });

    // Loading indicator should now be gone
    await this.page.waitForSelector(`[data-testid="${loadingTestId}"]`, {
      state: 'hidden',
      timeout: 5000,
    });
    const loadingVisible = await this.page
      .locator(`[data-testid="${loadingTestId}"]`)
      .isVisible()
      .catch(() => false);
    assert.ok(
      !loadingVisible,
      `Expected [data-testid="${loadingTestId}"] to be hidden once [data-testid="${contentTestId}"] is rendered`
    );
  }
);