Feature: Health Playground scaffolding and GitHub Pages deployment workflow

  Background:
    Given the repository is checked out
    And dependencies have been installed with "npm install"

  Scenario: The application builds as a static site
    When the command "npm run build" is executed
    Then the command exits with code 0
    And a file "out/index.html" exists in the build output

  Scenario: The home page displays the application title in the top bar
    Given the application has been built and is being served
    When a browser navigates to the home page "/"
    Then the page returns HTTP status 200
    And an element with data-testid "top-bar" is visible
    And the text "Health Playground" is visible inside the element with data-testid "top-bar"

  Scenario: The top bar contains a placeholder for the dataset selector
    Given the application has been built and is being served
    When a browser navigates to the home page "/"
    Then an element with data-testid "dataset-selector" exists inside the element with data-testid "top-bar"

  Scenario: A GitHub Actions workflow is configured to deploy to GitHub Pages
    Then a file ".github/workflows/deploy.yml" exists
    And the file ".github/workflows/deploy.yml" contains the text "actions/deploy-pages"
    And the file ".github/workflows/deploy.yml" contains the text "actions/upload-pages-artifact"
    And the file ".github/workflows/deploy.yml" contains a job step that runs "npm run build"

  Scenario: Building with a missing dependency fails clearly
    Given the directory "node_modules" has been removed
    When the command "npm run build" is executed
    Then the command exits with a non-zero status code