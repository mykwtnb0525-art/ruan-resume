import { ARCHIVE_VISUAL_BASELINE } from "../visual/visualBaseline.js";

export function getEnvironmentRenderConfig(chapterConfig, compact) {
  const densityDelta = chapterConfig.environment.fogDensity - 0.18;
  return {
    fogNear: compact ? 6.8 : 7.4,
    fogFar: (compact ? 13 : 15.5) - densityDelta * 14,
    environmentIntensity:
      ARCHIVE_VISUAL_BASELINE.environment.intensity *
      chapterConfig.environment.brightness,
    cssVariables: {
      "--chapter-brightness": chapterConfig.environment.brightness,
      "--chapter-saturation": chapterConfig.environment.saturation,
      "--chapter-residue": chapterConfig.environment.residueFromPrevious,
    },
  };
}
