STATUS: OK

# Product Owner Summary

**Status:** OK

**Input summary:** Set up scaffolding for a Next.js application titled "Health Playground". It must have a bar at the top with the title, and in the future a way to select the current data set.

**Interpretation:**
- "Scaffolding" means a runnable Next.js application skeleton with the homepage rendering the top bar.
- "Bar at the top" is interpreted as a header region rendered above page content on the home route (`/`).
- The title shown in the bar is the literal text "Health Playground".
- "In the future a way to select the current data set" is interpreted as a present-day placeholder element identifying where the dataset selector will live, so the layout is locked in now. It is not yet functional.

**Decisions:**
- Home route is `/`; the header must appear there.
- Dataset selector placeholder is identified via `data-testid="dataset-selector-placeholder"` to allow tests to locate it without prescribing visual design.
- The header region is identified via `data-testid="app-header"`.
- The app must start via `npm run dev` and respond with HTTP 200 on `/`.
- The browser tab/document title is also set to "Health Playground" (standard Next.js metadata).

**Alternatives considered:**
- Building a functional dataset selector now — ruled out; explicitly deferred to "the future".
- Using only ARIA roles instead of test IDs — ruled out to avoid ambiguity for automated tests.
- Asserting on CSS layout (position, color) — ruled out as not part of the request.

**Output summary:** 4 scenarios written, 1 negative case covered.