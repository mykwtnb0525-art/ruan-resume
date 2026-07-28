function withBase(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

export const ARCHIVE_CONFIG = {
  assets: {
    model: withBase("models/archive-gashapon-web.glb"),
    labels: withBase("textures/gashapon-labels.webp"),
    scratchedMetal: withBase("textures/scratched-metal.webp"),
    audio: {
      projector: withBase("audio/projector-loop.mp3"),
      power: withBase("audio/machine-power.mp3"),
      handle: withBase("audio/handle-turn.mp3"),
      drop: withBase("audio/capsule-drop.mp3"),
      open: withBase("audio/archive-open.mp3"),
    },
  },
  camera: {
    idle: [0, 1.5, 30],
    collage: [0.28, 1.58, 23],
    travelEnd: [2.2, 1.9, 11.6],
    arrival: [3.6, 1.8, 7.8],
    operation: [3.4, 1.75, 7.2],
    target: [0, 0.62, 0],
    fovStart: 46,
    fovEnd: 41,
  },
  ranges: {
    idle: [0, 0.18],
    collage: [0.18, 0.42],
    travel: [0.42, 0.7],
    arrival: [0.7, 0.86],
    boot: [0.86, 0.95],
    dispense: [0.91, 0.95],
    reveal: [0.95, 1],
  },
  colors: {
    paper: "#e8d5c4",
    paperLight: "#f2e3d4",
    ink: "#211d1b",
    red: "#9f1e2d",
    wine: "#4a1018",
    dark: "#08090b",
    charcoal: "#111216",
    cyan: "#00d7e8",
    violet: "#ba72ff",
    green: "#8cff45",
    muted: "#7e7771",
  },
  machine: {
    position: [0, -2.1, 0],
    scale: 0.68,
    capsuleCount: 24,
    modelMode: "gltf",
  },
};

export const ARCHIVE_PHASES = [
  ["IDLE", 0, 0.18],
  ["TRAVEL", 0.18, 0.7],
  ["TARGET_LOCK", 0.7, 0.86],
  ["BOOTING", 0.86, 0.91],
  ["DISPENSING", 0.91, 0.95],
  ["UNSEALED", 0.95, 1.01],
];

export function rangeProgress(progress, start, end) {
  return Math.min(1, Math.max(0, (progress - start) / (end - start)));
}

export function phaseFromProgress(progress) {
  return (
    ARCHIVE_PHASES.find(
      ([, start, end]) => progress >= start && progress < end,
    )?.[0] || "UNSEALED"
  );
}
