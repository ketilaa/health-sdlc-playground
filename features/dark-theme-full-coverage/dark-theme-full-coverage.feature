Feature: Dark Theme Full Coverage

  Background:
    Given the application is running at "http://localhost:3000"

  Scenario: Home page presents a dark visual theme across all visible surfaces
    When the user navigates to "http://localhost:3000/"
    Then the page presents a dark visual theme across all visible surfaces