import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const runtimeModules =
  "C:/Users/wulai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const sharp = require(`${runtimeModules}/sharp`);
const pixelmatch = require(`${runtimeModules}/pixelmatch`).default;

const baselineDir =
  process.argv[2] ||
  "D:/Codex/Outputs/kaicheng-archive-baseline-71cbc67";
const currentDir =
  process.argv[3] || "D:/Codex/Outputs/kaicheng-archive-qa";
const outputDir =
  process.argv[4] || "D:/Codex/Outputs/kaicheng-archive-config-comparison";
const files = [
  "progress-00-entry.png",
  "progress-70-dial.png",
  "progress-76-dispense.png",
  "progress-90-project-archive.png",
  "progress-99-bridge.png",
];

await mkdir(outputDir, { recursive: true });
const comparisons = [];

for (const file of files) {
  const baselinePath = path.join(baselineDir, file);
  const currentPath = path.join(currentDir, file);
  const baseline = sharp(baselinePath);
  const current = sharp(currentPath);
  const metadata = await baseline.metadata();
  const width = metadata.width;
  const height = metadata.height;
  const [baselineRaw, currentRaw] = await Promise.all([
    baseline.ensureAlpha().raw().toBuffer(),
    current.ensureAlpha().raw().toBuffer(),
  ]);
  const mismatchedPixels = pixelmatch(
    baselineRaw,
    currentRaw,
    null,
    width,
    height,
    { threshold: 0.1, includeAA: false },
  );
  const mismatchPercent = (mismatchedPixels / (width * height)) * 100;
  const labelSvg = Buffer.from(`
    <svg width="${width * 2}" height="42" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width * 2}" height="42" fill="rgba(16,13,12,.82)"/>
      <text x="24" y="27" fill="#f2e3d4" font-family="Arial" font-size="16">BASELINE / 71cbc67</text>
      <text x="${width + 24}" y="27" fill="#f2e3d4" font-family="Arial" font-size="16">CONFIG-DRIVEN / CURRENT</text>
    </svg>
  `);
  const outputPath = path.join(outputDir, file);
  await sharp({
    create: {
      width: width * 2,
      height,
      channels: 4,
      background: "#100d0c",
    },
  })
    .composite([
      { input: baselinePath, left: 0, top: 0 },
      { input: currentPath, left: width, top: 0 },
      { input: labelSvg, left: 0, top: 0 },
    ])
    .png()
    .toFile(outputPath);
  comparisons.push({
    file,
    mismatchPercent: Number(mismatchPercent.toFixed(4)),
    outputPath: outputPath.replaceAll("\\", "/"),
  });
}

await writeFile(
  path.join(outputDir, "comparison.json"),
  `${JSON.stringify(comparisons, null, 2)}\n`,
);
process.stdout.write(`${JSON.stringify(comparisons, null, 2)}\n`);
