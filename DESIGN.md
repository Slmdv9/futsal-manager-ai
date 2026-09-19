---
name: Futsal Manager AI — Futsal Tactical Edge
description: Mobile-first tactical coaching tool with a clean, data-dense, indoor-sports arena aesthetic.
designAssets:
  sourceOfTruth:
    - docs/design/prototype/futsal_tactical_edge/DESIGN.md
    - docs/design/prototype/01-explore-general/screen.png
    - docs/design/prototype/02-explore-by-category/screen.png
    - docs/design/prototype/03-exercise-detail-board/screen.png
    - docs/design/prototype/04-ai-assistant/screen.png
  generatedConcepts: []
colors:
  primary: "#006948"
  primary-container: "#00855d"
  secondary: "#006398"
  secondary-container: "#5bb8fe"
  tertiary: "#006947"
  background: "#faf8ff"
  surface: "#ffffff"
  surface-container: "#eaedff"
  surface-variant: "#dae2fd"
  text: "#131b2e"
  text-variant: "#3d4a42"
  outline: "#6d7a72"
  outline-variant: "#bccac0"
  error: "#ba1a1a"
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 56px
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 26px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 22px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: "600"
    lineHeight: 18px
rounded:
  sm: 0.25rem
  md: 0.5rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
  button-ai:
    backgroundColor: "{colors.secondary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
  pitch-token:
    backgroundColor: "{colors.text}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
---

# Design Direction

## Overview

The MVP is a mobile-first tactical coaching tool for futsal. The visual language is "clean tactical minimalism": light indoor-arena backdrops, high-contrast graphite marks, and restrained pitch-emerald and vector-cyan accents that signal progression and AI suggestions without cognitive overload.

## Existing Design Assets

- `docs/design/prototype/futsal_tactical_edge/DESIGN.md` — full original design system. **Source of truth** for tokens and rationale.
- `docs/design/prototype/01-explore-general/screen.png` (+ `code.html`) — explore general screen.
- `docs/design/prototype/02-explore-by-category/screen.png` (+ `code.html`) — explore-by-category screen.
- `docs/design/prototype/03-exercise-detail-board/screen.png` (+ `code.html`) — exercise detail + tactics board.
- `docs/design/prototype/04-ai-assistant/screen.png` (+ `code.html`) — AI tactical assistant.

Authority: these are the authoritative direction for the MVP. The `code.html` files are a reference for layout and component styling, not production code. Where this document and the prototype conflict, this document's tokens win; flag anything unresolved under Open Design Questions.

## Generated Concept Images

None. The prototype already provides screen direction, so no image generation was needed.

## Product Feel

Elite but approachable: a tactical tablet/notebook feel. Calm light canvas, crisp edges, minimal decoration, dense but scannable information, and legible at pitch distance.

## Colors

- **Primary / Pitch Emerald (`#006948`, container `#00855d`)** — primary actions, positive progression, tactical execution.
- **Secondary / Vector Cyan (`#006398`, container `#5bb8fe`)** — AI suggestions, movement paths, tactical zones.
- **Tertiary / Active Turf (`#006947`)** — feedback states, active filters, substitutions.
- **Text / Carbon (`#131b2e`)** and **text-variant (`#3d4a42`)** — typographic hierarchy, pitch boundaries.
- **Background (`#faf8ff`) / surface (`#ffffff`) / surface-container (`#eaedff`)** — calm canvas with white analytical cards.
- **Outline (`#6d7a72`) / outline-variant (`#bccac0`)** — hairline containment.
- **Error (`#ba1a1a`)** — destructive or blocking states.
- Light mode only in the MVP.

## Typography

- **Space Grotesk** — headings and play titles; muscular, modern sports cadence.
- **Hanken Grotesk** — body text: play notes, coaching advice, descriptions, lists.
- **JetBrains Mono** — data and numbers: durations, intensities, player numbers, coordinates, state labels.

## Layout

8pt spatial grid. Mobile-first:

- **Mobile (<768px):** 4-column fluid grid, `1rem` margin and gutter, stacked cards, bottom action dock.
- **Tablet (768–1023px):** 8-column layout, split-pane (board ~55%, detail cards ~45%), `2rem` margins.
- **Desktop (≥1024px):** 12-column layout with a fixed side rail and a central board monitor.

The pitch board must always keep a 2:1 futsal aspect ratio (40m × 20m), independent of viewport.

## Shapes

Calibrated roundedness: cards and tiles `0.5rem` (8px); chips, badges, and player tokens use pills/full rounding; the pitch surface uses a crisp `12px` outer radius.

## Components

- **Primary tactical button:** `#006948` background, white text, `0.5rem` radius.
- **AI assist action:** `#006398` background, white text, used distinctly for AI features.
- **Status chips:** JetBrains Mono, 11px, with defending / press-trigger / tactical-alert variants.
- **Lists/strategy rows:** alternating subtle hover, single-pixel dividers, generous touch padding.
- **Inputs/selectors:** white background, `#cbd5e1` border, `#006948` focus border with a soft emerald focus ring.
- **Cards:** white surface with hairline outline and light resting elevation.
- **Interactive pitch board:** court surface light with high-contrast markings; circular player tokens (~36px) in carbon (home) and vector cyan (away/variation) with mono shirt numbers; dashed emerald/cyan vector arrows for runs, passes, and press zones.

## Core Screens

1. **Explore general** — category filter, AI session prompt entry, methodology-by-stage overview, weekly exercises with "Ver Pizarra Táctica".
2. **Explore by category** — category switcher, methodology focus, key concepts, and the filtered exercise library with "Abrir en Pizarra".
3. **Exercise detail + board** — metadata (category, duration, players, space), board with phase playback and "Animar Jugada", coaching cues, and the AI Variant Adapter.
4. **AI Tactical Assistant** — chat thread, tactical diagnosis, proposed task with a board preview, and suggested follow-up questions.

## Responsive Baseline

Phone is the primary target (carried to the pitch). Tablet secondary. Board and key actions must remain reachable one-handed. Buttons and tokens must meet a minimum 44px touch target.

## Accessibility Baseline

- Maintain WCAG AA contrast for text on light surfaces; graphite on light passes, verify accent-on-light chips.
- Never rely on color alone for home/away or phase state: pair color with shape/label/number.
- Respect reduced-motion preferences for phase playback.
- Minimum 44px touch targets; minimum 16px body text; keep board labels legible at distance.

## Do's and Don'ts

- Do keep the canvas light and let the board dominate.
- Do use vector cyan consistently for AI-generated content and movement paths.
- Do keep the 2:1 pitch ratio everywhere.
- Don't add heavy shadows, dark themes, or decorative gradients.
- Don't use color as the only signal of state.
- Don't invent new accent colors or fonts beyond the three families.

## Open Design Questions

- The prototype `DESIGN.md` front matter (Material-style palette, e.g. `#006948`) and its prose (e.g. `#059669`) use different hex values. This document adopts the front matter; reconcile the original file before implementation.
- Final logo is undecided; the prototype still carries the old name "FutsalCoach AI" and should be relabelled to "Futsal Manager AI" when reused.
- Where the AI chat lives on mobile (full screen vs bottom sheet over the board) still needs a decision.
- Empty, loading, error, and AI-quota-reached states have no design yet and should be defined with the same tokens.
