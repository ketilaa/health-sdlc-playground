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
    """Read file if it exists and is valid UTF-8; return None otherwise."""
    if os.path.exists(path):
        try:
            with open(path, encoding='utf-8') as f:
                return f.read()
        except (UnicodeDecodeError, IsADirectoryError):
            return None
    return None


def write_file(path, content):
    """Write content to path, creating parent directories as needed."""
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)


def call_claude_messages(system, messages, model='claude-sonnet-4-6', max_tokens=8192):
    """Call the Claude API with a multi-turn messages list (streaming to support large outputs)."""
    import anthropic
    client = anthropic.Anthropic()
    with client.messages.stream(
        model=model,
        max_tokens=max_tokens,
        system=[{
            'type': 'text',
            'text': system,
            'cache_control': {'type': 'ephemeral'},
        }],
        messages=messages,
    ) as stream:
        return stream.get_final_text()


def call_claude(system, user, model='claude-sonnet-4-6', max_tokens=8192):
    """Call the Claude API with prompt caching on the system prompt (streaming to support large outputs)."""
    import anthropic
    client = anthropic.Anthropic()
    with client.messages.stream(
        model=model,
        max_tokens=max_tokens,
        system=[{
            'type': 'text',
            'text': system,
            'cache_control': {'type': 'ephemeral'},
        }],
        messages=[{'role': 'user', 'content': user}],
    ) as stream:
        return stream.get_final_text()


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


def extract_deletions(text):
    """
    Parse ===DELETE: path=== markers from agent output.
    Returns a list of paths the agent wants deleted.
    """
    deletions = []
    for line in text.split('\n'):
        stripped = line.strip()
        if stripped.startswith('===DELETE:') and stripped.endswith('==='):
            path = stripped[10:].rstrip()[:-3].strip()
            if path:
                deletions.append(path)
    return deletions


def apply_deletions(paths):
    """Delete files listed in paths. Silently skip non-existent files."""
    for path in paths:
        if os.path.exists(path):
            os.remove(path)
            print(f'  Deleted: {path}')


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


def format_test_output(output, max_chars=3000):
    """
    Return a focused view of test output for developer feedback.

    Extracts FAIL suite names and failure detail blocks (● … Expected/Received)
    so the developer sees exactly what broke without noise from passing suites or
    console.error chatter.  Falls back to a head+tail slice if no failure blocks
    are found (e.g. build errors that appear before the test runner starts).
    """
    lines = output.splitlines()

    # --- Extract structured failure blocks ---
    fail_suites = [l for l in lines if l.startswith('FAIL ')]
    failure_blocks = []
    in_block = False
    block = []
    for line in lines:
        stripped = line.strip()
        # Failure blocks start with '  ●' (two spaces then bullet)
        if stripped.startswith('● '):
            if block:
                failure_blocks.append('\n'.join(block))
            block = [line]
            in_block = True
        elif in_block:
            # Blank line after content ends the block
            if stripped == '' and any(
                kw in '\n'.join(block)
                for kw in ('Expected', 'Received', 'Error:', 'Cannot find', 'ENOENT')
            ):
                failure_blocks.append('\n'.join(block))
                block = []
                in_block = False
            else:
                block.append(line)
    if block:
        failure_blocks.append('\n'.join(block))

    if fail_suites or failure_blocks:
        parts = []
        if fail_suites:
            parts.append('Failing test suites:\n' + '\n'.join(fail_suites))
        if failure_blocks:
            parts.append('Failure details:\n' + '\n\n'.join(failure_blocks))
        extracted = '\n\n'.join(parts)
        if len(extracted) <= max_chars:
            return extracted
        return extracted[:max_chars] + '\n... [truncated]'

    # Fallback: no structured failures found (build error, import error, etc.)
    # Show head + tail so both early errors and the final summary are visible.
    head = 800
    tail = max_chars - head - 6  # 6 for the '\n...\n' separator
    if len(output) <= max_chars:
        return output
    return output[:head] + '\n...\n' + output[-tail:]


def read_pipeline_context():
    """Read the pipeline context file saved by the Product Owner workflow."""
    path = 'features/.pipeline_context.json'
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {}
