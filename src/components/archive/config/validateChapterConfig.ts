import { getArchiveLayout } from "./ArchiveLayout.ts";
import type { ChapterConfig } from "./chapterTypes.ts";

const PHASE_KEYS: Array<keyof ChapterConfig["phases"]> = [
  "takeover",
  "identify",
  "prime",
  "activate",
  "dispense",
  "land",
  "open",
  "emerge",
  "read",
  "close",
  "commit",
  "bridge",
];

export function validateChapterConfig(config: ChapterConfig) {
  const errors: string[] = [];
  let previousEnd = 0;

  if (!config.id) errors.push("id is required");
  if (!Number.isInteger(config.index) || config.index < 0) {
    errors.push("index must be a non-negative integer");
  }
  if (!Number.isFinite(config.scrollLengthVh) || config.scrollLengthVh <= 0) {
    errors.push("scrollLengthVh must be greater than 0");
  }

  for (const phase of PHASE_KEYS) {
    const range = config.phases[phase];
    if (
      !Array.isArray(range) ||
      range.length !== 2 ||
      !range.every(Number.isFinite)
    ) {
      errors.push(`phases.${phase} must be a numeric [start, end] tuple`);
      continue;
    }
    const [start, end] = range;
    if (start < 0 || end > 1 || end <= start) {
      errors.push(`phases.${phase} must satisfy 0 <= start < end <= 1`);
    }
    if (Math.abs(start - previousEnd) > 0.000001) {
      errors.push(
        `phases.${phase} starts at ${start}, expected continuous start ${previousEnd}`,
      );
    }
    previousEnd = end;
  }
  if (Math.abs(previousEnd - 1) > 0.000001) {
    errors.push(`phase map must end at 1, received ${previousEnd}`);
  }

  if (
    !Array.isArray(config.capsule.releasePath) ||
    config.capsule.releasePath.length < 4
  ) {
    errors.push("capsule.releasePath requires at least four Vec3 points");
  } else if (
    config.capsule.releasePath.some(
      (point) =>
        !Array.isArray(point) ||
        point.length !== 3 ||
        !point.every(Number.isFinite),
    )
  ) {
    errors.push("capsule.releasePath contains an invalid Vec3");
  }

  if (!config.capsule.openingType) {
    errors.push("capsule.openingType is required");
  }
  const openingParams = config.capsule.openingParams;
  if (
    config.capsule.openingType === "membrane-split" &&
    (!Number.isFinite(openingParams.topLift) ||
      !Number.isFinite(openingParams.bottomDrop) ||
      !Array.isArray(openingParams.topRotationDeg) ||
      !Array.isArray(openingParams.bottomRotationDeg) ||
      !Number.isFinite(openingParams.membraneOffset) ||
      !Number.isFinite(openingParams.membraneRotationDeg))
  ) {
    errors.push(
      "membrane-split requires lift/drop, top/bottom rotation, membrane offset and membrane rotation",
    );
  }
  if (
    config.capsule.openingType === "four-panel" &&
    ((openingParams.panelAngles?.length || 0) < 4 ||
      !Number.isFinite(openingParams.stagger))
  ) {
    errors.push("four-panel requires at least four panelAngles and a stagger");
  }
  if (
    ["hinged-lid", "ritual-frame", "twist-lock", "seal-fracture"].includes(
      config.capsule.openingType,
    ) &&
    !Number.isFinite(openingParams.stagger)
  ) {
    errors.push(`${config.capsule.openingType} requires openingParams.stagger`);
  }

  const layout = getArchiveLayout(config.archive.layoutId);
  if (!layout) {
    errors.push(`archive layout "${config.archive.layoutId}" is not registered`);
  } else {
    for (const piece of config.archive.pieces) {
      if (!layout.supportedPieces.includes(piece.kind)) {
        errors.push(
          `archive piece "${piece.id}" uses unsupported kind "${piece.kind}"`,
        );
      }
    }
  }

  if (errors.length) {
    throw new Error(
      `[ArchiveConfig:${config.id || "unknown"}]\n- ${errors.join("\n- ")}`,
    );
  }
  return config;
}

export function validateChapterRegistry(configs: ChapterConfig[]) {
  const indexes = new Set<number>();
  const ids = new Set<string>();
  configs.forEach((config) => {
    validateChapterConfig(config);
    if (indexes.has(config.index)) {
      throw new Error(`[ArchiveConfig] duplicate chapter index ${config.index}`);
    }
    if (ids.has(config.id)) {
      throw new Error(`[ArchiveConfig] duplicate chapter id "${config.id}"`);
    }
    indexes.add(config.index);
    ids.add(config.id);
  });
  return configs;
}
