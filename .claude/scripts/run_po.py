#!/usr/bin/env python3
"""Product Owner agent: turns a feature request into a Gherkin specification."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    call_claude, extract_between, get_feature_name,
    is_ok, read_file, read_prompt, require_files, write_file,
)


def main():
    require_files('feature.txt')

    feature_name = get_feature_name()
    feature_request = read_file('feature.txt') or ''
    system_prompt = read_prompt('product-owner')

    user_message = f"""Feature name: {feature_name}

Feature request:
{feature_request}

Produce your response using this exact structure:

STATUS: OK

[Agent summary]

===GHERKIN===
Feature: <feature title>

  Scenario: <name>
    Given ...
    When ...
    Then ...
===END GHERKIN===

Output STATUS: STOP instead of OK if the request is too vague or contradictory to produce \
a reliable, testable specification.
"""

    response = call_claude(system_prompt, user_message, max_tokens=4096)

    gherkin = extract_between(response, '===GHERKIN===\n', '===END GHERKIN===')
    gherkin_start = response.find('===GHERKIN===')
    summary = response[:gherkin_start].strip() if gherkin_start != -1 else response

    write_file(f'features/{feature_name}/work/product-owner-summary.md', summary)

    if not is_ok(response):
        print(summary)
        sys.exit(1)

    if not gherkin:
        print('ERROR: Agent response contained no ===GHERKIN=== block')
        sys.exit(1)

    write_file(f'features/{feature_name}/{feature_name}.feature', gherkin)
    sys.exit(0)


if __name__ == '__main__':
    main()
