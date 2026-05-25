Feature: Make Weekly Dashboard the Home Page

  Background:
    Given the repository is checked out
    And the development server is running at "http://localhost:3000"

  Scenario: Root route renders the Weekly Dashboard
    When the user navigates to "http://localhost:3000/"
    Then the page returns HTTP status 200
    And the text "Weekly Dashboard" is visible on the page

  Scenario: Root route does not render the Training Overview
    When the user navigates to "http://localhost:3000/"
    Then the page returns HTTP status 200
    And no element with data-testid "training-overview" is present on the page

  Scenario: The /weekly-dashboard route issues a permanent redirect to the root route
    When the user navigates directly to "http://localhost:3000/weekly-dashboard" without following redirects
    Then the response HTTP status is 308
    And the response Location header is "/"

  Scenario: The browser lands on the root route after following the /weekly-dashboard redirect
    When the user navigates to "http://localhost:3000/weekly-dashboard"
    Then the browser's final URL is "http://localhost:3000/"
    And the text "Weekly Dashboard" is visible on the page

  Scenario: TrainingOverview component file has been deleted from the codebase
    Then the file "frontend/src/components/TrainingOverview.tsx" does not exist

  Scenario: Weekly Dashboard renders without horizontal overflow on a narrow viewport
    Given the browser viewport is set to 390 pixels wide and 844 pixels tall
    When the user navigates to "http://localhost:3000/"
    Then the page returns HTTP status 200
    And the element with data-testid "weekly-dashboard-container" does not cause a horizontal scrollbar on the page

  Scenario: Non-existent routes return HTTP 404
    When the user navigates to "http://localhost:3000/non-existent-route"
    Then the page returns HTTP status 404