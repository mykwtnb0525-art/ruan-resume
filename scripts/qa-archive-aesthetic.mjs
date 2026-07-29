import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/wulai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const outputDir = "D:/Codex/Outputs/kaicheng-archive-aesthetic";
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
  process.argv[2] || "http://127.0.0.1:4173/ruan-resume/?qa=1";
const allCases = [
  {
    visualMode: "model-front",
    lightingPass: "ground",
    file: "01-grey-model-front.png",
  },
  {
    visualMode: "model-three-quarter",
    lightingPass: "ground",
    file: "02-grey-model-three-quarter.png",
  },
  {
    visualMode: "material",
    lightingPass: "ground",
    file: "03-material-no-background.png",
  },
  {
    visualMode: "glass",
    lightingPass: "environment",
    file: "04-glass-and-capsules-closeup.png",
  },
  {
    visualMode: "lighting",
    lightingPass: "ground",
    file: "05-final-lighting-no-post.png",
  },
  {
    visualMode: "integrated",
    lightingPass: "final",
    file: "06-background-integrated.png",
  },
  {
    visualMode: "final",
    lightingPass: "final",
    file: "07-final-ui-and-post.png",
  },
  {
    visualMode: "background-base",
    lightingPass: "final",
    file: "background-01-base-and-portal.png",
  },
  {
    visualMode: "background-collage",
    lightingPass: "final",
    file: "background-02-collage-and-neon.png",
  },
  {
    visualMode: "integrated",
    lightingPass: "final",
    file: "background-03-full-with-machine.png",
  },
];
const requestedCase = process.argv[3];
const cases = requestedCase
  ? allCases.filter(
      (item) =>
        item.visualMode === requestedCase || item.file === requestedCase,
    )
  : allCases;
const results = [];

for (const item of cases) {
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
  url.searchParams.set("lightingPass", item.lightingPass);
  url.searchParams.set("visualMode", item.visualMode);
  await page.goto(url.toString(), { waitUntil: "networkidle" });
  await page.locator("#chapter").waitFor();
  await page.locator("#chapter").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    return (
      document.querySelector(".archive-canvas")?.dataset.modelStatus ===
      "loaded"
    );
  });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector("#chapter")?.scrollIntoView();
  });
  await page.waitForTimeout(800);

  const range = await page.locator("#chapter").evaluate((element) => ({
    start: Number(element.dataset.archiveStart),
    end: Number(element.dataset.archiveEnd),
  }));
  await page.evaluate(({ start, end }) => {
    window.scrollTo(0, start + (end - start) * 0.5);
  }, range);
  await page.waitForTimeout(1400);

  const file = `${outputDir}/${item.file}`;
  await page.screenshot({ path: file });
  const state = await page.locator("#chapter").evaluate((element) => {
    const canvas = element.querySelector(".archive-canvas");
    return {
      phase: element.dataset.phase,
      lightingPass: element.dataset.lightingPass,
      visualMode: element.dataset.visualMode,
      model: canvas?.dataset.model,
      modelStatus: canvas?.dataset.modelStatus,
      webgl: canvas?.dataset.webgl,
    };
  });
  results.push({ ...state, file, errors });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
