import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/wulai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: [
    "--enable-webgl",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--use-angle=swiftshader",
  ],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const messages = [];
page.on("console", (message) =>
  messages.push(`${message.type()}: ${message.text()}`),
);
page.on("pageerror", (error) => messages.push(`pageerror: ${error.stack}`));
page.on("requestfailed", (request) =>
  messages.push(`requestfailed: ${request.url()} ${request.failure()?.errorText}`),
);
await page.goto("http://localhost:5173/ruan-resume/?qa=1", {
  waitUntil: "networkidle",
});
await page.evaluate(() => {
  document.querySelector("#chapter")?.scrollIntoView();
});
await page.waitForTimeout(3500);
const result = await page.evaluate(() => ({
  chapter: Boolean(document.querySelector("#chapter")),
  canvas: Boolean(document.querySelector("#chapter .archive-canvas")),
  webgl: document.querySelector(".archive-canvas")?.dataset.webgl,
  model: document.querySelector(".archive-canvas")?.dataset.model,
  bodyText: document.body.innerText.slice(-500),
}));
await browser.close();
process.stdout.write(`${JSON.stringify({ result, messages }, null, 2)}\n`);
