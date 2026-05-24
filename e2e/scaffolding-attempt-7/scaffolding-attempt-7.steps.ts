import {
  Given,
  When,
  Then,
  Before,
  After,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { chromium, request as playwrightRequest } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';
import type { ScaffoldingWorld } from './world';

setDefaultTimeout(60_000);

// ---------------------------------------------------------------------------
// Before / After hooks — browser lifecycle
// ---------------------------------------------------------------------------

Before(async function (this: ScaffoldingWorld) {
  this.appUrl = process.env.APP_URL || 'http://localhost:3000';
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.apiContext = await playwrightRequest.newContext({
    baseURL: this.appUrl,
  });
  this.lastResponse = null;
  this.lastBuildExitCode = -1;
});

After(async function (this: ScaffoldingWorld) {
  await this.apiContext.dispose();
  await this.context.close();
  await this.browser.close();
});

// ---------------------------------------------------------------------------
// Background steps
// ---------------------------------------------------------------------------

Given('the repository is checked out', function (this: ScaffoldingWorld) {
  // Structural assertion: the frontend directory must exist at the expected path.
  const fs = require('fs');
  const frontendDir = path.resolve(process.cwd(), '..', 'frontend');
  if (!fs.existsSync(frontendDir)) {
    throw new Error(
      `Expected repository to be checked out with a "frontend/" directory at ${frontendDir}`
    );
  }
});

Given(
  'dependencies have been installed with {string}',
  function (this: ScaffoldingWorld, _command: string) {
    // Dependencies are installed in run-e2e.sh before the server starts.
    // Structural check: node_modules must exist inside frontend/.
    const fs = require('fs');
    const nodeModules = path.resolve(
      process.cwd(),
      '..',
      'frontend',
      'node_modules'
    );
    if (!fs.existsSync(nodeModules)) {
      throw new Error(
        `Expected "frontend/node_modules" to exist after running ${_command}. ` +
          `Found none at ${nodeModules}.`
      );
    }
  }
);

// ---------------------------------------------------------------------------
// Scenario: The application builds successfully
// ---------------------------------------------------------------------------

When(
  'the command {string} is executed',
  function (this: ScaffoldingWorld, command: string) {
    const frontendDir = path.resolve(process.cwd(), '..', 'frontend');
    try {
      execSync(command, {
        cwd: frontendDir,
        stdio: 'pipe',
        encoding: 'utf-8',
      });
      this.lastBuildExitCode = 0;
    } catch (err: any) {
      this.lastBuildExitCode = err.status ?? 1;
    }
  }
);

Then(
  'the command exits with code {int}',
  function (this: ScaffoldingWorld, expectedCode: number) {
    if (this.lastBuildExitCode !== expectedCode) {
      throw new Error(
        `Expected command to exit with code ${expectedCode} but got ${this.lastBuildExitCode}.`
      );
    }
  }
);

// ---------------------------------------------------------------------------
// Scenario: The home page is served successfully
// Scenario: Requesting a non-existent route returns a 404
// ---------------------------------------------------------------------------

Given(
  'the application has been built with {string}',
  function (this: ScaffoldingWorld, _command: string) {
    // Build is performed by run-e2e.sh before the server starts.
    // Structural check: .next directory should exist.
    const fs = require('fs');
    const nextDir = path.resolve(process.cwd(), '..', 'frontend', '.next');
    const outDir = path.resolve(process.cwd(), '..', 'frontend', 'out');
    const buildExists = fs.existsSync(nextDir) || fs.existsSync(outDir);
    if (!buildExists) {
      throw new Error(
        `Expected a build artifact (.next/ or out/) after running "${_command}" but found none.`
      );
    }
  }
);

Given(
  'the application is running',
  async function (this: ScaffoldingWorld) {
    // Verify the application is actually reachable before proceeding.
    const response = await this.apiContext.get('/');
    // Any HTTP response (including 4xx) means the server is up.
    const status = response.status();
    if (status === 0 || status === undefined) {
      throw new Error(
        `Application at ${this.appUrl} is not reachable. Ensure the server is running.`
      );
    }
  }
);

When(
  'an HTTP GET request is made to the path {string} on the running application',
  async function (this: ScaffoldingWorld, urlPath: string) {
    this.lastResponse = await this.apiContext.get(urlPath);
  }
);

Then(
  'the response has HTTP status {int}',
  async function (this: ScaffoldingWorld, expectedStatus: number) {
    if (!this.lastResponse) {
      throw new Error('No HTTP response recorded. Was the GET step executed?');
    }
    const actual = this.lastResponse.status();
    if (actual !== expectedStatus) {
      throw new Error(
        `Expected HTTP status ${expectedStatus} but received ${actual} ` +
          `for URL ${this.lastResponse.url()}.`
      );
    }
  }
);

// ---------------------------------------------------------------------------
// Scenario: The top bar displays the application title
// Scenario: The top bar contains a placeholder for the future dataset selector
// ---------------------------------------------------------------------------

When(
  'a browser loads the path {string}',
  async function (this: ScaffoldingWorld, urlPath: string) {
    const fullUrl = `${this.appUrl}${urlPath}`;
    await this.page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
  }
);

Then(
  'an element with data-testid {string} is visible on the page',
  async function (this: ScaffoldingWorld, testId: string) {
    const locator = this.page.locator(`[data-testid="${testId}"]`);
    await locator.waitFor({ state: 'visible', timeout: 15_000 });
    const isVisible = await locator.isVisible();
    if (!isVisible) {
      throw new Error(
        `Expected element with data-testid="${testId}" to be visible but it was not.`
      );
    }
  }
);

Then(
  'the text {string} is visible inside the element with data-testid {string}',
  async function (
    this: ScaffoldingWorld,
    expectedText: string,
    testId: string
  ) {
    const container = this.page.locator(`[data-testid="${testId}"]`);
    await container.waitFor({ state: 'visible', timeout: 15_000 });

    // Wait until the text appears somewhere inside the container.
    await this.page.waitForFunction(
      ({ selector, text }: { selector: string; text: string }) => {
        const el = document.querySelector(selector);
        return el ? el.textContent?.includes(text) : false;
      },
      { selector: `[data-testid="${testId}"]`, text: expectedText },
      { timeout: 15_000 }
    );

    const innerText = await container.textContent();
    if (!innerText?.includes(expectedText)) {
      throw new Error(
        `Expected to find text "${expectedText}" inside [data-testid="${testId}"] ` +
          `but found: "${innerText}".`
      );
    }
  }
);

Then(
  'an element with data-testid {string} exists inside the element with data-testid {string}',
  async function (
    this: ScaffoldingWorld,
    childTestId: string,
    parentTestId: string
  ) {
    const parent = this.page.locator(`[data-testid="${parentTestId}"]`);
    await parent.waitFor({ state: 'attached', timeout: 15_000 });

    const child = parent.locator(`[data-testid="${childTestId}"]`);
    await child.waitFor({ state: 'attached', timeout: 15_000 });

    const count = await child.count();
    if (count === 0) {
      throw new Error(
        `Expected element with data-testid="${childTestId}" to exist ` +
          `inside [data-testid="${parentTestId}"] but it was not found.`
      );
    }
  }
);