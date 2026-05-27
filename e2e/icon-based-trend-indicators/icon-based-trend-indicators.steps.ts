import { Before, After, BeforeAll, AfterAll, Given, When, Then } from '@cucumber/cucumber'
import { Browser, BrowserContext, Page, chromium } from 'playwright'
import assert from 'assert'

const APP_URL = process.env.APP_URL || 'http://localhost:3000'
const BASE_PATH = '/health-sdlc-playground'

function resolveUrl(raw: string): string {
  return raw.replace('http://localhost:3000/', `${APP_URL}${BASE_PATH}/`)
}

let browser: Browser
let context: BrowserContext
let page: Page

BeforeAll(async () => {
  browser = await chromium.launch({ headless: true })
})

AfterAll(async () => {
  await browser.close()
})

Before(async () => {
  context = await browser.newContext()
  page = await context.newPage()
})

After(async () => {
  await context.close()
})

// Background steps

Given('the application is running at {string}', async (_url: string) => {
  // No-op: the app is assumed to be running; navigation happens in When steps
})

Given('the test fixture dataset is loaded', async () => {
  // No-op: fixture data is compiled into the JS bundle at build time
})

// Navigation

When('the user navigates to {string}', async (rawUrl: string) => {
  const url = resolveUrl(rawUrl)
  await page.goto(url)
  // Wait for week rows to be present before proceeding
  await page.locator('[data-testid="week-row"]').first().waitFor({ state: 'visible', timeout: 15000 })
})

// Scenario 1: Metric icons always visible in all collapsed week rows

Then(
  'each element with data-testid {string} contains an element with data-testid {string}',
  async (containerTestId: string, childTestId: string) => {
    const containers = page.locator(`[data-testid="${containerTestId}"]`)
    const count = await containers.count()
    assert.ok(count > 0, `Expected at least one element with data-testid="${containerTestId}" but found none`)

    for (let i = 0; i < count; i++) {
      const container = containers.nth(i)
      const child = container.locator(`[data-testid="${childTestId}"]`)
      const childCount = await child.count()
      assert.strictEqual(
        childCount,
        1,
        `Expected element #${i} with data-testid="${containerTestId}" to contain data-testid="${childTestId}" but it did not`
      )
    }
  }
)

// Scenario 2 & 3 (presence): trend icon present within specific week row

Then(
  'the element with data-testid {string} within the element with data-testid {string} containing the text {string} contains an element with data-testid {string}',
  async (
    innerContainerTestId: string,
    weekRowTestId: string,
    weekText: string,
    childTestId: string
  ) => {
    const weekRow = page.locator(`[data-testid="${weekRowTestId}"]`, { hasText: weekText })
    await weekRow.waitFor({ state: 'visible', timeout: 10000 })

    const innerContainer = weekRow.locator(`[data-testid="${innerContainerTestId}"]`)
    await innerContainer.waitFor({ state: 'visible', timeout: 5000 })

    const child = innerContainer.locator(`[data-testid="${childTestId}"]`)
    const childCount = await child.count()
    assert.strictEqual(
      childCount,
      1,
      `Expected [data-testid="${innerContainerTestId}"] within week-row "${weekText}" to contain [data-testid="${childTestId}"] but found ${childCount}`
    )
  }
)

// Scenario 3 (absence): trend icon NOT present within specific week row

Then(
  'the element with data-testid {string} within the element with data-testid {string} containing the text {string} does not contain an element with data-testid {string}',
  async (
    innerContainerTestId: string,
    weekRowTestId: string,
    weekText: string,
    childTestId: string
  ) => {
    const weekRow = page.locator(`[data-testid="${weekRowTestId}"]`, { hasText: weekText })
    await weekRow.waitFor({ state: 'visible', timeout: 10000 })

    const innerContainer = weekRow.locator(`[data-testid="${innerContainerTestId}"]`)
    await innerContainer.waitFor({ state: 'visible', timeout: 5000 })

    const child = innerContainer.locator(`[data-testid="${childTestId}"]`)
    const childCount = await child.count()
    assert.strictEqual(
      childCount,
      0,
      `Expected [data-testid="${innerContainerTestId}"] within week-row "${weekText}" NOT to contain [data-testid="${childTestId}"] but found ${childCount}`
    )
  }
)

// Scenarios 4, 5, 6: aria-label assertions on trend containers within specific week rows

Then(
  'the element with data-testid {string} within the element with data-testid {string} containing the text {string} has aria-label {string}',
  async (
    innerContainerTestId: string,
    weekRowTestId: string,
    weekText: string,
    expectedAriaLabel: string
  ) => {
    const weekRow = page.locator(`[data-testid="${weekRowTestId}"]`, { hasText: weekText })
    await weekRow.waitFor({ state: 'visible', timeout: 10000 })

    const innerContainer = weekRow.locator(`[data-testid="${innerContainerTestId}"]`)
    await innerContainer.waitFor({ state: 'visible', timeout: 5000 })

    const actualAriaLabel = await innerContainer.getAttribute('aria-label')
    assert.strictEqual(
      actualAriaLabel,
      expectedAriaLabel,
      `Expected [data-testid="${innerContainerTestId}"] within week-row "${weekText}" to have aria-label="${expectedAriaLabel}" but got "${actualAriaLabel}"`
    )
  }
)