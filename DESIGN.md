---
name: TherapyDesk
description: Clinical documentation and practice management for independent therapists
colors:
  primary: "#2D6A4F"
  primary-hover: "#235D44"
  primary-light: "#EAF3ED"
  primary-mid: "#B7D5C4"
  ink: "#1A1A18"
  ink-soft: "#3C3B38"
  stone: "#6B6762"
  stone-mid: "#E2DED9"
  stone-light: "#F5F3F0"
  mist: "#FAFAF8"
  white: "#FFFFFF"
  red: "#C0392B"
  red-light: "#FDECEA"
  amber: "#B45309"
  amber-light: "#FEF3E2"
  chart-1: "#2D6A4F"
  chart-2: "#5B8C5A"
  chart-3: "#8BAA7A"
  chart-4: "#B7C9A8"
  chart-5: "#D4DFC8"
typography:
  display:
    fontFamily: "'Instrument Serif', Georgia, serif"
    fontSize: "clamp(1.75rem, 3vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.05em"
    textTransform: "uppercase"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "8px 20px"
    typography: "{typography.title}"
  button-secondary:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "8px 20px"
    typography: "{typography.title}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.stone}"
    padding: "4px 12px"
    typography: "{typography.title}"
  input:
    backgroundColor: "{colors.white}"
    borderColor: "{colors.stone-mid}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.white}"
    borderColor: "transparent"
    rounded: "{rounded.xl}"
    padding: "16px"
  badge-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
    typography: "{typography.label}"
  badge-secondary:
    backgroundColor: "{colors.stone-light}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
    typography: "{typography.label}"
---

# Design System: TherapyDesk

## 1. Overview

**Creative North Star: "The Clinician's Instrument"**

TherapyDesk is a tool, not a dashboard. It should feel like picking up a well-balanced instrument — precise, quiet, and immediately useful. Every pixel earns its place; nothing is decorative. The palette centers on a restrained clinical sage against warm stone neutrals, evoking a calm, professional therapy room rather than a generic SaaS interface.

The system explicitly rejects: generic SaaS dashboard tropes (gradient headers, hero metrics, rounded-corner-overload), clinical EMR green, "gentle" or "soothing" aesthetics, and any decorative flourishes that slow down the core workflow.

**Key Characteristics:**
- Sharp and minimal — generous whitespace, tight typography, no decorative elements
- Flat by default — depth via spacing and typography, not shadows
- Clinical warmth — sage green on warm neutrals, not cold blue-white
- Trust through precision — alignment, consistency, and restraint carry authority

## 2. Colors: The Sage Clinical Palette

A restrained palette of one saturated green on a warm neutral ground. The green carries all interactive intent; neutrals provide the quiet structure.

### Primary

- **Sage** (#2D6A4F / oklch(0.42 0.08 165)): The only accent. Used for primary buttons, active states, focus rings, and signed-badge backgrounds. Never on more than ~10% of any given screen.

### Primary Variants

- **Sage Light** (#EAF3ED / oklch(0.94 0.02 155)): Subtle backgrounds, filled badges, hover states on neutral cards. The "active" whisper.
- **Sage Mid** (#B7D5C4 / oklch(0.8 0.04 160)): Hover borders, secondary indicators. Bridges sage and white.

### Neutral

- **Ink** (#1A1A18 / oklch(0.15 0.005 107)): Primary body text. High contrast on all backgrounds.
- **Ink Soft** (#3C3B38 / oklch(0.28 0.006 107)): Secondary body text, form labels, navigation items.
- **Stone** (#6B6762 / oklch(0.49 0.015 90)): Placeholder text, muted metadata, disabled states. The quietest readable gray.
- **Stone Mid** (#E2DED9 / oklch(0.9 0.008 85)): Borders, dividers, subtle separators. Visible but not assertive.
- **Stone Light** (#F5F3F0 / oklch(0.96 0.004 85)): Card background, sidebar surface, hover tints.
- **Mist** (#FAFAF8 / oklch(0.98 0.002 90)): Page background. The canvas all surfaces sit on.

### Semantic

- **Red** (#C0392B / oklch(0.5 0.18 30)): Destructive actions, errors, unsigned critical warnings.
- **Amber** (#B45309 / oklch(0.6 0.12 60)): Draft/pending states, caution indicators, unsaved status.

### Chart

- Five-step green ramp: sage through light olive to pale green. Used only in data visualizations (dashboard KPI accents, session distribution).

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. No shadows. Depth is communicated through spacing, tonal background layering (stone-light on mist), and typography scale. Shadows appear only as a response to state (hover, focus, active) — and even then, they are subtle (1-2px offset, 20% opacity).

**The One Accent Rule.** Sage is the only accent color. Never use multiple accent colors. Status differentiation uses icons and labels, not color alone.

## 3. Typography

**Display Font:** Instrument Serif (400 weight, Georgia fallback)
**Body Font:** Plus Jakarta Sans (300–800 weight, -apple-system fallback)

**Character:** A restrained editorial pairing. The serif display is used sparingly — only for page titles and the dashboard greeting — to establish a calm, professional authority. Everything else is Plus Jakarta Sans in medium-to-bold weights for clarity and speed.

Instrument Serif's light italic is the only allowable italic; it is used exclusively for empty-state messages and secondary contextual guidance. No bold serif, no roman serif for body text.

### Hierarchy

- **Display** (400, clamp(1.75rem, 3vw, 2.25rem), 1.15, -0.02em): Page titles and the dashboard greeting only. `text-wrap: balance`. Prohibited anywhere else.
- **Headline** (700, 1.25rem, 1.3): Card titles, section headers inside pages.
- **Title** (600, 0.875rem, 1.4): Button labels, list item names, table cells.
- **Body** (500, 0.8125rem, 1.5): Default text. Most common type size. 65ch max line length on prose blocks.
- **Label** (700, 0.6875rem, 1.3): Badge text, tab labels, sidebar group headers. `text-wrap: pretty`.

All body text uses weight 500 (medium), never 400 (regular) or 300 (light). Light weights at `stone` (#6B6762) on `mist` (#FAFAF8) failed WCAG AA contrast. The minimum contrast floor is weight 500 at `stone` size 13px.

### Named Rules

**The Serif Ceiling Rule.** Instrument Serif is a display-only face. Never use it for body text, labels, buttons, or navigation. Its rarity is the point — it signals "this is a page heading" at a glance.

**The No-Light-Text Rule.** Font weight 300 (light) is prohibited for body text. Minimum body weight is 500 (medium). Light weights are only acceptable for large display sizes (>1.5rem) where WCAG AA drops to 3:1.

## 4. Elevation

Flat by default. TherapyDesk does not use card shadows, drop shadows, or background blur. Depth is communicated exclusively through:
1. **Tonal layering:** mist → stone-light → white surfaces stack from background to card to modal.
2. **Spacing:** Elements that need emphasis get more isolation, not more shadow.
3. **Border presence:** Interactive surfaces (inputs, cards) reveal their boundary via a subtle `stone-mid` border at rest, shifting to `ink-soft` or `sage` on focus.

The only exception to the flat rule is the avatar/badge ring (a 1.5px `sage` outline on selected dates) and the modal backdrop (a 50% opacity black scrim).

## 5. Components

### Buttons
- **Shape:** Rounded-xl (14px). Medium height (~36px), compact padding.
- **Primary:** Sage background (#2D6A4F), white text, no border. Hover: darkens 5% (via `brightness(0.95)`). Active: no shift. Focus: 2px sage ring.
- **Secondary:** Mist background, ink text, stone-mid border. Hover: stone-light background. Focus: sage ring.
- **Ghost:** No background, stone text. Hover: stone-light background with tooltip delay.

### Cards / Containers
- **Shape:** Rounded-xl (14px). White background on mist page surface. No shadow.
- **Border:** None at rest (the white-on-mist contrast defines the shape). Optional stone-mid border when a card needs visual grouping within a white section.
- **Internal padding:** 16px (--spacing-md). Section headers inside cards get a bottom border + 16px padding.
- **Hover:** Border visible (stone-mid) + stone-light background for interactive cards. Transition: 150ms ease.

### Inputs / Fields
- **Shape:** Rounded-xl (14px). White background, stone-mid 1px border.
- **Focus:** Border shifts to sage, 1px sage ring with 2px offset. No glow.
- **Label:** 11px bold uppercase above the field. Stone color.
- **Error:** Red border + red-light background tint. Error message in 11px red bold below.
- **Disabled:** 50% opacity, no pointer events.

### Navigation (Sidebar)
- **Style:** Stone-light background, full height, no shadow.
- **Items:** 13px medium, stone text (ink on active). Rounded-lg (10px) pill for active state.
- **Active:** Sage-light background, ink text. No left-border accent strip.
- **Hover:** Stone-mid/50 background on nav items.

### Badges
- **Shape:** Rounded-md (8px). Compact 2px 8px padding.
- **Default:** Sage background, white text, 11px bold uppercase.
- **Secondary:** Stone-light background, ink-soft text.
- **Outline:** Transparent background, stone border, stone text.

## 6. Do's and Don'ts

### Do:
- **Do** use sage as the only accent. No second accent colors.
- **Do** prefer flat surfaces over shadows.
- **Do** use font weight 500 or higher for body text at 13px to maintain contrast.
- **Do** use Instrument Serif only for page-level headings.
- **Do** use `text-wrap: balance` on headings and `text-wrap: pretty` on prose.
- **Do** use the minimum interactions principle: the default path from opening the app to signing a SOAP note should be ≤3 clicks.

### Don't:
- **Don't** use gradient text, glassmorphism, or side-stripe borders (border-left >1px accent).
- **Don't** use uppercase "eyebrow" labels above every section heading.
- **Don't** use numbered section markers (01/02/03) as default scaffolding.
- **Don't** use text that overflows its container at any breakpoint.
- **Don't** use hero-metric templates (big number + small label + supporting text).
- **Don't** use identical card grids repeated endlessly.
- **Don't** use decorative UI patterns that don't serve the workflow.
- **Don't** animate CSS layout properties; prefer transform + opacity.
- **Don't** skip reduced-motion support; every animation needs a `prefers-reduced-motion` alternative.
