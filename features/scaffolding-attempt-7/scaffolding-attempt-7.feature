Feature: Health Playground Next.js scaffolding

  Background:
    Given the repository is checked out
    And dependencies have been installed with "npm install"

  Scenario: The application builds successfully
    When the command "npm run build" is executed
    Then the command exits with code 0

  Scenario: The home page is served successfully
    Given the application has been built with "npm run build"
    When an HTTP GET request is made to the path "/" on the running application
    Then the response has HTTP status 200

  Scenario: The top bar displays the application title
    Given the application is running
    When a browser loads the path "/"
    Then an element with data-testid "top-bar" is visible on the page
    And the text "Health Playground" is visible inside the element with data-testid "top-bar"

  Scenario: The top bar contains a placeholder for the future dataset selector
    Given the application is running
    When a browser loads the path "/"
    Then an element with data-testid "dataset-selector-placeholder" exists inside the element with data-testid "top-bar"

  Scenario: Requesting a non-existent route returns a 404
    Given the application is running
    When an HTTP GET request is made to the path "/this-route-does-not-exist" on the running application
    Then the response has HTTP status 404