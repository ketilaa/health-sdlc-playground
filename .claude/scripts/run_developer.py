#!/usr/bin/env python3
"""Developer agent: implements the feature using TDD from the specifications."""
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
    uxr_summary_path = f'features/{feature_name}/work/ux-reviewer-summary.md'
    require_files(feature_path, ux_path, uxr_summary_path)

    system_prompt = read_prompt('developer')
    feature_spec = read_file(feature_path)
    ux_spec = read_file(ux_path)
    uxr_summary = read_file(uxr_summary_path)

    user_message = f"""Feature name: {feature_name}

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

    response = call_claude(system_prompt, user_message, max_tokens=16384)

    files = extract_files(response)
    for path, content in files.items():
        write_file(path, content)

    summary = strip_file_blocks(response)
    write_file(f'features/{feature_name}/work/developer-summary.md', summary)

    if not is_ok(response):
        print(summary)
        sys.exit(1)

    scope_path = f'features/{feature_name}/scope'
    if not os.path.exists(scope_path):
        print('ERROR: Developer did not write a scope file')
        sys.exit(1)

    sys.exit(0)


if __name__ == '__main__':
    main()
