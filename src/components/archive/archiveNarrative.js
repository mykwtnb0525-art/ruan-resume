import { PRODUCTION_CHAPTERS } from "./config/chapterRegistry.ts";

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const [chapter01] = PRODUCTION_CHAPTERS;

export const NARRATIVE_MAP = {
  entryLengthVh: 650,
  totalLengthVh: 650 + chapter01.scrollLengthVh,
  chapters: [chapter01],
};

export const ARCHIVE_SCROLL = {
  entryVh: NARRATIVE_MAP.entryLengthVh,
  chapterOneVh: chapter01.scrollLengthVh,
  totalVh: NARRATIVE_MAP.totalLengthVh,
};

export const ENTRY_RANGES = {
  keyIdle: [0, 0.1],
  keyReveal: [0.1, 0.28],
  accessGranted: [0.28, 0.38],
  spaceOpening: [0.38, 0.65],
  machineApproach: [0.65, 0.9],
  machineAwake: [0.9, 1],
};

export const CHAPTER_ONE_RANGES = chapter01.phases;

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

function phaseFromChapter(progress, phases) {
  if (progress < phases.identify[0]) {
    return "ENVIRONMENT_TAKEOVER";
  }
  if (progress < phases.prime[0]) return "CAPSULE_IDENTIFY";
  if (progress < phases.activate[0]) return "MACHINE_PRIME";
  if (progress < phases.dispense[0]) {
    return "MACHINE_ACTIVATE";
  }
  if (progress < phases.land[0]) return "CAPSULE_DISPENSE";
  if (progress < phases.open[0]) return "CAPSULE_LAND";
  if (progress < phases.emerge[0]) return "CAPSULE_OPEN";
  if (progress < phases.read[0]) return "ARCHIVE_EMERGE";
  if (progress < phases.close[0]) return "ARCHIVE_READ";
  if (progress < phases.commit[0]) return "ARCHIVE_CLOSE";
  if (progress < phases.bridge[0]) return "MEMORY_COMMIT";
  return "NEXT_CHAPTER_BRIDGE";
}

export function evaluateArchiveNarrative(
  globalProgress,
  narrativeMap = NARRATIVE_MAP,
) {
  const chapterConfig = narrativeMap.chapters[0];
  const chapterRanges = chapterConfig.phases;
  const global = clamp01(globalProgress);
  const entryWeight =
    narrativeMap.entryLengthVh / narrativeMap.totalLengthVh;
  const inEntry = global < entryWeight;
  const entryProgress = clamp01(global / entryWeight);
  const chapterProgress = inEntry
    ? 0
    : clamp01((global - entryWeight) / (1 - entryWeight));
  const phase = inEntry
    ? phaseFromEntry(entryProgress)
    : phaseFromChapter(chapterProgress, chapterRanges);

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
    ...chapterRanges.takeover,
  );
  const identify = rangeProgress(
    chapterProgress,
    ...chapterRanges.identify,
  );
  const prime = rangeProgress(chapterProgress, ...chapterRanges.prime);
  const activate = rangeProgress(
    chapterProgress,
    ...chapterRanges.activate,
  );
  const dispense = rangeProgress(
    chapterProgress,
    ...chapterRanges.dispense,
  );
  const land = rangeProgress(chapterProgress, ...chapterRanges.land);
  const open = rangeProgress(chapterProgress, ...chapterRanges.open);
  const emerge = rangeProgress(chapterProgress, ...chapterRanges.emerge);
  const read = rangeProgress(chapterProgress, ...chapterRanges.read);
  const close = rangeProgress(chapterProgress, ...chapterRanges.close);
  const commit = rangeProgress(chapterProgress, ...chapterRanges.commit);
  const bridge = rangeProgress(chapterProgress, ...chapterRanges.bridge);
  const archiveVisibility = clamp01(
    (emerge || read || close || commit || bridge) * (1 - close),
  );
  const capsuleOpen = clamp01(open * (1 - close));

  return {
    globalProgress: global,
    entryProgress,
    chapterIndex: inEntry ? -1 : 0,
    chapterId: inEntry ? null : chapterConfig.id,
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
