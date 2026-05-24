#!/usr/bin/env python3
"""UX Designer agent: creates a UX specification from the Gherkin feature spec."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    call_claude, extract_between, get_feature_name,
    is_ok, read_file, read_prompt, require_files, write_file,
)


def main():
    feature_name = get_feature_name()
    feature_path = f'features/{feature_name}/{feature_name}.feature'
    fr_summary_path = f'features/{feature_name}/work/feature-reviewer-summary.md'
    require_files(feature_path, fr_summary_path)

    system_prompt = read_prompt('ux-designer')
    feature_spec = read_file(feature_path)
    fr_summary = read_file(fr_summary_path)

    user_message = f"""Feature name: {feature_name}

## Gherkin Feature Specification
{feature_spec}

## Feature Reviewer Summary
{fr_summary}

Start your response with STATUS: OK or STATUS: STOP.
Wrap the UX specification content in ===UX SPEC=== / ===END UX SPEC=== delimiters.
"""

    response = call_claude(system_prompt, user_message, max_tokens=4096)

    ux_spec = extract_between(response, '===UX SPEC===\n', '===END UX SPEC===')
    ux_start = response.find('===UX SPEC===')
    summary = response[:ux_start].strip() if ux_start != -1 else response

    write_file(f'features/{feature_name}/work/ux-designer-summary.md', summary)

    if not is_ok(response):
        print(summary)
        sys.exit(1)

    if not ux_spec:
        print('ERROR: Agent response contained no ===UX SPEC=== block')
        sys.exit(1)

    write_file(f'features/{feature_name}/ux.md', ux_spec)
    sys.exit(0)


if __name__ == '__main__':
    main()
