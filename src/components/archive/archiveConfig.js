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
    position: [0.14, -2.2, 0],
    scale: 0.62,
    height: 6.12,
    capsuleCount: 32,
    modelMode: "gltf",
  },
};
