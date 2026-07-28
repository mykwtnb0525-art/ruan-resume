import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/wulai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const videoPath =
  "D:/谷歌下载/dreamina-2026-07-28-3945-Untitled projec_参考图片1作为首帧和唯一视觉参考，严格保持画面中....mp4";
const outputRoot = "D:/Codex/Outputs/archive-preview-frame";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.setContent(`
  <style>
    html, body { margin: 0; background: #08090b; width: 100%; height: 100%; }
    video { width: 100%; height: 100%; object-fit: contain; }
  </style>
  <video muted playsinline src="${pathToFileURL(videoPath).href}"></video>
`);
await page.locator("video").evaluate(
  (video) =>
    new Promise((resolve, reject) => {
      if (video.readyState >= 1) resolve();
      video.addEventListener("loadedmetadata", resolve, { once: true });
      video.addEventListener("error", reject, { once: true });
    }),
);

const duration = await page.locator("video").evaluate((video) => video.duration);
const times = [0, 2, 4, 6, Math.max(0, duration - 0.2)];
for (let index = 0; index < times.length; index += 1) {
  await page.locator("video").evaluate(
    (video, time) =>
      new Promise((resolve) => {
        const done = () => resolve();
        video.addEventListener("seeked", done, { once: true });
        video.currentTime = Math.min(time, Math.max(0, video.duration - 0.05));
        if (Math.abs(video.currentTime - time) < 0.01) {
          requestAnimationFrame(done);
        }
      }),
    times[index],
  );
  await page.locator("video").screenshot({
    path: `${outputRoot}-${index + 1}.png`,
  });
}

await browser.close();
process.stdout.write(JSON.stringify({ duration, frames: times }, null, 2));
