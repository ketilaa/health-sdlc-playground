import re
import json
import os

feature = os.environ["FEATURE"]
body = open(f"features/{feature}/feature.txt").read()
ctx = {
    "issue_number": int(os.environ["ISSUE_NUMBER"]),
    "feature_name": feature,
    "issue_author": os.environ["ISSUE_AUTHOR"],
}
m = re.search(r"<!-- plan:(\{.*?\}) -->", body)
if m:
    meta = json.loads(m.group(1))
    ctx["plan_issue_number"] = meta.get("n")
    ctx["feature_index"] = meta.get("i")
    print(f'Plan metadata found: issue {meta.get("n")}, feature index {meta.get("i")}')
json.dump(ctx, open("features/.pipeline_context.json", "w"))
