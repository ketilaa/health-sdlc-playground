## Outer Iteration 1

I'll systematically review each Gherkin scenario, the implementation, tests, scripts, and security checklist.

---

## 1. Script Verification

### `run-tests.sh`
```bash
#!/usr/bin/env bash
set -e
cd frontend
npm install
npm audit --audit-level=high || echo "npm audit reported issues; continuing"
npm test -- --watchAll=false --forceExit
```
- File exists, is readable. The `|| echo` means audit failures don't block — this is acceptable per the skill template.
- **Executable bit**: Cannot verify filesystem permissions from content alone, but the developer declared it executable and the file has a valid shebang. I'll flag this as requiring verification but not as a blocking stop unless there's evidence it's missing.

### `run-e2e.sh`
Exists and is readable. However, it references `runner-dataset-with-consistent-improvement/**/*.steps.ts` and `'../features/runner-dataset-with-consistent-improvement/**/*.feature'` — this is the **wrong feature name**. For the `visual-theme-overhaul` feature, the e2e script should reference `visual-theme-overhaul`. This is a pre-existing script from a different feature and does not cover visual-theme-overhaul scenarios. However, the Gherkin spec says "Unit/integration tests" are the primary test vehicle here (no E2E Cucumber steps were written), and the scope is `frontend` with `run-tests.sh` as the primary test runner. The `run-e2e.sh` is a pre-existing file not modified by this feature. I'll note it but it is not directly a blocking failure for *this* feature's coverage.

---

## 2. Gherkin Scenario Coverage

### Background Preconditions
- `data-activity-type="long-run"` present: ✅ `TrainingOverview` renders `ActivityRow` with `data-activity-type={kind}` where `kind='long-run'` for Long run activities. Dataset has Long run in weeks 1–8.
- `data-activity-type="restorative-run"` present: ✅
- `data-activity-type="intervals"` present: ✅
- `exactly one element with data-testid="skipped-activity-marker"`: ✅ Week 4 is the only week with `skipped`, and `SkippedMarker` renders once.
- Background test in `VisualTheme.test.tsx`: ✅ covered by the first test.

### Scenario: Dark background is applied app-wide
**Gherkin:** `background-color` of `<body>` has WCAG luminance < 0.2.

**Test in `VisualTheme.test.tsx`:**
```js
test('Dark body background — WCAG luminance < 0.2', () => {
  document.body.style.backgroundColor = themeTokens['--color-background']
  const bg = window.getComputedStyle(document.body).backgroundColor
  expect(computeLuminance(bg)).toBeLessThan(0.2)
})
```

**Issue:** This test manually sets `document.body.style.backgroundColor = themeTokens['--color-background']` and then reads it back. It is **not** verifying that the application actually applies the dark background to `<body>` — it's verifying that the token value itself has low luminance. The Gherkin says "the resolved colour value of the `background-color` property of the `<body>` element is computed" *after* the page has rendered. This test would pass even if the implementation never set the body background at all.

The implementation does set it in `layout.tsx` via both a `<style>` block and an inline `style` prop on `<body>`. However, `RootLayout` renders `<html><body>`, which in jsdom when nested inside a test container doesn't actually become `document.body`. The test bypasses this by directly setting `document.body.style.backgroundColor` — making the test trivially pass regardless of implementation correctness.

**Verdict: The test does not meaningfully assert the Gherkin requirement.** This is a test quality issue — the test is not asserting real behavior.

Additionally, in `tokens.test.ts`:
```js
test('background luminance is below 0.2 (WCAG)', () => { ... })
```
This tests the *token value* directly, not the rendered body element. It has no relation to whether the body element actually receives that color.

### Scenario: Theme colours are defined as CSS custom properties on the document root
**Gherkin:** `--color-activity-long-run`, `--color-activity-restorative-run`, `--color-activity-intervals`, `--color-activity-skipped`, `--color-background` resolve to non-empty strings on `document.documentElement`.

**Test:**
```js
test('Theme custom properties resolve to non-empty values on documentElement', () => {
  const root = document.documentElement
  root.style.setProperty('--color-activity-long-run', themeTokens['--color-activity-long-run'])
  // ... sets all properties manually ...
  const cs = window.getComputedStyle(root)
  expect(cs.getPropertyValue('--color-activity-long-run').trim()).not.toBe('')
  // ...
})
```

**Issue:** The test *manually sets* the properties on `document.documentElement` before reading them. This is circular — it will always pass regardless of whether `layout.tsx` or any component actually injects these properties. The Gherkin requires that the *application* defines these tokens on the root. The test doesn't render the application and verify the properties are present; it sets them and reads them back.

**Verdict: The test does not meaningfully assert the Gherkin requirement.**

### Scenario Outline: Each activity type renders in its own theme colour
**Gherkin:** every element with `data-activity-type="<type>"` has `background-color` equal to the resolved value of `<token>` on `document.documentElement`.

**Test:**
```js
test.each([
  ['long-run', themeTokens['--color-activity-long-run']],
  ...
])(
  'every activity row of type %s has background-color equal to its token',
  async (type, expected) => {
    renderWithLayout()
    await loaded()
    const els = screen.getAllByTestId('activity-row')
      .filter((el) => el.getAttribute('data-activity-type') === type)
    for (const el of els) {
      expect(window.getComputedStyle(el).backgroundColor).toBe(expected)
    }
  }
)
```

The `renderWithLayout()` function sets the CSS custom properties manually on `document.documentElement` AND sets `document.body.style.backgroundColor`. The test then checks that `getComputedStyle(el).backgroundColor` equals the hardcoded token value.

**Analysis:** The implementation uses `style={{ backgroundColor: bg }}` inline on activity rows where `bg = activityTokenFor(kind)` which returns the canonical `rgb(...)` string. jsdom will report this as the computed `backgroundColor`. This test is **valid** and meaningful because it actually renders the component and verifies the rendered element has the correct inline backgroundColor.

However, the comparison is against `themeTokens['--color-activity-long-run']` (the hardcoded value) rather than resolving the CSS custom property from `document.documentElement`. The Gherkin says "equal to the resolved value of the CSS custom property `<token>` on `document.documentElement`". In `renderWithLayout()`, the test sets the CSS properties on the root equal to `themeTokens[...]`, so the comparison is effectively the same. **This test is acceptable for the inline-style approach.**

### Scenario: Colour coding remains visible when an activity row is expanded
**Gherkin:** click toggle on first long-run row, expanded panel appears with `data-activity-type="long-run"` and matching background color.

**Test:**
```js
test('Expanded activity-row keeps its activity-type colour', async () => {
  const user = userEvent.setup()
  renderWithLayout()
  await loaded()
  const longRunRow = screen.getAllByTestId('activity-row')
    .find((el) => el.getAttribute('data-activity-type') === 'long-run')!
  const toggle = within(longRunRow).getByTestId('activity-row-toggle')
  await user.click(toggle)
  const expanded = within(longRunRow).getByTestId('activity-row-expanded')
  expect(expanded).toBeVisible()
  expect(expanded.getAttribute('data-activity-type')).toBe('long-run')
  expect(window.getComputedStyle(expanded).backgroundColor).toBe(
    themeTokens['--color-activity-long-run']
  )
})
```

**Implementation:** `ActivityRow` renders an `activity-row-expanded` div with `data-activity-type={kind}` and `style={{ backgroundColor: bg }}` when expanded. ✅

**Verdict: Valid test, correctly covers the scenario.**

**One issue:** The Gherkin says "the first visible element with `data-testid="activity-row"` and `data-activity-type="long-run"` is located" and "within that row, an element with `data-testid="activity-row-toggle"` is visible". The test doesn't check that the toggle is visible before clicking, but this is a minor testing completeness issue, not a blocking structural problem.

### Scenario: Sickness-week skipped marker has its own distinct visual treatment
**Gherkin:** skipped marker is visible, has `background-color` equal to `--color-activity-skipped`, does NOT carry `data-activity-type`.

**Test:**
```js
test('Skipped marker uses --color-activity-skipped and carries no data-activity-type', async () => {
  renderWithLayout()
  await loaded()
  const marker = screen.getByTestId('skipped-activity-marker')
  expect(marker).toBeVisible()
  expect(window.getComputedStyle(marker).backgroundColor).toBe(
    themeTokens['--color-activity-skipped']
  )
  expect(marker.hasAttribute('data-activity-type')).toBe(false)
})
```

**Implementation:** `SkippedMarker` renders with `style={{ backgroundColor: themeTokens['--color-activity-skipped'] }}` and no `data-activity-type`. ✅

**Verdict: Valid test, correctly covers the scenario.**

### Scenario: All four activity-related theme colours resolve to pairwise distinct values
**Gherkin:** collect resolved values of all four tokens, normalize via hidden-probe technique, assert pairwise unequal.

**Test:**
```js
test('All four activity-related tokens are pairwise unequal (canonical form)', () => {
  const values = [
    themeTokens['--color-activity-long-run'],
    themeTokens['--color-activity-restorative-run'],
    themeTokens['--color-activity-intervals'],
    themeTokens['--color-activity-skipped'],
  ]
  expect(new Set(values).size).toBe(4)
})
```

**Issue:** The Gherkin says to collect "the resolved values of `--color-activity-long-run`, etc. on `document.documentElement`" and normalize "via the hidden-probe technique described in the glossary". The test directly reads from `themeTokens` (a hardcoded TypeScript object) without going through `document.documentElement` or any probe. While the values are already canonical `rgb(...)` strings, the test bypasses the rendering environment entirely.

This is a **meaningful test** in the sense that if the token values change to be duplicates, the test fails. However, it doesn't test that the application actually registers these on `document.documentElement` or that a probe technique would resolve them correctly. It's a unit test on the token module, not a behavioral test of the rendered page.

**Verdict: Acceptable in terms of correctness checking (the four values ARE distinct), but doesn't follow the Gherkin's "via hidden-probe technique" instruction.**

---

## 3. Critical Issues Found

### BLOCKING ISSUE #1: Two tests are trivially self-validating, not testing application behavior

**"Dark body background" test** (Scenario: Dark background is applied app-wide):
- Sets `document.body.style.backgroundColor = themeTokens['--color-background']` manually
- Reads it back
- **This always passes regardless of whether the application sets the body background**
- The Gherkin requires the application renders and the body gets its dark background from that rendering

**"Theme custom properties" test** (Scenario: Theme colours are defined as CSS custom properties on the document root):
- Sets all five CSS custom properties manually on `document.documentElement`
- Reads them back
- **This always passes regardless of whether `layout.tsx` or any component injects these properties**
- The Gherkin requires the application (served page) defines these on `:root`

Both these tests would pass even if `layout.tsx` was completely empty. This violates the requirement that "Tests are meaningful: they assert real behavior, not trivially pass."

### BLOCKING ISSUE #2: `data-testid="week-total-distance"` elements rendered off-screen without Gherkin backing

In `WeekSection` in `TrainingOverview.tsx`:
```jsx
<div data-testid="week-total-distance" style={{ position: 'absolute', left: -9999 }}>
  {week.activities.reduce((s, a) => s + a.distanceKm, 0).toFixed(1)} km
</div>
<div data-testid="week-total-duration" style={{ position: 'absolute', left: -9999 }}>
  {formatDuration(week.activities.reduce((s, a) => s + a.durationMinutes, 0))}
</div>
<div data-testid="week-activity-count" style={{ position: 'absolute', left: -9999 }}>
  {week.activities.length} activities
</div>
```

These three hidden elements (`week-total-distance`, `week-total-duration`, `week-activity-count`) are rendered but have no corresponding Gherkin scenario. Per the review instructions: "No implementation exists without a corresponding Gherkin scenario — flag any data, UI state, route, or behavior that has no Gherkin backing as a blocking failure; placeholder datasets, stub arrays, speculative UI states, and 'future extension' content all fall into this category."

These are "speculative UI states" hidden off-screen. They add UI state and DOM elements without any Gherkin scenario backing.

### BLOCKING ISSUE #3: `fixtureDataset.isTestFixture = true` but `getSelectableDatasets()` returns empty array

The `datasets.ts` marks `fixtureDataset.isTestFixture = true` and `getSelectableDatasets()` filters out `isTestFixture` datasets, so it returns an empty array. The test `'selectable datasets exclude anything labeled Test Fixture'` passes trivially (empty array, forEach loop doesn't execute). The `DatasetSelector` in `TrainingOverview.tsx` renders an empty `<ul>` when opened.

**More critically:** There is no Gherkin scenario that says the dataset selector should have selectable options. However, the TrainingOverview test says "dataset selector dropdown does not list any option containing 'Test Fixture'" — which passes because the list is empty. This is a pre-existing concern from the prior feature but warrants noting.

This is NOT a new blocking issue introduced by this feature — it pre-exists and the Gherkin doesn't contradict it.

### BLOCKING ISSUE #4: `run-e2e.sh` references wrong feature

`run-e2e.sh` references `runner-dataset-with-consistent-improvement` step definitions and feature files. This script, if run for visual-theme-overhaul, will not execute any visual-theme-overhaul scenarios. However, since no E2E Cucumber steps were written for visual-theme-overhaul (the implementation relies solely on Jest tests), and the `run-e2e.sh` pre-existed this feature, this is a pre-existing issue not introduced by this PR. Still, the reviewer instructions say to verify `run-e2e.sh` if present — and it cannot be called "executable" for this feature.

---

## 4. Security Checklist

- **Injection:** `layout.tsx` uses `dangerouslySetInnerHTML={{ __html: rootCss }}` where `rootCss` is constructed from `themeTokens` — hardcoded constants in `tokens.ts`, never user-controlled. No injection risk. ✅
- **Secrets:** No hardcoded API keys, tokens, or passwords. ✅
- **Dependencies:** No new packages added beyond what's in `package.json`. All packages are standard (MUI, Next.js, testing-library). ✅
- **Auth bypass:** No auth exists