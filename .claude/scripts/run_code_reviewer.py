#!/usr/bin/env python3
"""Code Reviewer agent: validates the implementation against all specifications."""
import glob
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    call_claude, get_feature_name, is_ok,
    read_file, read_prompt, require_files, write_file,
)


def collect_dir(pattern):
    """Return all files matching pattern as formatted text blocks."""
    parts = []
    for path in sorted(glob.glob(pattern, recursive=True)):
        if os.path.isfile(path):
            content = read_file(path)
            if content:
                parts.append(f'### {path}\n```\n{content}\n```')
    return '\n\n'.join(parts)


def main():
    feature_name = get_feature_name()
    feature_path = f'features/{feature_name}/{feature_name}.feature'
    scope_path = f'features/{feature_name}/scope'
    dev_summary_path = f'features/{feature_name}/work/developer-summary.md'
    require_files(feature_path, scope_path, dev_summary_path)

    scope = (read_file(scope_path) or '').strip()
    system_prompt = read_prompt('code-reviewer')
    feature_spec = read_file(feature_path)
    dev_summary = read_file(dev_summary_path)

    all_parts = []
    if scope in ('frontend', 'fullstack'):
        all_parts.append(collect_dir('frontend/**/*'))
    if scope in ('backend', 'fullstack'):
        all_parts.append(collect_dir('backend/**/*'))
    all_files = '\n\n'.join(filter(None, all_parts))

    user_message = f"""Feature name: {feature_name}
Scope: {scope}

## Gherkin Feature Specification
{feature_spec}

## Developer Summary
{dev_summary}

## Implementation Files
{all_files}

Start your response with STATUS: OK or STATUS: STOP.
"""

    response = call_claude(system_prompt, user_message, max_tokens=4096)
    write_file(f'features/{feature_name}/work/code-reviewer-summary.md', response)

    if not is_ok(response):
        print(response)
        sys.exit(1)

    sys.exit(0)


if __name__ == '__main__':
    main()
