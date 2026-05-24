import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AppWorld } from './world';

// ── Lifecycle ───────────────────────────────────────────────────────────────

Before(async function (this: AppWorld) {
  await this.init();
});

After(async function (this: AppWorld) {
  await this.teardown();
});

// ── Background steps ────────────────────────────────────────────────────────

Given('the repository is checked out', async function (this: AppWorld) {
  // Structural precondition — verified by the fact that tests are running.
});

Given('dependencies have been installed with {string}', async function (this: AppWorld, _command: string) {
  // Structural precondition — verified by run-e2e.sh executing npm install before this step.
});

// ── HTTP request scenarios ──────────────────────────────────────────────────

When(
  'a GET request is made to {string} on the running development server',
  async function (this: AppWorld, path: string) {
    this.response = await this.apiRequest.get(path, {
      // Do not follow redirects so we capture the true status code.
      maxRedirects: 0,
    });
  }
);

Then(
  'the response has HTTP status {int}',
  async function (this: AppWorld, expectedStatus: number) {
    if (!this.response) {
      throw new Error('No HTTP response recorded. Run a "GET request" step first.');
    }
    expect(this.response.status()).toBe(expectedStatus);
  }
);

// ── Browser navigation scenarios ────────────────────────────────────────────

When(
  'the home page {string} is loaded in a browser',
  async function (this: AppWorld, path: string) {
    await this.page.goto(`${this.appUrl}${path}`, { waitUntil: 'domcontentloaded' });
  }
);

// ── App header visibility ────────────────────────────────────────────────────

Then(
  'an element with data-testid {string} is visible',
  async function (this: AppWorld, testId: string) {
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    await expect(locator).toBeVisible({ timeout: 10_000 });
  }
);

Then(
  'the text {string} is visible inside the element with data-testid {string}',
  async function (this: AppWorld, text: string, testId: string) {
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    await expect(locator).toBeVisible({ timeout: 10_000 });
    await expect(locator).toContainText(text, { timeout: 10_000 });
  }
);

// ── Dataset selector placeholder ─────────────────────────────────────────────

Then(
  'an element with data-testid {string} is present inside the element with data-testid {string}',
  async function (this: AppWorld, childTestId: string, parentTestId: string) {
    // Assert the child is a DOM descendant of the parent.
    const parentLocator = this.page.locator(`[data-testid="${parentTestId}"]`);
    await expect(parentLocator).toBeVisible({ timeout: 10_000 });

    const childLocator = parentLocator.locator(`[data-testid="${childTestId}"]`);
    // "present" means in the DOM — not necessarily visible (though it should be).
    await expect(childLocator).toHaveCount(1, { timeout: 10_000 });
  }
);

// ── Document title ────────────────────────────────────────────────────────────

Then(
  'the document title equals {string}',
  async function (this: AppWorld, expectedTitle: string) {
    await expect(this.page).toHaveTitle(expectedTitle, { timeout: 10_000 });
  }
);