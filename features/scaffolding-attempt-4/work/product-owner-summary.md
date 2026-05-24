STATUS: OK

## Summary

**Status:** OK

**Input feature request (full):**
> Set up scaffolding for a Next.js application titled "Health Playground". It must have a bar at the top with the title, and in the future a way to select the current data set. Add a Gitlab workflow to deploy the application to Github Pages.

**Interpretation:**
- "Gitlab workflow" is interpreted as a typo for "GitHub Actions workflow", since the deployment target is GitHub Pages. A GitLab CI workflow deploying to GitHub Pages would be inconsistent and non-standard.
- "Scaffolding" means a minimal but runnable Next.js app: the project builds, the home page renders, and the top bar with the title is visible.
- "A way to select the current data set in the future" is interpreted as a placeholder element (a dataset selector region) present in the top bar now, but not yet wired to functionality. To keep it testable, the placeholder must be locatable by a stable identifier.
- Deployment to GitHub Pages requires Next.js static export (the app must produce static HTML in an output directory).

**Decisions:**
- Use `data-testid` attributes for the top bar and dataset selector placeholder to give tests stable selectors independent of styling.
- Pin the workflow path to `.github/workflows/deploy.yml` and the build command to `npm run build`.
- Pin the static output directory to `out/` (Next.js default for static export).
- Visible title text is exactly `Health Playground`.

**Alternatives considered:**
- Treating "Gitlab workflow" literally — ruled out as inconsistent with GitHub Pages target.
- Omitting the dataset selector until later — ruled out because the request explicitly says the top bar must accommodate it.
- Asserting deployment success on a live URL — ruled out as it depends on external infrastructure; instead assert the workflow file and static build output.

**Output summary:** 5 scenarios written, 2 negative cases covered.