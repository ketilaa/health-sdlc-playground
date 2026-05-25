Feature: Visual theme overhaul for Training Overview

  # Glossary (applies to all scenarios):
  # - "visible" = element is attached to the document, not display:none, not visibility:hidden,
  #   and has a bounding rectangle with width > 0 and height > 0.
  # - "resolved colour value of X" = the string returned by window.getComputedStyle for property X,
  #   which is always in the canonical form "rgb(r, g, b)" or "rgba(r, g, b, a)" with integer
  #   channels 0–255. All colour equality checks compare these canonical strings directly.
  # - "resolved value of CSS custom property --p on document.documentElement" = the trimmed string
  #   returned by getComputedStyle(document.documentElement).getPropertyValue('--p'),
  #   further normalised by resolving it through a hidden probe element's background-color so
  #   it ends up in the same canonical "rgb(...)" / "rgba(...)" form.
  # - "relative luminance L of an rgb colour" = the WCAG 2.x formula:
  #     for each channel c in {R, G, B}: cs = c/255;
  #       cl = cs/12.92 if cs <= 0.03928, else ((cs+0.055)/1.055)^2.4
  #     L = 0.2126*Rl + 0.7152*Gl + 0.0722*Bl
  # - "data-activity-type" attribute is used ONLY on elements representing one of the three real
  #   activity types and takes exactly one of the values: "long-run", "restorative-run", "intervals".
  #   The sickness-week skipped marker does NOT carry data-activity-type; it is identified solely
  #   by data-testid="skipped-activity-marker".

  Background:
    Given the application is served at `http://localhost:3000/`
    And the Training Overview page at `http://localhost:3000/` has finished rendering
    And the rendered Training Overview contains at least one element with `data-activity-type="long-run"`
    And the rendered Training Overview contains at least one element with `data-activity-type="restorative-run"`
    And the rendered Training Overview contains at least one element with `data-activity-type="intervals"`
    And the rendered Training Overview contains exactly one element with `data-testid="skipped-activity-marker"`

  Scenario: Dark background is applied app-wide
    When the resolved colour value of the `background-color` property of the `<body>` element is computed
    Then its relative luminance L (per the WCAG formula in the glossary) is strictly less than 0.2

  Scenario: Theme colours are defined as CSS custom properties on the document root
    Then the resolved value of `--color-activity-long-run` on `document.documentElement` is a non-empty string
    And the resolved value of `--color-activity-restorative-run` on `document.documentElement` is a non-empty string
    And the resolved value of `--color-activity-intervals` on `document.documentElement` is a non-empty string
    And the resolved value of `--color-activity-skipped` on `document.documentElement` is a non-empty string
    And the resolved value of `--color-background` on `document.documentElement` is a non-empty string

  Scenario Outline: Each activity type renders in its own theme colour
    Then every element with `data-activity-type="<type>"` has a resolved `background-color` value equal to the resolved value of the CSS custom property `<token>` on `document.documentElement`

    Examples:
      | type             | token                              |
      | long-run         | --color-activity-long-run          |
      | restorative-run  | --color-activity-restorative-run   |
      | intervals        | --color-activity-intervals         |

  Scenario: Colour coding remains visible when an activity row is expanded
    Given the first visible element with `data-testid="activity-row"` and `data-activity-type="long-run"` is located
    And within that row, an element with `data-testid="activity-row-toggle"` is visible
    When the element with `data-testid="activity-row-toggle"` within that row is clicked
    Then within that same row, an element with `data-testid="activity-row-expanded"` becomes visible
    And that expanded element carries the attribute `data-activity-type="long-run"`
    And that expanded element has a resolved `background-color` value equal to the resolved value of the CSS custom property `--color-activity-long-run` on `document.documentElement`

  Scenario: Sickness-week skipped marker has its own distinct visual treatment
    Then the element with `data-testid="skipped-activity-marker"` is visible
    And that element has a resolved `background-color` value equal to the resolved value of the CSS custom property `--color-activity-skipped` on `document.documentElement`
    And that element does NOT carry a `data-activity-type` attribute

  Scenario: All four activity-related theme colours resolve to pairwise distinct values
    When the resolved values of `--color-activity-long-run`, `--color-activity-restorative-run`, `--color-activity-intervals`, and `--color-activity-skipped` on `document.documentElement` are collected, each normalised to canonical `rgb(...)` / `rgba(...)` form via the hidden-probe technique described in the glossary
    Then the four resulting canonical strings are pairwise unequal (string equality, no further normalisation)