Feature: Health Playground application scaffolding

  Background:
    Given the "Health Playground" Next.js application has been scaffolded

  Scenario: Home page loads successfully
    When a user navigates to the application's home page
    Then the page responds successfully
    And the page renders without errors

  Scenario: Top bar displays the application title
    When a user views any page of the application
    Then a top bar is visible at the top of the page
    And the top bar contains the text "Health Playground"

  Scenario: Top bar reserves a placeholder for the future dataset selector
    When a user views the top bar
    Then a dedicated region for a future dataset selector is present in the top bar
    And the region is identifiable as the dataset selector placeholder

  Scenario: Application can be built as a static site for GitHub Pages
    When the production build process is executed
    Then the build completes successfully
    And it produces a static output suitable for hosting on GitHub Pages

  Scenario: GitHub Pages deployment workflow is defined
    When inspecting the repository's CI configuration
    Then a GitHub Actions workflow file exists for deploying to GitHub Pages
    And the workflow is triggered on pushes to the default branch
    And the workflow builds the application and publishes the static output to GitHub Pages

  Scenario: Missing title is detected as a failure
    Given the top bar does not contain the text "Health Playground"
    When a user views any page of the application
    Then the scaffolding is considered incomplete

  Scenario: Missing deployment workflow is detected as a failure
    Given no GitHub Actions workflow for GitHub Pages deployment exists in the repository
    When the repository CI configuration is inspected
    Then the scaffolding is considered incomplete