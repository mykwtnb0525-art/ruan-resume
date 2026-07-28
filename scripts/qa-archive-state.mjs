import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/wulai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));
await page.goto("http://localhost:5173/ruan-resume/?qa=1", {
  waitUntil: "networkidle",
});
await page.locator("#chapter").waitFor();
const range = await page.locator("#chapter").evaluate((element) => ({
  start: Number(element.dataset.archiveStart),
  end: Number(element.dataset.archiveEnd),
}));
const checkpoints = [0.001, 0.31, 0.52, 0.7, 0.85, 0.965];
const states = [];
for (const progress of checkpoints) {
  await page.evaluate(
    ({ range: nextRange, progress: nextProgress }) => {
      window.scrollTo(
        0,
        nextRange.start + (nextRange.end - nextRange.start) * nextProgress,
      );
    },
    { range, progress },
  );
  await page.waitForTimeout(720);
  states.push(
    await page.locator("#chapter").evaluate((element) => {
      const canvas = element.querySelector(".archive-canvas");
      return {
        phase: element.dataset.phase,
        progress: Number(element.dataset.progress),
        webgl: canvas?.dataset.webgl,
        model: canvas?.dataset.model,
        cameraZ: Number(canvas?.dataset.cameraZ),
        boot: Number(canvas?.dataset.machineBoot),
        capsule: Number(canvas?.dataset.capsule),
      };
    }),
  );
}
const assets = await page.evaluate(async () => {
  const urls = [
    "/ruan-resume/models/archive-gashapon.glb",
    "/ruan-resume/assets/archive-dream-corridor.png",
  ];
  return Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url);
      return {
        url,
        ok: response.ok,
        status: response.status,
        bytes: Number(response.headers.get("content-length") || 0),
      };
    }),
  );
});
await browser.close();
const expected = [
  "IDLE",
  "TRAVEL",
  "TARGET_LOCK",
  "BOOTING",
  "DISPENSING",
  "UNSEALED",
];
const result = {
  range,
  states,
  phasesCorrect: states.every((state, index) => state.phase === expected[index]),
  cameraAdvanced: states[1].cameraZ < states[0].cameraZ,
  machineBooted: states[3].boot > 0.5,
  capsuleDispensed: states[4].capsule > 0.5,
  assets,
  errors,
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (
  !result.phasesCorrect ||
  !result.cameraAdvanced ||
  !result.machineBooted ||
  !result.capsuleDispensed ||
  assets.some((asset) => !asset.ok) ||
  errors.length
) {
  process.exitCode = 1;
}
