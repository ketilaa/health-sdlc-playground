import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext, APIRequestContext, request as playwrightRequest } from 'playwright';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

setDefaultTimeout(30_000);

// ---------------------------------------------------------------------------
// Determine base URL — honours APP_URL env var for basePath deployments
// ---------------------------------------------------------------------------
const APP_URL = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

// ---------------------------------------------------------------------------
// Shared state (reset per scenario)
// ---------------------------------------------------------------------------
let browser: Browser;
let context: BrowserContext;
let page: Page;
let apiContext: APIRequestContext;
let lastResponse: Awaited<ReturnType<APIRequestContext['get']>> | null = null;

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
Before(async function () {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
  page = await context.newPage();
  apiContext = await playwrightRequest.newContext({
    baseURL: APP_URL,
    // Do NOT follow redirects — some scenarios need the raw response
    // Individual steps override this per-request
  });
  lastResponse = null;
});

After(async function () {
  await page.close().catch(() => { /* ignore */ });
  await context.close().catch(() => { /* ignore */ });
  await browser.close().catch(() => { /* ignore */ });
  await apiContext.dispose().catch(() => { /* ignore */ });
});

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------
Given('the repository is checked out', function () {
  // Structural — verified by test execution environment
});

Given('the development server is running at {string}', function (_url: string) {
  // Verified implicitly — if the server is down, subsequent steps will fail
});

// ---------------------------------------------------------------------------
// Viewport setup (Scenario 6)
// ---------------------------------------------------------------------------
Given('the browser viewport is set to {int} pixels wide and {int} pixels tall', async function (width: number, height: number) {
  await page.setViewportSize({ width, height });
});

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
When('the user navigates to {string}', async function (url: string) {
  // Resolve relative URLs against APP_URL
  const target = url.startsWith('http') ? url : `${APP_URL}${url}`;
  lastResponse = await page.goto(target, { waitUntil: 'networkidle' }) as any;
});

When('the user navigates directly to {string} without following redirects', async function (url: string) {
  const target = url.startsWith('http') ? url : `${APP_URL}${url}`;
  // Use API context so we control redirect behaviour
  const reqContext = await playwrightRequest.newContext({
    baseURL: APP_URL,
  });
  try {
    lastResponse = await reqContext.get(target, {
      maxRedirects: 0,
      // Playwright request: maxRedirects:0 → do not follow any redirect
    });
  } finally {
    // Keep reqContext alive for the assertion step; dispose in After via outer apiContext
    // Stash it on `this` world if needed — for simplicity store in module-level var
    // (single-scenario isolation is guaranteed by Before/After lifecycle)
    apiContext = reqContext;
  }
});

// ---------------------------------------------------------------------------
// HTTP status assertions
// ---------------------------------------------------------------------------
Then('the page returns HTTP status {int}', async function (expectedStatus: number) {
  // page.goto() resolves to the final response
  const response = await page.goto(page.url(), { waitUntil: 'networkidle' });
  const status = response?.status() ?? -1;
  assert.strictEqual(
    status,
    expectedStatus,
    `Expected HTTP ${expectedStatus} but got ${status} for ${page.url()}`
  );
});

Then('the response HTTP status is {int}', async function (expectedStatus: number) {
  assert.ok(lastResponse !== null, 'No HTTP response was captured — ensure a "When" step made a request');
  const status = lastResponse!.status();
  assert.strictEqual(
    status,
    expectedStatus,
    `Expected HTTP status ${expectedStatus} but got ${status}`
  );
});

// ---------------------------------------------------------------------------
// Redirect assertions (Scenario 3)
// ---------------------------------------------------------------------------
Then('the response Location header is {string}', async function (expectedLocation: string) {
  assert.ok(lastResponse !== null, 'No HTTP response captured');
  const location = lastResponse!.headers()['location'] ?? '';
  assert.strictEqual(
    location,
    expectedLocation,
    `Expected Location header "${expectedLocation}" but got "${location}"`
  );
});

// ---------------------------------------------------------------------------
// Text visibility assertions
// ---------------------------------------------------------------------------
Then('the text {string} is visible on the page', async function (text: string) {
  await page.waitForFunction(
    (t: string) => document.body.innerText.includes(t),
    text,
    { timeout: 10_000 }
  );
  const visible = await page.isVisible(`text=${text}`);
  assert.ok(visible, `Expected text "${text}" to be visible on the page`);
});

// ---------------------------------------------------------------------------
// Element presence / absence assertions
// ---------------------------------------------------------------------------
Then('no element with data-testid {string} is present on the page', async function (testId: string) {
  const count = await page.locator(`[data-testid="${testId}"]`).count();
  assert.strictEqual(
    count,
    0,
    `Expected no element with data-testid="${testId}" but found ${count}`
  );
});

// ---------------------------------------------------------------------------
// URL assertion (Scenario 4)
// ---------------------------------------------------------------------------
Then("the browser's final URL is {string}", async function (expectedUrl: string) {
  // Wait for navigation to settle
  await page.waitForLoadState('networkidle');
  const finalUrl = page.url();
  // Normalise trailing slash for comparison
  const normalise = (u: string) => u.replace(/\/$/, '');
  assert.strictEqual(
    normalise(finalUrl),
    normalise(expectedUrl),
    `Expected final URL "${expectedUrl}" but browser is at "${finalUrl}"`
  );
});

// ---------------------------------------------------------------------------
// File system assertion (Scenario 5)
// ---------------------------------------------------------------------------
Then('the file {string} does not exist', function (filePath: string) {
  // Resolve relative to repo root (process.cwd() when run from e2e/ is e2e/,
  // so we go up one level)
  const repoRoot = path.resolve(__dirname, '..', '..');
  const absPath = path.resolve(repoRoot, filePath);
  const exists = fs.existsSync(absPath);
  assert.ok(
    !exists,
    `Expected file "${filePath}" to not exist but it was found at "${absPath}"`
  );
});

// ---------------------------------------------------------------------------
// Horizontal overflow assertion (Scenario 6)
// ---------------------------------------------------------------------------
Then('the element with data-testid {string} does not cause a horizontal scrollbar on the page', async function (testId: string) {
  // Verify the container itself exists
  await page.waitForSelector(`[data-testid="${testId}"]`, { timeout: 10_000 });

  const overflows = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    return { docWidth, winWidth, overflows: docWidth > winWidth };
  });

  assert.ok(
    !overflows.overflows,
    `Horizontal overflow detected: document.documentElement.scrollWidth (${overflows.docWidth}px) > window.innerWidth (${overflows.winWidth}px)`
  );
});