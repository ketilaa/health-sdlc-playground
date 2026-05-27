import re
import json
import subprocess
import sys
import os

issue_num = int(os.environ["ISSUE_NUM"])
backlog_path = f"incoming-requests/{issue_num}/backlog.md"

if not os.path.exists(backlog_path):
    print(f"No backlog at {backlog_path} — nothing to kick off.")
    sys.exit(0)

backlog = open(backlog_path).read()
features = re.findall(r"^## Feature \d+: ([\w-]+)", backlog, re.MULTILINE)

if not features:
    print("No features found in backlog.")
    sys.exit(0)

print(f"Backlog: {features}")
first = features[0]
brief_path = f"incoming-requests/{issue_num}/{first}/brief.md"
body = (
    open(brief_path).read()
    if os.path.exists(brief_path)
    else f"Feature: {first}\n\nSee incoming-requests/{issue_num}/backlog.md for details."
)
body += f'\n\n<!-- plan:{json.dumps({"n": issue_num, "i": 0})} -->'

print(f"Kicking off Feature 1: {first}")
r = subprocess.run(
    ["gh", "issue", "create", "--title", first, "--body", body, "--label", "direct-feature"],
    capture_output=True,
    text=True,
)
if r.returncode != 0:
    print(r.stderr)
    sys.exit(1)
print(r.stdout.strip())
if len(features) > 1:
    print(f"Remaining features will chain after each merge: {features[1:]}")
