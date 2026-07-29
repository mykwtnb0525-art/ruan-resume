import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const assetsDir = fileURLToPath(
  new URL("../dist/client/assets/", import.meta.url),
);
const files = await readdir(assetsDir, { recursive: true });
const records = [];

for (const file of files) {
  const absolute = join(assetsDir, file);
  const info = await stat(absolute);
  if (!info.isFile()) continue;
  const extension = extname(file).toLowerCase();
  const text =
    extension === ".js" || extension === ".css"
      ? await readFile(absolute, "utf8")
      : "";
  records.push({
    file: relative(root, absolute).replaceAll("\\", "/"),
    bytes: info.size,
    extension,
    hasThreeLicense: text.includes("Three.js Authors"),
    hasFiberMarker: text.includes("@react-three/fiber"),
    hasDreiMarker: text.includes("@react-three/drei"),
    hasPostprocessingMarker:
      text.includes("postprocessing") || text.includes("EffectComposer"),
    hasDebugPanel: text.includes("NARRATIVE SNAPSHOT"),
    hasDebugChapter: text.includes("debug-capsule-02"),
    hasFutureChapterConfig:
      text.includes("capsule-02-") ||
      text.includes("capsule-03-") ||
      text.includes("capsule-04-") ||
      text.includes("capsule-05-") ||
      text.includes("capsule-06-"),
  });
}

const js = records
  .filter((record) => record.extension === ".js")
  .sort((a, b) => b.bytes - a.bytes);
const report = {
  generatedAt: new Date().toISOString(),
  javascript: js,
  findings: {
    threeChunkCount: js.filter((record) => record.hasThreeLicense).length,
    fiberChunkCount: js.filter((record) => record.hasFiberMarker).length,
    dreiChunkCount: js.filter((record) => record.hasDreiMarker).length,
    postprocessingChunkCount: js.filter(
      (record) => record.hasPostprocessingMarker,
    ).length,
    productionDebugPanelCount: js.filter((record) => record.hasDebugPanel)
      .length,
    productionDebugChapterCount: js.filter((record) => record.hasDebugChapter)
      .length,
    archiveChunksWithFutureChapterConfig: js
      .filter(
        (record) =>
          record.file.includes("ArchiveSequence") &&
          record.hasFutureChapterConfig,
      )
      .map((record) => record.file),
  },
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
