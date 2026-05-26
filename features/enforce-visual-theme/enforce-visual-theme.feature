Feature: Enforce Visual Theme

  Background:
    Given the application is running at "http://localhost:3000"
    And the test fixture dataset is loaded

  Scenario: Each activity row exposes its activity type for colour coding
    When the user navigates to "http://localhost:3000/"
    And the user clicks the element with data-testid "week-row" containing the text "Week 8"
    Then an element with data-testid "week-activities" is visible
    And each element with data-testid "activity-row" within "week-activities" has a "data-activity-type" attribute with a non-empty value

  Scenario: Activity type attribute values match the known activity types
    When the user navigates to "http://localhost:3000/"
    And the user clicks the element with data-testid "week-row" containing the text "Week 8"
    Then an element with data-testid "week-activities" is visible
    And an element with data-testid "activity-row" and data-activity-type "long_run" is visible within "week-activities"
    And an element with data-testid "activity-row" and data-activity-type "restorative_run" is visible within "week-activities"
    And an element with data-testid "activity-row" and data-activity-type "intervals" is visible within "week-activities"

  Scenario: Skipped activity marker exposes its type for colour coding
    When the user navigates to "http://localhost:3000/"
    And the user clicks the element with data-testid "week-row" containing the text "Week 4"
    Then an element with data-testid "week-activities" is visible
    And the element with data-testid "skipped-activity" within "week-activities" has a "data-activity-type" attribute with value "skipped"

  Scenario: Activity type attribute is consistent for the same type across different weeks
    When the user navigates to "http://localhost:3000/"
    And the user clicks the element with data-testid "week-row" containing the text "Week 8"
    Then an element with data-testid "activity-row" and data-activity-type "long_run" is visible within "week-activities"
    When the user clicks the element with data-testid "week-row" containing the text "Week 7"
    Then an element with data-testid "activity-row" and data-activity-type "long_run" is visible within "week-activities"