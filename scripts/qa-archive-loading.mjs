import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/wulai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const productionUrl =
  process.argv[2] || "http://127.0.0.1:4173/ruan-resume/?qa=1";
const developmentUrl =
  process.argv[3] ||
  "http://127.0.0.1:5174/ruan-resume/?qa=1&debugNarrative=1&debugChapter=2#chapter";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});

const production = await browser.newPage({
  viewport: { width: 1440, height: 900 },
});
const productionRequests = [];
production.on("request", (request) => productionRequests.push(request.url()));
await production.goto(productionUrl, { waitUntil: "networkidle" });
await production.waitForTimeout(300);
const initialArchiveRequests = productionRequests.filter((url) =>
  url.includes("ArchiveSequence"),
);
await production.locator("#chapter").scrollIntoViewIfNeeded();
await production.locator(".archive-sequence").waitFor();
await production.waitForFunction(
  () => document.querySelector(".archive-canvas")?.dataset.webgl === "ready",
);
const afterIntersectionArchiveRequests = productionRequests.filter((url) =>
  url.includes("ArchiveSequence"),
);
const productionDebugCount = await production.locator(
  ".archive-debug-panel",
).count();

const development = await browser.newPage({
  viewport: { width: 1440, height: 900 },
});
await development.goto(developmentUrl, { waitUntil: "networkidle" });
await development.locator(".archive-debug-panel").waitFor();
const debugText = await development.locator(".archive-debug-panel").innerText();

await browser.close();

const result = {
  initialArchiveRequests,
  afterIntersectionArchiveRequests,
  productionDebugCount,
  debugPanelHasSnapshot: debugText.includes("NARRATIVE SNAPSHOT"),
  debugPanelHasTestConfig: debugText.includes("debug-capsule-02"),
  debugPanelHasDifferentMotion:
    debugText.includes("counterclockwise") &&
    debugText.includes("four-panel") &&
    debugText.includes("debug-split-right"),
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

if (
  result.initialArchiveRequests.length !== 0 ||
  result.afterIntersectionArchiveRequests.length === 0 ||
  result.productionDebugCount !== 0 ||
  !result.debugPanelHasSnapshot ||
  !result.debugPanelHasTestConfig ||
  !result.debugPanelHasDifferentMotion
) {
  process.exitCode = 1;
}
