# Archive Chapter Configuration — Iteration Report

## Baseline

- Accepted Capsule 01 baseline commit: `71cbc67`
- Milestone branch: `milestone/capsule-01-closed-loop`
- Abstraction branch: `feature/archive-chapter-config`
- Baseline screenshots: `D:/Codex/Outputs/kaicheng-archive-baseline-71cbc67`
- Baseline recordings: `D:/Codex/Outputs/kaicheng-archive-motion-baseline-71cbc67`

The baseline stores the accepted 11 representative narrative checkpoints,
forward loop, reverse loop, rapid seek, reload restoration and the final
`02 / 06 READY` state. `ChapterConfig.phases` contains 12 continuous chapter
intervals because it also models the takeover and bridge boundaries.

## Final architecture

```text
ArchiveSequence
├─ NarrativeMap / NarrativeSnapshot evaluator
├─ ArchiveCanvas
│  ├─ MachineRig
│  ├─ CapsuleRig
│  ├─ LightingRig
│  └─ EnvironmentRig
├─ ArchiveRenderer
│  └─ ArchiveLayout registry
├─ TransitionResidue
└─ ArchiveHud

config/
├─ chapterTypes.ts
├─ chapter01.ts
├─ chapter02.debug.ts
├─ chapterRegistry.ts
├─ ArchiveLayout.ts
└─ validateChapterConfig.ts
```

`chapter01.ts` now owns the accepted 620vh length, phase boundaries, clockwise
230-degree dial, light order, deterministic Bezier release, single bounce,
membrane split, shell opening, five archive pieces, floating-left layout,
film dissolve close and bridge into `02 / 06 READY`.

The debug-only second configuration deliberately changes dial direction,
angle, release path, light order, opening type and archive layout. It contains
no formal `Mist` chapter content or production assets.

## Validation

Development startup and `npm run config:validate` reject:

- missing or duplicate ids and indexes;
- non-continuous, overlapping or out-of-bounds phases;
- invalid scroll lengths;
- missing or malformed release paths;
- incomplete opening parameters;
- unregistered archive layouts;
- archive piece kinds unsupported by the selected layout.

Configuration errors throw named `[ArchiveConfig:<id>]` errors and never
silently fall back.

## Vite base and loading

All runtime public asset URLs now use `import.meta.env.BASE_URL` through
`assetUrl()`. CSS paper textures are supplied by the same helper through a CSS
custom property.

The archive module is mounted only after 5% of its viewport placeholder becomes
visible. A direct `/#chapter` visit loads it immediately and preserves the
anchor. Automated network verification shows:

```text
Initial Hero requests for ArchiveSequence: 0
Requests after chapter intersection: JS + CSS
Production debug panel count: 0
```

## Bundle analysis

Baseline raw JavaScript:

```text
main:             403,284 bytes
ArchiveSequence:  708,696 bytes
```

Final raw JavaScript:

```text
main:             404,147 bytes
ArchiveSequence:  715,375 bytes
```

Findings:

- Three.js exists in one on-demand archive chunk only.
- `@react-three/fiber` is not installed or bundled.
- `@react-three/drei` is not installed or bundled.
- `postprocessing` is installed but not present in the production chunks.
- the debug panel is absent from production;
- the debug Capsule 02 configuration is absent from production;
- no formal Capsule 02–06 configuration is present in the archive chunk.

The archive chunk still triggers Vite's 500k warning. It has not been blindly
split because Three.js, GLTF loading and the accepted scene form one coherent
runtime. The effective first-screen cost was removed through intersection-based
loading. A later performance round may split the GLTF loader and non-critical
scene helpers after measuring real device timings.

## Regression results

Passed:

- accepted 11 checkpoint sequence;
- forward complete loop;
- reverse rollback;
- rapid seek without queued transitions;
- pause during capsule drop;
- reverse during archive emergence;
- mid-sequence reload restoration;
- one Canvas / one output capsule runtime;
- stable capsule archive anchor;
- final `02 / 06 READY`;
- model node validation;
- GitHub Pages base-path asset requests;
- production build;
- Sites worker tests.

Visual comparison against `71cbc67`:

```text
entry:            0.0000% mismatched pixels
dial:             0.1109%
dispense:         0.0657%
archive read:     0.0001%
bridge:           0.0535%
```

The small motion-state differences are from real-time idle sampling. The
accepted layout, timing, camera, material, archive and final state remain
unchanged.

Current comparison images:

`D:/Codex/Outputs/kaicheng-archive-config-comparison`

Current recordings:

`D:/Codex/Outputs/kaicheng-archive-motion`

## Deferred items

- Capsule 02 formal visuals, content and animation are intentionally absent.
- The 715KB archive chunk warning remains documented for a measured performance
  pass.
- `TransitionResidue` is structurally available; Capsule 01 retains its
  accepted HUD-only residue so this abstraction does not change the baseline.
