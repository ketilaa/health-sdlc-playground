import { Before, Given, When, Then, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as assert from 'assert';

setDefaultTimeout(30_000);

// ---------------------------------------------------------------------------
// World state
// ---------------------------------------------------------------------------
let browser: Browser;
let context: BrowserContext;
let page: Page;

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const PAGE_URL = `${APP_URL}/health-sdlc-playground/`;

// Stored between steps
let bodyBgColor: string = '';
let resolvedTokens: Record<string, string> = {};
let activeRow: any = null; // locator for the long-run activity row under test

// ---------------------------------------------------------------------------
// Browser lifecycle
// ---------------------------------------------------------------------------
Before(async function () {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
  page = await context.newPage();
  resolvedTokens = {};
  bodyBgColor = '';
  activeRow = null;
});

After(async function () {
  await browser.close();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse "rgb(r, g, b)" or "rgba(r, g, b, a)" into numeric channels.
 */
function parseRgb(color: string): { r: number; g: number; b: number } {
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) {
    throw new Error(`Cannot parse colour: "${color}"`);
  }
  return { r: parseInt(match[1], 10), g: parseInt(match[2], 10), b: parseInt(match[3], 10) };
}

/**
 * WCAG 2.x relative luminance.
 */
function relativeLuminance(color: string): number {
  const { r, g, b } = parseRgb(color);
  const channels = [r, g, b].map((c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/**
 * Resolve a CSS custom property to its canonical rgb(...) form using the
 * hidden colour probe element (data-testid="color-probe"), falling back to
 * creating a temporary probe element if the real one is absent.
 */
async function resolveCustomProperty(propertyName: string): Promise<string> {
  return page.evaluate((prop: string) => {
    // Try to use the existing colour probe element
    let probe = document.querySelector('[data-testid="color-probe"]') as HTMLElement | null;
    let isTemporary = false;

    if (!probe) {
      // Fallback: create a temporary hidden probe
      probe = document.createElement('div');
      probe.style.position = 'absolute';
      probe.style.width = '0';
      probe.style.height = '0';
      probe.style.overflow = 'hidden';
      probe.style.pointerEvents = 'none';
      document.body.appendChild(probe);
      isTemporary = true;
    }

    probe.style.backgroundColor = `var(${prop})`;
    const resolved = window.getComputedStyle(probe).backgroundColor;

    if (isTemporary && probe.parentNode) {
      probe.parentNode.removeChild(probe);
    }

    return resolved;
  }, propertyName);
}

/**
 * Wait for the page to finish rendering and validate background conditions.
 */
async function ensurePageReady(): Promise<void> {
  await page.goto(PAGE_URL, { waitUntil: 'networkidle' });

  // Wait for required elements from Background
  await page.waitForSelector('[data-activity-type="long-run"]', { state: 'visible', timeout: 15_000 });
  await page.waitForSelector('[data-activity-type="restorative-run"]', { state: 'visible', timeout: 15_000 });
  await page.waitForSelector('[data-activity-type="intervals"]', { state: 'visible', timeout: 15_000 });
  await page.waitForSelector('[data-testid="skipped-activity-marker"]', { state: 'visible', timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Background steps
// ---------------------------------------------------------------------------

Given('the application is served at `http://localhost:3000/`', async function () {
  // Navigation is deferred to the next step to avoid double navigation
});

Given(
  'the Training Overview page at `http://localhost:3000/` has finished rendering',
  async function () {
    await ensurePageReady();
  }
);

Given(
  'the rendered Training Overview contains at least one element with `data-activity-type="long-run"`',
  async function () {
    const count = await page.locator('[data-activity-type="long-run"]').count();
    assert.ok(count >= 1, `Expected at least one [data-activity-type="long-run"], found ${count}`);
  }
);

Given(
  'the rendered Training Overview contains at least one element with `data-activity-type="restorative-run"`',
  async function () {
    const count = await page.locator('[data-activity-type="restorative-run"]').count();
    assert.ok(
      count >= 1,
      `Expected at least one [data-activity-type="restorative-run"], found ${count}`
    );
  }
);

Given(
  'the rendered Training Overview contains at least one element with `data-activity-type="intervals"`',
  async function () {
    const count = await page.locator('[data-activity-type="intervals"]').count();
    assert.ok(count >= 1, `Expected at least one [data-activity-type="intervals"], found ${count}`);
  }
);

Given(
  'the rendered Training Overview contains exactly one element with `data-testid="skipped-activity-marker"`',
  async function () {
    const count = await page.locator('[data-testid="skipped-activity-marker"]').count();
    assert.strictEqual(
      count,
      1,
      `Expected exactly one [data-testid="skipped-activity-marker"], found ${count}`
    );
  }
);

// ---------------------------------------------------------------------------
// Scenario: Dark background is applied app-wide
// ---------------------------------------------------------------------------

When(
  'the resolved colour value of the `background-color` property of the `<body>` element is computed',
  async function () {
    bodyBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    assert.ok(bodyBgColor && bodyBgColor !== '', 'body background-color is empty');
  }
);

Then(
  'its relative luminance L (per the WCAG formula in the glossary) is strictly less than 0.2',
  async function () {
    const L = relativeLuminance(bodyBgColor);
    assert.ok(
      L < 0.2,
      `Expected body background luminance < 0.2, got L = ${L.toFixed(6)} for colour "${bodyBgColor}"`
    );
  }
);

// ---------------------------------------------------------------------------
// Scenario: Theme colours are defined as CSS custom properties on the document root
// ---------------------------------------------------------------------------

Then(
  'the resolved value of `--color-activity-long-run` on `document.documentElement` is a non-empty string',
  async function () {
    const value = await page.evaluate(() =>
      window.getComputedStyle(document.documentElement).getPropertyValue('--color-activity-long-run').trim()
    );
    assert.ok(value.length > 0, '--color-activity-long-run is empty or not defined');
  }
);

Then(
  'the resolved value of `--color-activity-restorative-run` on `document.documentElement` is a non-empty string',
  async function () {
    const value = await page.evaluate(() =>
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--color-activity-restorative-run')
        .trim()
    );
    assert.ok(value.length > 0, '--color-activity-restorative-run is empty or not defined');
  }
);

Then(
  'the resolved value of `--color-activity-intervals` on `document.documentElement` is a non-empty string',
  async function () {
    const value = await page.evaluate(() =>
      window.getComputedStyle(document.documentElement).getPropertyValue('--color-activity-intervals').trim()
    );
    assert.ok(value.length > 0, '--color-activity-intervals is empty or not defined');
  }
);

Then(
  'the resolved value of `--color-activity-skipped` on `document.documentElement` is a non-empty string',
  async function () {
    const value = await page.evaluate(() =>
      window.getComputedStyle(document.documentElement).getPropertyValue('--color-activity-skipped').trim()
    );
    assert.ok(value.length > 0, '--color-activity-skipped is empty or not defined');
  }
);

Then(
  'the resolved value of `--color-background` on `document.documentElement` is a non-empty string',
  async function () {
    const value = await page.evaluate(() =>
      window.getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim()
    );
    assert.ok(value.length > 0, '--color-background is empty or not defined');
  }
);

// ---------------------------------------------------------------------------
// Scenario Outline: Each activity type renders in its own theme colour
// ---------------------------------------------------------------------------

Then(
  'every element with `data-activity-type="long-run"` has a resolved `background-color` value equal to the resolved value of the CSS custom property `--color-activity-long-run` on `document.documentElement`',
  async function () {
    await assertActivityTypeColor('long-run', '--color-activity-long-run');
  }
);

Then(
  'every element with `data-activity-type="restorative-run"` has a resolved `background-color` value equal to the resolved value of the CSS custom property `--color-activity-restorative-run` on `document.documentElement`',
  async function () {
    await assertActivityTypeColor('restorative-run', '--color-activity-restorative-run');
  }
);

Then(
  'every element with `data-activity-type="intervals"` has a resolved `background-color` value equal to the resolved value of the CSS custom property `--color-activity-intervals` on `document.documentElement`',
  async function () {
    await assertActivityTypeColor('intervals', '--color-activity-intervals');
  }
);

// Also handle the parametrised step from the Outline
Then(
  'every element with {string} has a resolved {string} value equal to the resolved value of the CSS custom property {string} on {string}',
  async function (
    _activitySelector: string,
    _bgProp: string,
    _token: string,
    _element: string
  ) {
    // This generic step is not used — the Outline generates concrete steps above
  }
);

async function assertActivityTypeColor(activityType: string, token: string): Promise<void> {
  const expectedColor = await resolveCustomProperty(token);
  assert.ok(
    expectedColor && expectedColor !== '' && expectedColor !== 'rgba(0, 0, 0, 0)',
    `Token ${token} resolved to empty or transparent: "${expectedColor}"`
  );

  const elements = page.locator(`[data-activity-type="${activityType}"]`);
  const count = await elements.count();
  assert.ok(count >= 1, `No elements found with data-activity-type="${activityType}"`);

  for (let i = 0; i < count; i++) {
    const el = elements.nth(i);
    const actualColor = await el.evaluate((node: Element) => {
      return window.getComputedStyle(node).backgroundColor;
    });
    assert.strictEqual(
      actualColor,
      expectedColor,
      `Element ${i} with data-activity-type="${activityType}": expected background-color "${expectedColor}", got "${actualColor}"`
    );
  }
}

// ---------------------------------------------------------------------------
// Scenario: Colour coding remains visible when an activity row is expanded
// ---------------------------------------------------------------------------

Given(
  'the first visible element with `data-testid="activity-row"` and `data-activity-type="long-run"` is located',
  async function () {
    // Find the first visible activity-row with data-activity-type="long-run"
    const locator = page
      .locator('[data-testid="activity-row"][data-activity-type="long-run"]')
      .first();
    await locator.waitFor({ state: 'visible', timeout: 10_000 });
    activeRow = locator;
  }
);

Given(
  'within that row, an element with `data-testid="activity-row-toggle"` is visible',
  async function () {
    assert.ok(activeRow, 'activeRow not set — run the previous Given step first');
    const toggle = activeRow.locator('[data-testid="activity-row-toggle"]');
    await toggle.waitFor({ state: 'visible', timeout: 10_000 });
  }
);

When(
  'the element with `data-testid="activity-row-toggle"` within that row is clicked',
  async function () {
    assert.ok(activeRow, 'activeRow not set');
    const toggle = activeRow.locator('[data-testid="activity-row-toggle"]');
    await toggle.click();
  }
);

Then(
  'within that same row, an element with `data-testid="activity-row-expanded"` becomes visible',
  async function () {
    assert.ok(activeRow, 'activeRow not set');
    const expanded = activeRow.locator('[data-testid="activity-row-expanded"]');
    await expanded.waitFor({ state: 'visible', timeout: 10_000 });
  }
);

Then(
  'that expanded element carries the attribute `data-activity-type="long-run"`',
  async function () {
    assert.ok(activeRow, 'activeRow not set');
    const expanded = activeRow.locator('[data-testid="activity-row-expanded"]');
    const activityType = await expanded.getAttribute('data-activity-type');
    assert.strictEqual(
      activityType,
      'long-run',
      `Expected expanded element to have data-activity-type="long-run", got "${activityType}"`
    );
  }
);

Then(
  'that expanded element has a resolved `background-color` value equal to the resolved value of the CSS custom property `--color-activity-long-run` on `document.documentElement`',
  async function () {
    assert.ok(activeRow, 'activeRow not set');
    const expectedColor = await resolveCustomProperty('--color-activity-long-run');
    assert.ok(
      expectedColor && expectedColor !== '' && expectedColor !== 'rgba(0, 0, 0, 0)',
      `--color-activity-long-run resolved to empty or transparent: "${expectedColor}"`
    );

    const expanded = activeRow.locator('[data-testid="activity-row-expanded"]');
    const actualColor = await expanded.evaluate((node: Element) => {
      return window.getComputedStyle(node).backgroundColor;
    });

    assert.strictEqual(
      actualColor,
      expectedColor,
      `Expanded row background-color mismatch: expected "${expectedColor}", got "${actualColor}"`
    );
  }
);

// ---------------------------------------------------------------------------
// Scenario: Sickness-week skipped marker has its own distinct visual treatment
// ---------------------------------------------------------------------------

Then(
  'the element with `data-testid="skipped-activity-marker"` is visible',
  async function () {
    const marker = page.locator('[data-testid="skipped-activity-marker"]');
    await marker.waitFor({ state: 'visible', timeout: 10_000 });
    const box = await marker.boundingBox();
    assert.ok(box && box.width > 0 && box.height > 0, 'skipped-activity-marker is not visible (zero bounding box)');
  }
);

Then(
  'that element has a resolved `background-color` value equal to the resolved value of the CSS custom property `--color-activity-skipped` on `document.documentElement`',
  async function () {
    const expectedColor = await resolveCustomProperty('--color-activity-skipped');
    assert.ok(
      expectedColor && expectedColor !== '' && expectedColor !== 'rgba(0, 0, 0, 0)',
      `--color-activity-skipped resolved to empty or transparent: "${expectedColor}"`
    );

    const marker = page.locator('[data-testid="skipped-activity-marker"]');
    const actualColor = await marker.evaluate((node: Element) => {
      return window.getComputedStyle(node).backgroundColor;
    });

    assert.strictEqual(
      actualColor,
      expectedColor,
      `Skipped marker background-color mismatch: expected "${expectedColor}", got "${actualColor}"`
    );
  }
);

Then(
  'that element does NOT carry a `data-activity-type` attribute',
  async function () {
    const marker = page.locator('[data-testid="skipped-activity-marker"]');
    const activityType = await marker.getAttribute('data-activity-type');
    assert.strictEqual(
      activityType,
      null,
      `Expected skipped-activity-marker to have no data-activity-type, but found "${activityType}"`
    );
  }
);

// ---------------------------------------------------------------------------
// Scenario: All four activity-related theme colours resolve to pairwise distinct values
// ---------------------------------------------------------------------------

When(
  'the resolved values of `--color-activity-long-run`, `--color-activity-restorative-run`, `--color-activity-intervals`, and `--color-activity-skipped` on `document.documentElement` are collected, each normalised to canonical `rgb(...)` / `rgba(...)` form via the hidden-probe technique described in the glossary',
  async function () {
    const tokens = [
      '--color-activity-long-run',
      '--color-activity-restorative-run',
      '--color-activity-intervals',
      '--color-activity-skipped',
    ];

    for (const token of tokens) {
      resolvedTokens[token] = await resolveCustomProperty(token);
    }
  }
);

Then(
  'the four resulting canonical strings are pairwise unequal (string equality, no further normalisation)',
  async function () {
    const tokens = [
      '--color-activity-long-run',
      '--color-activity-restorative-run',
      '--color-activity-intervals',
      '--color-activity-skipped',
    ];

    const values = tokens.map((t) => {
      const v = resolvedTokens[t];
      assert.ok(
        v && v !== '' && v !== 'rgba(0, 0, 0, 0)',
        `Token ${t} resolved to empty or transparent: "${v}"`
      );
      return { token: t, value: v };
    });

    // Check all 6 pairs
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        assert.notStrictEqual(
          values[i].value,
          values[j].value,
          `Tokens ${values[i].token} and ${values[j].token} both resolved to "${values[i].value}" — they must be pairwise distinct`
        );
      }
    }
  }
);