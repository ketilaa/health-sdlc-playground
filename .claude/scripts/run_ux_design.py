#!/usr/bin/env python3
"""UX Design: UX Designer and UX Reviewer in an iteration loop."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    call_claude, call_claude_messages, extract_between,
    get_feature_name, is_ok, read_file, read_prompt,
    require_files, write_file,
)

MAX_ITERATIONS = 3


def run_ux_designer(messages):
    system_prompt = read_prompt('ux-designer')
    assistant_text = call_claude_messages(system_prompt, messages, max_tokens=4096)
    messages.append({'role': 'assistant', 'content': assistant_text})

    ux_spec = extract_between(assistant_text, '===UX SPEC===\n', '===END UX SPEC===')
    ux_start = assistant_text.find('===UX SPEC===')
    summary = assistant_text[:ux_start].strip() if ux_start != -1 else assistant_text

    return is_ok(assistant_text), ux_spec, summary, messages


def run_ux_reviewer(feature_name, feature_spec, ux_spec, fr_summary, uxd_summary):
    system_prompt = read_prompt('ux-reviewer')
    user_message = f"""Feature name: {feature_name}

## Gherkin Feature Specification
{feature_spec}

## UX Specification
{ux_spec}

## Feature Reviewer Summary
{fr_summary}

## UX Designer Summary
{uxd_summary}

Start your response with STATUS: OK or STATUS: STOP.
"""
    response = call_claude(system_prompt, user_message, model='claude-sonnet-4-6', max_tokens=4096)
    return is_ok(response), response


def main():
    feature_name = get_feature_name()
    feature_path = f'features/{feature_name}/{feature_name}.feature'
    fr_summary_path = f'features/{feature_name}/work/feature-reviewer-summary.md'
    require_files(feature_path, fr_summary_path)

    feature_spec = read_file(feature_path)
    fr_summary = read_file(fr_summary_path)

    messages = [{'role': 'user', 'content': f"""Feature name: {feature_name}

## Gherkin Feature Specification
{feature_spec}

## Feature Reviewer Summary
{fr_summary}

Start your response with STATUS: OK or STATUS: STOP.
Wrap the UX specification content in ===UX SPEC=== / ===END UX SPEC=== delimiters.
"""}]

    for iteration in range(1, MAX_ITERATIONS + 1):
        print(f'--- UX Design iteration {iteration}/{MAX_ITERATIONS} ---')

        ux_ok, ux_spec, uxd_summary, messages = run_ux_designer(messages)
        write_file(f'features/{feature_name}/work/ux-designer-summary.md', uxd_summary)

        if not ux_ok:
            print(f'UX Designer STOP:\n{uxd_summary}')
            sys.exit(1)

        if not ux_spec:
            print('ERROR: No ===UX SPEC=== block in designer response')
            sys.exit(1)

        write_file(f'features/{feature_name}/ux.md', ux_spec)

        uxr_ok, uxr_summary = run_ux_reviewer(
            feature_name, feature_spec, ux_spec, fr_summary, uxd_summary
        )
        write_file(f'features/{feature_name}/work/ux-reviewer-summary.md', uxr_summary)

        if uxr_ok:
            print(f'UX spec accepted on iteration {iteration}.')
            sys.exit(0)

        print(f'UX Reviewer STOP on iteration {iteration}.')

        if iteration == MAX_ITERATIONS:
            print(f'UX spec not accepted after {MAX_ITERATIONS} iterations.')
            sys.exit(1)

        truncated = uxr_summary[-2000:] if len(uxr_summary) > 2000 else uxr_summary
        messages.append({'role': 'user', 'content': (
            'The UX reviewer rejected your spec. Revise it based on this feedback.\n\n'
            f'Reviewer feedback:\n{truncated}\n\n'
            'Output the corrected UX spec using the same format '
            '(STATUS: OK, summary, ===UX SPEC=== block).'
        )})

    sys.exit(1)


if __name__ == '__main__':
    main()
