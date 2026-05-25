import {
  Given,
  When,
  Then,
  Before,
  After,
  BeforeAll,
  AfterAll,
} from '@cucumber/cucumber';
import { chromium, Browser } from 'playwright';
import { expect } from '@playwright/test';
import { CustomWorld } from './world';

const APP_URL =
  (process.env.APP_URL || 'http://localhost:3000') +
  '/health-sdlc-playground';

let sharedBrowser: Browser;

BeforeAll(async function () {
  sharedBrowser = await chromium.launch({ headless: true });
});

AfterAll(async function () {
  if (sharedBrowser) {
    await sharedBrowser.close();
  }
});

Before(async function (this: CustomWorld) {
  this.context = await sharedBrowser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld) {
  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
});

// ─── Background steps (no-ops at E2E level — data is baked in) ───────────────

Given('the repository is checked out', async function (this: CustomWorld) {
  // No-op: assumed true in CI environment
});

Given(
  'the application is running at {string}',
  async function (this: CustomWorld, _url: string) {
    // No-op: server is started by run-e2e.sh
  }
);

Given(
  'the mock dataset contains at least 3 weeks of activity data',
  async function (this: CustomWorld) {
    // No-op: baked into the frontend bundle
  }
);

Given(
  'week {string} contains the following activities:',
  async function (this: CustomWorld, _week: string, _table: any) {
    // No-op: baked into the frontend bundle
  }
);

Given(
  'week {string} has a resting heart rate series averaging {int} bpm and a VO2max of {int}',
  async function (
    this: CustomWorld,
    _week: string,
    _rhr: number,
    _vo2max: number
  ) {
    // No-op: baked into the frontend bundle
  }
);

Given(
  'week {string} has total training load lower than week {string}, average HR of {int} bpm, and resting HR averaging {int} bpm',
  async function (
    this: CustomWorld,
    _week: string,
    _compWeek: string,
    _avgHr: number,
    _restingHr: number
  ) {
    // No-op: baked into the frontend bundle
  }
);

Given(
  'week {string} exists with complete data',
  async function (this: CustomWorld, _week: string) {
    // No-op: baked into the frontend bundle
  }
);

// ─── Scenario-specific Given steps ───────────────────────────────────────────

Given(
  'the mock dataset contains an activity in week {string} named {string} with type {string} and no cadence or avg_hr values',
  async function (
    this: CustomWorld,
    _week: string,
    _name: string,
    _type: string
  ) {
    // No-op: "Strength Cross-Train" activity is baked into the frontend bundle
  }
);

Given(
  'week {string} has total training load within 2 percent of week {string}, average HR within 2 percent of week {string}, and resting HR within 2 percent of week {string}',
  async function (
    this: CustomWorld,
    _week: string,
    _comp1: string,
    _comp2: string,
    _comp3: string
  ) {
    // No-op: baked into the frontend bundle
  }
);

Given(
  'the earliest week in the mock dataset is {string}',
  async function (this: CustomWorld, _week: string) {
    // No-op: baked into the frontend bundle
  }
);

// ─── Navigation steps ─────────────────────────────────────────────────────────

Given(
  'the user navigates to {string}',
  async function (this: CustomWorld, _url: string) {
    await this.page.goto(APP_URL);
    await this.page.waitForLoadState('networkidle');
  }
);

Given(
  'the user navigates to {string} with a viewport width of {int} pixels',
  async function (this: CustomWorld, _url: string, width: number) {
    await this.context.close();
    this.context = await sharedBrowser.newContext({
      viewport: { width, height: 800 },
    });
    this.page = await this.context.newPage();
    await this.page.goto(APP_URL);
    await this.page.waitForLoadState('networkidle');
  }
);

// ─── Week selector step ────────────────────────────────────────────────────────

When(
  'the user selects week {string} using the element with data-testid {string}',
  async function (this: CustomWorld, week: string, testId: string) {
    const selector = `[data-testid="${testId}"]`;
    await this.page.waitForSelector(selector, { state: 'visible' });

    // Map ISO week code to label patterns used in the UI
    const weekLabels: Record<string, string[]> = {
      'W10': ['W10', '10', 'Week 10'],
      'W09': ['W09', '09', 'Week 9', 'Week 09'],
      'W08': ['W08', '08', 'Week 8', 'Week 08'],
    };

    // Extract the week number from the ISO code (e.g. "2024-W10" → "W10")
    const weekMatch = week.match(/W(\d+)$/);
    const weekKey = weekMatch ? `W${weekMatch[1].padStart(2, '0')}` : week;
    const labelsToTry = weekLabels[weekKey] ?? [week];

    const element = this.page.locator(selector);

    // Determine widget type: MUI Select (has combobox role) or ToggleButtonGroup (has buttons)
    const isSelect =
      (await element.locator('[role="combobox"]').count()) > 0 ||
      (await element.locator('select').count()) > 0;

    if (isSelect) {
      // MUI Select / native select approach
      const combobox =
        (await element.locator('[role="combobox"]').count()) > 0
          ? element.locator('[role="combobox"]')
          : element.locator('select');

      await combobox.click();

      // Wait for listbox/options to appear
      await this.page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 3000 }).catch(() => {});

      // Try each label variant
      let clicked = false;
      for (const label of labelsToTry) {
        const option = this.page
          .locator('[role="option"]')
          .filter({ hasText: label });
        if ((await option.count()) > 0) {
          await option.first().click();
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        // Fallback: try native select
        const nativeSelect = element.locator('select');
        if ((await nativeSelect.count()) > 0) {
          await nativeSelect.selectOption({ label: week });
        } else {
          throw new Error(
            `Could not find option for week ${week} in week-selector`
          );
        }
      }
    } else {
      // ToggleButtonGroup: find a button matching one of the label variants
      let clicked = false;
      for (const label of labelsToTry) {
        const btn = element.locator('button').filter({ hasText: label });
        if ((await btn.count()) > 0) {
          await btn.first().click();
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        // Last resort: try any element with the week code as text
        const anyMatch = element.locator(`text=${week}`);
        if ((await anyMatch.count()) > 0) {
          await anyMatch.first().click();
        } else {
          throw new Error(
            `Could not find week ${week} in toggle group week-selector`
          );
        }
      }
    }

    // Wait for the weekly summary card to update after selection
    await this.page.waitForSelector('[data-testid="weekly-summary-card"]', {
      state: 'visible',
      timeout: 5000,
    });
  }
);

// ─── Activity click step ───────────────────────────────────────────────────────

When(
  'the user clicks the activity {string} in the element with data-testid {string}',
  async function (this: CustomWorld, activityName: string, testId: string) {
    const listLocator = this.page.locator(`[data-testid="${testId}"]`);
    await listLocator.waitFor({ state: 'visible' });

    const activityItem = listLocator.locator(`text=${activityName}`);
    await activityItem.first().waitFor({ state: 'visible' });
    await activityItem.first().click();

    // Wait for activity detail to appear
    await this.page.waitForSelector('[data-testid="activity-detail"]', {
      state: 'visible',
      timeout: 5000,
    });
  }
);

// ─── Visibility assertions ─────────────────────────────────────────────────────

Then(
  'an element with data-testid {string} is visible on the page',
  async function (this: CustomWorld, testId: string) {
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    await locator.first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(locator.first()).toBeVisible();
  }
);

Then(
  'the element with data-testid {string} is visible on the page',
  async function (this: CustomWorld, testId: string) {
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    await locator.first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(locator.first()).toBeVisible();
  }
);

// ─── Text content assertions ───────────────────────────────────────────────────

Then(
  'the element with data-testid {string} contains the text {string}',
  async function (this: CustomWorld, testId: string, text: string) {
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    await locator.first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(locator.first()).toContainText(text, { timeout: 5000 });
  }
);

Then(
  'an element with data-testid {string} is visible on the page',
  async function (this: CustomWorld, testId: string) {
    // Duplicate step pattern — handled by the shared step above via Cucumber step matching
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    await locator.first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(locator.first()).toBeVisible();
  }
);

// ─── ARIA label assertion ──────────────────────────────────────────────────────

Then(
  'the element with data-testid {string} has aria-label {string}',
  async function (this: CustomWorld, testId: string, ariaLabel: string) {
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    await locator.first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(locator.first()).toHaveAttribute('aria-label', ariaLabel);
  }
);