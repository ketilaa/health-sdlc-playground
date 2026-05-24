Feature: Health Playground application scaffolding

  Scenario: Application homepage loads successfully
    Given the Health Playground application is built and running
    When a user navigates to the homepage
    Then the page responds with a successful status
    And the page renders without errors

  Scenario: Top bar displays the application title
    Given the Health Playground application is running
    When a user views any page of the application
    Then a top bar is visible at the top of the page
    And the top bar contains the text "Health Playground"

  Scenario: Top bar contains a placeholder for the dataset selector
    Given the Health Playground application is running
    When a user views the top bar
    Then a dataset selector placeholder element is present in the top bar

  Scenario: GitHub Pages deployment workflow exists
    Given the repository contains the scaffolded application
    When inspecting the repository's CI/CD configuration
    Then a GitHub Actions workflow file exists in ".github/workflows"
    And the workflow is configured to build the Next.js application
    And the workflow is configured to deploy the built output to GitHub Pages

  Scenario: Deployment workflow triggers on push to the main branch
    Given a GitHub Actions deployment workflow is configured
    When a commit is pushed to the main branch
    Then the workflow is triggered
    And it produces a static build artifact suitable for GitHub Pages

  Scenario: Application builds as a static export
    Given the Health Playground application source code
    When the production build command is executed
    Then the build completes successfully
    And static assets are generated in an output directory deployable to GitHub Pages

  Scenario: Navigating to a non-existent page returns a not-found response
    Given the Health Playground application is running
    When a user navigates to a route that does not exist
    Then the application responds with a not-found page
    And the top bar remains visible on the not-found page