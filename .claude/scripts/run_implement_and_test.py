#!/usr/bin/env python3
"""Implement and Test: Developer (TDD) + Code Reviewer + Tester + E2E in an iteration loop."""
import glob
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    apply_deletions, call_claude, call_claude_messages, collect_prior_feature_files,
    extract_deletions, extract_files, format_test_output, get_feature_name, is_ok,
    read_file, read_prompt, require_files, strip_file_blocks, write_file,
)

MAX_OUTER_ITERATIONS = 3  # full cycle: developer + code review + tester + E2E
MAX_TDD_ITERATIONS = 5    # unit-test-fix loops per developer attempt


UNIT_TEST_TIMEOUT = 300   # 5 minutes
E2E_TEST_TIMEOUT  = 600   # 10 minutes


def run_unit_tests():
    if not os.path.exists('run-tests.sh'):
        return False, 'ERROR: run-tests.sh not found — developer must provide it'
    try:
        result = subprocess.run(
            ['bash', 'run-tests.sh'],
            capture_output=True, text=True,
            env={**os.environ, 'CI': 'true'},
            timeout=UNIT_TEST_TIMEOUT,
        )
        return result.returncode == 0, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return False, f'ERROR: unit tests timed out after {UNIT_TEST_TIMEOUT}s'


def run_e2e_tests():
    if not os.path.exists('run-e2e.sh'):
        return False, 'ERROR: run-e2e.sh not found — tester must provide it'
    try:
        result = subprocess.run(
            ['bash', 'run-e2e.sh'],
            capture_output=True, text=True,
            env={**os.environ, 'CI': 'true', 'APP_URL': 'http://localhost:3000'},
            timeout=E2E_TEST_TIMEOUT,
        )
        return result.returncode == 0, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return False, f'ERROR: E2E tests timed out after {E2E_TEST_TIMEOUT}s'


def append_iteration_summary(path, content, label):
    """Append a labeled iteration block to a summary file."""
    existing = read_file(path) or ''
    separator = f'\n\n---\n\n## {label}\n\n' if existing else f'## {label}\n\n'
    write_file(path, existing + separator + content)


def run_developer_phase(feature_name, messages, outer_iter):
    system_prompt = read_prompt('developer')
    for tdd_iter in range(1, MAX_TDD_ITERATIONS + 1):
        print(f'  TDD iteration {tdd_iter}/{MAX_TDD_ITERATIONS}')
        assistant_text = call_claude_messages(system_prompt, messages, max_tokens=32768)
        messages.append({'role': 'assistant', 'content': assistant_text})

        files = extract_files(assistant_text)
        deletions = extract_deletions(assistant_text)
        summary_path = f'features/{feature_name}/work/developer-summary.md'
        summary = files.pop(summary_path, None) or strip_file_blocks(assistant_text)
        for path, content in files.items():
            write_file(path, content)
        apply_deletions(deletions)
        append_iteration_summary(summary_path, summary,
                                 f'Outer Iteration {outer_iter} — TDD Attempt {tdd_iter}')

        if not is_ok(assistant_text):
            print(f'Developer STOP:\n{summary}')
            return False, messages

        if not os.path.exists(f'features/{feature_name}/scope'):
            print('ERROR: Developer did not write a scope file')
            return False, messages

        passed, test_output = run_unit_tests()
        if passed:
            print('  Unit tests passed.')
            return True, messages

        print('  Unit tests failed.')
        if tdd_iter < MAX_TDD_ITERATIONS:
            messages.append({'role': 'user', 'content': (
                'Tests failed. Fix the code. '
                'Output only changed files using ===FILE: path=== blocks.\n\n'
                f'Test output:\n{format_test_output(test_output)}'
            )})

    print(f'Unit tests still failing after {MAX_TDD_ITERATIONS} TDD iterations.')
    return False, messages


SKIP_DIRS = {'.next', 'node_modules', '__pycache__', '.git', 'dist', 'build', 'out', '.pytest_cache'}
SKIP_EXTENSIONS = {'.lock', '.map', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg',
                   '.woff', '.woff2', '.ttf', '.eot', '.zip', '.gz'}
MAX_FILE_CHARS = 40_000
MAX_TOTAL_CHARS = 200_000
MAX_TEST_CHARS = 40_000


def collect_existing_tests():
    """Collect all existing test/spec files from frontend/ and backend/."""
    parts = []
    total = 0
    for pattern in ['frontend/**/*', 'backend/**/*']:
        for path in sorted(glob.glob(pattern, recursive=True)):
            if not os.path.isfile(path):
                continue
            if any(seg in SKIP_DIRS for seg in path.split(os.sep)):
                continue
            name = os.path.basename(path)
            if not ('.test.' in name or '.spec.' in name):
                continue
            content = read_file(path)
            if not content:
                continue
            if len(content) > MAX_FILE_CHARS:
                content = content[:MAX_FILE_CHARS] + '\n... [truncated]'
            entry = f'### {path}\n```\n{content}\n```'
            if total + len(entry) > MAX_TEST_CHARS:
                parts.append('... [additional test files omitted — size limit reached]')
                break
            parts.append(entry)
            total += len(entry)
    return '\n\n'.join(parts) if parts else '(none found)'


def collect_existing_sources():
    """Collect all existing non-test source files from frontend/ and backend/."""
    parts = []
    total = 0
    MAX_SOURCE_CHARS = 60_000
    for pattern in ['frontend/**/*', 'backend/**/*']:
        for path in sorted(glob.glob(pattern, recursive=True)):
            if not os.path.isfile(path):
                continue
            if any(seg in SKIP_DIRS for seg in path.split(os.sep)):
                continue
            if os.path.splitext(path)[1].lower() in SKIP_EXTENSIONS:
                continue
            name = os.path.basename(path)
            if '.test.' in name or '.spec.' in name:
                continue
            content = read_file(path)
            if not content:
                continue
            if len(content) > MAX_FILE_CHARS:
                content = content[:MAX_FILE_CHARS] + '\n... [truncated]'
            entry = f'### {path}\n```\n{content}\n```'
            if total + len(entry) > MAX_SOURCE_CHARS:
                parts.append('... [additional source files omitted — size limit reached]')
                break
            parts.append(entry)
            total += len(entry)
    return '\n\n'.join(parts) if parts else '(none found)'


def collect_dir(pattern):
    parts = []
    total = 0
    for path in sorted(glob.glob(pattern, recursive=True)):
        if not os.path.isfile(path):
            continue
        if any(seg in SKIP_DIRS for seg in path.split(os.sep)):
            continue
        if os.path.splitext(path)[1].lower() in SKIP_EXTENSIONS:
            continue
        content = read_file(path)
        if not content:
            continue
        if len(content) > MAX_FILE_CHARS:
            content = content[:MAX_FILE_CHARS] + '\n... [truncated]'
        entry = f'### {path}\n```\n{content}\n```'
        if total + len(entry) > MAX_TOTAL_CHARS:
            parts.append('... [additional files omitted — total size limit reached]')
            break
        parts.append(entry)
        total += len(entry)
    return '\n\n'.join(parts)


def run_code_reviewer(feature_name):
    system_prompt = read_prompt('code-reviewer')
    feature_spec = read_file(f'features/{feature_name}/{feature_name}.feature')
    ux_spec = read_file(f'features/{feature_name}/ux.md')
    scope = (read_file(f'features/{feature_name}/scope') or '').strip()
    dev_summary = read_file(f'features/{feature_name}/work/developer-summary.md')
    uxr_summary = read_file(f'features/{feature_name}/work/ux-reviewer-summary.md') or ''
    skills = collect_skills()
    run_tests_sh = read_file('run-tests.sh') or '(not found)'
    run_e2e_sh = read_file('run-e2e.sh') or '(not found)'
    project_context = read_file('CLAUDE.md') or ''

    parts = []
    if scope in ('frontend', 'fullstack'):
        parts.append(collect_dir('frontend/**/*'))
    if scope in ('backend', 'fullstack'):
        parts.append(collect_dir('backend/**/*'))

    user_message = f"""Feature name: {feature_name}
Scope: {scope}

## Project Context
{project_context}

## Gherkin Feature Specification
{feature_spec}

## UX Specification
{ux_spec}

## UX Reviewer Summary
{uxr_summary}

## Developer Summary
{dev_summary}

## Stack-specific Skills
{skills}

## run-tests.sh
```bash
{run_tests_sh}
```

## run-e2e.sh
```bash
{run_e2e_sh}
```

## Implementation Files
{chr(10).join(filter(None, parts))}

Start your response with STATUS: OK or STATUS: STOP.
"""
    response = call_claude(system_prompt, user_message, model='claude-haiku-4-5-20251001', max_tokens=8192)
    return is_ok(response), response


def run_tester_phase(feature_name, outer_iter):
    system_prompt = read_prompt('tester')
    feature_spec = read_file(f'features/{feature_name}/{feature_name}.feature')
    ux_spec = read_file(f'features/{feature_name}/ux.md')
    scope = (read_file(f'features/{feature_name}/scope') or '').strip()
    dev_summary = read_file(f'features/{feature_name}/work/developer-summary.md')
    cr_summary = read_file(f'features/{feature_name}/work/code-reviewer-summary.md') or ''
    e2e_package_json = read_file('e2e/package.json') or '(not found)'
    skills = collect_skills()
    project_context = read_file('CLAUDE.md') or ''

    user_message = f"""Feature name: {feature_name}
Scope: {scope}

## Project Context
{project_context}

## Gherkin Feature Specification (do NOT recreate)
{feature_spec}

## UX Specification
{ux_spec}

## Developer Summary
{dev_summary}

## Code Reviewer Summary
{cr_summary}

## Stack-specific Skills
{skills}

## e2e/package.json (reuse these versions — do not re-declare or upgrade)
```json
{e2e_package_json}
```

Generate Cucumber + Playwright E2E tests and run-e2e.sh.
Use ===FILE: path=== / ===END FILE=== delimiters for every file.
Start your response with STATUS: OK or STATUS: STOP.
"""
    response = call_claude(system_prompt, user_message, model='claude-sonnet-4-6', max_tokens=16384)

    files = extract_files(response)
    summary_path = f'features/{feature_name}/work/tester-summary.md'
    summary = files.pop(summary_path, None) or strip_file_blocks(response)
    for path, content in files.items():
        write_file(path, content)
    append_iteration_summary(summary_path, summary, f'Outer Iteration {outer_iter}')

    if not is_ok(response):
        print(f'Tester STOP:\n{summary}')
        return False

    if not os.path.exists('run-e2e.sh'):
        print('ERROR: run-e2e.sh not found — tester must provide it')
        return False

    return True


def collect_skills():
    """Read all files from .claude/skills/ and return them as a combined string."""
    parts = []
    for path in sorted(glob.glob('.claude/skills/*.md')):
        content = read_file(path)
        if content:
            parts.append(content)
    return '\n\n---\n\n'.join(parts)


def main():
    feature_name = get_feature_name()
    feature_path = f'features/{feature_name}/{feature_name}.feature'
    ux_path = f'features/{feature_name}/ux.md'
    uxr_summary_path = f'features/{feature_name}/work/ux-reviewer-summary.md'
    require_files(feature_path, ux_path, uxr_summary_path)

    feature_spec = read_file(feature_path)
    ux_spec = read_file(ux_path)
    uxr_summary = read_file(uxr_summary_path)
    fr_summary = read_file(f'features/{feature_name}/work/feature-reviewer-summary.md') or ''
    uxd_summary = read_file(f'features/{feature_name}/work/ux-designer-summary.md') or ''
    skills = collect_skills()
    existing_sources = collect_existing_sources()
    existing_tests = collect_existing_tests()
    prior_dev_summaries = collect_prior_feature_files(feature_name, 'features/*/work/developer-summary.md')
    project_context = read_file('CLAUDE.md') or ''

    dev_messages = [{'role': 'user', 'content': [
        {
            'type': 'text',
            'text': f"""Feature name: {feature_name}

## Project Context
{project_context}

## Gherkin Feature Specification (source of truth for behavior)
{feature_spec}

## Feature Reviewer Summary
{fr_summary}

## UX Specification
{ux_spec}

## UX Designer Summary
{uxd_summary}

## UX Reviewer Summary (spec approval)
{uxr_summary}

## Stack-specific Skills
{skills}

## Prior Feature Developer Summaries
These summaries describe what each previously completed feature implemented, which
files it owns, and what behavior it introduced. Before modifying any shared file,
check these summaries to understand prior feature ownership. Do not remove or break
behavior or tests that belong to a prior feature unless the current Gherkin explicitly
supersedes them.

{prior_dev_summaries}

## Existing Source Files
These are all current non-test source files in the codebase. Use them to infer
tech stack, conventions, and structure. If your implementation changes or removes
anything these files depend on, update those files too.

{existing_sources}

## Existing Test Files
These are all current test files in the codebase. If your implementation changes what
any of these files test, you MUST update or delete them — do not let stale tests pass
for invisible or removed content.

{existing_tests}

Write the scope file first, then run-tests.sh, then tests, then implementation.
Use ===FILE: path=== / ===END FILE=== delimiters for every file.
Start your response with STATUS: OK or STATUS: STOP.
""",
            'cache_control': {'type': 'ephemeral'},
        }
    ]}]

    # Clear any summary files left from a previous run so appends start fresh
    for agent in ['developer', 'code-reviewer', 'tester']:
        summary_path = f'features/{feature_name}/work/{agent}-summary.md'
        if os.path.exists(summary_path):
            os.remove(summary_path)

    for outer_iter in range(1, MAX_OUTER_ITERATIONS + 1):
        print(f'--- Implement and Test iteration {outer_iter}/{MAX_OUTER_ITERATIONS} ---')

        # Phase 1: Developer with TDD loop
        dev_ok, dev_messages = run_developer_phase(feature_name, dev_messages, outer_iter)
        if not dev_ok:
            sys.exit(1)

        # Phase 2: Code review
        cr_ok, cr_summary = run_code_reviewer(feature_name)
        append_iteration_summary(
            f'features/{feature_name}/work/code-reviewer-summary.md',
            cr_summary,
            f'Outer Iteration {outer_iter}',
        )

        if not cr_ok:
            print(f'Code Reviewer STOP on iteration {outer_iter}.')
            if outer_iter == MAX_OUTER_ITERATIONS:
                sys.exit(1)
            truncated = cr_summary[-6000:] if len(cr_summary) > 6000 else cr_summary
            dev_messages.append({'role': 'user', 'content': (
                'The code reviewer rejected the implementation. Fix it.\n\n'
                f'Code review feedback:\n{truncated}\n\n'
                'Output only changed files using ===FILE: path=== blocks.'
            )})
            continue

        # Phase 3: Tester generates E2E tests + run-e2e.sh
        if not run_tester_phase(feature_name, outer_iter):
            sys.exit(1)

        # Phase 4: E2E tests (disabled — set SKIP_E2E=1 to bypass)
        if os.environ.get('SKIP_E2E') == '1':
            print('  E2E tests skipped (SKIP_E2E=1).')
            sys.exit(0)

        print('  Running E2E tests...')
        e2e_ok, e2e_output = run_e2e_tests()

        if e2e_ok:
            print(f'E2E tests passed on iteration {outer_iter}.')
            sys.exit(0)

        print(f'E2E tests failed on iteration {outer_iter}.')
        if outer_iter == MAX_OUTER_ITERATIONS:
            print(f'E2E tests still failing after {MAX_OUTER_ITERATIONS} iterations.')
            sys.exit(1)

        dev_messages.append({'role': 'user', 'content': (
            'E2E tests failed after code review passed. Fix the implementation.\n\n'
            f'E2E test output:\n{format_test_output(e2e_output)}\n\n'
            'Output only changed files using ===FILE: path=== blocks.'
        )})

    sys.exit(1)


if __name__ == '__main__':
    main()
