Feature: Runner dataset with consistent improvement

  Background:
    Given the application is running with the test fixture dataset loaded
    And the test fixture dataset is named "Half-Marathon Build-Up — 8 Week Consistent Plan"

  Scenario: Default dataset is preselected in the top-bar picker
    When a user opens the application at the root path
    Then an element with data-testid "dataset-selector" is visible in the top bar
    And the element with data-testid "dataset-selector" displays the text "Half-Marathon Build-Up — 8 Week Consistent Plan"

  Scenario: Dataset contains 8 weeks of training data
    When a user opens the application at the root path
    Then exactly 8 elements with data-testid "week-row" are visible
    And the text "Week 8" is visible on the page
    And the text "Week 1" is visible on the page

  Scenario: Weeks are sorted from newest to oldest
    When a user opens the application at the root path
    Then the first element with data-testid "week-row" contains the text "Week 8"
    And the last element with data-testid "week-row" contains the text "Week 1"

  Scenario: Week aggregate shows only overview-relevant fields
    When a user opens the application at the root path
    Then each element with data-testid "week-row" contains an element with data-testid "week-total-distance"
    And each element with data-testid "week-row" contains an element with data-testid "week-total-duration"
    And each element with data-testid "week-row" contains an element with data-testid "week-activity-count"
    And no element with data-testid "week-average-pace" is present
    And no element with data-testid "week-average-heart-rate" is present
    And no element with data-testid "week-trend" is present

  Scenario: Consistent plan produces three activities per week except for the sickness week
    When a user opens the application at the root path
    Then 7 elements with data-testid "week-row" contain the text "3 activities"
    And exactly 1 element with data-testid "week-row" contains the text "2 activities"

  Scenario: Drill down reveals detailed activities for a selected week
    When a user opens the application at the root path
    And the user clicks the element with data-testid "week-row" containing the text "Week 8"
    Then an element with data-testid "week-activities" is visible
    And 3 elements with data-testid "activity-row" are visible within "week-activities"
    And the text "Long run" is visible within "week-activities"
    And the text "Restorative run" is visible within "week-activities"
    And the text "Intervals" is visible within "week-activities"

  Scenario: Drill down for the sickness week shows only two activities and a skipped marker
    When a user opens the application at the root path
    And the user clicks the element with data-testid "week-row" containing the text "Week 4"
    Then an element with data-testid "week-activities" is visible
    And 2 elements with data-testid "activity-row" are visible within "week-activities"
    And an element with data-testid "skipped-activity" is visible within "week-activities"
    And the text "Skipped due to sickness" is visible within "week-activities"

  Scenario: Activity rows show only overview-relevant fields
    When a user opens the application at the root path
    And the user clicks the element with data-testid "week-row" containing the text "Week 8"
    Then each element with data-testid "activity-row" contains an element with data-testid "activity-date"
    And each element with data-testid "activity-row" contains an element with data-testid "activity-type"
    And each element with data-testid "activity-row" contains an element with data-testid "activity-distance"
    And each element with data-testid "activity-row" contains an element with data-testid "activity-duration"
    And no element with data-testid "activity-pace" is present
    And no element with data-testid "activity-heart-rate" is present

  Scenario: Test dataset is isolated from live datasets
    When a user opens the element with data-testid "dataset-selector"
    Then the dropdown options visible to end users do not include any option with text "Test Fixture"
    And the test fixture used by automated tests is not selectable through the normal user interface

  Scenario: Loading state is shown before the dataset is rendered
    When a user opens the application at the root path with a slow network simulated
    Then an element with data-testid "dataset-loading" is visible before any element with data-testid "week-row" appears
    And the element with data-testid "dataset-loading" is no longer visible once at least one element with data-testid "week-row" is rendered