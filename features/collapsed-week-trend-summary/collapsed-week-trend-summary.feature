Feature: Collapsed Week Trend Summary

  Background:
    Given the application is running at "http://localhost:3000"
    And the test fixture dataset is loaded

  Scenario: Collapsed week rows display VO2max trend and resting HR trend indicators
    When the user navigates to "http://localhost:3000/"
    Then each element with data-testid "week-row" contains an element with data-testid "week-vo2max-trend"
    And each element with data-testid "week-row" contains an element with data-testid "week-resting-hr-trend"

  Scenario: Trend indicators are visible without expanding the week row
    When the user navigates to "http://localhost:3000/"
    Then an element with data-testid "week-vo2max-trend" is visible within the first element with data-testid "week-row"
    And an element with data-testid "week-resting-hr-trend" is visible within the first element with data-testid "week-row"
    And no element with data-testid "week-activities" is visible on the page

  Scenario: Week 8 shows increasing VO2max trend and decreasing resting HR trend
    When the user navigates to "http://localhost:3000/"
    Then the element with data-testid "week-vo2max-trend" within the element with data-testid "week-row" containing the text "Week 8" contains the text "↑ Increasing"
    And the element with data-testid "week-resting-hr-trend" within the element with data-testid "week-row" containing the text "Week 8" contains the text "↓ Decreasing"

  Scenario: A week with stable VO2max and stable resting HR shows stable trend indicators
    When the user navigates to "http://localhost:3000/"
    Then the element with data-testid "week-vo2max-trend" within the element with data-testid "week-row" containing the text "Week 3" contains the text "→ Stable"
    And the element with data-testid "week-resting-hr-trend" within the element with data-testid "week-row" containing the text "Week 3" contains the text "→ Stable"

  Scenario: The earliest week shows no comparison available for trend indicators
    When the user navigates to "http://localhost:3000/"
    Then the element with data-testid "week-vo2max-trend" within the element with data-testid "week-row" containing the text "Week 1" contains the text "—"
    And the element with data-testid "week-resting-hr-trend" within the element with data-testid "week-row" containing the text "Week 1" contains the text "—"