Feature: Improve Weekly Aggregates and Prepare for More Insights

  Background:
    Given the repository is checked out
    And the application is running at "http://localhost:3000"
    And the mock dataset contains at least 3 weeks of activity data
    And week "2024-W10" contains the following activities:
      | name              | type      | duration_min | distance_km | avg_hr | cadence |
      | Morning Run       | run       | 45           | 8.2         | 148    | 172     |
      | Interval Session  | intervals | 30           | 6.0         | 168    | 180     |
      | Recovery Jog      | recovery  | 40           | 6.5         | 130    | 162     |
      | Long Run          | long_run  | 90           | 16.0        | 140    | 165     |
    And week "2024-W10" has a resting heart rate series averaging 52 bpm and a VO2max of 54
    And week "2024-W09" has total training load lower than week "2024-W10", average HR of 145 bpm, and resting HR averaging 54 bpm
    And week "2024-W08" exists with complete data

  # ── Data model: activity-level fields ──────────────────────────────────────

  Scenario: Activity records expose cadence and average heart rate fields
    Given the user navigates to "http://localhost:3000"
    When the user selects week "2024-W10" using the element with data-testid "week-selector"
    And the user clicks the activity "Interval Session" in the element with data-testid "activity-list"
    Then an element with data-testid "activity-detail" is visible on the page
    And the element with data-testid "activity-avg-hr" contains the text "168"
    And the element with data-testid "activity-cadence" contains the text "180"

  Scenario: Activity detail displays a dash when cadence or average heart rate is absent
    Given the mock dataset contains an activity in week "2024-W10" named "Strength Cross-Train" with type "other" and no cadence or avg_hr values
    And the user navigates to "http://localhost:3000"
    When the user selects week "2024-W10" using the element with data-testid "week-selector"
    And the user clicks the activity "Strength Cross-Train" in the element with data-testid "activity-list"
    Then the element with data-testid "activity-avg-hr" contains the text "—"
    And the element with data-testid "activity-cadence" contains the text "—"

  # ── Data model: weekly-level fields ────────────────────────────────────────

  Scenario: Weekly summary displays VO2max and average resting heart rate
    Given the user navigates to "http://localhost:3000"
    When the user selects week "2024-W10" using the element with data-testid "week-selector"
    Then an element with data-testid "weekly-vo2max" is visible on the page
    And the element with data-testid "weekly-vo2max" contains the text "54"
    And an element with data-testid "weekly-resting-hr" is visible on the page
    And the element with data-testid "weekly-resting-hr" contains the text "52"

  # ── Weekly aggregates ───────────────────────────────────────────────────────

  Scenario: Weekly summary shows average heart rate aggregated from activities
    Given the user navigates to "http://localhost:3000"
    When the user selects week "2024-W10" using the element with data-testid "week-selector"
    Then an element with data-testid "weekly-avg-hr" is visible on the page
    And the element with data-testid "weekly-avg-hr" contains the text "147"

  Scenario: Weekly summary shows average cadence aggregated from activities
    Given the user navigates to "http://localhost:3000"
    When the user selects week "2024-W10" using the element with data-testid "week-selector"
    Then an element with data-testid "weekly-avg-cadence" is visible on the page
    And the element with data-testid "weekly-avg-cadence" contains the text "170"

  # ── Derived indicator: intensity balance ────────────────────────────────────

  Scenario: Weekly summary shows intensity balance between low and high intensity sessions
    Given the user navigates to "http://localhost:3000"
    When the user selects week "2024-W10" using the element with data-testid "week-selector"
    Then an element with data-testid "intensity-balance" is visible on the page
    And the element with data-testid "intensity-balance" contains the text "Low: 3"
    And the element with data-testid "intensity-balance" contains the text "High: 1"
    And the element with data-testid "intensity-balance" has aria-label "Intensity balance: 3 low-intensity sessions, 1 high-intensity session"

  # ── Derived indicators: week-over-week trends ───────────────────────────────

  Scenario: Trend indicators show increasing training load, increasing average HR, and decreasing resting HR compared to previous week
    Given the user navigates to "http://localhost:3000"
    When the user selects week "2024-W10" using the element with data-testid "week-selector"
    Then an element with data-testid "trend-training-load" is visible on the page
    And the element with data-testid "trend-training-load" contains the text "↑ Increasing"
    And an element with data-testid "trend-avg-hr" is visible on the page
    And the element with data-testid "trend-avg-hr" contains the text "↑ Increasing"
    And an element with data-testid "trend-resting-hr" is visible on the page
    And the element with data-testid "trend-resting-hr" contains the text "↓ Decreasing"

  Scenario: Trend indicators show stable when week-over-week change is within 2 percent
    Given week "2024-W09" has total training load within 2 percent of week "2024-W08", average HR within 2 percent of week "2024-W08", and resting HR within 2 percent of week "2024-W08"
    And the user navigates to "http://localhost:3000"
    When the user selects week "2024-W09" using the element with data-testid "week-selector"
    Then the element with data-testid "trend-training-load" contains the text "→ Stable"
    And the element with data-testid "trend-avg-hr" contains the text "→ Stable"
    And the element with data-testid "trend-resting-hr" contains the text "→ Stable"

  Scenario: Trend indicators show no comparison available for the earliest week in the dataset
    Given the earliest week in the mock dataset is "2024-W08"
    And the user navigates to "http://localhost:3000"
    When the user selects week "2024-W08" using the element with data-testid "week-selector"
    Then the element with data-testid "trend-training-load" contains the text "—"
    And the element with data-testid "trend-avg-hr" contains the text "—"
    And the element with data-testid "trend-resting-hr" contains the text "—"

  # ── Existing navigation and drill-down ─────────────────────────────────────

  Scenario: User can browse between weeks and drill down into a workout
    Given the user navigates to "http://localhost:3000"
    When the user selects week "2024-W10" using the element with data-testid "week-selector"
    Then an element with data-testid "activity-list" is visible on the page
    And the element with data-testid "activity-list" contains the text "Morning Run"
    When the user clicks the activity "Morning Run" in the element with data-testid "activity-list"
    Then an element with data-testid "activity-detail" is visible on the page
    And the element with data-testid "activity-detail" contains the text "Morning Run"
    When the user selects week "2024-W09" using the element with data-testid "week-selector"
    Then an element with data-testid "activity-list" is visible on the page

  # ── Responsive layout ───────────────────────────────────────────────────────

  Scenario: Weekly summary card remains readable at 375px viewport width
    Given the user navigates to "http://localhost:3000" with a viewport width of 375 pixels
    When the user selects week "2024-W10" using the element with data-testid "week-selector"
    Then an element with data-testid "weekly-summary-card" is visible on the page
    And the element with data-testid "weekly-vo2max" is visible on the page
    And the element with data-testid "weekly-resting-hr" is visible on the page
    And the element with data-testid "intensity-balance" is visible on the page
    And the element with data-testid "trend-training-load" is visible on the page