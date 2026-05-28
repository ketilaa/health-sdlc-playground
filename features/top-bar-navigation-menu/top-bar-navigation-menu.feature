Feature: Top Bar Navigation Menu

  Background:
    Given the application is running at "http://localhost:3000"
    And the user navigates to "http://localhost:3000/"

  Scenario: Navigation menu is not visible before the trigger is activated
    Then no element with data-testid "nav-menu" is visible on the page

  Scenario: Clicking the navigation menu trigger opens the menu
    When the user clicks the element with data-testid "nav-menu-trigger"
    Then an element with data-testid "nav-menu" is visible on the page

  Scenario: The open navigation menu contains a "Home" item
    When the user clicks the element with data-testid "nav-menu-trigger"
    Then an element with data-testid "nav-menu" is visible on the page
    And an element with data-testid "nav-menu-item-home" is visible on the page
    And the element with data-testid "nav-menu-item-home" contains the text "Home"

  Scenario: Selecting "Home" from the navigation menu navigates to the root page
    When the user clicks the element with data-testid "nav-menu-trigger"
    And the user clicks the element with data-testid "nav-menu-item-home"
    Then an element with data-testid "content-area" is visible on the page