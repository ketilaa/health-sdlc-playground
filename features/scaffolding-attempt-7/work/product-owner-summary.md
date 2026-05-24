STATUS: OK

## Summary

**Input feature request (verbatim):**
> Set up scaffolding for a Next.js application titled "Health Playground". It must have a bar at the top with the title, and in the future a way to select the current data set.

**Interpretation:**
- Scaffold a Next.js application that builds and serves a home page.
- The home page displays a top bar containing the title "Health Playground".
- A placeholder for a future dataset selector must be present in the top bar, identifiable via a stable selector, but not yet functional.

**Decisions:**
- Use the App Router default home page route `/` as the page under test.
- Pin concrete signals: HTTP 200 on `/`, exit code 0 for `npm run build`, exact visible text "Health Playground", and `data-testid="dataset-selector-placeholder"` for the future selector slot.
- Top bar identified via `data-testid="top-bar"` to make placement assertable.

**Alternatives considered:**
- Asserting only on visible text without test IDs — rejected because placement (inside the top bar) cannot be reliably verified.
- Including a working dataset selector — rejected as the request explicitly defers this to the future.
- Asserting on a specific port — rejected as port is an environment detail; rely on the dev/preview server returning 200 on `/`.

**Output summary:** 4 scenarios written (3 positive, 1 negative).