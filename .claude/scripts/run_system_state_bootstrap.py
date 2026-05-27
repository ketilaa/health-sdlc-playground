#!/usr/bin/env python3
"""System State Bootstrap: reads the codebase and produces system/state.md."""
import glob
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
from base_agent import (
    append_usage_to_summary, call_claude_tracked, extract_files,
    read_file, read_prompt, strip_file_blocks, write_file,
)

MAX_SECTION_CHARS = 8_000


def collect_file_listing(root):
    """Return a sorted recursive file listing under root, relative to repo root."""
    lines = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in ('node_modules', '__pycache__', '.next', 'out'))
        for fname in sorted(filenames):
            full = os.path.join(dirpath, fname)
            lines.append(full)
    return '\n'.join(lines)


def collect_source_files(paths, label):
    """Read a list of file paths and return a formatted block."""
    parts = []
    total = 0
    for path in paths:
        content = read_file(path)
        if not content:
            continue
        entry = f'### {path}\n```\n{content}\n```'
        if total + len(entry) > MAX_SECTION_CHARS:
            parts.append(f'### {path}\n[truncated — size limit reached]')
            break
        parts.append(entry)
        total += len(entry)
    if not parts:
        return f'## {label}\n(none found)'
    return f'## {label}\n\n' + '\n\n'.join(parts)


def collect_glob(pattern, label, max_chars=MAX_SECTION_CHARS):
    """Collect all files matching a glob pattern into a labeled block."""
    paths = sorted(glob.glob(pattern, recursive=True))
    parts = []
    total = 0
    for path in paths:
        content = read_file(path)
        if not content:
            continue
        entry = f'### {path}\n{content}'
        if total + len(entry) > max_chars:
            parts.append('[additional files omitted — size limit reached]')
            break
        parts.append(entry)
        total += len(entry)
    if not parts:
        return f'## {label}\n(none found)'
    return f'## {label}\n\n' + '\n\n---\n\n'.join(parts)


def main():
    print('System State Bootstrap starting...')

    frontend_listing = collect_file_listing('frontend/src')

    key_source_files = [
        'frontend/package.json',
        'frontend/src/app/layout.tsx',
        'frontend/src/app/page.tsx',
        'frontend/src/app/not-found.tsx',
        'frontend/src/theme/tokens.ts',
        'frontend/src/theme.ts',
        'frontend/src/data/loader.ts',
        'frontend/src/data/datasets.ts',
        'frontend/src/domain/dataset.ts',
        'frontend/src/lib/format.ts',
    ]
    # Add all component files
    component_files = sorted(glob.glob('frontend/src/components/*.tsx'))
    key_source_files.extend(f for f in component_files if not f.endswith('.test.tsx'))

    source_block = collect_source_files(key_source_files, 'Key Source Files')
    gherkin_block = collect_glob('features/**/*.feature', 'Gherkin Feature Specs', max_chars=12_000)
    ux_block = collect_glob('features/**/ux.md', 'UX Specifications', max_chars=12_000)
    dev_summaries_block = collect_glob('features/**/work/developer-summary.md', 'Developer Summaries', max_chars=8_000)
    workflows_block = collect_glob('.github/workflows/*.yml', 'GitHub Actions Workflows', max_chars=8_000)

    user_message = f"""Produce the initial `system/state.md` from the following codebase snapshot.

## Frontend Source File Tree
```
{frontend_listing}
```

{source_block}

{gherkin_block}

{ux_block}

{dev_summaries_block}

{workflows_block}

Today's date: {__import__('datetime').date.today().isoformat()}

Output STATUS: OK, a brief summary, then ===FILE: system/state.md=== / ===END FILE===.
"""

    system_prompt = read_prompt('system-state-bootstrap')
    print('Calling Claude...')
    response, usage, elapsed = call_claude_tracked(system_prompt, user_message, max_tokens=8192)

    files = extract_files(response)
    summary = strip_file_blocks(response)

    if 'system/state.md' not in files:
        print('ERROR: Agent did not produce system/state.md')
        print(summary)
        sys.exit(1)

    for path, content in files.items():
        write_file(path, content)
        print(f'Written: {path}')

    # Write a bootstrap run record
    bootstrap_summary_path = 'system/bootstrap-summary.md'
    write_file(bootstrap_summary_path, summary)
    append_usage_to_summary(bootstrap_summary_path, [('System State Bootstrap', usage, elapsed)])
    print(f'Written: {bootstrap_summary_path}')
    print(f'Done in {elapsed:.1f}s.')


if __name__ == '__main__':
    main()
