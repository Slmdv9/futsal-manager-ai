# AI module

Owns the grounded AI capabilities: session generator, variant adapter, tactical assistant, grounding policy, and anonymous quota enforcement. LLM calls are server-side only.

## Layers

- `domain`: request and constraint models, grounding rules, quota policy, and ports for the LLM gateway, retrieval, and local AI result storage.
- `application`: generate-session, adapt-exercise, ask-assistant, and quota use cases.
- `infrastructure`: the DevExpert Inference HTTP adapter, server-side quota store, and device-local AI result store.
- `presentation`: assistant, generator, and variant UI.

## Dependencies

May import the public API of the `content` module to ground answers and proposals. AI output uses the shared Board Data contract and must be validated before it is shown or saved.

## Public API

`src/modules/ai/index.ts`.

## Tests

Mirror the source path under `tests/modules/ai/`. Grounding and adversarial tests belong under `tests/modules/ai/`.
