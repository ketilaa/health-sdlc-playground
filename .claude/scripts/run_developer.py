#!/usr/bin/env python3
"""Developer agent: implements the feature using TDD from the specifications."""
import os
import subprocess
import sys

import anthropic

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    extract_files, get_feature_name, is_ok,
    read_file, read_prompt, require_files,
    strip_file_blocks, write_file,
)

MAX_ITERATIONS = 3


def _scope_dirs(scope):
    if scope == 'frontend':
        return ['frontend']
    if scope == 'backend':
        return ['backend']
    if scope == 'fullstack':
        return ['frontend', 'backend']
    return []


def install_deps(scope):
    for d in _scope_dirs(scope):
        if os.path.exists(f'{d}/package.json'):
            cmd = ['npm', 'ci'] if os.path.exists(f'{d}/package-lock.json') else ['npm', 'install']
            subprocess.run(cmd, cwd=d, check=False)
        elif os.path.exists(f'{d}/requirements.txt'):
            subprocess.run(['pip', 'install', '-r', f'{d}/requirements.txt'], check=False)


def run_tests(scope):
    """Run tests for the given scope. Returns (passed: bool, output: str)."""
    outputs = []
    for d in _scope_dirs(scope):
        if os.path.exists(f'{d}/package.json'):
            result = subprocess.run(
                ['npm', 'test', '--', '--watchAll=false', '--forceExit'],
                cwd=d,
                capture_output=True,
                text=True,
                env={**os.environ, 'CI': 'true'},
            )
            outputs.append(result.stdout + result.stderr)
            if result.returncode != 0:
                return False, '\n'.join(outputs)
        elif os.path.exists(f'{d}/requirements.txt'):
            result = subprocess.run(
                ['pytest', d, '-v'],
                capture_output=True,
                text=True,
            )
            outputs.append(result.stdout + result.stderr)
            if result.returncode != 0:
                return False, '\n'.join(outputs)
    return True, '\n'.join(outputs)


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

Write the scope file first, then failing tests, then implementation.
Use ===FILE: path=== / ===END FILE=== delimiters for every file.
Start your response with STATUS: OK or STATUS: STOP.
"""

    client = anthropic.Anthropic()
    messages = [{'role': 'user', 'content': initial_message}]
    scope = None

    for iteration in range(1, MAX_ITERATIONS + 1):
        print(f'--- Developer iteration {iteration}/{MAX_ITERATIONS} ---')

        response = client.messages.create(
            model='claude-opus-4-7',
            max_tokens=16384,
            system=[{'type': 'text', 'text': system_prompt, 'cache_control': {'type': 'ephemeral'}}],
            messages=messages,
        )
        assistant_text = response.content[0].text
        messages.append({'role': 'assistant', 'content': assistant_text})

        files = extract_files(assistant_text)
        for path, content in files.items():
            write_file(path, content)

        summary = strip_file_blocks(assistant_text)
        write_file(f'features/{feature_name}/work/developer-summary.md', summary)

        if not is_ok(assistant_text):
            print(summary)
            sys.exit(1)

        scope_file = f'features/{feature_name}/scope'
        if not os.path.exists(scope_file):
            print('ERROR: Developer did not write a scope file')
            sys.exit(1)
        scope = read_file(scope_file).strip()

        install_deps(scope)
        passed, test_output = run_tests(scope)

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
                f'Tests failed. Fix the code. '
                f'Output only the files that need to change using ===FILE: path=== blocks.\n\n'
                f'Test output:\n{truncated}'
            ),
        })

    sys.exit(1)


if __name__ == '__main__':
    main()
