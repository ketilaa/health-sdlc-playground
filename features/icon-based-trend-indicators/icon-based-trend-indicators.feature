Feature: Icon-Based Trend Indicators

  Background:
    Given the application is running at "http://localhost:3000"
    And the test fixture dataset is loaded

  Scenario: Metric icons are always visible in collapsed week rows regardless of trend availability
    When the user navigates to "http://localhost:3000/"
    Then each element with data-testid "week-vo2max-trend" contains an element with data-testid "week-vo2max-metric-icon"
    And each element with data-testid "week-resting-hr-trend" contains an element with data-testid "week-resting-hr-metric-icon"

  Scenario: Trend direction icons are visible for weeks that have a prior week for comparison
    When the user navigates to "http://localhost:3000/"
    Then the element with data-testid "week-vo2max-trend" within the element with data-testid "week-row" containing the text "Week 8" contains an element with data-testid "week-vo2max-trend-icon"
    And the element with data-testid "week-resting-hr-trend" within the element with data-testid "week-row" containing the text "Week 8" contains an element with data-testid "week-resting-hr-trend-icon"
    And the element with data-testid "week-vo2max-trend" within the element with data-testid "week-row" containing the text "Week 3" contains an element with data-testid "week-vo2max-trend-icon"
    And the element with data-testid "week-resting-hr-trend" within the element with data-testid "week-row" containing the text "Week 3" contains an element with data-testid "week-resting-hr-trend-icon"

  Scenario: The earliest week shows no trend direction icon
    When the user navigates to "http://localhost:3000/"
    Then the element with data-testid "week-vo2max-trend" within the element with data-testid "week-row" containing the text "Week 1" does not contain an element with data-testid "week-vo2max-trend-icon"
    And the element with data-testid "week-resting-hr-trend" within the element with data-testid "week-row" containing the text "Week 1" does not contain an element with data-testid "week-resting-hr-trend-icon"
    And the element with data-testid "week-vo2max-trend" within the element with data-testid "week-row" containing the text "Week 1" contains an element with data-testid "week-vo2max-metric-icon"
    And the element with data-testid "week-resting-hr-trend" within the element with data-testid "week-row" containing the text "Week 1" contains an element with data-testid "week-resting-hr-metric-icon"

  Scenario: Week 8 trend containers carry accessible labels reflecting increasing VO2max and decreasing resting HR
    When the user navigates to "http://localhost:3000/"
    Then the element with data-testid "week-vo2max-trend" within the element with data-testid "week-row" containing the text "Week 8" has aria-label "VO2max trend: increasing"
    And the element with data-testid "week-resting-hr-trend" within the element with data-testid "week-row" containing the text "Week 8" has aria-label "Resting HR trend: decreasing"

  Scenario: Week 3 trend containers carry accessible labels reflecting stable trends
    When the user navigates to "http://localhost:3000/"
    Then the element with data-testid "week-vo2max-trend" within the element with data-testid "week-row" containing the text "Week 3" has aria-label "VO2max trend: stable"
    And the element with data-testid "week-resting-hr-trend" within the element with data-testid "week-row" containing the text "Week 3" has aria-label "Resting HR trend: stable"

  Scenario: The earliest week trend containers carry accessible labels indicating no comparison is available
    When the user navigates to "http://localhost:3000/"
    Then the element with data-testid "week-vo2max-trend" within the element with data-testid "week-row" containing the text "Week 1" has aria-label "VO2max trend: no data"
    And the element with data-testid "week-resting-hr-trend" within the element with data-testid "week-row" containing the text "Week 1" has aria-label "Resting HR trend: no data"