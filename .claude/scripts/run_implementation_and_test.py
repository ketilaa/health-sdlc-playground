#!/usr/bin/env python3
"""Implementation and Test: Developer (TDD loop) and Code Reviewer in an iteration loop."""
import glob
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    call_claude, call_claude_messages, extract_files,
    get_feature_name, is_ok, read_file, read_prompt,
    require_files, strip_file_blocks, write_file,
)

MAX_OUTER_ITERATIONS = 3  # code-reviewer feedback loops
MAX_TDD_ITERATIONS = 3    # test-fix loops per developer attempt


def run_tests():
    if not os.path.exists('run-tests.sh'):
        return False, 'ERROR: run-tests.sh not found — developer must provide it'
    result = subprocess.run(
        ['bash', 'run-tests.sh'],
        capture_output=True, text=True,
        env={**os.environ, 'CI': 'true'},
    )
    return result.returncode == 0, result.stdout + result.stderr


def run_developer_phase(feature_name, messages):
    system_prompt = read_prompt('developer')
    for tdd_iter in range(1, MAX_TDD_ITERATIONS + 1):
        print(f'  TDD iteration {tdd_iter}/{MAX_TDD_ITERATIONS}')
        assistant_text = call_claude_messages(system_prompt, messages, max_tokens=16384)
        messages.append({'role': 'assistant', 'content': assistant_text})

        for path, content in extract_files(assistant_text).items():
            write_file(path, content)

        summary = strip_file_blocks(assistant_text)
        write_file(f'features/{feature_name}/work/developer-summary.md', summary)

        if not is_ok(assistant_text):
            print(f'Developer STOP:\n{summary}')
            return False, messages

        if not os.path.exists(f'features/{feature_name}/scope'):
            print('ERROR: Developer did not write a scope file')
            return False, messages

        passed, test_output = run_tests()
        if passed:
            print('  Tests passed.')
            return True, messages

        print('  Tests failed.')
        if tdd_iter < MAX_TDD_ITERATIONS:
            truncated = test_output[-3000:] if len(test_output) > 3000 else test_output
            messages.append({'role': 'user', 'content': (
                'Tests failed. Fix the code. '
                'Output only changed files using ===FILE: path=== blocks.\n\n'
                f'Test output:\n{truncated}'
            )})

    print(f'Tests still failing after {MAX_TDD_ITERATIONS} TDD iterations.')
    return False, messages


def collect_dir(pattern):
    parts = []
    for path in sorted(glob.glob(pattern, recursive=True)):
        if os.path.isfile(path):
            content = read_file(path)
            if content:
                parts.append(f'### {path}\n```\n{content}\n```')
    return '\n\n'.join(parts)


def run_code_reviewer(feature_name):
    system_prompt = read_prompt('code-reviewer')
    feature_spec = read_file(f'features/{feature_name}/{feature_name}.feature')
    scope = (read_file(f'features/{feature_name}/scope') or '').strip()
    dev_summary = read_file(f'features/{feature_name}/work/developer-summary.md')

    parts = []
    if scope in ('frontend', 'fullstack'):
        parts.append(collect_dir('frontend/**/*'))
    if scope in ('backend', 'fullstack'):
        parts.append(collect_dir('backend/**/*'))

    user_message = f"""Feature name: {feature_name}
Scope: {scope}

## Gherkin Feature Specification
{feature_spec}

## Developer Summary
{dev_summary}

## Implementation Files
{chr(10).join(filter(None, parts))}

Start your response with STATUS: OK or STATUS: STOP.
"""
    response = call_claude(system_prompt, user_message, max_tokens=4096)
    return is_ok(response), response


def main():
    feature_name = get_feature_name()
    feature_path = f'features/{feature_name}/{feature_name}.feature'
    ux_path = f'features/{feature_name}/ux.md'
    uxr_summary_path = f'features/{feature_name}/work/ux-reviewer-summary.md'
    require_files(feature_path, ux_path, uxr_summary_path)

    feature_spec = read_file(feature_path)
    ux_spec = read_file(ux_path)
    uxr_summary = read_file(uxr_summary_path)

    dev_messages = [{'role': 'user', 'content': f"""Feature name: {feature_name}

## Gherkin Feature Specification (source of truth for behavior)
{feature_spec}

## UX Specification
{ux_spec}

## UX Reviewer Summary (spec approval)
{uxr_summary}

Write the scope file first, then run-tests.sh, then tests, then implementation.
Use ===FILE: path=== / ===END FILE=== delimiters for every file.
Start your response with STATUS: OK or STATUS: STOP.
"""}]

    for outer_iter in range(1, MAX_OUTER_ITERATIONS + 1):
        print(f'--- Implementation iteration {outer_iter}/{MAX_OUTER_ITERATIONS} ---')

        dev_ok, dev_messages = run_developer_phase(feature_name, dev_messages)
        if not dev_ok:
            sys.exit(1)

        cr_ok, cr_summary = run_code_reviewer(feature_name)
        write_file(f'features/{feature_name}/work/code-reviewer-summary.md', cr_summary)

        if cr_ok:
            print(f'Code review passed on iteration {outer_iter}.')
            sys.exit(0)

        print(f'Code Reviewer STOP on iteration {outer_iter}.')

        if outer_iter == MAX_OUTER_ITERATIONS:
            print(f'Code review not passed after {MAX_OUTER_ITERATIONS} iterations.')
            sys.exit(1)

        truncated = cr_summary[-3000:] if len(cr_summary) > 3000 else cr_summary
        dev_messages.append({'role': 'user', 'content': (
            'The code reviewer rejected the implementation. Fix it based on this feedback.\n\n'
            f'Code review feedback:\n{truncated}\n\n'
            'Output only changed files using ===FILE: path=== blocks.'
        )})

    sys.exit(1)


if __name__ == '__main__':
    main()
