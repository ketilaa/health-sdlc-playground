#!/usr/bin/env python3
"""Feature Specification: Product Owner and Feature Reviewer in an iteration loop."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    call_claude, call_claude_messages, extract_between,
    get_feature_name, is_ok, read_file, read_prompt,
    require_files, write_file,
)

MAX_ITERATIONS = 3


def run_product_owner(feature_name, messages):
    system_prompt = read_prompt('product-owner')
    assistant_text = call_claude_messages(system_prompt, messages, max_tokens=4096)
    messages.append({'role': 'assistant', 'content': assistant_text})

    gherkin = extract_between(assistant_text, '===GHERKIN===\n', '===END GHERKIN===')
    gherkin_start = assistant_text.find('===GHERKIN===')
    summary = assistant_text[:gherkin_start].strip() if gherkin_start != -1 else assistant_text

    return is_ok(assistant_text), gherkin, summary, messages


def run_feature_reviewer(feature_name, gherkin, po_summary):
    system_prompt = read_prompt('feature-reviewer')
    user_message = f"""Feature name: {feature_name}

## Gherkin Feature Specification
{gherkin}

## Product Owner Summary
{po_summary}

Start your response with STATUS: OK or STATUS: STOP.
"""
    response = call_claude(system_prompt, user_message, max_tokens=2048)
    return is_ok(response), response


def main():
    feature_name = get_feature_name()
    require_files(f'features/{feature_name}/feature.txt')
    feature_request = read_file(f'features/{feature_name}/feature.txt') or ''
    project_context = read_file('CLAUDE.md') or ''

    messages = [{'role': 'user', 'content': f"""Feature name: {feature_name}

## Project Context
{project_context}

## Feature request
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

Output STATUS: STOP instead of OK if the request is too vague or contradictory.
"""}]

    for iteration in range(1, MAX_ITERATIONS + 1):
        print(f'--- Feature Specification iteration {iteration}/{MAX_ITERATIONS} ---')

        po_ok, gherkin, po_summary, messages = run_product_owner(feature_name, messages)
        write_file(f'features/{feature_name}/work/product-owner-summary.md', po_summary)

        if not po_ok:
            print(f'Product Owner STOP:\n{po_summary}')
            sys.exit(1)

        if not gherkin:
            print('ERROR: No ===GHERKIN=== block in product owner response')
            sys.exit(1)

        write_file(f'features/{feature_name}/{feature_name}.feature', gherkin)

        fr_ok, fr_summary = run_feature_reviewer(feature_name, gherkin, po_summary)
        write_file(f'features/{feature_name}/work/feature-reviewer-summary.md', fr_summary)

        if fr_ok:
            print(f'Feature spec accepted on iteration {iteration}.')
            sys.exit(0)

        print(f'Feature Reviewer STOP on iteration {iteration}.')

        if iteration == MAX_ITERATIONS:
            print(f'Feature spec not accepted after {MAX_ITERATIONS} iterations.')
            sys.exit(1)

        truncated = fr_summary[-2000:] if len(fr_summary) > 2000 else fr_summary
        messages.append({'role': 'user', 'content': (
            'The feature reviewer rejected your spec. Revise it based on this feedback.\n\n'
            f'Reviewer feedback:\n{truncated}\n\n'
            'Output the corrected spec using the same format '
            '(STATUS: OK, agent summary, ===GHERKIN=== block).'
        )})

    sys.exit(1)


if __name__ == '__main__':
    main()
