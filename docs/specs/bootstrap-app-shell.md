# Feature Implementation Spec: Bootstrap a runnable app shell

## Source Feature

- `id`: `bootstrap-app-shell`
- `area`: `foundation`
- `depends_on`: none
- `status`: `not_started`
- `source`: `feature_list.json`

## Goal

Create the first runnable React Native application for Futsal Manager AI using Expo and Expo Router, with a single Spanish home route, documented install/verify/start commands, and a non-blocking verification gate. This is the technical bootstrap that every later feature builds on.

## Non-Goals

- Design system tokens, typography scale, or reusable UI primitives (`design-system-tokens`).
- Bottom navigation and the four MVP sections (`app-navigation-shell`).
- Exercise content, Board Data, tactics board, or any AI integration.
- Authentication, accounts, or team management (later phase).
- Web deployment or a web target.
- Adding `react-native-svg`; the board feature owns that dependency.

## Job Story

When I clone the repository for the first time,
I want one documented install, verification, and start path,
so I can run the app shell and begin feature work without guessing commands.

## Users And Permissions

- Developer/agent: can install dependencies, run the verification gate, and start the Expo dev server locally.
- Anonymous coach: not yet served by this feature beyond a placeholder home screen.

## Acceptance Scenarios

### Scenario 1: Fresh install succeeds

Given a clean checkout with Node 22 and npm available
When I run `npm install`
Then dependencies install without errors and a lockfile is created.

### Scenario 2: Home route renders

Given dependencies are installed
When I run `npm start` and open the app in Expo Go or a simulator
Then the home route renders a Spanish placeholder identifying Futsal Manager AI.

### Scenario 3: Verification gate passes

Given dependencies are installed
When I run `npm run verify`
Then ESLint, the TypeScript compiler, and `expo-doctor` all pass.

### Scenario 4: Standard startup path is honest and non-blocking

Given dependencies are installed
When I run `./init.sh`
Then it runs the verification gate, prints the start command, exits successfully, and does not start a long-running dev server.

### Scenario 5: Missing dependencies are reported

Given `node_modules` is absent
When I run `./init.sh`
Then it either installs dependencies or clearly instructs `npm install`, and does not fail silently.

## Repository Research

### Files Inspected

- `AGENTS.md` — operating rules; Project Status and Verification must change after bootstrap.
- `PROGRESS.md` — records current pre-bootstrap state; must be updated with real commands.
- `feature_list.json` — `bootstrap-app-shell` verification steps and dependencies.
- `docs/technical-discovery.md` — chosen stack: React Native + Expo, Expo Router, EAS Hosting for API routes.
- `init.sh` — current provisional script that only prints guidance.
- `DESIGN.md` — tokens exist, but visual implementation belongs to `design-system-tokens`.
- Repository root — no `package.json`, no app code, no lockfile, no `.gitignore`.

### Existing Patterns To Follow

- Expo Router file-based routing and TypeScript.
- Conventional commits and one branch per SDD phase (`AGENTS.md`).
- Keep `init.sh` as the single standard startup/verification path.
- Spanish UI copy; English code identifiers and docs.

### Current Gaps

- No Node project, framework, or dependency lockfile.
- No app route, no TypeScript config, no lint config, no `.gitignore`.
- `init.sh` is provisional and cannot verify anything yet.
- No tests or E2E harness exist; this feature does not create one.

## Technical Approach

Scaffold an Expo SDK 58 application with the default Expo Router + TypeScript template, then reduce it to the smallest shell:

- Keep `app/_layout.tsx` as a root stack and replace the template home with `app/index.tsx`.
- Remove example tabs/screens and demo content that are not part of the MVP.
- Add npm scripts: `start`, `android`, `ios`, `lint`, `typecheck`, and `verify` (`lint` + `typecheck` + `expo-doctor`).
- Add a `.gitignore` covering `node_modules`, `.expo`, `dist`, native build folders, and local env files.
- Update `init.sh` to run the non-blocking gate (`npm run verify`) when dependencies exist, install or instruct install when they do not, print the start command, and never start the dev server.
- Keep the home screen intentionally minimal and unstyled beyond platform defaults; `design-system-tokens` owns the visual system.

Use `npx expo-doctor` rather than adding it as a runtime dependency.

## Expected File Changes

- `package.json` — create; Expo app metadata, scripts, dependencies.
- `package-lock.json` — create; reproducible installs.
- `app.json` (or `app.config.ts`) — create; app name `Futsal Manager AI`, slug, orientation, icons.
- `tsconfig.json` — create; Expo TypeScript base.
- `eslint.config.js` — create; Expo lint config.
- `.gitignore` — create; ignore dependencies, Expo cache, builds, env files.
- `app/_layout.tsx` — create; root stack layout.
- `app/index.tsx` — create; Spanish home placeholder.
- `assets/*` — create; template icons/splash assets.
- `init.sh` — modify; real non-blocking gate and start guidance.
- `PROGRESS.md` — modify; verified state and session log.
- `feature_list.json` — modify; status and evidence for this feature.
- `AGENTS.md` — modify; Project Status and Verification reflect the bootstrapped app.

Paths are provisional only where the Expo template chooses a different filename (e.g. `app.config.ts` instead of `app.json`).

## Visual Design Impact

- UI involved: yes, but minimal.
- Design source: `DESIGN.md` (tokens only; full application deferred).
- Screens or states affected: home placeholder only.
- New design artifact required: no — `design-system-tokens` implements the visual system next.

## Durable Documentation Impact

- `ARCHITECTURE.md`: not needed — `docs/technical-discovery.md` already records the chosen stack and runtime surface; duplicating it would create drift.
- `CONSTRAINTS.md`: not needed — no new durable MUST/MUST NOT rule beyond `AGENTS.md`.
- `AGENTS.md`: update — Project Status moves from pre-bootstrap to bootstrapped; Verification lists the real commands.
- Other docs: `PROGRESS.md` and `docs/technical-discovery.md` — record real install/verify/start commands.

## Implementation Plan

1. Scaffold Expo Router + TypeScript in a temporary directory, then copy the minimal app into the repository without overwriting docs.
2. Reduce the template to a root layout and one Spanish home route; remove demo screens and unused assets.
3. Add scripts, lint/typecheck configuration, `.gitignore`, and the verification gate.
4. Update `init.sh`, `AGENTS.md`, `PROGRESS.md`, and `feature_list.json`.
5. Run install, verification, and a manual start smoke check.

## Implementation Tasks

- [x] Scaffold Expo SDK 58 app with Expo Router and TypeScript.
- [x] Replace template screens with `src/app/_layout.tsx` and `src/app/index.tsx`.
- [x] Add `start`, `android`, `ios`, `lint`, `typecheck`, and `verify` scripts.
- [x] Add `.gitignore` and ensure no generated files are committed.
- [x] Update `init.sh` to run the non-blocking verification gate and print the start command.
- [x] Run `npm install` and `npm run verify`.
- [x] Start the app once and confirm the home route renders.
- [x] Update `AGENTS.md`, `PROGRESS.md`, and `feature_list.json` with evidence.

## Verification Plan

- `npm install` from a clean checkout — succeeds and writes a lockfile.
- `npm run verify` — ESLint, `tsc --noEmit`, and `npx expo-doctor` pass.
- `./init.sh` — exits 0, runs the gate, prints `npm start`, and does not start the dev server.
- Manual smoke: `npm start`, open in Expo Go or a simulator, confirm the Spanish home placeholder.
- No persistent E2E command exists yet, and this feature only adds a static home route; unit/E2E coverage is not applicable. The next feature that adds user-visible flows must introduce focused coverage.

For `init.sh`:

- It must execute the non-blocking standard gate for the current repo state.
- It must not start long-running processes such as `npm start`.
- It may print manual follow-up commands after the gate passes.

## Evidence To Capture

- Output of `npm run verify` (lint, typecheck, expo-doctor).
- Output of `./init.sh`.
- Manual confirmation that the home route renders.
- Record results in `feature_list.json` evidence and `PROGRESS.md`.

## Validator Checklist

- [ ] Implementation stays within this feature's scope.
- [ ] Acceptance scenarios pass.
- [ ] Verification evidence is present.
- [ ] No persistent E2E coverage is expected yet; the spec explains why.
- [ ] `feature_list.json` and `PROGRESS.md` were updated correctly.
- [ ] No unrelated product behavior or extra feature work was added.
