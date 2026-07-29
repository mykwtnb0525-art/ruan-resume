import { mkdir, rename } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/wulai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl =
  process.argv[2] || "http://127.0.0.1:4173/ruan-resume/?qa=1";
const outputDir = "D:/Codex/Outputs/kaicheng-archive-motion";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: [
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});

async function recordJourney(name, segments) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator("#chapter").waitFor();
  await page.waitForFunction(() => {
    const status = document.querySelector(".archive-canvas")?.dataset.modelStatus;
    return status && status !== "loading";
  });
  await page.evaluate(() => {
    document.documentElement.style.setProperty(
      "scroll-behavior",
      "auto",
      "important",
    );
  });
  const range = await page.locator("#chapter").evaluate((element) => ({
    start: Number(element.dataset.archiveStart),
    end: Number(element.dataset.archiveEnd),
  }));

  for (const segment of segments) {
    await page.evaluate(
      async ({ nextRange, from, to, duration }) => {
        const startY =
          nextRange.start + (nextRange.end - nextRange.start) * from;
        const endY =
          nextRange.start + (nextRange.end - nextRange.start) * to;
        window.scrollTo({ top: startY, behavior: "instant" });
        const startedAt = performance.now();
        await new Promise((resolve) => {
          const advance = (now) => {
            const progress = Math.min(1, (now - startedAt) / duration);
            const eased =
              progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            window.scrollTo({
              top: startY + (endY - startY) * eased,
              behavior: "instant",
            });
            if (progress < 1) {
              requestAnimationFrame(advance);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(advance);
        });
      },
      {
        nextRange: range,
        from: segment.from,
        to: segment.to,
        duration: segment.duration,
      },
    );
    await page.waitForTimeout(segment.hold ?? 500);
  }

  const video = page.video();
  await page.close();
  const temporaryPath = await video.path();
  await context.close();
  const finalPath = path.join(outputDir, `${name}.webm`);
  await rename(temporaryPath, finalPath);
  return finalPath;
}

const outputs = [];
outputs.push(
  await recordJourney("capsule-01-forward", [
    { from: 0.49, to: 0.993, duration: 15000, hold: 1200 },
  ]),
);
outputs.push(
  await recordJourney("capsule-01-reverse", [
    { from: 0.902, to: 0.34, duration: 9000, hold: 800 },
  ]),
);
outputs.push(
  await recordJourney("capsule-01-rapid-seek", [
    { from: 0.59, to: 0.902, duration: 900, hold: 1600 },
  ]),
);

await browser.close();
process.stdout.write(`${JSON.stringify({ outputs }, null, 2)}\n`);
