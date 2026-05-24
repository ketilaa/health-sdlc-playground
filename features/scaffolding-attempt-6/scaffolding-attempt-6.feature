Feature: Health Playground application scaffolding

  Background:
    Given the repository is checked out
    And dependencies have been installed with "npm install"

  Scenario: Home page responds successfully
    When a GET request is made to "/" on the running development server
    Then the response has HTTP status 200

  Scenario: Home page displays the application title in the top bar
    When the home page "/" is loaded in a browser
    Then an element with data-testid "app-header" is visible
    And the text "Health Playground" is visible inside the element with data-testid "app-header"

  Scenario: Home page reserves a location for the future dataset selector
    When the home page "/" is loaded in a browser
    Then an element with data-testid "dataset-selector-placeholder" is present inside the element with data-testid "app-header"

  Scenario: Document title is set to the application name
    When the home page "/" is loaded in a browser
    Then the document title equals "Health Playground"

  Scenario: Unknown routes return a not-found response
    When a GET request is made to "/this-route-does-not-exist" on the running development server
    Then the response has HTTP status 404