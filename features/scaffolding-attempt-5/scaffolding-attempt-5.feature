Feature: Health Playground Next.js scaffolding

  Background:
    Given the repository is checked out
    And dependencies have been installed with "npm install"

  Scenario: Production build succeeds
    When the command "npm run build" is executed
    Then the command exits with code 0

  Scenario: Home page is served successfully
    Given the application is running via "npm run dev"
    When a GET request is made to "/"
    Then the response has HTTP status 200

  Scenario: Top bar displays the application title and a dataset selector placeholder
    Given the application is running via "npm run dev"
    When a browser loads the page at "/"
    Then an element with data-testid "top-bar" is visible
    And the text "Health Playground" is visible inside the element with data-testid "top-bar"
    And an element with data-testid "dataset-selector-placeholder" is present inside the element with data-testid "top-bar"

  Scenario: Unknown route returns 404
    Given the application is running via "npm run dev"
    When a GET request is made to "/this-route-does-not-exist"
    Then the response has HTTP status 404