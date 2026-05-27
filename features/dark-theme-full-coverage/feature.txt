# Feature Brief: dark-theme-full-coverage

## Goal
After this feature, every visible UI surface — AppBar, TopBar, and MUI Paper section cards — uses the dark theme palette, eliminating the blue AppBar and white-background Paper outliers.

## Context
`visual-theme-overhaul` established the dark token system (`--color-background: rgb(18,20,24)`, white text, activity-type color tokens) and `enforce-visual-theme` wired those tokens to activity rows. However, the MUI AppBar (rendered in `HomePage.tsx` / `TopBar.tsx`) defaults to MUI's primary blue, and MUI Paper components (used for the Insights and Training Overview placeholder sections) default to white/light surfaces. This feature applies the existing dark theme to those remaining surfaces. No new pages or data model changes are needed.

## Scope
frontend

## Affected System Areas
- **Pages / routes:** `/` (`HomePage.tsx`)
- **Components:** `TopBar.tsx`, `HomePage.tsx` (inline AppBar sx props), MUI Paper section cards (insights panel, any remaining Training Overview placeholder), `ColorProbe.tsx` (may need probe assertions extended)
- **Data model:** none

## Out of Scope
- Introducing a new MUI theme provider or switching to a full MUI dark mode theme — fix must be achievable via `sx` props, CSS custom properties, or targeted MUI `sx`/`style` overrides consistent with existing patterns
- Changing any activity-row color tokens (already correct)
- Modifying typography scale, spacing, or any non-color visual properties
- Adding new color tokens beyond what is needed to cover AppBar and Paper surfaces (if new tokens are needed, they follow the existing `rgb(...)` canonical format in `tokens.ts`)