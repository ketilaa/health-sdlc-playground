The TrainingOverview tests pass. Two pre-existing test files have issues unrelated to my feature:

1. `src/app/not-found.test.tsx` — `not-found.tsx` is failing to resolve a module at line 14 (likely a missing import). I need to inspect/restore this file.
2. `src/components/TopBar.test.tsx` — not shown in failures actually; let me re-read. Only `not-found.test.tsx` is reported failing (`Test Suites: 2 failed` but only 1 visible). The `layout.test.tsx` shows a console warning, not a failure.

The `not-found.tsx` module resolution error at line 14 — I never wrote `not-found.tsx`, so it's a pre-existing file with a broken import. I'll create a minimal `not-found.tsx` that satisfies its test (heading "404", sub-message "couldn't find that page", and a link to "/").

Let me also check what the second failing suite is. The output shows "2 failed, 5 passed, 7 total" with only `not-found.test.tsx` visible in the error trace. The other failure must be `TopBar.test.tsx` — its tests reference a `TopBar` component which may also have a broken import. I'll restore both.