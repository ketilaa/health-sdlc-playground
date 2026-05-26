#!/usr/bin/env python3
"""Calibrator: reads all agent summaries for a feature and updates the global findings file."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    append_usage_to_summary, call_claude_tracked, extract_files, get_feature_name,
    read_file, read_prompt, strip_file_blocks, write_file,
)

SUMMARY_AGENTS = [
    'product-owner',
    'feature-reviewer',
    'ux-designer',
    'ux-reviewer',
    'developer',
    'code-reviewer',
    'tester',
]

FINDINGS_PATH = 'calibration/findings.md'

FINDINGS_TEMPLATE = """# Calibration Findings

_Accumulated across all features. Each finding describes a recurring pattern in agent behavior that may warrant a prompt improvement. Manual action required to act on any finding._
"""


def main():
    feature_name = get_feature_name()

    # Read all available agent summaries
    summaries = {}
    for agent in SUMMARY_AGENTS:
        path = f'features/{feature_name}/work/{agent}-summary.md'
        content = read_file(path)
        if content:
            summaries[agent] = content

    if not summaries:
        print(f'ERROR: No agent summaries found under features/{feature_name}/work/')
        sys.exit(1)

    # Read existing global findings (may be empty/new)
    existing_findings = read_file(FINDINGS_PATH) or FINDINGS_TEMPLATE
    project_context = read_file('CLAUDE.md') or ''

    # Build the summaries block
    summaries_text = '\n\n'.join(
        f'### {agent}-summary.md\n{content}'
        for agent, content in summaries.items()
    )

    user_message = f"""Feature name: {feature_name}

## Project Context
{project_context}

## Existing Global Findings
{existing_findings}

## Agent Summaries for This Feature
{summaries_text}

Produce:
1. The full updated `calibration/findings.md` (deduplicate against existing findings — increment Seen count for equivalent findings, add new entries for new findings)
2. `features/{feature_name}/work/calibrator-summary.md`

Use ===FILE: path=== / ===END FILE=== delimiters for both files.
Start your response with STATUS: OK.
"""

    system_prompt = read_prompt('calibrator')
    response, usage, elapsed = call_claude_tracked(system_prompt, user_message, max_tokens=8192)

    files = extract_files(response)
    calibrator_summary_path = f'features/{feature_name}/work/calibrator-summary.md'
    calibrator_summary = files.pop(calibrator_summary_path, None) or strip_file_blocks(response)

    for path, content in files.items():
        write_file(path, content)
    write_file(calibrator_summary_path, calibrator_summary)
    append_usage_to_summary(calibrator_summary_path, [('Calibrator', usage, elapsed)])

    print('Calibration complete.')


if __name__ == '__main__':
    main()
