#!/usr/bin/env python3
"""Tester agent: generates E2E tests from the Gherkin specification."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    call_claude, extract_files, get_feature_name,
    is_ok, read_file, read_prompt, require_files,
    strip_file_blocks, write_file,
)


def main():
    feature_name = get_feature_name()
    feature_path = f'features/{feature_name}/{feature_name}.feature'
    ux_path = f'features/{feature_name}/ux.md'
    scope_path = f'features/{feature_name}/scope'
    dev_summary_path = f'features/{feature_name}/work/developer-summary.md'
    require_files(feature_path, ux_path, scope_path, dev_summary_path)

    scope = (read_file(scope_path) or '').strip()
    system_prompt = read_prompt('tester')
    feature_spec = read_file(feature_path)
    ux_spec = read_file(ux_path)
    dev_summary = read_file(dev_summary_path)

    user_message = f"""Feature name: {feature_name}
Scope: {scope}

## Gherkin Feature Specification (existing file — do NOT recreate it)
Path: features/{feature_name}/{feature_name}.feature

{feature_spec}

## UX Specification
{ux_spec}

## Developer Summary
{dev_summary}

Generate Cucumber + Playwright E2E tests using ===FILE: path=== / ===END FILE=== delimiters.
Start your response with STATUS: OK or STATUS: STOP.
"""

    response = call_claude(system_prompt, user_message, max_tokens=16384)

    files = extract_files(response)
    for path, content in files.items():
        write_file(path, content)

    summary = strip_file_blocks(response)
    write_file(f'features/{feature_name}/work/tester-summary.md', summary)

    if not is_ok(response):
        print(summary)
        sys.exit(1)

    sys.exit(0)


if __name__ == '__main__':
    main()
