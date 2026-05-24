#!/usr/bin/env python3
"""UX Reviewer agent: validates the UX specification against the Gherkin spec."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    call_claude, get_feature_name, is_ok,
    read_file, read_prompt, require_files, write_file,
)


def main():
    feature_name = get_feature_name()
    feature_path = f'features/{feature_name}/{feature_name}.feature'
    ux_path = f'features/{feature_name}/ux.md'
    fr_summary_path = f'features/{feature_name}/work/feature-reviewer-summary.md'
    uxd_summary_path = f'features/{feature_name}/work/ux-designer-summary.md'
    require_files(feature_path, ux_path, fr_summary_path, uxd_summary_path)

    system_prompt = read_prompt('ux-reviewer')
    feature_spec = read_file(feature_path)
    ux_spec = read_file(ux_path)
    fr_summary = read_file(fr_summary_path)
    uxd_summary = read_file(uxd_summary_path)

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

    response = call_claude(system_prompt, user_message, max_tokens=2048)
    write_file(f'features/{feature_name}/work/ux-reviewer-summary.md', response)

    if not is_ok(response):
        print(response)
        sys.exit(1)

    sys.exit(0)


if __name__ == '__main__':
    main()
