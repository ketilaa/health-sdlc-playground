STATUS: OK

## Agent summary

**Input feature request (verbatim):**
> Generate a dataset for a person that are training for a half-maraton. Data set starts when the person is realtively untrained 8 weeks ago. The person has been following the same plan consistently with a mix of long runs, restorative runs and intervals. One exercise in the middle of the period were skipped due to sickness.
>
> Give this data set a good, descriptive name and make it the default dataset in the dataset picker in the top bar.
>
> Visualize the dataset as week aggregates sorted from newest to oldest. It must be possible to drill down to see detailed activities for a week.
>
> Only show data that are relevant for an overview. Later, when we start adding insights, we expose data like trends etc.
>
> It is important that tests have their own data and does not rely on the "live" datasets.

**Interpretation:**
- "Realtively untrained 8 weeks ago" → 8 weeks of data ending today, week 1 (oldest) shows low volume, progressing upward.
- "Same plan consistently" → a repeating weekly pattern of three activity types: long run, restorative run, intervals.
- "One exercise in the middle ... skipped due to sickness" → exactly one planned session missing in week 4 or 5.
- "Good descriptive name" → I chose "Half-Marathon Build-Up — 8 Week Consistent Plan".
- "Default dataset in the picker" → it is preselected on first load.
- "Week aggregates sorted newest to oldest" → list/table with most recent week at top.
- "Drill down" → clicking a week reveals individual activities for that week.
- "Only relevant overview data" → for week aggregate: total distance, total duration, number of activities. For drill-down activity: date, type (long/restorative/intervals), distance, duration. Pace, HR, trends, etc. excluded per request.
- "Tests have their own data" → a separate fixture dataset is used in E2E tests, not the production "live" dataset.

**Decisions:**
- Dataset name pinned as `Half-Marathon Build-Up — 8 Week Consistent Plan`.
- Weekly pattern: 3 sessions/week (long, restorative, intervals) = 24 planned, 23 actual (1 skipped).
- Skipped session: the intervals session in week 4 (counting from oldest).
- Test isolation: tests run with a `?dataset=test-fixture` mechanism (or equivalent test-only dataset id) that is invisible/inert to normal users. The Gherkin asserts behavior, not the mechanism name — but pins that the test dataset is distinct from the default.
- Drill-down: clicking a week row reveals activities inline or via a panel; Gherkin pins observable visible activity rows without prescribing layout.
- Overview fields chosen: distance (km), duration, activity count. Activity fields: date, type, distance, duration.

**Alternatives considered:**
- Skipping a long run instead of intervals — rejected; intervals fits "exercise" wording and a missed high-intensity session is common with sickness.
- 4 sessions/week — rejected; three types named in request, simplest faithful mapping is 3/week.
- Showing pace/HR in overview — rejected; explicitly out of scope per "only overview data".
- Separate route for drill-down — left unprescribed; Gherkin only asserts observable result.

**Output summary:** 8 scenarios written (6 positive, 2 negative), covering dataset content, default selection, week aggregation, sort order, drill-down, overview-only fields, test data isolation, and loading state.