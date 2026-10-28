# Feature Implementation Spec: Exercise detail screen

## Source Feature

- **id:** `exercise-detail-screen`
- **area:** `browse`
- **status:** `accepted` (independent validation verdict `accept`)
- **depends_on:** `content-model-and-store` (accepted), `design-system-tokens` (accepted), `seed-weekly-highlights` (accepted)
- **source:** `feature_list.json`
- **branch:** `feat/exercise-detail-screen` (stacked on `feat/explore-by-category-screen` @ `ff86167`, clean tree)
- **spec path:** `docs/specs/exercise-detail-screen.md`
- **reference:** `docs/design/prototype/03-exercise-detail-board/code.html` (breadcrumb `Volver a Explorar`, title + chips, metadata, `Paso a Paso del Ejercicio` with `3 FASES TÁCTICAS`, `Consignas para el Entrenador`), `DESIGN.md` Core Screens item 3
- **baseline (verified in this planning run):** `./init.sh` exit 0, **378 tests / 255 suites**, `expo-doctor` 20/20; `contentVersion`/`CONTENT_PACKAGE_VERSION` `1.2.0` (71 exercises: 50 `library` + 21 `weekly`, 7 Programming), `infantil-u14-base` `1.1.0`, Board Data `1.0.0`.
- **size check:** correctly sized. One root route, one screen, two pure modules (details model + href), one reusable card link, two card edits, tests, docs. No new module, layer, port, content field, version, token or dependency. No split needed.

## Goal

A coach can open any exercise — from a library card or a weekly-highlight card — into a full-screen detail page that shows the drill's objective, category, session part, duration, players, space, intensity, work structure, constraints, coaching cues, and its ordered tactical phases as text, plus the `Inspirado en` citation (label + public URL) when the exercise was inspired by an external resource, with the pinned disclaimer that the exercise is original Futsal Manager AI content.

**Job story:** when a drill catches my eye while I am browsing, I want to read it in full — objective, load, space, coach cues and the phase-by-phase explanation — so I can decide whether to run it this week without leaving the app or guessing how it is organised.

The `references` field only exists on the 21 `weekly` records, so the detail entry **must** exist on weekly cards too; otherwise `Inspirado en` would be unreachable.

## Non-Goals

- No pitch, SVG, token, cone, arrow, phase animation or playback, and no board placeholder of any kind (`tactics-board-renderer`, `board-phase-playback` own them). `boardData` phases are read as **text only**.
- No board preview thumbnail (`exercise-preview-board-thumbnail`).
- No AI, variant adapter, quota, network request or `ai` module import.
- No content, package, parser, read-layer, provenance, version or seed change: `contentVersion` `1.2.0`, `infantil-u14-base` `1.1.0`, Board Data `1.0.0` stay.
- No `Abrir en Pizarra` on weekly cards; the library action is kept exactly as accepted and the weekly cards stay board-free.
- No new `shared/ui` primitive, colour, font, shadow, spacing or radius token; no `src/shared/**`, `package.json`, `eslint.config.js`, `init.sh` or `app.json` change.
- No new module, layer, port, cross-module import or allowed-dependency change.
- No persistence, favourites, share sheet, "Animar Jugada", AI variant CTA or analytics (all prototype-only).
- No React Native Testing Library or E2E harness; `node:test` plus the device smoke remain the agreed coverage level.

## Acceptance Scenarios

### Scenario 1: A library card opens the detail route

Given a selected category on Explorar and the bundled repository
When the coach taps a library card's `Ver detalle` area (title, summary, meta, or the label itself)
Then the root-stack route `/ejercicios/[exerciseId]` opens with that exercise id, above the tabs (no tab bar), and the screen shows the exercise title, summary and every metadata field
And the card still renders exactly one unchanged `Abrir en Pizarra` action, which keeps opening `/pizarra?exerciseId=<id>`.

### Scenario 2: A weekly card opens the detail route and the citation is reachable

Given a selected category with its three weekly highlights
When the coach taps a weekly card's `Ver detalle` area
Then the detail route opens for that weekly exercise and `Inspirado en` shows the citation label and URL (e.g. `Activación con pases y nombres` → `Adri Martín Futsal`, `https://adrimartinofutsal.es.tl/`) followed by the disclaimer
And the weekly card exposes no board action.

### Scenario 3: Every metadata field is rendered (feature_list #1)

Given `salida-3-1-presion-alta` from the bundled package
When the detail screen renders
Then the `Ficha del ejercicio` card shows exactly these rows in this order — `Categoría` `Infantil (U14) · Cadete (U16)`, `Tramo` `Parte general`, `Duración` `15 min`, `Jugadores` `10 jugadores · 2 porteros`, `Espacio` `Pista completa · 20 × 40 m`, `Intensidad` `Alta · 85%`, `Estructura` `Bloques de 3 minutos x 4 series`
And the header card shows one category chip per category, a session-part chip, the title, the summary and `Objetivo` with the exercise's objective verbatim.

### Scenario 4: Cues and phases render in order (feature_list #2)

Given an exercise whose `boardData.phases` array is not in `order` sequence
When the model and screen render `Paso a paso`
Then phases are sorted by `order` ascending (never array position), each phase shows its number, title and explanation in that order, settings/positions/ball/arrows/labels are never rendered, and the counter reads `N fases tácticas` (`1 fase táctica` when there is exactly one)
And `Consignas para el entrenador` lists the exercise's coaching cues in package order, one bullet each.

### Scenario 5: A missing optional field does not break the screen (feature_list #3)

Given an exercise with `intensity.percent` absent, `players.goalkeepers` `0`, no `references`, no `provenance.attribution`, and empty `constraints`/`coachingCues`
When the detail screen renders
Then `Intensidad` reads `Baja` (no trailing `· %`), `Jugadores` reads `8 jugadores`, `Restricciones` and `Consignas para el entrenador` are omitted entirely, `Inspirado en` is omitted and `Atribución` is omitted — no empty card, no placeholder, no `undefined`, no crash.

### Scenario 6: References show label, URL and disclaimer (feature_list #4)

Given a weekly exercise with one `references` entry
When the detail screen renders `Inspirado en`
Then the card shows the label, the URL as an accessible link, and the pinned disclaimer `Ejercicio original de Futsal Manager AI. La fuente se cita únicamente como inspiración.`
And tapping the link calls `Linking.openURL(url)`; a rejected promise is swallowed so no unhandled-rejection warning appears.

### Scenario 7: An owned exercise shows no empty source block (feature_list #4)

Given an owned library exercise without `references` and without `provenance.attribution`
When the detail screen renders
Then neither `Inspirado en` nor `Atribución` appears anywhere in the page, and no source heading is rendered with empty content.
And when `provenance.attribution` is present, `Atribución` shows the attribution string verbatim (no paraphrasing, no invented permission claim).

### Scenario 8: Unknown, empty, or unpublished ids fall back safely

Given `/ejercicios/no-existe`, `/ejercicios/` with no id, an unpublished or unlicensed id, or a cold deep link
When the route resolves the parameter
Then `getExercise` returns `null` and the screen renders `Ejercicio no encontrado` with its explanatory copy and a `Volver a Explorar` action — no throw, no fetch, no empty metadata card.

### Scenario 9: Back returns to Explorar with the category preserved

Given the detail screen opened from a category with a selected category
When the coach taps `Volver a Explorar` (or uses Android back)
Then `router.canGoBack()` is true and `router.back()` returns to Explorar with the same category selected, its methodology, weekly block and library intact
And on a cold deep link where `canGoBack()` is false, `router.replace('/')` opens Explorar instead of leaving an empty stack.

### Scenario 10: Accessibility and narrow-width reflow

Given `SM-M135F` at 320 dp width and `font_scale 1.3`
When the detail screen renders
Then the card `Ver detalle` target and `Volver a Explorar` are each at least 44 dp tall, the reference link is at least 44 dp tall, labels/values wrap without clipping or overlap (fact rows stack the label above the value), and `wm size reset`, `wm density reset` and `font_scale 1.0` are restored afterwards.

### Scenario 11: No forbidden change

Given the finished feature
When the diff and the gate run
Then only `content/presentation` (screen, components, view models), `content/index.ts`, `src/app/ejercicios/[exerciseId].tsx`, `src/app/_layout.tsx`, new tests and the named docs changed; no content/package/domain/application/infrastructure, `src/shared/**`, `src/modules/{board,ai,club}/**`, `package.json`, `eslint.config.js`, `init.sh` or `app.json` change; `content/presentation` imports no `@/modules/board`, draws no SVG/pitch, and contains no literal hex colour, `fetch(`, or `content/infrastructure` import.

## Contracts

### Detail model (pure, presentation)

```ts
// src/modules/content/presentation/view-models/exercise-detail-model.ts
export type ExerciseDetailPhase = { order: number; title: string; explanation: string };
export type ExerciseDetailRow = { label: string; value: string };

export type ExerciseDetailModel = {
  title: string;
  summary: string;
  objective: string;
  categoryLabels: string[];      // getCategoryById + formatCategoryLabel, categoryIds order
  sessionPartLabel: string;      // formatSessionPartLabel
  facts: ExerciseDetailRow[];    // exactly 7 rows, fixed order
  constraints: ExerciseConstraint[];   // verbatim copy, may be []
  coachingCues: string[];              // verbatim copy, may be []
  phases: ExerciseDetailPhase[]; // sorted by order asc, text-only fields
  phaseCountLabel: string;
  references: ExerciseReference[];     // [] when absent
  attribution: string | null;          // provenance.attribution ?? null
};

export function buildExerciseDetailModel(exercise: Exercise): ExerciseDetailModel;
```

Pinned rules:

- `facts` labels in order: `Categoría`, `Tramo`, `Duración`, `Jugadores`, `Espacio`, `Intensidad`, `Estructura`. `Categoría` joins resolved labels with ` · ` (unknown ids skipped; `Sin categoría` if none resolve).
- `Duración` = `` `${durationMinutes} min` ``.
- `Jugadores` = `` `${total} jugador` / `${total} jugadores` ``, plus ` · ${n} portero` / ` · ${n} porteros` only when `goalkeepers > 0`; `goalkeepers === 0` renders no suffix.
- `Espacio` = `` `${label} · ${widthM} × ${lengthM} m` `` (U+00D7 multiplication sign, `m` once at the end).
- `Intensidad` = `Baja` | `Media` | `Alta`, plus ` · ${percent}%` only when `percent` is a number (including `0`).
- `Estructura` = `workStructure` verbatim; `Objetivo` = `objective` verbatim.
- `phases` = `[...boardData.phases].sort((a, b) => a.order - b.order)` mapped to `{ order, title, explanation }` only — `positions`, `ball`, `arrows` and `labels` never leave the model.
- `phaseCountLabel` = `1 fase táctica` or `${count} fases tácticas`.
- `references` = `[...(exercise.references ?? [])]`; `attribution` = `exercise.provenance.attribution ?? null`.
- The model never mutates its input and returns fresh arrays (mutating the model must not affect the `Exercise`).
- `buildExerciseDetailModel` is the only place that formats detail copy; the screen renders `model.*` and never re-derives values.

### Detail href (pure, presentation)

```ts
// src/modules/content/presentation/view-models/exercise-detail-routing.ts
export type ExerciseDetailHref = {
  pathname: '/ejercicios/[exerciseId]';
  params: { exerciseId: string };
};

export function buildExerciseDetailHref(exerciseId: string): ExerciseDetailHref;
```

- Literal `pathname: '/ejercicios/[exerciseId]'` is required by `experiments.typedRoutes`; widening it to `string` breaks `Link href` under `tsc`.
- The **raw** id goes in `params.exerciseId`: no `encodeURIComponent`, no baked query string — expo-router encodes once.

### Reusable card link

```tsx
// src/modules/content/presentation/components/exercise-detail-link.tsx
type ExerciseDetailLinkProps = {
  exerciseId: string;
  title: string;
  children: ReactNode; // card title / summary / meta
};

<Link href={buildExerciseDetailHref(exerciseId)} asChild>
  <Pressable
    accessibilityRole="link"
    accessibilityLabel={`Ver detalle de ${title}`}
    accessibilityHint="Abre la ficha completa de este ejercicio"
    style={styles.pressable}   // minHeight: 44, gap: spacing.sm, width: '100%'
  >
    {children}
    <AppText variant="labelMd" color="primary">Ver detalle</AppText>
  </Pressable>
</Link>
```

### Route and screen contract

```tsx
// src/app/ejercicios/[exerciseId].tsx
import { useLocalSearchParams } from 'expo-router';
import { ExerciseDetailScreen, createBundledContentRepository, getExercise } from '@/modules/content';

const repository = createBundledContentRepository();

export default function ExerciseDetailRoute() {
  const params = useLocalSearchParams<{ exerciseId?: string | string[] }>();
  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
  const exercise = exerciseId ? getExercise(repository, exerciseId) : null;

  return <ExerciseDetailScreen exercise={exercise} />;
}

// src/app/_layout.tsx — inside the existing <Stack screenOptions={{ headerShown: false }}>
<Stack.Screen name="(tabs)" />
<Stack.Screen name="ejercicios/[exerciseId]" />
<Stack.Screen name="design-system" />
```

```tsx
// src/modules/content/presentation/screens/exercise-detail-screen.tsx
export function ExerciseDetailScreen({ exercise }: { exercise: Exercise | null });
```

- `exercise` is the publishable-only result of `getExercise`; the screen performs no lookup, no filtering, and no fetching.
- Screen composition, in this order: top bar (`Volver a Explorar` + `Detalle de ejercicio`) → header `Card` (category chips, session-part chip, title with `accessibilityRole="header"`, summary, `Objetivo`) → `Ficha del ejercicio` → `Restricciones` → `Paso a paso` → `Consignas para el entrenador` → `Inspirado en` → `Atribución`.
- Back control: `useRouter()`, `router.canGoBack() ? router.back() : router.replace('/')`, `accessibilityRole="link"`, `accessibilityLabel="Volver a Explorar"`, `accessibilityHint="Vuelve a la pantalla de Explorar"`, `minHeight: 44`.
- Conditional sections render **only** behind `model.constraints.length > 0`, `model.coachingCues.length > 0`, `model.references.length > 0`, and `model.attribution !== null`. No empty cards.
- Reference rows: `Pressable` (`accessibilityRole="link"`, `accessibilityLabel={`Abrir ${reference.label}`}`, `minHeight: 44`) calling `Linking.openURL(reference.url).catch(() => {})`, label in `bodyLgMedium`, URL in `labelMd`/`secondary`; disclaimer `Ejercicio original de Futsal Manager AI. La fuente se cita únicamente como inspiración.` is always the last element of the card.
- Not-found state: `Ejercicio no encontrado` (`headlineSm`, header role) + `Este ejercicio no está disponible. Puede que todavía no esté publicado o que el enlace ya no exista.` + `Link href="/" asChild` wrapping `AppButton label="Volver a Explorar" variant="secondary" fullWidth`.
- Layout: `SafeAreaView edges={['top']}` + `ScrollView` with `paddingHorizontal: spacing.lg`, `paddingBottom: spacing['2xl']`, `gap: spacing.lg`; fact rows stack label (`labelMd`, `textVariant`) above value (`bodyLg`) with a hairline separator using `colors.surfaceContainer`.
- Typography: long-form copy uses `bodyLg` (16 px) to respect DESIGN's body minimum; `bodyMd`/`bodySm` only for short meta and the disclaimer. Tokens only, no literal colour.

### Public API additions (`src/modules/content/index.ts`)

`ExerciseDetailScreen`, `buildExerciseDetailModel`, `buildExerciseDetailHref`, and the types `ExerciseDetailModel`, `ExerciseDetailPhase`, `ExerciseDetailRow`, `ExerciseDetailHref`. `ExerciseDetailLink` stays internal to `content/presentation` (both card components live there).

## Expected Files By Module And Layer

| Module | Layer | File | Change |
| --- | --- | --- | --- |
| `content` | presentation / view models | `presentation/view-models/exercise-detail-model.ts` | **new** model + formatters |
| `content` | presentation / view models | `presentation/view-models/exercise-detail-routing.ts` | **new** `ExerciseDetailHref`, `buildExerciseDetailHref` |
| `content` | presentation / components | `presentation/components/exercise-detail-link.tsx` | **new** `ExerciseDetailLink` |
| `content` | presentation / components | `presentation/components/exercise-library-list.tsx` | wrap title/summary/meta in one `ExerciseDetailLink`; keep the board action unchanged |
| `content` | presentation / components | `presentation/components/weekly-exercises.tsx` | wrap title/summary/meta in one `ExerciseDetailLink`; chip stays outside; still no board action |
| `content` | presentation / screens | `presentation/screens/exercise-detail-screen.tsx` | **new** screen with not-found state |
| `content` | public API | `index.ts` | export screen, builders and detail types |
| `app` | composition root | `src/app/ejercicios/[exerciseId].tsx` | **new** thin route (`useLocalSearchParams` → `getExercise` → `ExerciseDetailScreen`) |
| `app` | composition root | `src/app/_layout.tsx` | register `<Stack.Screen name="ejercicios/[exerciseId]" />` |
| tests | content | `tests/modules/content/presentation/view-models/{exercise-detail-model,exercise-detail-routing}.test.ts` | **new** |
| tests | content | `tests/modules/content/presentation/components/{exercise-detail-link,weekly-exercises}.test.ts` | **new** |
| tests | content | `tests/modules/content/presentation/components/exercise-library-list.test.ts` | extend (+3 tests) |
| tests | content | `tests/modules/content/presentation/screens/exercise-detail-screen.test.ts` | **new** source-structure guard |
| tests | content | `tests/modules/content/presentation/exercise-detail-wiring.test.ts` | **new** route + layout guard |
| tests | content | `tests/modules/content/index.test.ts`, `presentation/screens/explore-general-screen.test.ts` | extend export list / forbidden-scan source list only (counts unchanged) |

Explicitly unchanged: content `domain`/`application`/`infrastructure`, `content-package.json`, `ExploreScreen`, `ExploreHero`, `CategoryFilterBar`, `MethodologyOverviewCard`, `AiSessionEntryCard`, `state/**`, `category-browse-model.ts`, `explore-general-model.ts`, `board-routing.ts`, `src/shared/**`, `src/modules/{board,ai,club}/**`, `src/app/(tabs)/**`, `package.json`, `eslint.config.js`, `app.json`, `init.sh`, `DESIGN.md`, `CONTEXT.md`, `docs/domain-model.md`, `docs/board-data-schema.md`.

## Test Plan (exact counts)

Baseline **378 tests / 255 suites**. Target **417 tests / 305 suites** (+39 tests, +50 suites, 0 fail). Tests are fixed at 417; suites are `node:test` `describe` blocks, so 305 is the planned estimate from Given/When/Then nesting — record the actual suite count and keep the same 39 cases (precedent: the accepted `explore-by-category-screen` planned 246 and shipped 255 for the same 20 cases).

| File | Tests | Suites |
| --- | --- | --- |
| `presentation/view-models/exercise-detail-model.test.ts` (**new**) | 12 | 16 |
| `presentation/view-models/exercise-detail-routing.test.ts` (**new**) | 3 | 4 |
| `presentation/components/exercise-detail-link.test.ts` (**new**) | 5 | 6 |
| `presentation/components/exercise-library-list.test.ts` (extended) | 7 (was 4) | 10 (was 6) |
| `presentation/components/weekly-exercises.test.ts` (**new**) | 4 | 5 |
| `presentation/screens/exercise-detail-screen.test.ts` (**new**) | 8 | 10 |
| `presentation/exercise-detail-wiring.test.ts` (**new**) | 4 | 5 |
| `tests/modules/content/index.test.ts` (list only) | 1 (unchanged) | 3 (unchanged) |
| `presentation/screens/explore-general-screen.test.ts` (list only) | 13 (unchanged) | 9 (unchanged) |

`tests/architecture/{architecture,boundaries}.test.ts` must pass **unedited** (no new module, layer or dependency).

### Given / When / Then cases

`exercise-detail-model.test.ts` (pure; bundled repository for real records, synthetic fixtures for missing fields)

1. Given `salida-3-1-presion-alta` / When the model is built / Then `facts` labels are exactly `['Categoría','Tramo','Duración','Jugadores','Espacio','Intensidad','Estructura']`.
2. Given the same exercise / When the model is built / Then the seven fact values are `Infantil (U14) · Cadete (U16)`, `Parte general`, `15 min`, `10 jugadores · 2 porteros`, `Pista completa · 20 × 40 m`, `Alta · 85%`, `Bloques de 3 minutos x 4 series`.
3. Given the same exercise / When title, summary, objective and categories are read / Then they are verbatim and `categoryLabels` keeps `categoryIds` order.
4. Given the same exercise / When constraints and cues are read / Then each `{ rule, detail }` and each cue is verbatim in package order.
5. Given the same exercise / When phases are read / Then they are `[1, 2, 3]` in `order`, and each entry has exactly the keys `order`, `title`, `explanation` (no positions, ball, arrows, labels).
6. Given a synthetic exercise whose `boardData.phases` array is `[order 3, order 1, order 2]` / When the model is built / Then the phases are `[1, 2, 3]` and titles follow `order`, not array position.
7. Given 0, 1 and 3 phases / When `phaseCountLabel` is read / Then it is `0 fases tácticas`, `1 fase táctica`, `3 fases tácticas`.
8. Given the bundled weekly `activacion-pases-y-nombres` / When the model is built / Then `references` is exactly `[{ label: 'Adri Martín Futsal', url: 'https://adrimartinofutsal.es.tl/' }]` and `attribution` is `null`.
9. Given a bundled library exercise with no citations / When the model is built / Then `references` deep-equals `[]` and `attribution` is `null`.
10. Given a synthetic exercise with `intensity: { level: 'low' }` (no `percent`), `players { total: 8, goalkeepers: 0 }`, no `references`, empty `constraints`/`coachingCues` / When the model is built / Then `Intensidad` is `Baja`, `Jugadores` is `8 jugadores`, `references` is `[]`, and both lists are `[]` without throwing.
11. Given a synthetic exercise with `provenance.attribution` / When the model is built / Then `attribution` is that string verbatim and `references` is still `[]`.
12. Given a built model / When the input exercise is compared and the model arrays are mutated / Then the `Exercise` is unchanged (no shared array references, no mutation).

`exercise-detail-routing.test.ts`

1. Given an id / When `buildExerciseDetailHref` runs / Then it deep-equals `{ pathname: '/ejercicios/[exerciseId]', params: { exerciseId: id } }`.
2. Given `rondo 4v1/orientación` / When the param is encoded and decoded / Then no `%` was added by the helper and the id round-trips.
3. Given any id / When the href is inspected / Then `pathname` is the exact literal (no trailing slash, no `?`, no `&`).

`exercise-detail-link.test.ts` (source-structure guard)

1. It renders one `<Link href={buildExerciseDetailHref(exerciseId)} asChild>` around a `Pressable`.
2. The `Pressable` carries `accessibilityRole="link"`, `` accessibilityLabel={`Ver detalle de ${title}`} `` and `accessibilityHint="Abre la ficha completa de este ejercicio"`.
3. `Ver detalle` is rendered after `{children}`.
4. The style pins `minHeight: 44` and `gap: spacing.sm`.
5. It contains no `Abrir en Pizarra`, no `buildBoardHref`, no literal hex colour and no `content/infrastructure` import.

`exercise-library-list.test.ts` (+3 tests)

5. Each card renders exactly one `<ExerciseDetailLink` wrapping title, summary and `formatExerciseMeta(exercise)`, placed before `Abrir en Pizarra`.
6. The accepted board action is unchanged: one `Link href={buildBoardHref(exercise.id)} asChild` + `AppButton label="Abrir en Pizarra" variant="secondary" fullWidth`, exercise-specific label, pinned hint, `minHeight: spacing.xl + spacing.md`.
7. Headings, counts, empty-state copy and the weekly source scan (no `Abrir en Pizarra`, no `buildBoardHref`) are unchanged.

`weekly-exercises.test.ts` (new)

1. Each weekly card renders exactly one `<ExerciseDetailLink` around title, summary and `formatExerciseMeta(exercise)`.
2. The session-part `<Chip` stays outside the pressable (source index of `<Chip` precedes `<ExerciseDetailLink`).
3. The file contains no `Abrir en Pizarra`, no `buildBoardHref` and no board `Link` — weekly stays board-free.
4. Pinned copy survives: `Ejercicios de la Semana`, `Una selección fuera de la biblioteca`, `formatWeeklySelection(exercises.length)`, the empty state, and `numberOfLines={2}` on title and summary.

`exercise-detail-screen.test.ts` (source-structure guard)

1. Section order is top bar → header card (`Objetivo`) → `Ficha del ejercicio` → `Restricciones` → `Paso a paso` → `Consignas para el entrenador` → `Inspirado en` → `Atribución`.
2. The seven fact rows render from `model.facts.map` (no re-derivation, no duplicated formatter call in the screen).
3. Each conditional section sits behind its non-empty guard (`constraints.length > 0`, `coachingCues.length > 0`, `references.length > 0`, `model.attribution`), so an owned exercise without citations renders no source block.
4. Phases render `{phase.order}`, `{phase.title}`, `{phase.explanation}` in model order, with no positions/ball/arrows/labels.
5. The reference row calls `Linking.openURL(reference.url).catch(() => {})`, is an accessible link with a 44 dp target, and the pinned disclaimer string is present.
6. Back uses `router.canGoBack()`, `router.back()` and `router.replace('/')` with `minHeight: 44` and the pinned accessibility copy.
7. The not-found branch pins `Ejercicio no encontrado`, the explanatory sentence and the `Volver a Explorar` action.
8. No board/SVG/pitch/phases geometry (`@/modules/board`, `react-native-svg`, `Svg`, `pitch`, `boardData`), no `@/modules/ai`, no `fetch(`, no literal hex colour, no `content/infrastructure` import.

`exercise-detail-wiring.test.ts` (composition-root guard)

1. `src/app/ejercicios/[exerciseId].tsx` uses `useLocalSearchParams<{ exerciseId?: string | string[] }>()`, normalizes the array case, and resolves with `getExercise(repository, exerciseId)`.
2. It renders `<ExerciseDetailScreen exercise={exercise} />` and passes `null` when the id is missing.
3. It imports only `@/modules/content` (public API), creates the repository with `createBundledContentRepository()`, and contains no `fetch(`, no `.json` import and no module-internal path.
4. `src/app/_layout.tsx` registers `<Stack.Screen name="ejercicios/[exerciseId]" />` inside the existing root `Stack`.

### Existing suites

`index.test.ts`: add `ExerciseDetailScreen`, `buildExerciseDetailModel`, `buildExerciseDetailHref`, `ExerciseDetailModel`, `ExerciseDetailPhase`, `ExerciseDetailRow`, `ExerciseDetailHref` to `requiredPublicApiExports` (same single test). `explore-general-screen.test.ts`: add `exercise-detail-screen.tsx`, `exercise-detail-link.tsx`, `exercise-detail-model.ts` and `exercise-detail-routing.ts` to `newOrChangedSources` (same 13 tests). If a suite is nested differently, **417 tests** is fixed; record the actual suite count.

## Verification Plan

1. `npm test` → **417/417 tests, 0 fail**; record the actual suite count and the per-file counts above; confirm the edited files changed in count only as specified and untouched suites were not edited.
2. `npm run lint` → exit 0 (no deep imports, no cross-module import; presentation may import `react-native`, `expo-router`).
3. `npm run typecheck` → exit 0 (proves the typed-route literals `/ejercicios/[exerciseId]` and the `ExerciseDetailScreen` prop type). Regenerate `.expo/types` first (`npx expo export --platform android` or a Metro start) so the new route exists in the generated route union.
4. `npm run verify` → exit 0 with `expo-doctor` 20/20.
5. `./init.sh` → exit 0 and starts no Metro.
6. Forbidden-scope scans: `rg 'Ver detalle' src` hits only `exercise-detail-link.tsx`; `rg '@/modules/board|react-native-svg|fetch\(' src/modules/content/presentation` empty; `rg '#[0-9a-fA-F]{3,8}\b' src/modules/content/presentation` empty; `rg 'boardData' src/modules/content/presentation/screens/exercise-detail-screen.tsx` empty; `rg 'Abrir en Pizarra' src` hits only `exercise-library-list.tsx`; `git diff --stat` limited to the expected files; versions `contentVersion` `1.2.0`, `infantil-u14-base` `1.1.0`, Board Data `1.0.0`.
7. `npx expo export --platform android` → exit 0; record bundle size; scan for `Ver detalle`, `Inspirado en`, `Detalle de ejercicio`, `Ejercicio no encontrado`, `Ejercicio original de Futsal Manager AI. La fuente se cita únicamente como inspiración.` and `Paso a paso` (UTF-8 and UTF-16LE; macOS `strings` is not UTF-16 aware).
8. `SM-M135F` smoke (Galaxy M13, Android 14, 450 dpi, Expo Go 58.0.5, `adb reverse tcp:8081 tcp:8081`; a Metro instance may already run on 8081):
   - Explorar → Infantil U14 → tap `Ver detalle` on a library card: the route opens above the tabs (no tab bar) and shows `Detalle de ejercicio`, the title, `Objetivo`, all seven `Ficha del ejercicio` rows, `Restricciones`, `Paso a paso` with the phase counter/titles/explanations in order, and `Consignas para el entrenador`; no source block.
   - `Volver a Explorar` returns with Infantil still selected (methodology, weekly block, library intact); Android back behaves the same.
   - Prebenjamín → weekly card detail shows `Inspirado en` with the label and URL plus the disclaimer; tapping the URL opens the browser (if the device has a reachable browser; otherwise record that it was verified by source test and the model test).
   - Deep link `exp://127.0.0.1:8081/--/ejercicios/no-existe` shows `Ejercicio no encontrado`, no throw.
   - Confirm the library card still opens Pizarra and weekly cards still have no board action.
   - Measure `Ver detalle` and `Volver a Explorar` bounds (≥44 dp); check 320 dp (`wm size 900x1800`) at `font_scale 1.3`, then restore `wm size reset`, `wm density reset`, `font_scale 1.0`.
   - `adb logcat -d -t 800 | grep -iE 'ReactNativeJS.*(error|exception)|FATAL EXCEPTION'` → no lines.

## Evidence To Capture

- Test totals before/after, per-file counts, actual suite count, and confirmation that untouched suites and `tests/architecture/*` were not edited.
- `uiautomator` dumps for: library detail (full metadata + ordered phases + cues), weekly detail with `Inspirado en` + disclaimer, not-found deep link, and the Explorar return with the category preserved.
- `git diff --stat` proving scope, plus explicit statements that versions, `src/shared/**`, `src/modules/{board,ai,club}/**`, `package.json`, `eslint.config.js`, `app.json` and `init.sh` are untouched.
- Bundle size and string-scan result; clean `logcat`; restored device size/density/font scale.
- Explicit statement on whether the URL tap opened a browser on device, or that it is covered by the source/model tests only.

## Durable Documentation Impact

| Document | Action | Reason |
| --- | --- | --- |
| `ARCHITECTURE.md` | update | Directory map gains `src/app/ejercicios/[exerciseId].tsx`; content presentation gains the detail screen, the detail model/routing view models and the reusable card link; composition root and a new "Open an exercise" data flow (`useLocalSearchParams` → `getExercise` → `ExerciseDetailScreen`); phases are rendered as text only. Dependency table unchanged. |
| `src/modules/content/README.md` | update | Active presentation list, new files, public API additions, card entry links, detail flow, tests. |
| `AGENTS.md` | update | Project Status: library **and** weekly cards open the detail route; the detail screen renders metadata, ordered phase text and the `Inspirado en` citation; still no board rendering. |
| `PROGRESS.md` | update | Current verified state, branch/compare URL, session log, next feature (`tactics-board-renderer`). |
| `feature_list.json` | update | `exercise-detail-screen` → `passing`, then `accepted` with evidence; notes refreshed. |
| `docs/specs/exercise-detail-screen.md` | update | Check off tasks; append implementation evidence. |
| `docs/content-model.md` | update | Delete the stale "no screen displays `attribution` or `references` yet" and "exercise detail … remain separate features" statements (Known Gaps) and the "Attribution display belongs to `exercise-detail-screen`" future tense; state that the detail screen renders `references` under `Inspirado en` and `provenance.attribution` under `Atribución` when present. |
| `docs/content-licensing.md` | update | Attribution display and citation display are shipped on the detail screen (replace the "not implemented yet"/"displayed later" lines); keep the rule that a citation is inspiration, not provenance and not a licence. |
| `docs/risks-and-open-questions.md` | update | Close the "Citation display obligation" entry as shipped; keep the CMD Mora written-permission gap open. |
| `DESIGN.md` | not needed | No token, type, colour or layout direction change; existing prototype direction already covers the detail screen. |
| `CONTEXT.md`, `docs/domain-model.md` | not needed | No new domain term or entity; `Exercise`, `Category`, `SessionPart`, `Exercise.references`, `ContentProvenance.attribution` already exist. |
| `docs/board-data-schema.md`, `src/modules/board/README.md` | not needed | Board Data is consumed as text only; no renderer, contract or board-copy change. |
| `CONSTRAINTS.md` | not applicable | File does not exist. |
| `init.sh` | not needed | Verification path unchanged; it must keep running non-blocking checks and never start Metro. |

## Implementation Tasks

- [x] 1. Add `presentation/view-models/exercise-detail-model.ts` (model type, `buildExerciseDetailModel`, the five pinned formatters) with sorting, optional-field defaults and no mutation.
- [x] 2. Add `presentation/view-models/exercise-detail-routing.ts` (`ExerciseDetailHref`, `buildExerciseDetailHref`) with the literal pathname and raw id.
- [x] 3. Add `presentation/components/exercise-detail-link.tsx` (`Link asChild` + `Pressable`, `Ver detalle`, accessible label/hint, 44 dp).
- [x] 4. Wrap title/summary/meta in `ExerciseDetailLink` in `exercise-library-list.tsx` and `weekly-exercises.tsx`; keep the library board action, chip placement, `numberOfLines`, headings, counts and empty states unchanged.
- [x] 5. Add `presentation/screens/exercise-detail-screen.tsx` with the pinned composition, conditional sections, `Linking.openURL` + disclaimer, back behavior and the `Ejercicio no encontrado` state.
- [x] 6. Export `ExerciseDetailScreen`, `buildExerciseDetailModel`, `buildExerciseDetailHref` and the four detail types from `content/index.ts`.
- [x] 7. Add `src/app/ejercicios/[exerciseId].tsx` as a thin composition root and register `<Stack.Screen name="ejercicios/[exerciseId]" />` in `src/app/_layout.tsx`.
- [x] 8. Add the six new test files and extend `exercise-library-list.test.ts`, `index.test.ts` and `explore-general-screen.test.ts` per the Test Plan; confirm 417 tests pass.
- [x] 9. Run `npm test`, `npm run lint`, `npm run typecheck` (after regenerating typed routes), `npm run verify`, `./init.sh`, the scans and the Android export; record exact numbers.
- [x] 10. Run the `SM-M135F` smoke (library detail, weekly detail + `Inspirado en`, URL tap, back with category preserved, unknown deep link, board actions unchanged, 320 dp/1.3, bounds, restored device, `logcat`).
- [x] 11. Update `ARCHITECTURE.md`, `src/modules/content/README.md`, `AGENTS.md`, `PROGRESS.md`, `feature_list.json`, `docs/content-model.md`, `docs/content-licensing.md`, `docs/risks-and-open-questions.md`, and check off these tasks.

## Implementation Evidence

Recorded by the implementer on `2026-10-28` on branch `feat/exercise-detail-screen` (stacked on `ff86167`); no commit was created.

### Source shipped

- `src/modules/content/presentation/view-models/exercise-detail-model.ts`: `buildExerciseDetailModel` with the seven pinned facts in order, `Categoría` joined with ` · ` (`Sin categoría` fallback), `Jugadores` singular/plural plus conditional keeper suffix, `Espacio` `20 × 40 m`, `Intensidad` with ` · ${percent}%` only when a number, `Estructura`/`Objetivo` verbatim, phases copied and sorted by `order` into `{ order, title, explanation }`, `1 fase táctica` / `N fases tácticas`, `references` defaulting to `[]`, `attribution ?? null`, and fresh arrays with no input mutation.
- `src/modules/content/presentation/view-models/exercise-detail-routing.ts`: `buildExerciseDetailHref` with the literal `'/ejercicios/[exerciseId]'` pathname and the raw id in `params`.
- `src/modules/content/presentation/components/exercise-detail-link.tsx`: `Link asChild` + accessible `Pressable` (`accessibilityRole="link"`, `Ver detalle de ${title}`, pinned hint, `minHeight: 44`); both cards use it as a sibling of the board action / chip.
- `src/modules/content/presentation/screens/exercise-detail-screen.tsx`: pinned composition (top bar → header card → `Ficha del ejercicio` → `Restricciones` → `Paso a paso` → `Consignas para el entrenador` → `Inspirado en` → `Atribución`), guarded optional sections, `Linking.openURL(url).catch(() => {})`, pinned disclaimer last in the citation card, `canGoBack() ? back() : replace('/')`, and the `Ejercicio no encontrado` branch.
- `src/app/ejercicios/[exerciseId].tsx` (thin, `useLocalSearchParams` → `getExercise` → `ExerciseDetailScreen`) and `<Stack.Screen name="ejercicios/[exerciseId]" />` in `src/app/_layout.tsx`.
- Back and reference pressables carry `paddingVertical: spacing.md` on top of `minHeight: 44`: the raw 44 dp value rendered `123 px` = 43.73 dp at density 450, so padding was added to clear the 44 dp bar on device (matches the accepted `Abrir en Pizarra` precedent).

### Tests

- `npm test`: **417/417 tests, 0 fail, 306 suites** (baseline 378/255). The 39 new cases match the plan exactly; suites overshoot the planned 305 because `node:test` counts nested Given/When `describe` blocks.
- Per-file: `exercise-detail-model.test.ts` 12, `exercise-detail-routing.test.ts` 3, `exercise-detail-link.test.ts` 5, `exercise-library-list.test.ts` 7 (was 4), `weekly-exercises.test.ts` 4, `exercise-detail-screen.test.ts` 8, `exercise-detail-wiring.test.ts` 4; `index.test.ts` and `explore-general-screen.test.ts` changed source lists only (still 1 and 13).
- `tests/architecture/architecture.test.ts` and `tests/architecture/boundaries.test.ts` pass **unedited**; `git status` lists no change under `tests/architecture/`.

### Gates and scans

- `npm run lint` exit 0; `npm run typecheck` exit 0 after the new route was picked up in `.expo/types` (typed-route literals accepted); `npm run verify` exit 0 with **expo-doctor 20/20**; `./init.sh` exit 0 and started no Metro. All four were re-run after the final padding edit.
- `rg 'Ver detalle' src` → only `exercise-detail-link.tsx`; `rg '@/modules/board|react-native-svg|fetch\(' src/modules/content/presentation` empty; hex-colour scan empty; `boardData` absent from the detail screen; `rg -l 'Abrir en Pizarra' -g '*.tsx' src` → only `exercise-library-list.tsx` (the module README also names the action, as before).
- Versions unchanged: `contentVersion` `1.2.0`, `CONTENT_PACKAGE_VERSION` `1.2.0`, `infantil-u14-base` `1.1.0`, all 71 boards `schemaVersion` `1.0.0`.
- `git status` scope: modified `AGENTS.md`, `ARCHITECTURE.md`, `feature_list.json`, `PROGRESS.md`, `docs/content-{model,licensing}.md`, `docs/risks-and-open-questions.md`, `src/app/_layout.tsx`, `src/modules/content/{index.ts,README.md}`, the two card components, and the three extended tests; added the spec, the detail route, the two view models, the link, the screen and six new test files. No change to content domain/application/infrastructure, `content-package.json`, `src/shared/**`, `src/modules/{board,ai,club}/**`, `src/app/(tabs)/**`, `package.json`, `eslint.config.js`, `app.json`, `init.sh`, `DESIGN.md`, `CONTEXT.md`, `docs/domain-model.md` or `docs/board-data-schema.md`.
- `npx expo export --platform android` exit 0: `dist/_expo/static/js/android/entry-749d1d63861cf542f2b643d9503b6fc5.hbc`, **3,862,478 bytes**. Byte-offset scan (UTF-8 and UTF-16LE) found `Ver detalle`, `Inspirado en`, `Detalle de ejercicio`, `Ejercicio no encontrado`, `Paso a paso`, `Ficha del ejercicio`, `Consignas para el entrenador`, `Volver a Explorar`, `Objetivo`, `Atribución`, and the pinned disclaimer.

### `SM-M135F` device smoke

Samsung Galaxy M13 (`SM-M135F`, Android 14, Expo Go 58.0.5, 450 dpi, `adb reverse tcp:8081 tcp:8081`), against the Metro instance on 8081.

- Explorar → Infantil U14 → `Circulación rápida cierre-ala` → `Ver detalle`: the route opened above the tabs (no tab bar) showing `Detalle de ejercicio`, the two chips, title, summary, `Objetivo`, all seven `Ficha del ejercicio` rows (`Infantil (U14)`, `Vuelta a la calma`, `12 min`, `8 jugadores · 2 porteros`, `Pista completa · 20 × 40 m`, `Media · 65%`, `Ondas de 4 minutos x 3 series`), `Restricciones`, `Paso a paso` with `2 fases tácticas` (`Fijar con el cierre` → `Conectar con el ala`) and three cues; no `Inspirado en` and no `Atribución`.
- Back target measured `338×135 px` = `120.2×48.0 dp` after the padding edit (`123 px` ≈ 43.73 dp before it). `Volver a Explorar` returned to Explorar with Infantil U14 still checked, the methodology card, the three weekly highlights and the 2/5/2 library intact; Android back from the Prebenjamín detail behaved the same (Prebenjamín still selected, `7 ejercicios`).
- Prebenjamín weekly `Juego de las cuatro esquinas` detail showed `Inspirado en` with `KeepMove — Recursos de entrenamiento`, `https://www.keepmove.net/recursosdeentrenamiento/` and the pinned disclaimer; the reference pressable measured `850×259 px` = `302×92 dp`. Tapping it opened Samsung Internet on `keepmove.net`; Android back returned to the detail screen.
- Deep link `exp://127.0.0.1:8081/--/ejercicios/no-existe` rendered `Ejercicio no encontrado`, the explanatory sentence and the `Volver a Explorar` action (44.1 dp) with no tab bar and no throw; the action opened Explorar.
- Library `Abrir en Pizarra` still opens the Pizarra tab targeted: `Vuelta a la calma con balón` rendered `SELECCIONADO`, its title, summary and the next-phase note. Weekly cards expose `Ver detalle` and no board action.
- `wm size 900x1800` (320 dp) at `font_scale 1.3`: chips, title, summary, objective, the stacked label-above-value fact rows, `Restricciones`, phases and cues wrapped without clipping or horizontal overflow (no node exceeded 900 px); back control `446×147 px` = `158.6×52.3 dp`, weekly reference row `238.2×130.1 dp`. Device restored with `wm size reset`, `wm density reset`, `font_scale 1.0` (`1080x2408`, 450, `1.0`) and the app relaunched on Explorar.
- `adb logcat -d -t 1500` → 0 matches for `ReactNativeJS.*(error|exception)` or `FATAL EXCEPTION`.

### Not device-verifiable (proven by tests only)

- No seeded exercise omits `intensity.percent` (the field is present on all 71), carries `provenance.attribution` (0 of 71), or has empty `constraints`/`coachingCues` (0 of 71), so the `Intensidad`-without-percent branch, the verbatim `Atribución` block and the omitted `Restricciones`/`Consignas` sections are covered by `exercise-detail-model.test.ts` synthetic fixtures and the screen's conditional-guard source test, not by the device.
- `goalkeepers: 0` is seeded in 49 of 71 records and absent `references` in the 50 library records; both were device-visible — the weekly `Juego de las cuatro esquinas` rendered `8 jugadores` with no keeper suffix and the Infantil library detail rendered no `Inspirado en` block.
- The Expo Go `Tools` floating button overlays part of the top-right content at 320 dp; it is a dev-only overlay, not app UI.

### Deliberate deviations

- Header chips use existing `Chip` variants (`press-trigger` for categories, `defending` for the session part) because the prototype's custom tint has no token.
- The detail page renders `boardData.phases` as text only; no pitch, placeholder, geometry or playback is drawn.
- The `Inspirado en` disclaimer uses `bodySm` (12 px) although `DESIGN.md` sets a 16 px body minimum. This spec pins `bodyMd`/`bodySm` for short meta and the disclaimer; the line is a legal footnote rather than body copy, so it is accepted as a Low deviation and recorded in `docs/risks-and-open-questions.md`.

### Independent validation

Validated on `2026-10-28` by the independent validator on the uncommitted branch; verdict **`accept`** with no Critical, High or Medium findings.

- Re-ran `npm test` (**417/417 tests, 0 fail, 0 skipped, 306 suites**), the nine relevant files individually (12 / 3 / 5 / 4 / 8 / 4 / 7 / 1 / 13 tests, i.e. the 39 planned cases 1:1), `npx tsc --noEmit` (exit 0; `.expo/types/router.d.ts` contains `/ejercicios/[exerciseId]` with a required `exerciseId`, proving the typed-route literal), `npm run lint` (exit 0), `npm run verify` (exit 0, `expo-doctor` 20/20) and `./init.sh` (exit 0, no Metro).
- Re-ran the forbidden-scope scans and the diff/untracked-file review: `Ver detalle` only in `exercise-detail-link.tsx`, no `@/modules/board`, `react-native-svg`, `fetch(`, literal hex, `content/infrastructure` or `boardData` in the detail screen, `Abrir en Pizarra` only in `exercise-library-list.tsx`, and no change under `tests/architecture/` or to content domain/application/infrastructure, `src/shared/**`, board/ai/club, tabs, `package.json`, `eslint.config.js`, `app.json`, `init.sh`, `DESIGN.md`, `CONTEXT.md` or `docs/domain-model.md`. Content stays `1.2.0` with 71 exercises (50 library / 21 weekly), 7 plans, `infantil-u14-base` `1.1.0` and all 71 boards `1.0.0`.
- Re-ran `npx expo export --platform android` (exit 0, `entry-749d1d…hbc`, **3,862,478 bytes**) and found the pinned strings in UTF-8 and UTF-16LE.
- Re-ran the `SM-M135F` smoke (Expo Go against Metro 8081): the Infantil library detail with all seven facts, `Restricciones`, `3 fases tácticas` in order, cues and no source block; the two-chip joined-category rendering of `salida-3-1-presion-alta`; `Volver a Explorar` and Android back preserving Infantil (9 ejercicios, 2 calentamiento, weekly block intact); `Abrir en Pizarra` still targeting `SELECCIONADO`; weekly `Ver detalle` with no board action; the weekly `Inspirado en` label + URL + disclaimer opening Samsung Internet; `…/no-existe` warm and after a cold `force-stop` showing `Ejercicio no encontrado` with the cold fallback landing on Explorar; 320 dp / `font_scale 1.3` reflow with 0 nodes over 900 px and 120.2×48 dp back / 302×150 dp reference targets; the device restored (`1080x2408`, 450 dpi, `font_scale 1.0`); `logcat` with 0 error/exception/FATAL matches.
- Two Low findings, both documentation-level: the "Not device-verifiable" claim wrongly listed `goalkeepers: 0` and absent `references` (fixed in this spec and in `feature_list.json`), and the disclaimer's `bodySm` (12 px) sits below DESIGN's 16 px body minimum (spec-sanctioned; recorded as an accepted typography deviation in `docs/risks-and-open-questions.md`).

## Validator Checklist

- [x] Tapping the `Ver detalle` area of a library card opens `/ejercicios/<id>` above the tabs; the tab bar is absent; the title, summary, objective and all seven metadata rows render with the pinned Spanish labels and values.
- [x] The library card still exposes exactly one unchanged `Abrir en Pizarra` action targeting `/pizarra?exerciseId=<id>`.
- [x] Weekly cards expose a `Ver detalle` link and still expose no board action; their chip, copy, counter and `numberOfLines` are unchanged.
- [x] Phase text renders in `order` sequence from a deliberately shuffled source array, each with number, title and explanation, and the counter reads `1 fase táctica` / `N fases tácticas`; no positions, ball, arrows, labels, pitch or SVG are rendered.
- [x] Coaching cues and constraints render in package order, each as its own row; empty lists omit their section entirely.
- [x] A weekly exercise shows `Inspirado en` with label + URL as an accessible link opening via `Linking.openURL`, followed by the pinned disclaimer; an owned exercise without citations shows no `Inspirado en` and no `Atribución`.
- [x] `provenance.attribution` renders verbatim inside a conditional `Atribución` block.
- [x] A missing `intensity.percent`, `goalkeepers: 0`, and absent optional arrays render without `undefined`, empty cards or errors.
- [x] `/ejercicios/no-existe` (and no-id) shows `Ejercicio no encontrado` with a working `Volver a Explorar`; nothing throws and nothing is fetched.
- [x] Back returns to Explorar with the category still selected; a cold deep link falls back to `router.replace('/')`.
- [x] `Ver detalle`, `Volver a Explorar` and the reference row each measure ≥44 dp; 320 dp at `font_scale 1.3` reflows without clipping; the device is restored.
- [x] `npm test` passes 417 tests (actual suite count recorded), `tests/architecture/*` unedited, `lint`/`typecheck`/`verify`/`./init.sh` exit 0, `./init.sh` starts no Metro, Android export succeeds, `logcat` is clean.
- [x] No content/package/parser/read-layer/provenance/version/Board Data/AI/quota/`src/shared/**`/`package.json`/`eslint.config.js`/`app.json`/`init.sh` change; no `@/modules/board`, SVG, `pitch`, `boardData` or `fetch(` in the screen.
- [x] `ARCHITECTURE.md`, module README, `AGENTS.md`, `PROGRESS.md`, `feature_list.json`, `docs/content-model.md`, `docs/content-licensing.md`, `docs/risks-and-open-questions.md` and this spec match the shipped behavior.

## Risks And Open Points

- **Typed routes.** `experiments.typedRoutes` is on. `buildExerciseDetailHref` must keep the literal `'/ejercicios/[exerciseId]'`, and typecheck only sees the new route after `.expo/types` is regenerated (run the Android export or start Metro first). If `router.replace('/')` is not accepted by the typed `Href`, use `'/(tabs)'` and record it; the visible behavior must stay "Explorar".
- **Two interactive targets per card.** The detail `Pressable` and the `Abrir en Pizarra` `Link` must stay siblings, never nested, or Android merges/blocks the inner press. Keep the board action outside `ExerciseDetailLink`.
- **Screen-reader grouping.** The detail `Pressable` groups title/summary/meta into one accessible element; the explicit `accessibilityLabel` compensates, so do not set `accessible={false}` on children and do not drop the label.
- **Seed cannot demonstrate two branches.** No seeded exercise lacks `intensity.percent`, none carries `provenance.attribution`, and no seeded record has empty `constraints`/`coachingCues`. Those paths are proven by synthetic fixtures in `exercise-detail-model.test.ts` and by the conditional-guard source test; the device smoke cannot show them. State this in the evidence instead of claiming a device check.
- **URL opening is environment-dependent.** `Linking.openURL` can reject when no browser is available; the `.catch(() => {})` prevents an unhandled rejection. If the device cannot open the URL, record that the tap calls `openURL` (source + model tests) and do not claim a browser observation.
- **Long page on a phone.** The detail screen is the longest page in the app; use a `ScrollView` with generous bottom padding and verify nothing clips at 320 dp/1.3. Do not add a sticky footer or new dock.
- **Third module-scope repository.** `src/app/ejercicios/[exerciseId].tsx` calls `createBundledContentRepository()` like `(tabs)/index.tsx` and `(tabs)/pizarra.tsx`; the adapter caches its parse, so evidence should state no second parse occurs. A shared composition-root container is a later refactor, not this feature.
- **Structure tests assert raw source text.** Keep every new guard tag/regex-based rather than line-number based so a later extraction does not become a false failure; `\bLink\b` does not match `ExerciseDetailLink`, but assert the weekly board-free rule with `Abrir en Pizarra` / `buildBoardHref` too.
- **Prototype divergence.** The prototype shows a favourite/share bar, an interactive board, an AI variant CTA and checkbox cues; all are out of scope. The header chips use existing `Chip` variants (`press-trigger` for categories, `defending` for the session part) because the prototype's custom tint has no token; record this as a deliberate, non-blocking deviation.
- **Body-text minimum.** Use `bodyLg` (16 px) for objective, fact values, constraints, cues and phase explanations so the screen does not repeat the accepted `bodyMd` 14 px exception on the longest reading surface.
- No blocking open questions. Remaining implementation-time questions stay in `docs/risks-and-open-questions.md`; none are introduced by this feature.
