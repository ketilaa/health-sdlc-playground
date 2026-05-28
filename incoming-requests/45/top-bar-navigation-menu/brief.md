# Feature Brief: top-bar-navigation-menu

## Feature Type
behavioral

## Goal
A user can open a navigation menu in the top bar and select "Home" to navigate to the root page (`/`).

## Context
The top bar is currently rendered by `TopBar.tsx` (and/or inline AppBar logic in `HomePage.tsx`). The root route `/` already exists and renders `HomePage`. This feature adds an interactive menu element (e.g. a hamburger button or nav menu) to the AppBar that exposes a single "Home" entry pointing to `/`.

## Scope
frontend

## Affected System Areas
- Pages / routes: `/` (linked target — no changes to route itself)
- Components: `TopBar.tsx` (add menu trigger + menu/nav item); `HomePage.tsx` if AppBar logic remains inline there
- Data model: none

## Out of Scope
- Adding any routes other than Home to the menu
- Redesigning the AppBar layout beyond inserting the menu element
- Mobile drawer vs. desktop nav bar distinction — implementation choice left to UX/developer
- Any changes to page content, dataset selector, or dashboard components