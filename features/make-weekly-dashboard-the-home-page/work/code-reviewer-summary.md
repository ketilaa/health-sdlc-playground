## Outer Iteration 1

STATUS: STOP

---

## Code Reviewer Summary

**Status:** STOP

**Input summary:** Scope: `frontend`. Files examined: all 7 Gherkin scenarios, UX specification, developer summary, `run-tests.sh`, and all implementation/test files listed above.

---

### Interpretation

- The app uses Next.js static export (`output: 'export'`) served by `npx serve` with a `serve.json` redirect file.
- HTTP-status and browser-redirect assertions (Scenarios 1, 3, 4, 7) are deferred to E2E with explicit notes in the developer summary — this is acceptable per the evidence rule.
- Scenario 6's `scrollWidth === innerWidth` assertion is deferred to E2E with an explicit note — also acceptable.
- Pre-existing tests for `WeeklyDashboard`, `weeklyDashboardData`, `datasets`, `format`, `tokens`, `layout`, and `VisualTheme` are carried over from prior features and are **not** subject to this review unless modified by this feature.

---

### Decisions — Findings

#### BLOCKING: Scenario 6 viewport GIVEN not satisfied and deferral note is inadequate

**Gherkin Scenario 6:**
```gherkin
Given the browser viewport is set to 390 pixels wide and 844 pixels tall
When the user navigates to "http://localhost:3000/"
Then the page returns HTTP status 200
And the element with data-testid "weekly-dashboard-container" does not cause a horizontal scrollbar on the page
```

The GIVEN explicitly sets a **viewport constraint** (390 × 844 px). Per the review rules:

> Any Gherkin scenario whose GIVEN includes a viewport width, device type, or rendering-environment constraint must either (a) have a unit test that actually sets that constraint, or (b) have an explicit "deferred to E2E" note in the developer summary.

The unit test in `WeeklyDashboard.test.tsx` ("weekly-dashboard-container has overflow-x:hidden and max-width:100% (Scenario 6)") sets `window.innerWidth = 390` but does **not** set `window.innerHeight = 844`. More critically, it only checks inline CSS property values (`container.style.overflowX`, `container.style.maxWidth`, `container.style.boxSizing`) — it does not measure actual layout (JSDOM does not perform layout), and does not configure the full viewport to 390 × 844. This is not option (a).

The developer summary's E2E deferral table for Scenario 6 says:
> "Requires real browser viewport; JSDOM does not compute layout/scrollWidth"

This is a **partial** deferral — it defers the `scrollWidth` check but claims the CSS-property unit test satisfies the GIVEN's viewport constraint. However, a DOM-presence/CSS-property check **without full viewport configuration** (390 × 844) does not satisfy a viewport GIVEN. The deferral note does not explicitly state that the entire scenario — including the viewport GIVEN — is deferred to E2E; it only defers the scroll-width assertion.

**What is needed:** The developer summary must explicitly say the full Scenario 6 (including the viewport GIVEN) is deferred to E2E, **or** the unit test must use a full viewport mock (390 width and 844 height) alongside a meaningful layout assertion. Currently it does neither: `window.innerHeight` is never set to 844, and the assertion cannot satisfy a layout-based GIVEN in JSDOM.

**File:** `frontend/src/components/WeeklyDashboard.test.tsx`, test "weekly-dashboard-container has overflow-x:hidden and max-width:100% (Scenario 6)"; and `features/make-weekly-dashboard-the-home-page/work/developer-summary.md`, E2E deferrals table.

---

#### BLOCKING: `serve.json` redirect destination does not match Gherkin specification

**Gherkin Scenario 3:**
```gherkin
Then the response HTTP status is 308
And the response Location header is "/"
```

The Gherkin specifies the `Location` header value as `"/"`.

`frontend/public/serve.json` configures:
```json
{
  "source": "/health-sdlc-playground/weekly-dashboard",
  "destination": "/",
  "type": 308
},
{
  "source": "/health-sdlc-playground/weekly-dashboard/",
  "destination": "/",
  "type": 308
}
```

The `destination` is `"/"`. However, `run-e2e.sh` checks:
```bash
if [ "$LOCATION_PATH" = "/health-sdlc-playground/" ]; then
```
…stripping the host and checking for `/health-sdlc-playground/`, not `/`.

Whether `npx serve` emits the absolute path `/health-sdlc-playground/` or just `/` as the `Location` header value is implementation-dependent. The Gherkin says the `Location` header is `"/"`. If `serve` resolves the destination `/` relative to the base URL and emits `http://localhost:3000/` (absolute), the `Location` header will be `http://localhost:3000/` (or `/`), not `/health-sdlc-playground/`. Conversely, the E2E script strips the host from the effective URL and expects `/health-sdlc-playground/` — which would only be the result if `serve` issues the redirect to the full base-prefixed path.

The `destination: "/"` in `serve.json` is ambiguous and potentially contradicts the Gherkin's `Location: "/"`. If the deployed `basePath` is `/health-sdlc-playground`, the correct final URL after following the redirect should be `http://localhost:3000/health-sdlc-playground/`, not `http://localhost:3000/`. This means the destination in `serve.json` should likely be `"/health-sdlc-playground/"` — but the Gherkin says `Location: "/"`.

This is a contradiction between the Gherkin specification and the E2E validation in `run-e2e.sh`. Either:
1. The Gherkin is wrong (the Location should be `/health-sdlc-playground/` given `basePath`), or
2. The `serve.json` destination is wrong (should be `/health-sdlc-playground/` to match actual deployed behavior)

The redirect unit test (`redirect.test.ts`) asserts `destination === '/'` — matching `serve.json` but potentially inconsistent with actual behavior at runtime.

**File:** `frontend/public/serve.json`; `frontend/src/app/weekly-dashboard/redirect.test.ts`; Gherkin Scenario 3.

---

#### NON-BLOCKING (flagged for awareness): `run-tests.sh` `npm audit` may fail or pass vacuously

`run-tests.sh` runs `npm audit --audit-level=high` which is correct per the security skill. No new packages were added in this feature (developer summary confirms), so this is not a blocking concern. The `package-lock.json` is present. No hardcoded secrets or `dangerouslySetInnerHTML` with untrusted data are introduced.

---

#### NON-BLOCKING: `WeeklyDashboard` component exports both named and default

`WeeklyDashboard.tsx` exports both `export function WeeklyDashboard` and `export default WeeklyDashboard`. Tests import via both `{ WeeklyDashboard }` (named) and `default` (via `page.tsx`). This is consistent and not a defect.

---

### Alternatives considered

- Accepting the Scenario 6 partial deferral as sufficient — ruled out because the review rules explicitly require either a full viewport unit test or an explicit "deferred to E2E" covering the entire scenario including the GIVEN constraint, which is not present.
- Accepting the `serve.json` destination of `"/"` as matching the Gherkin `Location: "/"` — considered, but the E2E script itself contradicts this by checking for `/health-sdlc-playground/`, indicating the developer knows the runtime behavior differs from the raw `destination` value. This ambiguity is blocking because the unit test's destination assertion and the Gherkin spec cannot both be correct simultaneously given the `basePath`.

---

### Output summary

2 blocking failures:

1. **Scenario 6** — Viewport GIVEN (390 × 844 px) not actually satisfied by the unit test (no `innerHeight` set, JSDOM cannot compute layout), and the E2E deferral note does not explicitly cover the full scenario including the viewport GIVEN.

2. **Scenario 3** — Contradiction between `serve.json` `destination: "/"`, the Gherkin `Location: "/"`, and the E2E script's actual assertion of `/health-sdlc-playground/`. The redirect destination is ambiguous and the unit test assertion of `destination === '/'` may not reflect the actual HTTP `Location` header emitted at runtime.

---

## Outer Iteration 2

STATUS: STOP

---

## features/make-weekly-dashboard-the-home-page/work/code-reviewer-summary.md

### Status: STOP

### Input summary
- **Scope:** frontend
- **Files examined:** All implementation and test files provided, including:
  - `frontend/src/app/page.tsx`, `page.test.tsx`
  - `frontend/src/app/not-found.tsx`, `not-found.test.tsx`
  - `frontend/src/app/layout.tsx`, `layout.test.tsx`
  - `frontend/src/app/weekly-dashboard/page.tsx`, `redirect.test.ts`
  - `frontend/src/components/WeeklyDashboard.tsx`, `WeeklyDashboard.test.tsx`
  - `frontend/src/components/TrainingOverview.test.tsx`
  - `frontend/src/components/VisualTheme.test.tsx`
  - `frontend/public/serve.json`
  - `frontend/src/data/weeklyDashboardData.ts`, `weeklyDashboardData.test.ts`
  - `run-tests.sh`
  - `features/make-weekly-dashboard-the-home-page/scope`

---

### Interpretation
- The application is a Next.js static export (`output: 'export'`) served via `npx serve`. HTTP status codes are provided by `npx serve` reading `serve.json` for redirects, and by Next.js generating `404.html` for the not-found page.
- The developer deferred five scenarios (or portions thereof) to E2E: Scenarios 1 (HTTP 200), 3 (HTTP 308 + Location header), 4 (browser redirect following), 6 (scrollWidth assertion at 390px viewport), and 7 (HTTP 404). Each deferral is documented in the developer summary with rationale.
- The `run-e2e.sh` reference to a prior feature is expected per the review rules and was not assessed.

---

### Decisions

#### BLOCKING: Scenario 3 — `serve.json` redirect destination does not match Gherkin specification

**Gherkin (Scenario 3):**
> Then the response Location header is **"/"**

**`frontend/public/serve.json` (as provided):**
```json
{
  "redirects": [
    {
      "source": "/health-sdlc-playground/weekly-dashboard",
      "destination": "/",
      "type": 308
    },
    {
      "source": "/health-sdlc-playground/weekly-dashboard/",
      "destination": "/",
      "type": 308
    }
  ]
}
```

At first glance the destination appears to be `"/"`, which matches the Gherkin. **However**, the E2E script (`run-e2e.sh`) reveals the actual runtime behavior:

```bash
=== Scenario 3: Location header is /health-sdlc-playground/ ===
LOCATION_PATH=$(echo "$LOCATION" | sed 's|http://localhost:3000||')
if [ "$LOCATION_PATH" = "/health-sdlc-playground/" ]; then
  echo "PASS: Location: $LOCATION_PATH"
```

The `run-e2e.sh` — written by the tester to exercise the running server — asserts that the `Location` header is `/health-sdlc-playground/`, **not** `"/"`. This directly contradicts the Gherkin specification which requires `Location: "/"`.

Furthermore, Scenario 4 in `run-e2e.sh` asserts:
```bash
if [ "$FINAL_URL" = "http://localhost:3000/health-sdlc-playground/" ]; then
```

This corroborates that after following the redirect the browser is expected to land on `/health-sdlc-playground/`, not `/`.

This is a material contradiction between:
1. The **Gherkin** (`Location: "/"`, final URL `http://localhost:3000/`)
2. The **E2E test** (expects `Location: /health-sdlc-playground/`, final URL `http://localhost:3000/health-sdlc-playground/`)

**The unit tests for the redirect (`redirect.test.ts`) assert `destination: "/"` against `serve.json`**, which is consistent with `serve.json` but inconsistent with what the E2E script validates. This means either:
- The `serve.json` destination `"/"` is wrong (and should be `/health-sdlc-playground/` or `/health-sdlc-playground`), or
- The Gherkin and E2E are misaligned

Because I can only assess what is explicitly in the source files, and the `serve.json` `destination` field is `"/"` while the Gherkin specifies `Location: "/"`, the `serve.json` technically matches the Gherkin text. However, `npx serve` with `destination: "/"` will redirect to `http://localhost:3000/` (the served static root), not to the Next.js app root at `/health-sdlc-playground/`. With `basePath: '/health-sdlc-playground'`, the app's `index.html` is at `frontend/out/health-sdlc-playground/index.html`. The `npx serve` root is `frontend/out/`, so `"/"` points to `frontend/out/index.html` which does not exist — the Weekly Dashboard content is at `frontend/out/health-sdlc-playground/index.html`.

**This means the redirect `destination: "/"` will land the browser on a page that is not the Weekly Dashboard**, failing Scenario 4's `Then the text "Weekly Dashboard" is visible on the page` assertion. The `redirect.test.ts` tests pass (they only check `serve.json` content), but the actual runtime behavior does not satisfy the Gherkin.

**This is a blocking failure** — the redirect destination is functionally incorrect for this deployment. The correct destination should be `/health-sdlc-playground/` (or `/health-sdlc-playground`) to route to the Next.js app root. The Gherkin spec `Location: "/"` would then require updating to `Location: "/health-sdlc-playground/"`, or the deployment architecture requires reconsideration.

**References:**
- Gherkin Scenario 3: `Location header is "/"`
- Gherkin Scenario 4: `browser's final URL is "http://localhost:3000/"` and `text "Weekly Dashboard" is visible`
- `frontend/public/serve.json`: `destination: "/"`
- `run-e2e.sh`: asserts `Location: /health-sdlc-playground/` and `final URL: http://localhost:3000/health-sdlc-playground/`
- `frontend/src/app/weekly-dashboard/redirect.test.ts`: asserts `destination === "/"`

---

#### BLOCKING: Scenario 6 — viewport GIVEN not satisfied; deferral note present but structural guard fails Gherkin contract

**Gherkin (Scenario 6):**
> Given the browser viewport is set to 390 pixels wide and 844 pixels tall

The developer summary explicitly defers Scenario 6 (including the viewport GIVEN) to E2E — this is documented and acceptable per the review rules. The `WeeklyDashboard.test.tsx` structural guard test is explicitly labelled as not satisfying the Gherkin GIVEN.

This is **not** a blocking issue per the review rules (deferral is documented). Recording it here for completeness only.

---

#### BLOCKING: Scenario 3 — unit test for `serve.json` redirect destination asserts incorrect value

In `frontend/src/app/weekly-dashboard/redirect.test.ts`:

```typescript
it('serve.json contains a 308 redirect from /health-sdlc-playground/weekly-dashboard to /', () => {
  ...
  const match = redirects.find(
    (r) =>
      r.source === '/health-sdlc-playground/weekly-dashboard' &&
      r.destination === '/' &&
      r.type === 308
  )
  expect(match).toBeDefined()
})
```

This test **verifies `destination === '/'`**, but as argued above, the destination `"/"` in the context of `npx serve frontend/out` points to `frontend/out/index.html` (which does not exist for this app). The tests pass because they only check the JSON content, not the runtime routing behavior. The tests are testing the wrong value — they are confirming that `serve.json` contains a value that is functionally incorrect for the deployment.

Additionally, the E2E script tests for `Location: /health-sdlc-playground/` — contradicting what the unit tests assert. This inconsistency means the unit tests cannot be trusted to confirm Scenario 3's runtime behavior.

---

#### BLOCKING: Scenario 1 — `run-tests.sh` does not verify `run-tests.sh` is executable

Per the review checklist: "`run-tests.sh` exists and is executable — verify by reading it directly; a missing or unreadable script is a blocking failure."

`run-tests.sh` content:
```bash
#!/usr/bin/env bash
set -e
cd frontend
npm ci
npm audit --audit-level=high
npm test -- --watchAll=false --forceExit
```

The file is provided and readable. However, the review rules require verifying it is **executable**. The file content is provided in the prompt, indicating it exists and is readable. File permissions are not observable from content alone, but since the file is provided as an implementation file (not missing or truncated), I will not flag this as blocking — the convention is that `run-tests.sh` at the repo root should be marked executable by the developer.

---

#### NON-BLOCKING OBSERVATION: `intensity-balance` `aria-label` has a grammatical inconsistency for plural "sessions"

In `WeeklyDashboard.tsx`:
```tsx
aria-label={`Intensity balance: ${lowCount} low-intensity sessions, ${highCount} high-intensity session`}
```

The `highCount` label reads "session" (singular) even when `highCount > 1`. The test asserts:
```typescript
expect(balance).toHaveAttribute(
  'aria-label',
  'Intensity balance: 3 low-intensity sessions, 1 high-intensity session'
)
```

For W10 (`highCount === 1`) the test passes. This is not a Gherkin scenario violation but is an accessibility quality issue (ARIA label will read "2 high-intensity session" when count is 2).

Not blocking, but worth noting.

---

#### GHERKIN SCENARIO COVERAGE MAP

| Scenario | Test file | Test(s) | Status |
|---|---|---|---|
| Scenario 1: Root renders Weekly Dashboard (HTTP 200 + text visible) | `page.test.tsx` | `renders the Weekly Dashboard heading`, `renders the weekly-dashboard-container` | HTTP 200 deferred to E2E (documented); component coverage ✓ |
| Scenario 2: Root does not render Training Overview | `page.test.tsx`, `WeeklyDashboard.test.tsx`, `VisualTheme.test.tsx` | `does not render a training-overview element`, `does not render data-testid="training-overview"` | ✓ |
| Scenario 3: `/weekly-dashboard` → HTTP 308, Location `"/"` | `redirect.test.ts` | checks `serve.json` destination | **BLOCKED** — destination is functionally incorrect; tests pass against wrong value |
| Scenario 4: Browser follows redirect, lands on root | Entire scenario deferred to E2E | documented | deferred ✓ (but Scenario 3 runtime failure affects this) |
| Scenario 5: `TrainingOverview.tsx` file deleted | `TrainingOverview.test.tsx` | `the file ... does not exist` | ✓ |
| Scenario 6: No horizontal overflow at 390×844px | `WeeklyDashboard.test.tsx` | structural CSS guard only; full scenario deferred to E2E | deferred ✓ (documented) |
| Scenario 7: Non-existent routes → HTTP 404 | `not-found.test.tsx` | file existence + component structure | HTTP 404 deferred to E2E (documented); component coverage ✓ |

---

#### SECURITY CHECK

- No user input interpolated into shell commands, SQL, or `eval` ✓
- `dangerouslySetInnerHTML` in `layout.tsx` uses only hardcoded CSS from `themeTokens` — no user data ✓
- No API keys, tokens, or passwords hardcoded ✓
- `npm audit --audit-level=high` present in `run-tests.sh` ✓
- No new dependencies without stated reason ✓
- No auth bypass (no auth present in this feature) ✓
- No data exposure issues ✓

---

### Alternatives considered
- **Accepting `destination: "/"` as matching Gherkin literally**: Ruled out — at runtime, `npx serve frontend/out` with `destination: "/"` routes to an empty root, not to the Weekly Dashboard. Scenario 4 would fail in practice even if Scenario 3's Location header assertion technically matched `"/"`.
- **Treating the E2E script discrepancy as outside scope**: Ruled out — the E2E script reveals that the developer and tester both expect `Location: /health-sdlc-playground/`, which is incompatible with the `serve.json` destination of `"/"` and the Gherkin's `Location: "/"`. This inconsistency represents a real defect.
- **Flagging Scenario 6 as blocking** (no viewport constraint in tests): Not blocking per rules because the deferral is explicitly documented in the developer summary.

---

### Output summary

**STATUS: STOP**

Two blocking failures identified:

1. **Scenario 3 / Scenario 4 — redirect destination runtime mismatch**: `serve.json` `destination: "/"` points to the static file server root (`frontend/out/`), not the Next.js app at `frontend/out/health-sdlc-playground/`. The redirect will not land the browser on the Weekly Dashboard, causing Scenario 4 to fail at runtime. The unit tests in `redirect.test.ts` confirm the `serve.json` JSON value but cannot detect this runtime routing error. The E2E script corroborates the problem by testing for `Location: /health-sdlc-playground/` rather than `Location: /`. The Gherkin, the `serve.json`, the unit tests, and the E2E script are mutually inconsistent; at minimum the redirect configuration is functionally incorrect for the deployment.

2. **Scenario 3 — unit tests assert incorrect value**: The `redirect.test.ts` tests verify `destination === "/"` which, while matching the Gherkin text, asserts a functionally incorrect redirect destination. These tests will pass even when the redirect is broken at runtime.

---

## Outer Iteration 3

I will systematically evaluate every Gherkin scenario, test file, implementation file, and structural concern against the stated rules.

---

## Scenario-by-Scenario Coverage Mapping

### Scenario 1: Root route renders Weekly Dashboard (HTTP 200 + "Weekly Dashboard" visible)

- **HTTP 200**: Developer summary explicitly defers to E2E. ✓ (Acceptable deferral with documented rationale.)
- **"Weekly Dashboard" visible**: Covered in `frontend/src/app/page.test.tsx` → `'renders the Weekly Dashboard heading (Scenario 1)'` and `'renders the weekly-dashboard-container (Scenario 1)'`. Also covered in `WeeklyDashboard.test.tsx` → `'renders H1 with text "Weekly Dashboard"'` and `VisualTheme.test.tsx`. ✓

### Scenario 2: Root route does not render Training Overview

- Covered in `frontend/src/app/page.test.tsx` → `'does not render a training-overview element (Scenario 2)'` and `'does not render the Training Overview heading (Scenario 2)'`. Also `WeeklyDashboard.test.tsx` → `'does not render data-testid="training-overview" (Scenario 2)'` and `VisualTheme.test.tsx`. ✓

### Scenario 3: `/weekly-dashboard` issues HTTP 308 with Location `"/"`

The Gherkin states:
> the response Location header is "/"

The implementation uses `destination: "/health-sdlc-playground/"` in `serve.json`. The developer summary acknowledges this discrepancy and argues the Gherkin's `"/"` means the application root, which in this deployment context is `/health-sdlc-playground/`. The `run-e2e.sh` also tests for `Location: /health-sdlc-playground/` not `"/"`.

**This is a genuine conflict.** The Gherkin specifies `Location: "/"` as a literal assertion. The implementation emits `Location: /health-sdlc-playground/`. The developer justifies this as a deployment interpretation, but the code reviewer's role is to flag deviations from the Gherkin, not accept reinterpretations.

However: the developer summary explicitly documents this as a **spec discrepancy** and provides a rationale. The question is: does the implementation violate the Gherkin, or is the Gherkin describing the logical application root (which is `/health-sdlc-playground/` in this static export)?

Looking at the Gherkin more carefully:
```
When the user navigates directly to "http://localhost:3000/weekly-dashboard" without following redirects
Then the response HTTP status is 308
And the response Location header is "/"
```

The base URL is `http://localhost:3000` with no path prefix. The `run-e2e.sh` navigates to `http://localhost:3000/health-sdlc-playground/weekly-dashboard/` and asserts `Location: /health-sdlc-playground/`. This is inconsistent with the Gherkin which navigates to `http://localhost:3000/weekly-dashboard` (no basePath).

The `serve.json` has:
```json
"source": "/health-sdlc-playground/weekly-dashboard"
"destination": "/health-sdlc-playground/"
```

The Gherkin says navigate to `http://localhost:3000/weekly-dashboard` — but that URL would not match the `serve.json` source `/health-sdlc-playground/weekly-dashboard`. The redirect would **not trigger** at all for `http://localhost:3000/weekly-dashboard` with the current `serve.json`.

This is a **blocking concern**: the Gherkin's source URL (`/weekly-dashboard`) does not match the `serve.json` source (`/health-sdlc-playground/weekly-dashboard`), and the Location header assertion (`"/"`) does not match the destination (`"/health-sdlc-playground/"`). However, this is entirely deferred to E2E, and the E2E script navigates to the basePath-prefixed URL which does work. The unit test in `redirect.test.ts` only checks the `serve.json` content, not the actual HTTP behavior at `http://localhost:3000/weekly-dashboard`.

For a code reviewer limited to what is visible in source files: the Gherkin says `http://localhost:3000/weekly-dashboard` and `Location: "/"`, but the implementation redirects at `/health-sdlc-playground/weekly-dashboard` to `/health-sdlc-playground/`. **This is a spec deviation that is not correctable at the unit level.**

The developer summary explicitly documents this under "Spec discrepancy note." The E2E tests (which I'm instructed not to assess for correctness) navigate to the basePath URL. The question is whether to block on this. The spec discrepancy is **explicitly documented and reasoned**, not hidden.

Per my instructions: "Only flag elements, functions, routes, or behaviors that are **explicitly visible in the source files provided**." The source files show a mismatch between Gherkin (`/weekly-dashboard` → `Location: "/"`) and implementation (`/health-sdlc-playground/weekly-dashboard` → `/health-sdlc-playground/`). The developer summary documents this. This is a legitimate concern but the developer has documented rationale.

I will flag this as a concern but note the documented rationale.

### Scenario 4: Browser lands on root route after following redirect

- Fully deferred to E2E. ✓ (Documented rationale in developer summary.)

### Scenario 5: `TrainingOverview.tsx` does not exist

- Covered in `frontend/src/components/TrainingOverview.test.tsx` → `'the file frontend/src/components/TrainingOverview.tsx does not exist'`. ✓
- The file `TrainingOverview.tsx` is absent from the provided source files. ✓

### Scenario 6: No horizontal overflow at 390×844px viewport

The Gherkin GIVEN is:
> Given the browser viewport is set to 390 pixels wide and 844 pixels tall

The developer summary explicitly defers the **entire scenario including the viewport GIVEN** to E2E, with documented rationale (JSDOM does not perform layout). A structural CSS guard is retained but explicitly labelled as not satisfying the Gherkin GIVEN.

Per the review rules: "Any Gherkin scenario whose GIVEN includes a viewport width, device type, or rendering-environment constraint must either (a) have a unit test that actually sets that constraint, or (b) have an explicit 'deferred to E2E' note in the developer summary."

The developer summary has:
> **Scenario 6: No horizontal overflow at 390×844px viewport** | **Entire scenario including the viewport GIVEN** | **JSDOM does not perform layout and cannot enforce viewport dimensions...**

This satisfies condition (b). ✓

### Scenario 7: Non-existent routes return HTTP 404

- HTTP 404 assertion deferred to E2E (documented). ✓
- Component existence covered in `frontend/src/app/not-found.test.tsx` → `'not-found.tsx file exists'`. ✓
- Component structure covered: H1 "Page Not Found", decorative 404, explanatory paragraph, "Go to Dashboard" link, `role="main"`. ✓

---

## `run-tests.sh` Verification

The file is provided and readable:
```bash
#!/usr/bin/env bash
set -e
cd frontend
npm ci
npm audit --audit-level=high
npm test -- --watchAll=false --forceExit
```

It exists at the repo root, is readable, contains `npm audit --audit-level=high`, and runs tests. ✓

---

## New Implementation Without Gherkin Backing

I need to check whether any **new** code introduced by this feature has no Gherkin backing.

Looking at `WeeklyDashboard.tsx` and `WeeklyDashboard.test.tsx`: there are extensive tests for:
- Week selector, activity drill-down, trend indicators, intensity balance, VO2max display, HR metrics, cadence metrics, close behavior, etc.

These are not scenarios in the **current** Gherkin spec (`make-weekly-dashboard-the-home-page.feature`). The developer summary states "existing implementation is already correct" and that no new implementation was introduced. These behaviors appear to be **pre-existing** from prior features.

Per the rules: "Pre-existing code in files that were modified by this feature (behavior already present before this feature) must not be flagged — only judge what is new."

The developer summary states no implementation files were modified. The `WeeklyDashboard.tsx`, `weeklyDashboardData.ts`, `WeeklyDashboard.test.tsx`, `weeklyDashboardData.test.ts` are pre-existing. ✓

---

## Security Checklist

- **Injection**: No user input interpolated into shell commands, SQL, or `eval`. `dangerouslySetInnerHTML` in `layout.tsx` uses only hardcoded CSS tokens from `themeTokens` — no user data. ✓
- **Secrets**: No API keys, tokens, or passwords hardcoded. ✓
- **Dependencies**: No new npm packages added. `npm audit --audit-level=high` in `run-tests.sh`. ✓
- **Auth bypass**: No auth checks exist in this frontend codebase. ✓
- **Data exposure**: No server-side data exposure; static frontend only. ✓

---

## SOLID / DDD Checks

The feature is small-scope frontend routing and component restructuring. SOLID concerns don't rise to a blocking level here. Domain language is consistent (`WeeklyDashboard`, `WeekData`, `DashboardActivity` match the Gherkin terminology). Business logic (trend computation, avg calculations) is in `weeklyDashboardData.ts` domain module, not in UI components. ✓

---

## Test Meaningfulness

Tests are meaningful — they assert real behavior:
- `page.test.tsx` renders the component and queries by role/testid
- `not-found.test.tsx` renders and queries by role, checks `aria-hidden`, checks link href
- `redirect.test.ts` parses JSON file content and checks redirect configuration
- `TrainingOverview.test.tsx` checks file non-existence on disk
- `WeeklyDashboard.test.tsx` uses `userEvent` for interactive behavior, checks computed values

No trivially-passing tests. ✓

---

## The Gherkin vs. Implementation Discrepancy on Scenario 3

**Critical finding**: The Gherkin spec says:
```
When the user navigates directly to "http://localhost:3000/weekly-dashboard" without following redirects
Then the response HTTP status is 308
And the response Location header is "/"
```

The implementation:
- `serve.json` source: `/health-sdlc-playground/weekly-dashboard` (not `/weekly-dashboard`)
- `serve.json` destination: `/health-sdlc-playground/` (not `/`)

If the E2E test runs against `http://localhost:3000/weekly-dashboard` (as the Gherkin specifies), the redirect will **not fire** because `serve.json` only handles `/health-sdlc-playground/weekly-dashboard`. The `run-e2e.sh` avoids this by using the basePath-prefixed URL, but that contradicts the Gherkin step definition.

The `redirect.test.ts` unit test asserts `destination === "/health-sdlc-playground/"` and documents the rationale. But the Gherkin assertion is `Location: "/"`.

This is a **documented spec discrepancy** — the developer has explicitly noted it and reasoned about it. The E2E script (which I'm not assessing) navigates to a different URL than the Gherkin specifies.

This is a genuine deviation from the Gherkin specification that cannot be dismissed. The Gherkin says `Location: "/"` and the implementation produces `Location: /health-sdlc-playground/`. The spec discrepancy is documented but not resolved — the Gherkin was not updated to reflect the actual behavior.

**This is a blocking failure** per the rules: "Implementation behavior matches the Gherkin specification exactly."

---

## Output

Writing the summary file now.

---

**`features/make-weekly-dashboard-the-home-page/work/code-reviewer-summary.md`**

```markdown
# Code Reviewer Summary

## Status: STOP

## Input summary
- **Scope**: frontend
- **Files examined**: all provided implementation and test files across `frontend/src/`, `frontend/public/serve.json`, `frontend/jest.config.js`, `frontend/next.config.js`, `frontend/package.json`, `run-tests.sh`, and the Gherkin feature specification

## Interpretation
- "Pre-existing code" = any behavior present in files the developer stated were not modified; only newly introduced behavior was assessed
- The developer summary's assertion that no implementation files were modified was accepted — the extensive WeeklyDashboard tests covering non-Gherkin scenarios are treated as pre-existing
- "Location header is '/'" in Gherkin Scenario 3 is treated as a literal HTTP response header value, not an application-relative logical reference

## Decisions

### BLOCKING: Scenario 3 — Gherkin vs. implementation mismatch on both URL and Location header

The Gherkin specifies:
```
When the user navigates directly to "http://localhost:3000/weekly-dashboard" without following redirects
Then the response HTTP status is 308
And the response Location header is "/"
```

The implementation in `frontend/public/serve.json` has:
```json
{
  "source": "/health-sdlc-playground/weekly-dashboard",
  "destination": "/health-sdlc-playground/",
  "type": 308
}
```

There are two deviations:

1. **Source URL mismatch**: The Gherkin step says the user navigates to `http://localhost:3000/weekly-dashboard`. The `serve.json` redirect is configured for `/health-sdlc-playground/weekly-dashboard`. If the E2E test navigates to `http://localhost:3000/weekly-dashboard` (exactly as the Gherkin states), the redirect will **not fire** at all — there is no matching rule in `serve.json` for that path. The response would be a 404 or a pass-through, not a 308.

2. **Location header mismatch**: The Gherkin asserts `Location: "/"`. The `serve.json` destination is `"/health-sdlc-playground/"`. At runtime `npx serve` will emit `Location: /health-sdlc-playground/` (or the absolute form `http://localhost:3000/health-sdlc-playground/`), which does not equal `"/"`.

The developer summary documents this as a "spec discrepancy" and argues that `"/"` in the Gherkin means the logical application root. However:
- The Gherkin step definition uses `http://localhost:3000/weekly-dashboard` (no basePath prefix), not `http://localhost:3000/health-sdlc-playground/weekly-dashboard`. The Gherkin must be treated as authoritative.
- The review rule is: "Implementation behavior matches the Gherkin specification exactly."
- A documented rationale for deviating does not make the deviation conformant.

The `redirect.test.ts` unit test explicitly asserts `destination === "/health-sdlc-playground/"` and adds a comment that this contradicts the Gherkin's `"/"`. This confirms the mismatch is known but unresolved.

**Resolution required**: Either (a) update the Gherkin to reflect the actual deployment paths (`http://localhost:3000/health-sdlc-playground/weekly-dashboard` → `Location: /health-sdlc-playground/`), or (b) restructure the deployment so that `http://localhost:3000/weekly-dashboard` redirects to `http://localhost:3000/` (e.g., by serving the app at the static file server root rather than under the basePath subdirectory during local development).

### Non-blocking observation: `run-e2e.sh` uses basePath-prefixed URLs inconsistent with Gherkin steps
The `run-e2e.sh` navigates to `http://localhost:3000/health-sdlc-playground/weekly-dashboard/` and asserts `Location: /health-sdlc-playground/`. Per the review rules, `run-e2e.sh` is written by the tester and must not be assessed — this is noted for awareness only and does not contribute to the STOP verdict.

### Passing checks
- **Scenario 1**: HTTP 200 deferred to E2E (documented); "Weekly Dashboard" heading covered by `page.test.tsx` and `WeeklyDashboard.test.tsx`. ✓
- **Scenario 2**: `data-testid="training-overview"` absence covered by `page.test.tsx` and `WeeklyDashboard.test.tsx`. ✓
- **Scenario 3 (structure)**: `serve.json` content validated by `redirect.test.ts`; HTTP assertion deferred to E2E. But fails on spec deviation (see blocking finding above).
- **Scenario 4**: Entirely deferred to E2E with documented rationale. ✓
- **Scenario 5**: `TrainingOverview.tsx` non-existence checked by `TrainingOverview.test.tsx`; file is absent from source. ✓
- **Scenario 6**: Entire scenario (including viewport GIVEN) explicitly deferred to E2E in developer summary — satisfies the deferral-note requirement. ✓
- **Scenario 7**: HTTP 404 deferred to E2E (documented); `not-found.tsx` component structure covered by `not-found.test.tsx` (H1, decorative 404, paragraph, link, `role="main"`). ✓
- **`run-tests.sh`**: Present at repo root, readable, executable form (`#!/usr/bin/env bash`), includes `npm audit --audit-level=high`. ✓
- **Security**: No injection, no hardcoded secrets, no new dependencies, no auth bypass, no data exposure. ✓
- **Test meaningfulness**: All tests assert real behavior; none trivially pass. ✓
- **SOLID/DDD**: Domain logic in `weeklyDashboardData.ts`; ubiquitous language consistent with Gherkin; infrastructure separated. ✓
- **No unrelated code modified**: Developer confirms no implementation files changed; pre-existing tests are pre-existing. ✓

## Alternatives considered
- Treating the Gherkin's `"/"` as a documentation-level logical reference rather than a literal assertion — ruled out; the review rule requires exact match and the Gherkin step text is unambiguous
- Flagging the `run-e2e.sh` URL mismatch as a separate blocking concern — ruled out; the review rules explicitly exclude `run-e2e.sh` assessment

## Output summary
1 blocking failure: Scenario 3 has a documented spec deviation — the Gherkin asserts navigation to `http://localhost:3000/weekly-dashboard` with `Location: "/"`, but the `serve.json` redirect fires only for `/health-sdlc-playground/weekly-dashboard` and emits `Location: /health-sdlc-playground/`. The Gherkin must be updated to match the actual deployment behavior, or the deployment must be changed to match the Gherkin, before this feature can be approved.

All other 6 scenarios are covered appropriately (either by unit tests or with properly documented E2E deferrals).
```

STATUS: STOP

**Blocking failure**: Scenario 3 has a verified, source-file-visible mismatch between the Gherkin specification and the implementation.

- The Gherkin says: navigate to `http://localhost:3000/weekly-dashboard`, assert `Location: "/"`.
- `frontend/public/serve.json` configures the redirect source as `/health-sdlc-playground/weekly-dashboard` (not `/weekly-dashboard`) and the destination as `/health-sdlc-playground/` (not `/`).
- As a result, a request to `http://localhost:3000/weekly-dashboard` (the URL the Gherkin specifies) would not match any redirect rule and would not return a 308 at all.
- `redirect.test.ts` confirms this by asserting `destination === "/health-sdlc-playground/"` with an explicit comment acknowledging the contradiction with the Gherkin's `"/"`.

The developer summary documents this as a "spec discrepancy" but does not resolve it. The Gherkin must be updated to reflect the actual deployed URLs (`http://localhost:3000/health-sdlc-playground/weekly-dashboard` → `Location: /health-sdlc-playground/`), or the deployment configuration must be changed to match the Gherkin's paths.