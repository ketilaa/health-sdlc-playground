STATUS: OK

# Product Owner Summary (Revision 2)

**Status:** OK

**Input summary (full feature request):**
> Apply a visual theme to the Training Overview.
>
> Use a dark background throughout the app. Introduce a colour-coding system for the three activity types — Long run, Restorative run, and Intervals — so each type always renders in its own distinct colour wherever it appears in the UI (activity rows, type labels, icons, or indicators).
>
> Define the theme colours as CSS custom properties (variables) so all colour decisions live in one place and can be changed consistently.
>
> The colour coding must be visible in the expanded activity rows. The sickness week's skipped-activity marker should also have its own distinct visual treatment within the theme.
>
> No data or behavior changes. This is purely a visual enhancement of the existing Training Overview.
>
> This is intentionally open-ended — no colours, no layout, no specific components prescribed. The UX designer owns all creative decisions.

**Interpretation:**
- The Training Overview page is reachable at `http://localhost:3000/` (the app's root route, Next.js dev server convention) and renders mocked workout data including at least one Long run, one Restorative run, one Intervals session, and a sickness week with a skipped activity.
- "Dark background" is verified by a deterministic relative-luminance formula (WCAG) applied to the body's computed `background-color`.
- "Distinct colours" are verified by comparing colour values *after normalisation to `rgb(r, g, b)` lower-case form* (the form `getComputedStyle` returns), so `#fff`, `#ffffff`, and `rgb(255, 255, 255)` all compare equal.
- The skipped marker uses its own `data-testid="skipped-activity-marker"` and does **not** carry `data-activity-type`; the `data-activity-type` attribute is reserved for the three real activity types (`long-run`, `restorative-run`, `intervals`).
- Expanding a row is performed by activating an element with `data-testid="activity-row-toggle"` scoped within the target row.
- "Visible" means: the element exists in the DOM, is not `display: none` / `visibility: hidden`, has non-zero bounding box dimensions, and is within the document.

**Decisions made (in response to reviewer):**
1. Pinned base URL to `http://localhost:3000/`.
2. Defined "dark colour" via WCAG relative luminance < 0.2.
3. Defined "visible" explicitly in the Background as a glossary step.
4. Pinned colour-comparison normalisation: all colour values are normalised to `getComputedStyle`'s canonical `rgb(r, g, b)` / `rgba(r, g, b, a)` form before equality checks.
5. Pinned `data-testid="activity-row-toggle"` for the expand control.
6. Pinned `data-activity-type` convention: only the three activity types use it; the skipped marker uses `data-testid="skipped-activity-marker"` only.
7. Added explicit fixture-presence preconditions: the seeded Training Overview MUST include at least one row per activity type and a sickness week with one skipped activity. These are stated as Background facts the implementation must satisfy.
8. Removed the open-ended "colour-bearing style" disjunction: each scenario now pins exactly one CSS property (`background-color`) per element, since that is the most common and reliably observable carrier for category colour. The Designer may still apply additional accents, but the test contract requires at minimum the background colour to match the token.

**Alternatives considered:**
- Per-feature `data-theme-color` data attribute echoing the resolved colour — rejected; reflects implementation, not user-visible styling.
- Asserting any of (`color` / `background-color` / `border-color` / `fill`) — rejected per reviewer; ambiguous.
- Letting tests resolve "visible" via Playwright's built-in `toBeVisible` — accepted and codified in the glossary step so the contract is explicit.

**Output summary:** 6 scenarios (5 positive, 1 implicit negative via distinctness check). All reviewer issues addressed: pinned URL, luminance formula, visibility definition, colour normalisation, toggle selector, fixture guarantees, and `data-activity-type` convention.