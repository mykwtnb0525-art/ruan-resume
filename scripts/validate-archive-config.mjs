import { chapter01 } from "../src/components/archive/config/chapter01.ts";
import { chapter02Debug } from "../src/components/archive/config/chapter02.debug.ts";
import {
  validateChapterConfig,
  validateChapterRegistry,
} from "../src/components/archive/config/validateChapterConfig.ts";

validateChapterConfig(chapter01);
validateChapterRegistry([chapter01, chapter02Debug]);

const differences = {
  dialDirection:
    chapter01.machine.dialMotion.direction !==
    chapter02Debug.machine.dialMotion.direction,
  dialDegrees:
    chapter01.machine.dialMotion.degrees !==
    chapter02Debug.machine.dialMotion.degrees,
  releasePath:
    JSON.stringify(chapter01.capsule.releasePath) !==
    JSON.stringify(chapter02Debug.capsule.releasePath),
  openingType:
    chapter01.capsule.openingType !== chapter02Debug.capsule.openingType,
  archiveLayout:
    chapter01.archive.layoutId !== chapter02Debug.archive.layoutId,
  lightOrder:
    chapter01.machine.lightSequence.map((step) => step.target).join(",") !==
    chapter02Debug.machine.lightSequence
      .map((step) => step.target)
      .join(","),
};

const missingDifference = Object.entries(differences).find(([, value]) => !value);
if (missingDifference) {
  throw new Error(
    `[ArchiveConfig] debug capability test did not vary ${missingDifference[0]}`,
  );
}

process.stdout.write(
  `${JSON.stringify(
    {
      valid: true,
      productionChapter: chapter01.id,
      debugOnlyChapter: chapter02Debug.id,
      phaseCount: Object.keys(chapter01.phases).length,
      scrollLengthVh: chapter01.scrollLengthVh,
      differences,
    },
    null,
    2,
  )}\n`,
);
