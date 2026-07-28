function withBase(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

export const ARCHIVE_CONFIG = {
  assets: {
    model: withBase("models/archive-gashapon.glb"),
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
    idle: [0.35, 1.35, 18],
    travelEnd: [4.9, 2.3, 9.4],
    arrival: [4.8, 2.2, 7.8],
    operation: [3.6, 1.8, 6.2],
    target: [0, 1.55, 0],
    fovStart: 46,
    fovEnd: 40,
  },
  ranges: {
    idle: [0, 0.12],
    travel: [0.12, 0.43],
    arrival: [0.43, 0.58],
    boot: [0.58, 0.78],
    dispense: [0.78, 0.9],
    reveal: [0.9, 1],
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
    position: [0, -1.25, 0],
    scale: 0.82,
    capsuleCount: 24,
    modelMode: "gltf",
  },
};

export const ARCHIVE_PHASES = [
  ["IDLE", 0, 0.12],
  ["TRAVEL", 0.12, 0.43],
  ["TARGET_LOCK", 0.43, 0.58],
  ["BOOTING", 0.58, 0.78],
  ["DISPENSING", 0.78, 0.9],
  ["UNSEALED", 0.9, 1.01],
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
