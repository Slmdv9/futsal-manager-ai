# Feature Implementation Spec: Design tokens and base UI primitives

## Source Feature

- `id`: `design-system-tokens`
- `area`: `foundation`
- `depends_on`: `bootstrap-app-shell`
- `status`: `not_started`
- `source`: `feature_list.json`

## Goal

Implement the Futsal Tactical Edge design tokens and a small set of reusable React Native primitives so every later screen renders consistent colors, typography, spacing, radii, elevation, and component states. A `/design-system` gallery route must make every token and primitive state visually inspectable on a phone.

This feature establishes the visual contract for the MVP. It does not build product screens beyond a token-based home placeholder.

## Non-Goals

- Bottom navigation, section routing, or app shell chrome (`app-navigation-shell`).
- Exercise content, Board Data, tactics board, or AI surfaces.
- Dark mode, theming switches, or user-selectable accents.
- Additional fonts, colors, gradients, or heavy shadows outside `DESIGN.md` and the prototype front matter.
- Full component coverage (modals, lists, sheets, tabs, icons). Only text, button, card, chip, and input are in scope.
- Icon assets or a logo.
- E2E automation for the gallery.

## Job Story

When I build a screen for Futsal Manager AI,
I want shared tokens and primitives that already match the tactical design language,
so I can compose screens quickly without re-deciding colors, type, or component states.

## Users And Permissions

- Developer/agent: consumes tokens and primitives, renders the gallery, and verifies visual parity.
- Anonymous coach: sees the design language on the home placeholder and gallery; no actions are persisted.

## Acceptance Scenarios

### Scenario 1: Tokens render as documented

Given the app is running on a phone viewport
When I open `/design-system`
Then the palette, typography scale, spacing scale, radii, and card elevation match `DESIGN.md`.

### Scenario 2: Typography families load

Given the app has just started
When the gallery renders
Then headings use Space Grotesk, body copy uses Hanken Grotesk, and labels/data use JetBrains Mono, with no fallback system font visible.

### Scenario 3: Button states are distinguishable

Given the gallery is visible
When I compare the button section
Then primary (`#006948`), AI (`#006398`), secondary (white with outline), and disabled buttons render as distinct states, all at least 44px tall.

### Scenario 4: Input states render

Given the gallery is visible
When I inspect the input section
Then default, focused, and error states render with the documented border, focus ring, and error color; the focused field accepts text.

### Scenario 5: Chips and cards use the system

Given the gallery is visible
When I inspect chips and cards
Then defending, press-trigger, and tactical-alert chips use mono labels and the documented surfaces, and cards use white surface, hairline outline, 8px radius, and light resting elevation.

### Scenario 6: Home placeholder consumes the system

Given the app opens at `/`
When the home route renders
Then it uses tokens and primitives instead of hardcoded styles and links to the gallery.

### Scenario 7: Verification gate passes

Given dependencies are installed
When I run `npm run verify` and `./init.sh`
Then ESLint, `tsc --noEmit`, and `expo-doctor` pass without warnings introduced by this feature.

## Repository Research

### Files Inspected

- `DESIGN.md` — authoritative colors, typography, spacing, radii, components, accessibility.
- `docs/design/prototype/futsal_tactical_edge/DESIGN.md` — source-of-truth front matter with mobile type variants, extra surface roles, elevation, and component detail.
- `docs/design/prototype/01-explore-general/code.html` — reference styling for buttons, chips, inputs, and cards.
- `src/app/_layout.tsx` — root stack; must gate rendering until fonts load.
- `src/app/index.tsx` — home placeholder with hardcoded hex values and no font usage.
- `package.json` — Expo SDK 58, React Native 0.88, `expo-font` already installed.
- `docs/specs/bootstrap-app-shell.md` — spec format and evidence conventions.
- `feature_list.json` — verification targets for this feature.

### Existing Patterns To Follow

- Expo Router file-based routes under `src/app`.
- TypeScript strict mode with `@/*` path alias to `src/*`.
- Spanish UI copy; English identifiers and docs.
- Tokens must be traceable to `DESIGN.md` or the prototype front matter; root `DESIGN.md` wins on conflicts.

### Current Gaps

- No token module, no font loading, no primitive layer, no gallery.
- The home screen uses raw hex values and system fonts.
- No visual regression or unit test harness exists; verification is manual on device plus static checks.

## Technical Approach

### Token layer

Create `src/theme/`:

- `colors.ts` — semantic palette mapped from `DESIGN.md` plus the prototype front matter roles needed by primitives (surfaces, on-colors, fixed chip surfaces). No new hues.
- `typography.ts` — the documented scale, including mobile display/headline variants. Each entry carries `fontFamily` from the loaded font asset key, `fontSize`, `lineHeight`, `fontWeight`, and `letterSpacing` where documented.
- `spacing.ts` — the 8pt scale (`2xs` 2, `xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 32, `2xl` 48, `3xl` 64) plus mobile margin 16.
- `radius.ts` — `sm` 4, `md` 8, `lg` 16, `xl` 24, `full` 9999.
- `elevation.ts` — Level 1 and Level 2 shadow values from the prototype, expressed for React Native (`shadowColor`, offsets, opacity, radius, elevation).
- `fonts.ts` — `useAppFonts` hook wrapping `expo-font` with Space Grotesk 600/700, Hanken Grotesk 400/500, JetBrains Mono 500/600.
- `index.ts` — single public export surface.

Use `expo-google-fonts` packages installed with `npx expo install` so versions match the Expo SDK. Font weights are selected by explicit family key (e.g. `SpaceGrotesk_700Bold`) rather than `fontWeight`, which is unreliable for custom fonts on Android.

### Primitive layer

Create `src/components/ui/`:

- `text.tsx` — `AppText` with `variant`, `color`, `align`, and style overrides; default `bodyMd`.
- `button.tsx` — `AppButton` with `variant` (`primary`, `ai`, `secondary`, `disabled`), minimum 44px height, pressed feedback, accessibility role/state, and optional `fullWidth`.
- `card.tsx` — `Card` with white surface, hairline outline, `radius.md`, resting elevation, and padding.
- `chip.tsx` — `Chip` with `variant` (`neutral`, `defending`, `press-trigger`, `tactical-alert`), mono `label-md` label, and pill radius.
- `input.tsx` — `AppInput` with `label`, `error`, focus ring, placeholder color, and forwarded `TextInput` props.
- `index.ts` — barrel export.

All primitives read from tokens; no literal hex values inside components.

### Font gate

Update `src/app/_layout.tsx` to call `useAppFonts`, keep the splash screen visible until fonts resolve, hide it when ready, and render nothing (or keep the splash) while loading. Errors should fail visibly rather than silently render fallback fonts.

### Gallery route

Create `src/app/design-system.tsx` as a scrollable gallery with labeled sections:

1. Palette swatches with hex and token name.
2. Typography scale samples in each documented variant.
3. Spacing and radius scales.
4. Buttons: primary, AI, secondary, disabled.
5. Cards: default and elevated.
6. Chips: defending, press-trigger, tactical-alert, neutral.
7. Inputs: default, focused (autoFocus or state), error.

The gallery is a development/verification surface, not a product screen. It can remain in the router for later design review.

### Home route

Replace hardcoded styles in `src/app/index.tsx` with tokens and primitives, keep the current Spanish copy, and add a link to `/design-system` using Expo Router `Link` styled as a secondary button.

## Expected File Changes

- `package.json`, `package-lock.json` — add the three Expo-compatible Google Font packages.
- `src/theme/colors.ts` — new.
- `src/theme/typography.ts` — new.
- `src/theme/spacing.ts` — new.
- `src/theme/radius.ts` — new.
- `src/theme/elevation.ts` — new.
- `src/theme/fonts.ts` — new.
- `src/theme/index.ts` — new.
- `src/components/ui/text.tsx` — new.
- `src/components/ui/button.tsx` — new.
- `src/components/ui/card.tsx` — new.
- `src/components/ui/chip.tsx` — new.
- `src/components/ui/input.tsx` — new.
- `src/components/ui/index.ts` — new.
- `src/app/_layout.tsx` — modify; font gate.
- `src/app/index.tsx` — modify; tokens and primitives.
- `src/app/design-system.tsx` — new gallery route.
- `PROGRESS.md` — modify; verified state and session log.
- `feature_list.json` — modify; status and evidence.
- `AGENTS.md` — modify only if Project Status or verification commands change.

## Token Contract

Colors (from `DESIGN.md` / prototype front matter):

- primary `#006948`, onPrimary `#ffffff`, primaryContainer `#00855d`
- secondary `#006398`, onSecondary `#ffffff`, secondaryContainer `#5bb8fe`
- tertiary `#006947`
- background `#faf8ff`, surface `#ffffff`, surfaceContainerLow `#f2f3ff`, surfaceContainer `#eaedff`, surfaceContainerHigh `#e2e7ff`, surfaceVariant `#dae2fd`
- text `#131b2e`, textVariant `#3d4a42`
- outline `#6d7a72`, outlineVariant `#bccac0`
- error `#ba1a1a`, onError `#ffffff`, errorContainer `#ffdad6`, onErrorContainer `#93000a`
- inputBorder `#cbd5e1`, placeholder `#94a3b8`
- chip extras from the prototype front matter: `primaryFixed #85f8c4`, `onPrimaryFixed #002114`, `secondaryFixed #cce5ff`, `onSecondaryFixed #001d31`, `secondaryFixedDim #93ccff`, `primaryFixedDim #68dba9`

Typography: `displayLg` 48/56/-0.02em, `displayLgMobile` 36/44/-0.02em, `headlineLg` 32/40/-0.015em, `headlineLgMobile` 26/34/-0.015em, `headlineMd` 24/32/-0.01em, `headlineSm` 20/28/-0.005em, `bodyLg` 16/26, `bodyLgMedium` 16/26, `bodyMd` 14/22, `bodyMdMedium` 14/22, `bodySm` 12/18, `labelLg` 13/18/0.02em, `labelMd` 11/16/0.04em, `labelSm` 10/14/0.05em.

Component states:

- Primary button: primary background, white label, 8px radius, 44px minimum height.
- AI button: secondary background, white label.
- Secondary button: white background, text color, 1px outline border.
- Disabled: `surfaceContainer` background, `outline` label, no press feedback, `accessibilityState.disabled`.
- Input: white background, 1px `inputBorder`, 8px radius; focus `primary` border plus emerald ring; error `error` border and error message.
- Card: white surface, 1px `outlineVariant`, 8px radius, Level 1 shadow.
- Chip: pill radius, JetBrains Mono `labelMd`.

## Visual Design Impact

- UI involved: yes.
- Design source: `DESIGN.md` and `docs/design/prototype/futsal_tactical_edge/DESIGN.md`.
- Screens or states affected: home placeholder, new gallery route, all primitive states.
- New design artifact required: no; the gallery itself is the verification artifact.

## Durable Documentation Impact

- `ARCHITECTURE.md`: not needed — the token/primitive layout is discoverable in `src/theme` and `src/components/ui`.
- `CONSTRAINTS.md`: not needed — no new durable rule; `AGENTS.md` already forbids inventing colors and fonts.
- `AGENTS.md`: update only Project Status to note the design system is implemented.
- Other docs: `PROGRESS.md` and `feature_list.json` evidence.

## Implementation Plan

1. Install the three Expo-compatible Google Font packages and confirm the lockfile updates.
2. Add the `src/theme` modules and font hook with the documented values.
3. Add the five primitives and barrel exports.
4. Gate the root layout on font loading.
5. Build the `/design-system` gallery with every token group and component state.
6. Rewrite the home placeholder with tokens and primitives, linking to the gallery.
7. Run `npm run verify` and `./init.sh`.
8. Verify the gallery on the Galaxy M13 in Expo Go, including a full reload.
9. Record evidence in `feature_list.json` and `PROGRESS.md`.

## Implementation Tasks

- [x] Install Google Font packages compatible with Expo SDK 58.
- [x] Add color, typography, spacing, radius, elevation, and font token modules.
- [x] Add `AppText`, `AppButton`, `Card`, `Chip`, and `AppInput` primitives.
- [x] Load fonts in the root layout and hold the splash until ready.
- [x] Add the `/design-system` gallery route with all required states.
- [x] Replace home placeholder hardcoded styles with tokens and primitives.
- [x] Run `npm run verify` and `./init.sh`.
- [x] Verify the gallery on the physical Android device.
- [x] Update `PROGRESS.md`, `feature_list.json`, and `AGENTS.md` status.

## Verification Plan

- `npm run verify` — ESLint, `tsc --noEmit`, `expo-doctor` pass.
- `./init.sh` — exit 0 and prints the start command.
- Static scan: `rg '#[0-9a-fA-F]{6}' src/components src/app` shows no hex values outside `src/theme` (except documentation text if any).
- Manual on device: open `/design-system`, confirm fonts, palette, type scale, spacing, radii, buttons, cards, chips, and input states against `DESIGN.md`; type into the focused input; trigger Fast Refresh and a full reload to confirm fonts reload cleanly.
- Gallery route is not covered by automated tests; no test harness exists yet, and this feature is static. The first feature with dynamic behavior must add focused coverage.

## Evidence To Capture

- `npm run verify` output and `./init.sh` output.
- Static hex scan result.
- Device screenshots or UI hierarchy dumps showing gallery sections and the home link.
- Confirmation of Fast Refresh and full reload with fonts loaded.
- Record results in `feature_list.json` evidence and `PROGRESS.md`.

## Validator Checklist

- [ ] Implementation stays within this feature's scope.
- [ ] Acceptance scenarios pass.
- [ ] Every color and font traces to `DESIGN.md` or the prototype front matter.
- [ ] No literal hex values in primitives or screens.
- [ ] Touch targets are at least 44px where interactive.
- [ ] Fonts load before first paint and no fallback font flashes.
- [ ] Verification evidence is present.
- [ ] `feature_list.json` and `PROGRESS.md` were updated correctly.
- [ ] No unrelated product behavior or extra feature work was added.
