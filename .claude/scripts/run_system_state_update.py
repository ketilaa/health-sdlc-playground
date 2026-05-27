#!/usr/bin/env python3
"""System State Updater: applies a minimal update to system/state.md after a feature lands."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    append_usage_to_summary, call_claude_tracked, extract_files,
    get_feature_name, read_file, read_prompt, strip_file_blocks, write_file,
)

STATE_PATH = 'system/state.md'
STATE_PLACEHOLDER = """# System State

_Not yet initialized. Run the bootstrap-system-state workflow first._
"""


def main():
    feature_name = get_feature_name()
    print(f'System State Updater — feature: {feature_name}')

    current_state = read_file(STATE_PATH) or STATE_PLACEHOLDER
    gherkin = read_file(f'features/{feature_name}/{feature_name}.feature') or '(not found)'
    ux_spec = read_file(f'features/{feature_name}/ux.md') or '(not found)'
    dev_summary = read_file(f'features/{feature_name}/work/developer-summary.md') or '(not found)'
    code_review = read_file(f'features/{feature_name}/work/code-reviewer-summary.md') or '(not found)'

    user_message = f"""Feature name: {feature_name}

Apply a minimal update to `system/state.md` based on the artifacts below.

## Current system/state.md
{current_state}

## Gherkin Feature Spec
{gherkin}

## UX Specification
{ux_spec}

## Developer Summary
{dev_summary}

## Code Reviewer Summary
{code_review}

Today's date: {__import__('datetime').date.today().isoformat()}

Output STATUS: OK, a brief update summary, then:
- ===FILE: system/state.md=== block (full updated file)
- ===FILE: features/{feature_name}/work/system-state-updater-summary.md=== block
"""

    system_prompt = read_prompt('system-state-updater')
    print('Calling Claude...')
    response, usage, elapsed = call_claude_tracked(system_prompt, user_message, max_tokens=8192)

    files = extract_files(response)
    summary_path = f'features/{feature_name}/work/system-state-updater-summary.md'
    updater_summary = files.pop(summary_path, None) or strip_file_blocks(response)

    for path, content in files.items():
        write_file(path, content)
        print(f'Written: {path}')

    write_file(summary_path, updater_summary)
    append_usage_to_summary(summary_path, [('System State Updater', usage, elapsed)])
    print(f'Done in {elapsed:.1f}s.')


if __name__ == '__main__':
    main()
