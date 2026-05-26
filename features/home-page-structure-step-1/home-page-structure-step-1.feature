Feature: Home Page Structure

  Background:
    Given the user navigates to the home page

  Scenario: Top bar displays the application title
    Then the text "Health Playground" is visible on the page

  Scenario: Top bar contains the dataset selector
    Then an element with data-testid "dataset-selector" is visible

  Scenario: Page layout contains a two-column content area below the top bar
    Then an element with data-testid "content-area" is visible
    And an element with data-testid "left-column" is visible
    And an element with data-testid "right-column" is visible

  Scenario: Left column contains Training Overview above Weekly Dashboard
    Then an element with data-testid "training-overview" is visible within data-testid "left-column"
    And an element with data-testid "weekly-dashboard" is visible within data-testid "left-column"
    And the element with data-testid "training-overview" appears before the element with data-testid "weekly-dashboard"

  Scenario: Training Overview shows placeholder content
    Then the text "Training Overview" is visible within the element with data-testid "training-overview"

  Scenario: Right column contains the Insights component
    Then an element with data-testid "insights" is visible within data-testid "right-column"

  Scenario: Insights component shows placeholder content
    Then the text "Insights" is visible within the element with data-testid "insights"