# Feature Implementation Spec: Add mobile navigation shell

## Source Feature

- `id`: `app-navigation-shell`
- `area`: `foundation`
- `depends_on`: `bootstrap-app-shell`, `design-system-tokens`
- `status`: `not_started`
- `source`: `feature_list.json`

## Goal

Give the app a persistent four-section mobile shell so a coach can move between Explorar, Pizarra, Asistente IA, and Mi Club with Spanish labels and a bottom navigation bar that matches the prototype. Each destination must be a real route that renders a token-based section placeholder. Mi Club must open a locked next-phase state instead of a broken or empty route.

This feature establishes navigation and section placeholders only. The real explore content, tactics board, and AI assistant are separate features.

## Non-Goals

- Board renderer, phase playback, exercise content, category filter, programming, or chat behavior.
- A functional Mi Club area with teams, rosters, or calendars; it stays a locked next-phase entry point.
- Custom tab-bar gestures, animated transitions, badges with counts, or deep-link campaigns beyond Expo Router defaults.
- Dark mode, new colors, new fonts, or a second icon library.

## Job Story

When I open the app on my phone at training,
I want to reach Explorar, Pizarra, Asistente IA, or Mi Club from one thumb-reachable bar,
so I can orient myself in the app and understand which areas exist now and which come later.

## Users And Permissions

- Anonymous coach: can open all four tabs; only Mi Club is visibly locked and explains that it belongs to a later phase.
- No authentication, account, or role checks are introduced.

## Acceptance Scenarios

### Scenario 1: Launch into Explorar

Given the app starts with no prior navigation state
When the bundle finishes loading
Then the Explorar section is visible and its tab is marked active in the bottom bar.

### Scenario 2: Move between sections

Given Explorar is active
When the coach taps Pizarra, Asistente IA, or Explorar
Then the matching section screen renders, the tapped item becomes active, and the previous item becomes inactive.

### Scenario 3: Mi Club is locked, not broken

Given the coach is on any section
When the coach taps Mi Club
Then a real Mi Club screen renders with a lock indicator and Spanish copy stating it arrives in a later phase, and no team, roster, or calendar UI appears.

### Scenario 4: Developer gallery stays reachable

Given the existing design-system gallery is part of the repo
When the coach opens the Explorar placeholder
Then the `Ver sistema de diseño` action still navigates to `/design-system` and the shell is not shown over the gallery.

### Scenario 5: One-handed mobile use

Given a phone viewport with a bottom safe-area inset
When the shell renders
Then all four items sit in one row above the safe area, each item is at least 44 dp tall, and labels and icons remain legible without horizontal scrolling.

## Repository Research

### Files Inspected

- `AGENTS.md` — MVP constraints, Spanish UI copy, device verification requirement, branch workflow.
- `PROGRESS.md` — accepted state of `bootstrap-app-shell` and `design-system-tokens`.
- `feature_list.json` — selected feature, dependencies, verification, and next-feature order.
- `DESIGN.md` — mobile bottom action dock, 44 px touch targets, tokens, and accessibility baseline.
- `CONTEXT.md` — canonical terms: Pizarra, Asistente IA, Mi Club is not defined as a domain entity.
- `docs/risks-and-open-questions.md` — confirms the four prototype screens and that Mi Club is a locked next-phase entry point.
- `docs/design/prototype/01-explore-general/code.html` — four-item bottom nav markup, icon names, active styling, AI dot, and lock badge.
- `src/app/_layout.tsx` — root stack, font gate, and splash handling.
- `src/app/index.tsx` — current placeholder home and gallery link.
- `src/app/design-system.tsx` — existing gallery route that must remain outside the tabs.
- `src/components/ui/*` — `AppText`, `AppButton`, `Card`, `Chip`, and `AppInput` primitives available for the placeholders.
- `src/theme/*` — colors, typography, spacing, radius, and elevation tokens.
- `package.json` — Expo Router 58 and `expo-symbols` are already installed; no icon package is present.
- `node_modules/expo-symbols` — `SymbolView` supports Material Symbols on Android and SF Symbols on iOS.

### Existing Patterns To Follow

- Routes live under `src/app` and use Expo Router typed routes.
- Screens compose `@/components/ui` primitives and `@/theme` tokens; no literal colors or font sizes.
- Every screen uses `SafeAreaView` from `react-native-safe-area-context`.
- Spanish user-facing copy, English code identifiers.
- Single non-blocking verification gate: `npm run verify`, executed by `./init.sh`.

### Current Gaps

- No route group or tab navigator exists; the app has a single stack with `/` and `/design-system`.
- No section screens exist for Pizarra, Asistente IA, or Mi Club.
- There is no persistent E2E harness; verification remains scripted static checks plus manual device checks.
- `DESIGN.md` asks for a 16 px body minimum while the prototype nav labels use the 11 px `labelMd` token. The nav follows the prototype token; this is a documented token exception, not a new style.

## Technical Approach

1. Move the home route into an Expo Router group: `src/app/(tabs)/_layout.tsx` renders `Tabs` and `src/app/(tabs)/index.tsx` becomes the Explorar placeholder. Delete `src/app/index.tsx` so `/` resolves to the tab group.
2. Configure the tab bar with tokens only: white `surface` background, hairline top border in `outlineVariant`, active tint `primary`, inactive tint `textVariant`, `labelMd` labels, and 22 px icons. Use `useSafeAreaInsets()` so the bar keeps a 64 dp content area plus the bottom inset, and do not rely on platform defaults for height or typography.
3. Add one small `TabIcon` component under `src/components/navigation` that renders `SymbolView` with `{ ios, android }` names, a `focused` color, an optional cyan AI dot (`secondary`), and an optional lock badge (`outline`). Icons map to the prototype: Explorar `sports_soccer`, Pizarra `draw`, Asistente IA `smart_toy`, Mi Club `shield_person`; iOS equivalents are `soccerball`, `pencil.and.outline`, `brain.head.profile`, `shield.lefthalf.filled`, and `lock.fill` for the badge.
4. Add a shared `SectionPlaceholder` component for Explorar, Pizarra, and Asistente IA so the three sections share spacing and status treatment. Mi Club gets its own screen with a `Card`, a `Chip` labelled `SIGUIENTE FASE`, the lock symbol, and Spanish copy that names the later-phase scope without implementing it.
5. Keep `/design-system` in the root stack, outside `(tabs)`, so the gallery has no tab bar. Preserve the existing `Ver sistema de diseño` action in Explorar for manual design verification.
6. Set tab options `headerShown: false`, `tabBarHideOnKeyboard: true`, and explicit `tabBarAccessibilityLabel` per section. Do not add a custom tab bar unless the default one cannot match the required tokens and touch size.

## Expected File Changes

- `src/app/(tabs)/_layout.tsx` — create; tabs, tokens, safe-area sizing, icon badges.
- `src/app/(tabs)/index.tsx` — create; Explorar placeholder moved from the old home route.
- `src/app/(tabs)/pizarra.tsx` — create; Pizarra placeholder.
- `src/app/(tabs)/asistente.tsx` — create; Asistente IA placeholder.
- `src/app/(tabs)/mi-club.tsx` — create; locked next-phase screen.
- `src/app/index.tsx` — delete; replaced by the tab group index.
- `src/app/_layout.tsx` — modify; register `(tabs)` and `design-system` in the root stack.
- `src/components/navigation/tab-icon.tsx` — create; symbol icon with AI and lock badges.
- `src/components/navigation/section-placeholder.tsx` — create; shared section layout.
- `src/components/navigation/index.ts` — create; local exports.
- `docs/specs/app-navigation-shell.md` — this spec.
- `AGENTS.md`, `PROGRESS.md`, `feature_list.json` — update state, evidence, and next feature.

## Visual Design Impact

- UI involved: yes.
- Design source: `DESIGN.md` and `docs/design/prototype/01-explore-general/code.html`.
- Screens or states affected: Explorar, Pizarra, Asistente IA, Mi Club locked state, and the root stack transition to `/design-system`.
- Required tokens: `surface`, `outlineVariant`, `primary`, `textVariant`, `secondary`, `outline`, `background`, `text`; `typography.labelMd`, `headlineLgMobile`, `bodyLg`, `bodyMd`; `spacing.sm`, `md`, `lg`; `radius.md`, `radius.full`; existing `Card` and `Chip` states.
- Bottom bar: four equal items, 64 dp content height plus safe-area inset, no heavy shadow, no gradients, no new accent colors.
- Active state pairs color with `accessibilityState.selected`; the AI dot is decorative and never the only signal of state.
- New design artifact required: no; the prototype already defines the dock.

## Durable Documentation Impact

- `ARCHITECTURE.md`: not needed — no new layer, provider, or domain boundary.
- `CONSTRAINTS.md`: not needed — navigation rules are feature-local and captured here plus `AGENTS.md`.
- `AGENTS.md`: update — project status and the next feature change.
- Other docs: `PROGRESS.md` and `feature_list.json` — record implementation and device evidence; `docs/risks-and-open-questions.md` — only if a new navigation risk appears.

## Implementation Plan

1. Create the `(tabs)` group, the four section screens, and the shared placeholder, then remove the old home route.
2. Configure the tab bar with tokens, safe-area height, icons, AI dot, and lock badge.
3. Update the root stack, verify on the physical Android device, then record evidence and harness state.

## Implementation Tasks

- [ ] Create `src/components/navigation/tab-icon.tsx` using `expo-symbols` with iOS/Android names and optional AI/lock badges.
- [ ] Create `src/components/navigation/section-placeholder.tsx` with a Spanish eyebrow, title, description, status chip, and optional children.
- [ ] Create `src/app/(tabs)/_layout.tsx` with four `Tabs.Screen` entries, token-based bar styling, and safe-area sizing.
- [ ] Create `src/app/(tabs)/index.tsx` for Explorar and keep the `Ver sistema de diseño` link.
- [ ] Create `src/app/(tabs)/pizarra.tsx` and `src/app/(tabs)/asistente.tsx` placeholders with distinct Spanish copy.
- [ ] Create `src/app/(tabs)/mi-club.tsx` with the locked next-phase state.
- [ ] Update `src/app/_layout.tsx` to register `(tabs)` and `design-system`; delete `src/app/index.tsx`.
- [ ] Run the verification gate and the physical Android device checks; record evidence.

## Verification Plan

- `npm run verify` — ESLint, `tsc --noEmit`, and `expo-doctor` must pass.
- `./init.sh` — must exit 0, execute the gate, and not start Metro.
- `npx expo export --platform android` — must bundle successfully with the new route group.
- Physical Android device (Samsung Galaxy M13, Android 14, Expo Go):
  - Cold start lands on Explorar with the tab active.
  - Tap Pizarra, Asistente IA, Explorar, and Mi Club; confirm each screen and active state with `uiautomator` dumps plus screenshots.
  - Confirm Mi Club shows the lock, `SIGUIENTE FASE`, and next-phase copy with no team UI.
  - Confirm the design-system gallery opens without a tab bar and returns to Explorar.
  - Confirm the four items fit in one row, are at least 44 dp tall, and sit above the safe area.
  - Confirm no React Native warnings, errors, or missing-symbol placeholders in `logcat`.
- Fast Refresh and a force-stop/full relaunch must both keep the shell working.
- No persistent E2E harness exists yet; the feature is navigation-only and the device checks above are the accepted evidence. Add E2E coverage when an E2E harness is introduced.

## Evidence To Capture

- `npm run verify` output and exit code.
- `./init.sh` exit code.
- Android export bundle result.
- Device model, Android version, and Expo Go version.
- `uiautomator` text/bounds output for each tab destination and active-state bounds.
- Screenshots of Explorar, Pizarra, Asistente IA, Mi Club locked state, and the gallery without tabs.
- `logcat` confirmation of no React Native warnings or errors.

## Validator Checklist

- [ ] Implementation stays within this feature's scope.
- [ ] Acceptance scenarios pass.
- [ ] Verification evidence is present.
- [ ] Persistent E2E coverage was added/updated when the feature has an observable user/API flow and an E2E harness exists, or the spec explains why it is not needed.
- [ ] `feature_list.json` and `PROGRESS.md` were updated correctly.
- [ ] No unrelated product behavior or extra feature work was added.
