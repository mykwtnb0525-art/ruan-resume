import { chapter01 } from "./chapter01.ts";
import { validateChapterRegistry } from "./validateChapterConfig.ts";

export const PRODUCTION_CHAPTERS = [chapter01];

if (import.meta.env?.DEV) {
  validateChapterRegistry(PRODUCTION_CHAPTERS);
}

export const getProductionChapter = (index: number) =>
  PRODUCTION_CHAPTERS.find((chapter) => chapter.index === index) || null;
