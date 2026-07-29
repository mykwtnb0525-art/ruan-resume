import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/wulai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const outputDir = "D:/Codex/Outputs/kaicheng-archive-fusion";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: false,
  args: [
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});

const sourceUrl =
  process.argv[2] || "http://localhost:5173/ruan-resume/?qa=1";
const passes = [
  { id: "base", file: "01-base-light-only.png" },
  { id: "environment", file: "02-base-plus-environment.png" },
  { id: "ground", file: "03-ground-contact-shadow.png" },
  { id: "atmosphere", file: "04-background-air-perspective.png" },
  { id: "final", file: "05-final-scene-fusion.png" },
];
const results = [];

for (const pass of passes) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  const url = new URL(sourceUrl);
  url.searchParams.set("qa", "1");
  url.searchParams.set("lightingPass", pass.id);
  await page.goto(url.toString(), { waitUntil: "networkidle" });
  await page.locator("#chapter").waitFor();
  await page.waitForFunction(() => {
    return document.querySelector(".archive-canvas")?.dataset.modelStatus ===
      "loaded";
  });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector("#chapter")?.scrollIntoView();
  });
  await page.waitForTimeout(1200);

  const range = await page.locator("#chapter").evaluate((element) => ({
    start: Number(element.dataset.archiveStart),
    end: Number(element.dataset.archiveEnd),
  }));
  await page.evaluate(({ start, end }) => {
    window.scrollTo(0, start + (end - start) * 0.5);
  }, range);
  await page.waitForTimeout(1800);

  const file = `${outputDir}/${pass.file}`;
  await page.screenshot({ path: file });
  const state = await page.locator("#chapter").evaluate((element) => {
    const canvas = element.querySelector(".archive-canvas");
    const crosshair = element.querySelector(".acid-crosshair");
    return {
      phase: element.dataset.phase,
      lightingPass: element.dataset.lightingPass,
      model: canvas?.dataset.model,
      modelStatus: canvas?.dataset.modelStatus,
      webgl: canvas?.dataset.webgl,
      crosshairPresent: Boolean(crosshair),
    };
  });
  results.push({ ...state, file, errors });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
