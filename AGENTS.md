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
- The `#chapter` portal must feel like travelling forward into the archive, not like a static perspective illustration. Keep the acid crosshair and foreground collage stable while the tunnel grid continuously advances; wheel input and pointer press may briefly accelerate the depth motion.
- Between the Hero and Profile, preserve a single continuous archive sequence: paper UI recedes, the camera travels toward a restrained retro-futurist gashapon machine, the machine dispenses a capsule, and the capsule unlocks the real internship record as layered paper DOM cards.
- The gashapon machine is a real volumetric asset, never a flat UI icon: use the approved cream-and-green cylindrical body, bulged smoked-glass chamber, brass trim, violet archive light, central weighted dial, top MEMORY ARCHIVE plaque, visible memory capsules, and worn archival finish. Keep its dial, capsule carousel, output door, tray, and output capsule as independently addressable animation nodes.
- Treat the warm childhood archive corridor with layered photographs, handwriting, wet reflections, sparse cyan/violet glitches, and a luminous center as the atmosphere reference for the Hero-to-Profile travel. Use it as a live composition guide rather than baking duplicate headings into the background.
- In `#chapter`, the machine must remain visible as the continuous spatial target from progress 0.00 onward. Use the approved sequence: entrance 0.00–0.18, layered collage 0.18–0.42, old-album travel 0.42–0.70, three-quarter arrival 0.70–0.86, machine boot/dispense 0.86–0.95, archive reveal 0.95–1.00.
- Never allow a near-white or targetless interval in `#chapter`; within every half viewport of scroll, the machine scale, passing memory fragments, exposure, mechanical state, capsule, or archive cards must visibly advance.
