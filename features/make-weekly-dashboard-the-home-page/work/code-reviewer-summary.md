## Outer Iteration 1

STATUS: STOP

## Code Reviewer Summary

### Status: STOP

### Input Summary
- **Scope:** frontend
- **Feature:** make-weekly-dashboard-the-home-page
- **Files examined:** All frontend source files, test files, `run-tests.sh`, `run-e2e.sh`, developer summary, Gherkin specification, and UX specification.

### Interpretation
I evaluated each of the 7 Gherkin scenarios against the test files, implementation files, and deferral notes in the developer summary. I applied the evidence rule strictly — only raising findings on explicitly visible source code.

---

### Decisions — Findings

#### FINDING 1 (Blocking): Scenario 6 viewport GIVEN not satisfied at unit-test level, and deferral note is present but the test does not satisfy the constraint

**Scenario 6 states:**
> Given the browser viewport is set to 390 pixels wide and 844 pixels tall  
> Then the element with `data-testid "weekly-dashboard-container"` does not cause a horizontal scrollbar on the page

The developer summary defers the `scrollWidth === innerWidth` assertion to E2E (acceptable). However, the unit test in `WeeklyDashboard.test.tsx` (`weekly-dashboard-container has overflow-x:hidden and max-width:100% (Scenario 6)`) only sets `window.innerWidth = 390` and then checks **inline styles** on the rendered element:

```ts
expect(container.style.overflowX).toBe('hidden')
expect(container.style.maxWidth).toBe('100%')
expect(container.style.boxSizing).toBe('border-box')
```

The GIVEN in the scenario specifies `390 px wide AND 844 px tall`. The test sets only `innerWidth`, not `innerHeight`. While height is less material for horizontal overflow, the viewport GIVEN is not fully configured (both dimensions specified). More critically, the test asserts CSS properties as a proxy for "no horizontal scrollbar" — this is a DOM-presence / inline-style check without actually configuring a real viewport. The developer summary explicitly defers the real `scrollWidth` assertion to E2E.

Per the review rules: *"Any Gherkin scenario whose GIVEN includes a viewport width, device type, or rendering-environment constraint must either (a) have a unit test that actually sets that constraint, or (b) have an explicit 'deferred to E2E' note in the developer summary."*

The developer summary **does** have an explicit E2E deferral note for Scenario 6:
> Scenario 6: `scrollWidth === innerWidth` at 390px — Requires real browser viewport; unit test checks CSS properties as proxy

This deferral note is present, which satisfies rule (b). However, rule (b) requires the deferral to cover the scenario itself, not just the assertion. The GIVEN (`viewport is set to 390px wide and 844px tall`) is a rendering-environment constraint. The deferral note specifically says the *`scrollWidth` assertion* is deferred, leaving the viewport constraint partially addressed (width set, height not set, no `innerHeight` configured). This is a marginal boundary case; I flag it but note it is the weakest of the findings.

**However**, re-reading strictly: the deferral note covers "the full scrollWidth === innerWidth assertion" — i.e., the THEN clause — at the E2E level. The GIVEN (viewport) is also only achievable in a real browser. The note implicitly covers the full scenario at E2E. I will **downgrade this to a non-blocking concern** under the policy that the deferral exists.

#### FINDING 2 (Blocking): New implementation without a corresponding Gherkin scenario — `weeklyDashboardData.ts` data module contains speculative/extended content

The `weeklyDashboardData.ts` file contains extensive inline comments (lines visible in the provided file) that document the **derivation of W09 average HR** to reconcile a contradiction between Gherkin Background expectations ("average HR of 145 bpm" for W09) and the `computeTrend` threshold. The developer elected to use W09 `avgHr = 143` instead of 145 so that the "↑ Increasing" trend assertion passes. This is a data decision made to reconcile the spec, not a new unsanctioned behavior. This is not a new feature — it's data tuning. **Not blocking.**

#### FINDING 3 (Blocking): `weekly-dashboard/page.tsx` uses `redirect('/')` which is a Next.js server-side API incompatible with `output: 'export'`

**File:** `frontend/src/app/weekly-dashboard/page.tsx`

```tsx
import { redirect } from 'next/navigation'
export default function WeeklyDashboardRedirectPage() {
  redirect('/')
}
```

The developer summary explicitly acknowledges this:
> `next/navigation`'s `redirect()` in `weekly-dashboard/page.tsx` also handles SSR-level redirect but for static export the `serve.json` is the authoritative redirect mechanism.

The `next/navigation` `redirect()` function in a static export context does **not** produce an HTTP 308 response in the served `out/` directory. With `output: 'export'`, Next.js generates static HTML. The `redirect()` call in a page component during static export will cause the build to **throw** or the page to be omitted, because `redirect()` is designed for server-side execution and throws a special error that Next.js catches during RSC rendering. When `output: 'export'` is set, calling `redirect()` in a page causes a build error or the page file is not generated.

This is a **concrete build risk**. Let me evaluate the evidence:
- The developer says `serve.json` is the authoritative redirect for static export — correct.
- The `weekly-dashboard/page.tsx` exists with a `redirect('/')` call.
- In Next.js 15 with `output: 'export'`, calling `redirect()` from a page component during static generation will throw at build time (`Error: Redirect cannot be used in static rendering`).

There is no test covering the successful build of the `weekly-dashboard` route. The unit test for the redirect (`redirect.test.ts`) only checks `serve.json` content — it does **not** verify that `next build` succeeds with the `weekly-dashboard/page.tsx` as-is.

If `next build` fails, `run-tests.sh` would fail at `npm run build` stage (if it ran the build), but `run-tests.sh` only runs `jest` — so the build failure would only be caught during `run-e2e.sh`.

More specifically: `run-tests.sh` runs:
```bash
npm ci
npm audit --audit-level=high
npm test -- --watchAll=false --forceExit
```

It does **not** run `npm run build`. The broken `weekly-dashboard/page.tsx` would only surface during the E2E phase (which runs `npm run build`). The jest test suite itself does not import or render `weekly-dashboard/page.tsx`, so the tests would pass while the implementation is broken.

**This is a blocking concern.** The implementation in `weekly-dashboard/page.tsx` using `redirect()` will cause a build failure when `output: 'export'` is active. The redirect for static export must be handled entirely by `serve.json` (which is correctly configured), and `weekly-dashboard/page.tsx` should either not exist, export a simple component, or use a client-side redirect. The current file will prevent `npm run build` from completing successfully.

#### FINDING 4 (Blocking): Scenario 3 — redirect test does not cover the Gherkin scenario THEN clause

**Scenario 3 states:**
> When the user navigates directly to "http://localhost:3000/weekly-dashboard" without following redirects  
> Then the response HTTP status is **308**  
> And the response Location header is **"/"**

The Gherkin Scenario 3 asserts:
1. HTTP status 308
2. Location header is `"/"` (not `/health-sdlc-playground/`)

The unit test in `redirect.test.ts` checks `serve.json` for:
```
source: '/health-sdlc-playground/weekly-dashboard'
destination: '/health-sdlc-playground/'
type: 308
```

The developer defers the actual HTTP response check to E2E (documented in the deferral table — acceptable). However, there is a **mismatch in the Gherkin Location header expectation**:

- Gherkin Scenario 3 says: `Location header is "/"`
- `serve.json` redirects to `/health-sdlc-playground/` (due to `basePath`)
- The E2E script (`run-e2e.sh`) checks `Location: /health-sdlc-playground/` — which would make Scenario 3 FAIL per the literal Gherkin assertion (`"/"`)

This is not a code defect but a **specification gap** that would cause Scenario 3 to fail in E2E. The developer summary does not note this discrepancy. However, per the evidence rule, the reviewer cannot assess E2E correctness — but the unit-level structural test does not cover the Location header value `"/"` as stated in the Gherkin.

The developer summary's deferral covers the HTTP status check. The Location header value mismatch between Gherkin (`"/"`) and actual behavior (`"/health-sdlc-playground/"`) is unacknowledged. This is a **blocking concern** because the implementation cannot satisfy Scenario 3's THEN clause as written.

#### FINDING 5 (Blocking): `weekly-dashboard/page.tsx` — `redirect('/')` will redirect to `/` (not `/health-sdlc-playground/`) in Next.js server context, further breaking Scenario 3 and 4

Even if the static export build did not fail (see Finding 3), `redirect('/')` in Next.js with `basePath: '/health-sdlc-playground'` would redirect to `/health-sdlc-playground/` (Next.js prepends the basePath). But in static export, this is moot because the file produces broken output. This compounds Finding 3.

---

### Summary of Findings

| Finding | Severity | Scenario | File | Description |
|---|---|---|---|---|
| F1 | Non-blocking | Scenario 6 | `WeeklyDashboard.test.tsx` | Viewport height not configured in test; E2E deferral present and covers scenario |
| F2 | Non-blocking | — | `weeklyDashboardData.ts` | Data tuning comment — not new behavior |
| **F3** | **BLOCKING** | Scenarios 3, 4 | `weekly-dashboard/page.tsx` | `redirect()` from `next/navigation` in a `output: 'export'` page causes build failure; file must be removed or replaced with a no-op component |
| **F4** | **BLOCKING** | Scenario 3 | `serve.json`, Gherkin | Location header in Gherkin says `"/"` but actual redirect destination is `/health-sdlc-playground/`; discrepancy unacknowledged in developer summary |

---

### Alternatives Considered
- Accepting F3 as an E2E-only risk: rejected — `npm run build` will fail during E2E, proving the feature does not work end-to-end; a correct static export must not include `redirect()` in a page file.
- Treating F4 as a Gherkin authoring error (using the `basePath`-aware path as ground truth): rejected — the Gherkin is the specification; the implementation must match it or the developer must document the discrepancy with an explicit justification.
- Flagging F1 as blocking: rejected — the developer summary contains an explicit E2E deferral note that satisfies rule (b).

### Output Summary
- 7 Gherkin scenarios reviewed
- Scenarios 1, 2, 5, 7: covered by unit tests, no issues
- Scenario 4 (browser final URL): deferred to E2E, deferral documented — acceptable
- Scenario 6 (viewport overflow): deferral documented — acceptable (non-blocking)
- **Scenario 3 (308 redirect / Location header):** Two blocking failures — `weekly-dashboard/page.tsx` will break `npm run build` with `output: 'export'`, and the Location header value `"/"` in the Gherkin cannot be satisfied by the `serve.json` configuration (which redirects to `/health-sdlc-playground/`)
- `run-tests.sh` is present and readable at the repo root — passes
- Security checklist: no injection, no hardcoded secrets, no new dependencies, no auth bypass, `dangerouslySetInnerHTML` used with static `themeTokens` only (pre-existing) — passes