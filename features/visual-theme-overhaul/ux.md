# UX Specification: Visual Theme Overhaul for Training Overview

## 1. Overview

This specification defines the visual theme system for the Training Overview page. The page surfaces a runner's planned training activities.

**Design goal:** a runner scanning the page identifies activity types and skipped weeks in under three seconds, with no text reading required. Colour is the primary communication channel; icons and typographic hierarchy reinforce — but never replace — colour.

**Component library:** All structural and interactive components are built from MUI (Material UI) primitives. Specific MUI components are named per section.

### 1.1 The non-obvious move: the training "timeline tape"

A generic dashboard would render this data as a card grid or a flat list of rows. We deliberately reject that pattern. Instead, the Training Overview is presented as a **continuous vertical timeline tape**: a single uninterrupted column of full-width coloured segments, butted edge-to-edge with **zero vertical gap between rows within a week**. Read top-to-bottom, the page becomes a "tape" of colour blocks — a Gantt-chart-style visual rhythm rotated 90°.

Concretely, this expresses itself as:

- **Zero inter-row gap within a week.** Activity rows within a week stack with no margin, no divider, no shadow between them. The eye reads them as one multi-stripe block, not as a list of items.
- **Sickness weeks read as visual silence.** A skipped marker is rendered at **half the height** of a regular activity row (32px vs. 64px) and uses the recessive slate token. At week-group scale, a sickness week appears as a thin, muted band between two thick, saturated bands — a literal "dip" in the tape that is visible in peripheral vision while scrolling.
- **Week labels are floating gutter annotations**, not card headers. They sit in a narrow left gutter beside the tape (see 3.1), so the tape itself remains the dominant visual.

This is the non-obvious differentiator: the user perceives **training rhythm and recovery** before they perceive **individual activities**. It satisfies the 3-second glanceability goal at the *week-pattern* level, not just the *row* level.

Where this is a conventional list (icons, titles, metrics on each row), the conventions are retained because they are the right answer for the *secondary* reading — once the user's eye has located the week or pattern of interest, they need familiar affordances to read details. The novelty is in the macro-composition; the micro-composition is intentionally familiar.

---

## 2. Design Tokens (CSS Custom Properties)

All theme colours are defined as CSS custom properties on `document.documentElement` (`:root`) and integrated into the MUI theme via `createTheme` so MUI components consume them through `theme.palette`. Components never hard-code colour values.

### 2.1 Required tokens

| Token name                            | Purpose                                              | Required properties                                                                                                                                |
|---------------------------------------|------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `--color-background`                  | App-wide page background                             | Dark; the `<body>` `background-color` must resolve to a colour with WCAG relative luminance L strictly less than 0.2.                              |
| `--color-activity-long-run`           | Long-run rows and expanded panels                    | Non-empty, distinct from the other three activity-related tokens. Saturated cool hue.                                                              |
| `--color-activity-restorative-run`    | Restorative-run rows and expanded panels             | Non-empty, distinct from the other three activity-related tokens. Calm muted green.                                                                |
| `--color-activity-intervals`          | Intervals rows and expanded panels                   | Non-empty, distinct from the other three activity-related tokens. Warm energetic hue.                                                              |
| `--color-activity-skipped`            | Sickness-week skipped marker                         | Non-empty, distinct from all three activity colours. Desaturated grey/slate that visually recedes.                                                  |

### 2.2 Reference palette

- `--color-background: rgb(18, 20, 24)` — near-black with subtle cool tint (L ≈ 0.007).
- `--color-activity-long-run: rgb(56, 132, 196)` — deep azure.
- `--color-activity-restorative-run: rgb(94, 164, 122)` — muted sage.
- `--color-activity-intervals: rgb(224, 138, 64)` — warm amber.
- `--color-activity-skipped: rgb(120, 124, 132)` — neutral slate.

Implementer may tune hues only if all constraints in 2.1 continue to hold and all four activity-related tokens remain pairwise unequal after canonical-form normalisation.

### 2.3 Foreground (text/icon) colours on coloured backgrounds

- **On long-run, intervals, skipped:** `rgb(255, 255, 255)` (white) for primary text; `rgba(255, 255, 255, 0.75)` for secondary metadata.
- **On restorative-run:** `rgb(18, 20, 24)` (matches `--color-background`) for primary text; `rgba(18, 20, 24, 0.7)` for secondary metadata.

All combinations meet WCAG AA (contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text and icons).

### 2.4 Hidden colour probe

A persistent, hidden DOM element is rendered at app mount:

- Element: `<div data-testid="color-probe" aria-hidden="true" />`
- Styles: `position: absolute; width: 0; height: 0; overflow: hidden; pointer-events: none;`
- Intentionally not "visible" per the glossary.

It exists solely to let tests resolve a custom-property value to canonical `rgb(...)` form: assign `background-color: var(--token)` to it and read back via `getComputedStyle`.

---

## 3. Page Structure

### 3.1 Layout — the timeline tape

```
        ┌────────────────────────────────────────────────────┐
        │                Training Overview                   │  (h4)
        ├────────────────────────────────────────────────────┤
        │                                                    │
 Week 1 │  [▶ icon]  Long Run            12 km · 5:30/km  ▾  │  ← 64px, long-run band
        │  [▶ icon]  Restorative         6 km · 6:30/km   ▾  │  ← 64px, restorative band (no gap above)
        │  [▶ icon]  Intervals 6×400m    8 km · 4:00/km   ▾  │  ← 64px, intervals band (no gap above)
        │                                                    │
        │                                                    │  ← 24px inter-week gap
        │                                                    │
 Week 2 │  ~  Skipped — recovery week                        │  ← 32px, skipped band (half height)
        │                                                    │
        │                                                    │  ← 24px inter-week gap
        │                                                    │
 Week 3 │  [▶ icon]  Long Run            14 km · 5:30/km  ▾  │
        │  …                                                 │
        └────────────────────────────────────────────────────┘
                  (page background: --color-background)
```

**MUI components used:**

- App shell: `<CssBaseline />` inside `<ThemeProvider>`.
- Page container: MUI `<Container maxWidth="md">`; internally a two-column flex (left gutter 96px for week labels, right column for the tape).
- Page title: MUI `<Typography variant="h4">` ("Training Overview"), 32px bottom margin.
- Week section: MUI `<Box>` containing the week label (left gutter) and a vertical `<Stack spacing={0}>` of rows (right column). Inter-week gap: 24px applied as `<Stack spacing={3}>` between week sections.
- Week label: MUI `<Typography variant="overline">` rendered in the left gutter, sticky to the top of its week section (`position: sticky; top: 16px`), foreground colour `rgba(255, 255, 255, 0.6)`. Sticky positioning means the label remains visible beside the tape as the user scrolls through a long week.
- Activity row band: MUI `<Paper elevation={0} square>` (square corners are essential — rounded corners would break the tape continuity).
- Expand transition: MUI `<Collapse>`.
- Toggle button: MUI `<IconButton size="small">` containing `<ExpandMoreIcon />` (rotated 180° via CSS transform when expanded).
- Skipped marker: MUI `<Paper elevation={0} square>` with `<Stack direction="row">`.

**Inter-week visual separation:** a 24px gap of `--color-background` between week sections. This is the *only* visual separator between weeks; no divider line, no card border. The dark gap reads as breathing space; the tape reads as content.

**Inter-row visual separation within a week:** zero gap. Rows butt edge-to-edge. The colour change between adjacent rows of different types is itself the separator.

### 3.2 Activity row anatomy (collapsed)

Each collapsed activity row is a horizontal band, full container width, **64px tall**, square corners:

```
┌──────────────────────────────────────────────────────────────┐
│  [icon]   Long Run                  12 km · 5:30/km    [▾]   │
└──────────────────────────────────────────────────────────────┘
   ↑ background-color: var(--color-activity-long-run)
```

**Required elements:**

| Element              | MUI component                          | Role                                                  | Accessibility                                                                                                  |
|----------------------|----------------------------------------|-------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| Type icon (leading)  | MUI `<SvgIcon>` (24px)                 | Non-colour channel for activity-type recognition.     | `aria-hidden="true"` (decorative — type is announced via the title text).                                       |
| Title                | MUI `<Typography variant="subtitle1">` | Activity name.                                        | Plain text.                                                                                                    |
| Primary metric       | MUI `<Typography variant="body1">`     | Headline value (distance or duration).                | Plain text.                                                                                                    |
| Secondary metric     | MUI `<Typography variant="body2">`     | Supporting value (target pace or intensity).          | Plain text.                                                                                                    |
| Toggle button        | MUI `<IconButton>`                     | Expands/collapses the detail panel.                   | `aria-label`, `aria-expanded`, `aria-controls` — see 3.2.3.                                                    |

#### 3.2.1 Type-to-icon mapping (required)

| `data-activity-type`  | MUI icon                  | Rationale                                                    |
|-----------------------|---------------------------|--------------------------------------------------------------|
| `long-run`            | `<DirectionsRunIcon />`   | Sustained continuous effort.                                 |
| `restorative-run`     | `<SelfImprovementIcon />` | Recovery/restoration theme.                                  |
| `intervals`           | `<SpeedIcon />`           | Speed/intensity work.                                        |

The skipped marker uses `<SickIcon />` (see 3.4).

#### 3.2.2 Visual hierarchy within a row

1. **Colour band** (read first, < 1 second): the entire row's `background-color`.
2. **Type icon** — 24px, leading position, full-opacity foreground.
3. **Title** — `subtitle1`, ~16px, font-weight 600, full-opacity foreground.
4. **Primary metric** — `body1`, ~16px, font-weight 500, full-opacity foreground, right-aligned within the metadata cluster. Headline number.
5. **Secondary metric** — `body2`, ~14px, font-weight 400, 0.75 opacity foreground. Deliberately lower weight so it does not compete with the primary metric.
6. **Toggle chevron** — 24px icon button, trailing position, 0.85 opacity