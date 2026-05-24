STATUS: OK

## Summary

**Input feature request (verbatim):**
> Set up scaffolding for a Next.js application titled "Health Playground". It must have a bar at the top with the title, and in the future a way to select the current data set.

**Interpretation:**
- Scaffold a Next.js application that builds and serves a home page.
- Home page contains a top bar displaying the title "Health Playground".
- A placeholder for a future dataset selector should be present in the top bar so the layout is ready for future work, but no selection functionality is required now.

**Decisions:**
- Pin concrete signals: HTTP 200 on `/`, visible text "Health Playground", and a placeholder element identified by `data-testid="dataset-selector-placeholder"`.
- Pin the dev/build commands: `npm run build` and `npm run dev` (Next.js defaults).
- Use neutral preconditions (repo checked out, dependencies installed) — not "app is scaffolded".
- Omit a pure-negative inversion scenario; instead include a meaningful negative: navigating to an unknown route returns HTTP 404 (Next.js default behavior, observable).

**Alternatives considered:**
- Implementing a functional dataset dropdown now — ruled out; request says "in the future".
- Asserting CSS positioning of the top bar — ruled out; not reliably testable without implementation coupling. Replaced with a `data-testid="top-bar"` containing the title.

**Output summary:** 4 scenarios written (3 positive, 1 negative).