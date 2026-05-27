#!/usr/bin/env python3
"""Planner: decomposes a GitHub issue into a batch feature backlog."""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    append_usage_to_summary, call_claude_tracked, extract_files,
    is_ok, read_file, read_prompt, strip_file_blocks, write_file,
)

STATE_PATH = 'system/state.md'


def get_issue_number():
    issue_number = os.environ.get('ISSUE_NUMBER', '')
    if not issue_number:
        print('ERROR: ISSUE_NUMBER environment variable not set')
        sys.exit(1)
    return issue_number


def collect_existing_features():
    names = sorted(
        os.path.basename(p)
        for p in glob.glob('features/*')
        if os.path.isdir(p) and not os.path.basename(p).startswith('.')
    )
    return '\n'.join(f'- {name}' for name in names) if names else '(none)'


def main():
    issue_number = get_issue_number()
    context_path = f'incoming-requests/{issue_number}/.context.json'
    request_path = f'incoming-requests/{issue_number}/request.txt'

    if not os.path.exists(request_path):
        print(f'ERROR: Required input file missing: {request_path}')
        sys.exit(1)

    request = read_file(request_path) or ''
    context = {}
    if os.path.exists(context_path):
        with open(context_path) as f:
            context = json.load(f)

    issue_title = context.get('issue_title', f'Issue #{issue_number}')
    system_state = read_file(STATE_PATH) or '_(system/state.md not yet initialized — run bootstrap first)_'
    existing_features = collect_existing_features()

    user_message = f"""Issue #{issue_number}: {issue_title}

## Issue Body
{request}

## Current System State
{system_state}

## Existing Features (already built)
{existing_features}

Today's date: {__import__('datetime').date.today().isoformat()}
Issue number for file paths: {issue_number}

Decompose this request into a batch feature backlog.
Output STATUS: OK or STATUS: STOP, then the file blocks as specified in your instructions.
"""

    system_prompt = read_prompt('planner')
    print(f'Planner — issue #{issue_number}: {issue_title}')
    print('Calling Claude...')
    response, usage, elapsed = call_claude_tracked(system_prompt, user_message, max_tokens=8192)

    summary_path = f'incoming-requests/{issue_number}/work/planner-summary.md'
    files = extract_files(response)
    planner_summary = files.pop(summary_path, None) or strip_file_blocks(response)

    write_file(summary_path, planner_summary)
    append_usage_to_summary(summary_path, [('Planner', usage, elapsed)])

    if not is_ok(response):
        print(f'Planner STOP:\n{planner_summary}')
        sys.exit(1)

    for path, content in files.items():
        write_file(path, content)
        print(f'Written: {path}')

    print(f'Planner OK — {len(files)} file(s) written in {elapsed:.1f}s.')


if __name__ == '__main__':
    main()
