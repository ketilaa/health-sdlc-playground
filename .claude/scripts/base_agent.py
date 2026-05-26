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


def _extract_usage(message):
    u = message.usage
    return {
        'input_tokens': u.input_tokens,
        'output_tokens': u.output_tokens,
        'cache_read_tokens': getattr(u, 'cache_read_input_tokens', 0) or 0,
        'cache_write_tokens': getattr(u, 'cache_creation_input_tokens', 0) or 0,
    }


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


def call_claude_messages_tracked(system, messages, model='claude-sonnet-4-6', max_tokens=8192):
    """Like call_claude_messages but also returns (text, usage_dict, elapsed_seconds)."""
    import anthropic, time
    client = anthropic.Anthropic()
    start = time.time()
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
        msg = stream.get_final_message()
    elapsed = time.time() - start
    text = msg.content[0].text if msg.content else ''
    return text, _extract_usage(msg), elapsed


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


def call_claude_tracked(system, user, model='claude-sonnet-4-6', max_tokens=8192):
    """Like call_claude but also returns (text, usage_dict, elapsed_seconds)."""
    import anthropic, time
    client = anthropic.Anthropic()
    start = time.time()
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
        msg = stream.get_final_message()
    elapsed = time.time() - start
    text = msg.content[0].text if msg.content else ''
    return text, _extract_usage(msg), elapsed


def format_usage_row(label, usage, elapsed):
    """Return a single markdown table row for a usage entry."""
    cache_pct = int(100 * usage['cache_read_tokens'] / usage['input_tokens']) if usage['input_tokens'] else 0
    return (
        f"| {label} | {elapsed:.1f}s "
        f"| {usage['input_tokens']:,} "
        f"| {usage['output_tokens']:,} "
        f"| {usage['cache_read_tokens']:,} ({cache_pct}%) "
        f"| {usage['cache_write_tokens']:,} |"
    )


def append_usage_to_summary(path, rows):
    """Append a resource-usage table to a summary file.

    rows — list of (label, usage_dict, elapsed_seconds) tuples.
    """
    header = (
        '\n\n## Resource Usage\n'
        '| Step | Time | Input tokens | Output tokens | Cache read | Cache write |\n'
        '|------|------|-------------|--------------|------------|-------------|\n'
    )
    body = '\n'.join(format_usage_row(label, u, t) for label, u, t in rows)
    existing = read_file(path) or ''
    write_file(path, existing + header + body + '\n')


def is_ok(text):
    """Return True if response contains STATUS: OK; False for STOP or missing.

    Accepts common markdown variants produced by agents:
      STATUS: OK          (canonical)
      ## Status: OK       (markdown heading)
      **Status:** OK      (bold label)
    """
    for line in text.split('\n'):
        # Strip leading markdown heading markers and bold/italic markers
        core = line.strip().lstrip('#').lstrip('*').strip().lstrip('*').strip()
        if core.upper().startswith('STATUS:'):
            return 'STOP' not in core.upper()
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


def collect_prior_feature_files(current_feature_name, glob_pattern, max_chars=20_000):
    """Collect files matching glob_pattern, excluding the current feature's directory."""
    import glob as glob_module
    parts = []
    total = 0
    for path in sorted(glob_module.glob(glob_pattern)):
        if os.path.join('features', current_feature_name) in os.path.normpath(path):
            continue
        content = read_file(path)
        if not content:
            continue
        entry = f'### {path}\n{content}'
        if total + len(entry) > max_chars:
            parts.append('... [additional files omitted — size limit reached]')
            break
        parts.append(entry)
        total += len(entry)
    return '\n\n---\n\n'.join(parts) if parts else '(none)'


def read_pipeline_context():
    """Read the pipeline context file saved by the Product Owner workflow."""
    path = 'features/.pipeline_context.json'
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {}
