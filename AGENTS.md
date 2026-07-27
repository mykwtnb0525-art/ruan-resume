# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable visual direction

- Treat `reference.png` as the single visual source of truth.
- Preserve the third concept's black editorial canvas, projected portrait, oversized cream name, violet handwritten accent, childhood-object surreal collage, red widescreen film panel, and sparse top navigation.
- Do not incorporate the later film-strip combination or the discarded second concept.
- Keep copy deliberately sparse and hierarchically clear; do not add dense metadata merely to fill space.
- The visual mood combines retro childhood memory, experimental cinema, fashion editorial layout, and restrained digital glitch.
