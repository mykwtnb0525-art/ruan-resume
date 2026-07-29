import type { ChapterConfig } from "./chapterTypes.ts";

export type ArchiveLayoutDefinition = {
  id: string;
  className: string;
  supportedPieces: ChapterConfig["archive"]["pieces"][number]["kind"][];
};

export const ARCHIVE_LAYOUTS: Record<string, ArchiveLayoutDefinition> = {
  "mv-floating-left": {
    id: "mv-floating-left",
    className: "archive-layout--mv-floating-left",
    supportedPieces: ["main", "lyric", "storyboard", "palette", "method"],
  },
  "debug-split-right": {
    id: "debug-split-right",
    className: "archive-layout--debug-split-right",
    supportedPieces: ["main", "method"],
  },
};

export function getArchiveLayout(layoutId: string) {
  return ARCHIVE_LAYOUTS[layoutId] || null;
}
