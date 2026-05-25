# Skill: Accessibility (WCAG / ARIA)

Apply these principles when designing and reviewing UX specifications. Target level: **WCAG 2.1 AA**.

---

## Designer principles

**Colour alone must never be the only differentiator.**
Since colour is a primary communication tool in this project, every colour-coded distinction must also have a secondary cue — an icon, a label, a shape, or a text alternative. A colour-blind user must be able to distinguish activity types, states, and categories without relying on hue. This pairs directly with the colour token system: every token that carries meaning also needs a non-colour counterpart.

**Contrast ratios are non-negotiable — especially on dark backgrounds.**
Dark backgrounds amplify visual impact but also raise the risk of low-contrast text. Specify contrast intent in the UX spec:
- Normal text: minimum 4.5:1 against its background (WCAG 1.4.3)
- Large text (18pt / 14pt bold) and UI component boundaries: minimum 3:1
- Use the colour token names when describing contrast — "the `--color-long-run` token must meet 3:1 against `--color-bg-surface`" is a complete spec statement.

**Every icon-only element must have an accessible name.**
Icons replacing text labels (see experimental-ux) are not exempt from accessibility. For each icon-only element, specify its accessible name — either an `aria-label` on the element, a visually hidden `<span>`, or an MUI `Tooltip` that also serves as the accessible label. "Running shoe icon" is not a name; "Long run activity type" is.

**Keyboard navigation and focus order must be explicitly described for interactive elements.**
Any element a user can click, expand, or activate must also be reachable by keyboard. Specify: what is focusable, what the focus indicator looks like (visible ring matching the colour token or a contrasting fallback), and the logical tab order. For lists and rows, describe whether arrow-key navigation applies.

**Animations must respect `prefers-reduced-motion`.**
Every animated or transitional state described in the UX spec must note its reduced-motion fallback — typically an instant state change with no transition. This applies to loading skeletons, row expansions, and colour fill animations.

**Loading and dynamic states must be announced to screen readers.**
When content loads or changes without a full page navigation, specify the announcement strategy:
- Use `aria-live="polite"` for non-urgent updates (data loaded)
- Use `aria-live="assertive"` sparingly, only for errors or critical alerts
- Skeleton/loading states should have a static `aria-label` like "Loading activity data" so screen readers don't read raw skeleton markup.

**Semantic structure over visual structure.**
Define the heading hierarchy (`h1` / `h2` / `h3`) for the feature, not just the visual sizes. Define landmark regions (`main`, `nav`, `region` with `aria-label`) so screen reader users can navigate by landmark. A feature that is visually organised but semantically flat is not complete.

---

## Reviewer checklist

Apply these checks when validating a UX spec. The goal is to verify that the designer made **intentional, explicit accessibility decisions** — not to enforce a single implementation. A designer who chose a tooltip-based accessible name instead of a visually hidden span is fine; a designer who left icon accessibility unspecified is not.

- [ ] Every icon-only element has a specified accessible name — `aria-label`, visually hidden text, or tooltip. Omitting the accessible name for any icon that carries meaning is a blocking gap.
- [ ] Every colour-coded distinction has a named secondary cue (icon, label, pattern, or shape). "Colour differentiates activity types" without a secondary cue is a blocking gap.
- [ ] Contrast intent is stated for text and UI components on non-white backgrounds. A spec that introduces a dark background or a colour token for text must state the expected contrast level or token pairing. Silence is a gap.
- [ ] Interactive elements (expandable rows, buttons, selectors) have keyboard behaviour described — what is focusable, tab order, and what the focus indicator looks like.
- [ ] Every animated or transitional state includes a `prefers-reduced-motion` fallback — even if that fallback is "instant state change with no transition."
- [ ] Loading and async states specify a screen reader announcement strategy (`aria-live` region or static `aria-label` on the skeleton).
- [ ] The heading hierarchy and landmark regions are defined, or the spec explicitly states the feature inherits them from the surrounding shell and names which shell.
- [ ] If the designer deferred any accessibility decision to the developer (e.g. "use appropriate ARIA"), the rationale is documented. Undocumented deferrals are a gap; a documented "MUI handles this natively" is acceptable.
