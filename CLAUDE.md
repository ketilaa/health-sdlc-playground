# Project: Training Insights Playground

## Purpose
This is a lightweight playground for exploring insights based on health and training data (simulating data from Garmin / Apple Health / Health Connect).

Focus:
- Rapid prototyping of training/health insights
- Clear, readable logic over completeness
- Fast iteration during live sessions

---

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- No backend

---

## Data Model
Data will be mocked.

Key concepts:
- workouts (runs, intervals, long runs, recovery)
- weekly summaries
- resting heart rate
- VO2 max trend

Data should be modelled and structure like if it came from a wearable platform (e.g., Garmin).

# Claude Agent Pipeline Specification

This repository uses a multi-agent pipeline to implement features autonomously.

All agents MUST follow this lifecycle strictly.

Agents live here: .claude/agents/.

---

# Lifecycle Overview

A feature progresses through the following stages:

1. Product Owner → Feature Specification (Gherkin)
2. Feature Reviewer → Validate feature specification
3. Designer → UX Specification
4. UX Reviewer → Validate UX specification
5. Developer → Unit Tests + Implementation (TDD + DDD)
6. Code Reviewer → Validate implementation
7. Tester → Create new E2E tests for the feature that is executes as part of the pipeline
8. Result → PR creation or STOP

Each stage is a hard gate.

If any stage returns STOP, the pipeline terminates.

IMPORTANT: All agents must commit their work to he current feature branch (feature/<feature-name>) and push it to origin when done.

---

# STOP Contract

All agents MUST return:

STATUS: OK | STOP

If STOP:
- Clearly explain why
- List missing or invalid elements
- Provide actionable feedback

No partial success is allowed.

---

# File Structure Contract

All features MUST be stored under:

features/<feature-name>/

Required files:

- <feature-name>.feature     (Gherkin spec)
- ux.md                      (UX specification)

Agent summaries MUST be written to:

features/<feature-name>/work/<agent>-summary.md

The agent summaries MUST include:
- Status: OK | STOP
- Compressed input summary (feature goal, constraints, dependencies)
- Interpretation (interpretation and assumptions made)
- Decisions made
- Alternatives considered (brief)
- Output summary (n scenarios created, edge cases covered)

---

# Branching Strategy

Each feature MUST be developed in its own branch:

feature/<feature-name>

The Product Owner is responsible for:
- defining the feature name (kebab-case)
- creating the feature branch and push it to origin

---

# Directory Structure

```
frontend/           ← frontend application code and tests (internal structure follows tech stack conventions)
backend/            ← backend application code and tests (internal structure follows tech stack conventions)
e2e/
  <feature-name>/   ← E2E tests (Cucumber + Playwright)
infrastructure/     ← infrastructure as code
features/           ← agent specs and summaries
```

---

# Developer Scope Rules

The Developer determines which directories to work in by reading the Gherkin spec and UX specification:

- **Frontend only** — scenarios describe UI interactions, pages, components, or user-facing behavior:
  work in `frontend/`
- **Backend only** — scenarios describe API endpoints, data processing, or server-side business logic with no UI:
  work in `backend/`
- **Full-stack** — scenarios require both a user interface and server-side logic:
  work in both `frontend/` and `backend/`
- **Infrastructure** — only touch `infrastructure/` if the Gherkin spec explicitly requires infrastructure changes

When the scope cannot be clearly determined from the specs, apply the rules above as the default.

---

# Scope Constraints

Agents MUST only modify files in the directories relevant to their role:

| Agent | Allowed directories |
|-------|-------------------|
| Developer | `frontend/`, `backend/`, `infrastructure/` (if required), `features/` |
| Tester | `e2e/`, `features/` |
| All other agents | `features/` only |

Agents MUST NOT modify unrelated files or directories outside the table above.

---

# Cost Awareness

Agents SHOULD:

- Prefer concise output
- Avoid unnecessary verbosity
- Reuse existing context
- Avoid reprocessing unchanged inputs

---

# Failure Handling

On STOP:
- The pipeline halts immediately
- No PR is created
- Agent summary must contain failure reason

Future extensions may include:
- retry loops
- feedback cycles

