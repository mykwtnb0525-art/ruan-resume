const clamp01 = (value) => Math.min(1, Math.max(0, value));

export const ARCHIVE_SCROLL = {
  entryVh: 650,
  chapterOneVh: 620,
  totalVh: 1270,
  plannedTotalVh: 4510,
};

export const ARCHIVE_CHAPTER_REGISTRY = [
  { id: "time", index: 0, scrollVh: 620, implemented: true },
  { id: "mist", index: 1, scrollVh: 580, implemented: false },
  { id: "abc", index: 2, scrollVh: 560, implemented: false },
  { id: "gala", index: 3, scrollVh: 600, implemented: false },
  { id: "tiktok", index: 4, scrollVh: 500, implemented: false },
  { id: "dayu", index: 5, scrollVh: 680, implemented: false },
];

export const ENTRY_RANGES = {
  keyIdle: [0, 0.1],
  keyReveal: [0.1, 0.28],
  accessGranted: [0.28, 0.38],
  spaceOpening: [0.38, 0.65],
  machineApproach: [0.65, 0.9],
  machineAwake: [0.9, 1],
};

export const CHAPTER_ONE_RANGES = {
  takeover: [0, 0.12],
  identify: [0.12, 0.2],
  prime: [0.2, 0.32],
  activate: [0.32, 0.44],
  dispense: [0.44, 0.55],
  land: [0.55, 0.6],
  open: [0.6, 0.64],
  emerge: [0.64, 0.72],
  read: [0.72, 0.91],
  close: [0.91, 0.95],
  commit: [0.95, 0.97],
  bridge: [0.97, 1],
};

export function rangeProgress(progress, start, end) {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
}

function phaseFromEntry(progress) {
  if (progress < ENTRY_RANGES.keyReveal[0]) return "KEY_IDLE";
  if (progress < ENTRY_RANGES.accessGranted[0]) return "KEY_REVEAL";
  if (progress < ENTRY_RANGES.spaceOpening[0]) return "ACCESS_GRANTED";
  if (progress < ENTRY_RANGES.machineApproach[0]) return "SPACE_OPENING";
  if (progress < ENTRY_RANGES.machineAwake[0]) return "MACHINE_APPROACH";
  return "MACHINE_AWAKE";
}

function phaseFromChapter(progress) {
  if (progress < CHAPTER_ONE_RANGES.identify[0]) {
    return "ENVIRONMENT_TAKEOVER";
  }
  if (progress < CHAPTER_ONE_RANGES.prime[0]) return "CAPSULE_IDENTIFY";
  if (progress < CHAPTER_ONE_RANGES.activate[0]) return "MACHINE_PRIME";
  if (progress < CHAPTER_ONE_RANGES.dispense[0]) {
    return "MACHINE_ACTIVATE";
  }
  if (progress < CHAPTER_ONE_RANGES.land[0]) return "CAPSULE_DISPENSE";
  if (progress < CHAPTER_ONE_RANGES.open[0]) return "CAPSULE_LAND";
  if (progress < CHAPTER_ONE_RANGES.emerge[0]) return "CAPSULE_OPEN";
  if (progress < CHAPTER_ONE_RANGES.read[0]) return "ARCHIVE_EMERGE";
  if (progress < CHAPTER_ONE_RANGES.close[0]) return "ARCHIVE_READ";
  if (progress < CHAPTER_ONE_RANGES.commit[0]) return "ARCHIVE_CLOSE";
  if (progress < CHAPTER_ONE_RANGES.bridge[0]) return "MEMORY_COMMIT";
  return "NEXT_CHAPTER_BRIDGE";
}

export function evaluateArchiveNarrative(globalProgress) {
  const global = clamp01(globalProgress);
  const entryWeight = ARCHIVE_SCROLL.entryVh / ARCHIVE_SCROLL.totalVh;
  const inEntry = global < entryWeight;
  const entryProgress = clamp01(global / entryWeight);
  const chapterProgress = inEntry
    ? 0
    : clamp01((global - entryWeight) / (1 - entryWeight));
  const phase = inEntry
    ? phaseFromEntry(entryProgress)
    : phaseFromChapter(chapterProgress);

  const entrance = rangeProgress(
    entryProgress,
    ENTRY_RANGES.keyReveal[0],
    ENTRY_RANGES.accessGranted[1],
  );
  const collage = rangeProgress(
    entryProgress,
    ENTRY_RANGES.keyReveal[0],
    ENTRY_RANGES.spaceOpening[1],
  );
  const travel = rangeProgress(
    entryProgress,
    ENTRY_RANGES.spaceOpening[0],
    ENTRY_RANGES.machineApproach[1],
  );
  const arrival = rangeProgress(
    entryProgress,
    ENTRY_RANGES.machineApproach[0],
    ENTRY_RANGES.machineAwake[1],
  );

  const takeover = rangeProgress(
    chapterProgress,
    ...CHAPTER_ONE_RANGES.takeover,
  );
  const identify = rangeProgress(
    chapterProgress,
    ...CHAPTER_ONE_RANGES.identify,
  );
  const prime = rangeProgress(chapterProgress, ...CHAPTER_ONE_RANGES.prime);
  const activate = rangeProgress(
    chapterProgress,
    ...CHAPTER_ONE_RANGES.activate,
  );
  const dispense = rangeProgress(
    chapterProgress,
    ...CHAPTER_ONE_RANGES.dispense,
  );
  const land = rangeProgress(chapterProgress, ...CHAPTER_ONE_RANGES.land);
  const open = rangeProgress(chapterProgress, ...CHAPTER_ONE_RANGES.open);
  const emerge = rangeProgress(chapterProgress, ...CHAPTER_ONE_RANGES.emerge);
  const read = rangeProgress(chapterProgress, ...CHAPTER_ONE_RANGES.read);
  const close = rangeProgress(chapterProgress, ...CHAPTER_ONE_RANGES.close);
  const commit = rangeProgress(chapterProgress, ...CHAPTER_ONE_RANGES.commit);
  const bridge = rangeProgress(chapterProgress, ...CHAPTER_ONE_RANGES.bridge);
  const archiveVisibility = clamp01(
    (emerge || read || close || commit || bridge) * (1 - close),
  );
  const capsuleOpen = clamp01(open * (1 - close));

  return {
    globalProgress: global,
    entryProgress,
    chapterIndex: inEntry ? -1 : 0,
    chapterProgress,
    phase,
    archivedCount: commit > 0 ? 1 : 0,
    activeCapsule: bridge > 0 ? 1 : 0,
    nextChapterReady: bridge > 0,
    entry: {
      entrance,
      collage,
      travel,
      arrival,
    },
    chapter: {
      takeover,
      identify,
      prime,
      activate,
      dispense,
      land,
      open,
      emerge,
      read,
      close,
      commit,
      bridge,
      capsuleOpen,
      archiveVisibility,
    },
  };
}

export const INITIAL_ARCHIVE_SNAPSHOT = evaluateArchiveNarrative(0);
