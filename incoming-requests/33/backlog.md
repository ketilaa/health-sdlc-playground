# Backlog — Issue #33: Enforce dark theme

_Planned on 2026-05-27. 1 feature in sequence._

## Feature 1: dark-theme-full-coverage
- **Goal:** All structural UI surfaces — AppBar/TopBar and MUI Paper section cards — use the established dark theme tokens so there are no white or blue outliers.
- **Scope:** frontend
- **Affected system areas:** `TopBar.tsx`, `HomePage.tsx`, MUI Paper instances (insights, training overview placeholders), `theme/tokens.ts` (potentially adding surface tokens), `layout.tsx`
- **Sequence rationale:** Self-contained visual fix; all token infrastructure already exists — this feature applies it to the remaining non-conforming surfaces.
- **Dependencies:** none (builds on `visual-theme-overhaul` and `enforce-visual-theme` already in inventory)