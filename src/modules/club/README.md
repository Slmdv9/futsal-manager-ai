# Club module

Owns the next-phase team, roster, and season surface. The MVP is anonymous, so the current module only exposes the locked Mi Club screen.

## Layers

- `domain`: Team, Player, Season, and roster rules. Added in the account phase.
- `application`: team and season use cases.
- `infrastructure`: account and team persistence adapters.
- `presentation`: Mi Club, team detail, roster, and calendar screens.

## Public API

`src/modules/club/index.ts`.

## Tests

Mirror the source path under `tests/modules/club/`.
