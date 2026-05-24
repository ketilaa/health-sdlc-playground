#!/usr/bin/env python3
"""Developer agent: implements the feature using TDD from the specifications."""
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    call_claude_messages, extract_files, get_feature_name, is_ok,
    read_file, read_prompt, require_files, strip_file_blocks, write_file,
)

MAX_ITERATIONS = 3


def run_tests():
    """Execute run-tests.sh. Returns (passed: bool, output: str)."""
    if not os.path.exists('run-tests.sh'):
        return False, 'ERROR: run-tests.sh not found — developer must provide it'
    result = subprocess.run(
        ['bash', 'run-tests.sh'],
        capture_output=True,
        text=True,
        env={**os.environ, 'CI': 'true'},
    )
    return result.returncode == 0, result.stdout + result.stderr


def main():
    feature_name = get_feature_name()
    feature_path = f'features/{feature_name}/{feature_name}.feature'
    ux_path = f'features/{feature_name}/ux.md'
    uxr_summary_path = f'features/{feature_name}/work/ux-reviewer-summary.md'
    require_files(feature_path, ux_path, uxr_summary_path)

    system_prompt = read_prompt('developer')
    feature_spec = read_file(feature_path)
    ux_spec = read_file(ux_path)
    uxr_summary = read_file(uxr_summary_path)

    initial_message = f"""Feature name: {feature_name}

## Gherkin Feature Specification (source of truth for behavior)
{feature_spec}

## UX Specification
{ux_spec}

## UX Reviewer Summary (spec approval)
{uxr_summary}

Write the scope file first, then run-tests.sh, then tests, then implementation.
Use ===FILE: path=== / ===END FILE=== delimiters for every file.
Start your response with STATUS: OK or STATUS: STOP.
"""

    messages = [{'role': 'user', 'content': initial_message}]

    for iteration in range(1, MAX_ITERATIONS + 1):
        print(f'--- Developer iteration {iteration}/{MAX_ITERATIONS} ---')

        assistant_text = call_claude_messages(system_prompt, messages, max_tokens=16384)
        messages.append({'role': 'assistant', 'content': assistant_text})

        files = extract_files(assistant_text)
        for path, content in files.items():
            write_file(path, content)

        summary = strip_file_blocks(assistant_text)
        write_file(f'features/{feature_name}/work/developer-summary.md', summary)

        if not is_ok(assistant_text):
            print(summary)
            sys.exit(1)

        if not os.path.exists(f'features/{feature_name}/scope'):
            print('ERROR: Developer did not write a scope file')
            sys.exit(1)

        passed, test_output = run_tests()

        if passed:
            print(f'Tests passed on iteration {iteration}.')
            sys.exit(0)

        print(f'Tests failed on iteration {iteration}:\n{test_output}')

        if iteration == MAX_ITERATIONS:
            print(f'Tests still failing after {MAX_ITERATIONS} iterations.')
            sys.exit(1)

        truncated = test_output[-3000:] if len(test_output) > 3000 else test_output
        messages.append({
            'role': 'user',
            'content': (
                'Tests failed. Fix the code. '
                'Output only the files that need to change using ===FILE: path=== blocks.\n\n'
                f'Test output:\n{truncated}'
            ),
        })

    sys.exit(1)


if __name__ == '__main__':
    main()
