"""Shared utilities for all SDLC pipeline agent scripts."""
import json
import os
import subprocess
import sys


def get_feature_name():
    """Extract feature name from current git branch (strips 'feature/' prefix)."""
    result = subprocess.run(
        ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
        capture_output=True, text=True, check=True,
    )
    branch = result.stdout.strip()
    if '/' in branch:
        return branch.split('/', 1)[1]
    return branch


def read_prompt(agent_name):
    """Read agent system prompt from .claude/agents/<agent_name>.md."""
    path = f'.claude/agents/{agent_name}.md'
    with open(path) as f:
        return f.read()


def read_file(path):
    """Read file if it exists; return None otherwise."""
    if os.path.exists(path):
        with open(path) as f:
            return f.read()
    return None


def write_file(path, content):
    """Write content to path, creating parent directories as needed."""
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)


def call_claude_messages(system, messages, model='claude-opus-4-7', max_tokens=8192):
    """Call the Claude API with a multi-turn messages list."""
    import anthropic
    client = anthropic.Anthropic()
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=[{
            'type': 'text',
            'text': system,
            'cache_control': {'type': 'ephemeral'},
        }],
        messages=messages,
    )
    return response.content[0].text


def call_claude(system, user, model='claude-opus-4-7', max_tokens=8192):
    """Call the Claude API with prompt caching on the system prompt."""
    import anthropic
    client = anthropic.Anthropic()
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=[{
            'type': 'text',
            'text': system,
            'cache_control': {'type': 'ephemeral'},
        }],
        messages=[{'role': 'user', 'content': user}],
    )
    return response.content[0].text


def is_ok(text):
    """Return True if response contains STATUS: OK; False for STOP or missing."""
    for line in text.split('\n'):
        stripped = line.strip()
        if stripped.startswith('STATUS:'):
            return 'STOP' not in stripped
    return False  # no STATUS line → treat as STOP


def extract_between(text, start_marker, end_marker):
    """Return the text between start_marker and end_marker, stripped."""
    start = text.find(start_marker)
    if start == -1:
        return None
    start += len(start_marker)
    end = text.find(end_marker, start)
    return text[start:end].strip() if end != -1 else text[start:].strip()


def extract_files(text):
    """
    Parse ===FILE: path=== ... ===END FILE=== blocks from agent output.
    Returns a dict of {path: content}.
    """
    files = {}
    lines = text.split('\n')
    current_path = None
    current_lines = []

    for line in lines:
        if line.startswith('===FILE:') and line.rstrip().endswith('==='):
            current_path = line[8:].rstrip()[:-3].strip()
            current_lines = []
        elif line.rstrip() == '===END FILE===' and current_path is not None:
            files[current_path] = '\n'.join(current_lines)
            current_path = None
            current_lines = []
        elif current_path is not None:
            current_lines.append(line)

    return files


def strip_file_blocks(text):
    """Remove ===FILE=== blocks from text, returning the remaining content."""
    lines = []
    in_block = False
    for line in text.split('\n'):
        if line.startswith('===FILE:') and line.rstrip().endswith('==='):
            in_block = True
        elif line.rstrip() == '===END FILE===':
            in_block = False
        elif not in_block:
            lines.append(line)
    return '\n'.join(lines).strip()


def require_files(*paths):
    """Exit 1 immediately if any required file does not exist."""
    missing = [p for p in paths if not os.path.exists(p)]
    if missing:
        for p in missing:
            print(f'ERROR: Required input file missing: {p}')
        sys.exit(1)


def read_pipeline_context():
    """Read the pipeline context file saved by the Product Owner workflow."""
    path = 'features/.pipeline_context.json'
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {}
