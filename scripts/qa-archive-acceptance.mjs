import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/wulai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const outputDir = "D:/Codex/Outputs/kaicheng-archive-qa";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: false,
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
});
const errors = [];
let modelResponse = null;
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", async (response) => {
  if (response.url().endsWith("/models/archive-gashapon-web.glb")) {
    modelResponse = {
      url: response.url(),
      status: response.status(),
      contentLength: Number(
        (await response.allHeaders())["content-length"] || 0,
      ),
    };
  }
});

await page.goto("http://localhost:5173/ruan-resume/?qa=1", {
  waitUntil: "networkidle",
});
await page.locator("#chapter").waitFor();
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  document.querySelector("#chapter")?.scrollIntoView();
});
await page.waitForTimeout(1600);

const range = await page.locator("#chapter").evaluate((element) => ({
  start: Number(element.dataset.archiveStart),
  end: Number(element.dataset.archiveEnd),
}));
const checkpoints = [
  { progress: 0, name: "progress-00-entry" },
  { progress: 0.3, name: "progress-30-collage" },
  { progress: 0.58, name: "progress-58-travel" },
  { progress: 0.8, name: "progress-80-arrival" },
  { progress: 0.98, name: "progress-98-reveal" },
];
const states = [];

for (const checkpoint of checkpoints) {
  await page.evaluate(
    ({ start, end, progress }) => {
      window.scrollTo(0, start + (end - start) * progress);
    },
    { ...range, progress: checkpoint.progress },
  );
  await page.waitForTimeout(1000);
  const state = await page.locator("#chapter").evaluate((element) => {
    const stage = element.querySelector(".archive-sequence__stage");
    const canvas = element.querySelector(".archive-canvas");
    const paper = element.querySelector(".archive-sequence__paper");
    const atmosphere = element.querySelector(
      ".archive-sequence__atmosphere",
    );
    const reveal = element.querySelector(".internship-reveal");
    const fallback = element.querySelector(".archive-gashapon-fallback");
    const memoryField = element.querySelector(
      ".archive-sequence__memory-fragments",
    );
    const memories = [...element.querySelectorAll(".archive-memory")];
    return {
      phase: element.dataset.phase,
      progress: Number(element.dataset.progress),
      webgl: canvas?.dataset.webgl,
      model: canvas?.dataset.model,
      modelStatus: canvas?.dataset.modelStatus,
      modelUrl: canvas?.dataset.modelUrl,
      cameraZ: Number(canvas?.dataset.cameraZ),
      machineBoot: Number(canvas?.dataset.machineBoot),
      capsule: Number(canvas?.dataset.capsule),
      paperOpacity: Number(getComputedStyle(paper).opacity),
      atmosphereOpacity: Number(getComputedStyle(atmosphere).opacity),
      stageBackground: getComputedStyle(stage).backgroundImage,
      atmosphereFilter: getComputedStyle(atmosphere).filter,
      atmosphereBackground: getComputedStyle(atmosphere).backgroundImage,
      revealOpacity: Number(getComputedStyle(reveal).opacity),
      fallbackDisplay: getComputedStyle(fallback).display,
      fallbackOpacity: Number(getComputedStyle(fallback).opacity),
      fallbackHeight: Number(
        fallback.getBoundingClientRect().height.toFixed(1),
      ),
      memoryFieldOpacity: Number(getComputedStyle(memoryField).opacity),
      visibleMemoryFragments: memories.filter(
        (memory) =>
          Number(getComputedStyle(memory).opacity) > 0.05 &&
          memory.getBoundingClientRect().width > 0,
      ).length,
      centerStack: document.elementsFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2,
      ).slice(0, 10).map((node) => {
        const style = getComputedStyle(node);
        return {
          tag: node.tagName,
          className: typeof node.className === "string" ? node.className : "",
          opacity: style.opacity,
          backgroundColor: style.backgroundColor,
          zIndex: style.zIndex,
        };
      }),
    };
  });
  states.push({ checkpoint: checkpoint.progress, ...state });
  await page.screenshot({
    path: `${outputDir}/${checkpoint.name}.png`,
  });
}

await browser.close();
process.stdout.write(
  `${JSON.stringify({ modelResponse, range, states, errors, outputDir }, null, 2)}\n`,
);

if (
  modelResponse?.status !== 200 ||
  states.some(
    (state) =>
      state.webgl !== "ready" &&
      (state.fallbackDisplay === "none" || state.fallbackHeight < 80),
  ) ||
  states.some(
    (state) => state.webgl === "ready" && state.model !== "gltf",
  ) ||
  errors.length
) {
  process.exitCode = 1;
}
