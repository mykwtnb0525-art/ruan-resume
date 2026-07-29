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
    "--ignore-gpu-blocklist",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const baseUrl =
  process.argv[2] || "http://localhost:5173/ruan-resume/?qa=1";
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(baseUrl, {
  waitUntil: "networkidle",
});
await page.locator("#chapter").waitFor();
await page.locator("#chapter").scrollIntoViewIfNeeded();
await page.waitForFunction(() => {
  const status = document.querySelector(".archive-canvas")?.dataset.modelStatus;
  return status && status !== "loading";
});
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
});
await page.waitForTimeout(900);
const range = await page.locator("#chapter").evaluate((element) => ({
  start: Number(element.dataset.archiveStart),
  end: Number(element.dataset.archiveEnd),
}));

async function seekArchive(progress, timeout = 6000) {
  await page.evaluate(
    ({ range: nextRange, progress: nextProgress }) => {
      document.documentElement.style.setProperty(
        "scroll-behavior",
        "auto",
        "important",
      );
      const top =
        nextRange.start + (nextRange.end - nextRange.start) * nextProgress;
      window.scrollTo({ top, behavior: "instant" });
      document.documentElement.scrollTop = top;
      document.body.scrollTop = top;
      window.dispatchEvent(new Event("scroll"));
    },
    { range, progress },
  );
  try {
    await page.waitForFunction(
      (target) => {
        const actual = Number(
          document.querySelector("#chapter")?.dataset.progress || -1,
        );
        return Math.abs(actual - target) < 0.012;
      },
      progress,
      { timeout },
    );
  } catch (error) {
    const runtime = await page.locator("#chapter").evaluate(
      (element, target) => ({
        target,
        actual: element.dataset.progress,
        start: element.dataset.archiveStart,
        end: element.dataset.archiveEnd,
        scrollY: window.scrollY,
        innerProgress:
          element.querySelector(".archive-sequence")?.dataset.progress,
        innerStart:
          element.querySelector(".archive-sequence")?.dataset.archiveStart,
        innerEnd:
          element.querySelector(".archive-sequence")?.dataset.archiveEnd,
      }),
      progress,
    );
    throw new Error(
      `${error.message}\nArchive runtime: ${JSON.stringify(runtime)}`,
    );
  }
  await page.waitForTimeout(180);
}

const checkpoints = [
  0.001,
  0.15,
  0.34,
  0.5,
  0.59,
  0.697,
  0.756,
  0.814,
  0.902,
  0.966,
  0.993,
];
const states = [];
for (const progress of checkpoints) {
  await seekArchive(progress);
  states.push(
    await page.locator("#chapter").evaluate((element) => {
      const canvas = element.querySelector(".archive-canvas");
      const reveal = element.querySelector(".project-archive-reveal");
      return {
        phase: element.dataset.phase,
        progress: Number(element.dataset.progress),
        webgl: canvas?.dataset.webgl,
        model: canvas?.dataset.model,
        cameraZ: Number(canvas?.dataset.cameraZ),
        boot: Number(canvas?.dataset.machineBoot),
        capsule: Number(canvas?.dataset.capsule),
        capsuleOpen: Number(canvas?.dataset.capsuleOpen),
        capsuleAnchorX: Number(canvas?.dataset.capsuleAnchorX),
        capsuleAnchorY: Number(canvas?.dataset.capsuleAnchorY),
        revealClipPath: getComputedStyle(reveal).clipPath,
        hud: element.querySelector(".archive-hud__status")?.innerText || "",
        archived: Number(element.dataset.archived),
      };
    }),
  );
}
const reverseCheckpoints = [0.902, 0.814, 0.697, 0.59, 0.34];
const reverseStates = [];
for (const progress of reverseCheckpoints) {
  await seekArchive(progress);
  reverseStates.push(
    await page.locator("#chapter").evaluate((element) => ({
      phase: element.dataset.phase,
      progress: Number(element.dataset.progress),
      archived: Number(element.dataset.archived),
      activeArchives: [...element.querySelectorAll(".project-archive-reveal")]
        .filter((archive) => getComputedStyle(archive).visibility === "visible")
        .length,
    })),
  );
}

await page.evaluate(({ range: nextRange }) => {
  const first = nextRange.start + (nextRange.end - nextRange.start) * 0.59;
  const last = nextRange.start + (nextRange.end - nextRange.start) * 0.902;
  window.scrollTo({ top: first, behavior: "instant" });
  window.scrollTo({ top: last, behavior: "instant" });
}, { range });
await page.waitForFunction(() => {
  const progress = Number(
    document.querySelector("#chapter")?.dataset.progress || -1,
  );
  return Math.abs(progress - 0.902) < 0.012;
});
await page.waitForTimeout(180);
const rapidState = await page.locator("#chapter").evaluate((element) => {
  const canvas = element.querySelector(".archive-canvas");
  return {
    phase: element.dataset.phase,
    progress: Number(element.dataset.progress),
    capsule: Number(canvas?.dataset.capsule),
    capsuleOpen: Number(canvas?.dataset.capsuleOpen),
    activeArchives: [...element.querySelectorAll(".project-archive-reveal")]
      .filter((archive) => getComputedStyle(archive).visibility === "visible")
      .length,
  };
});

await seekArchive(0.756);
const dropBeforePause = await page.locator("#chapter").evaluate((element) => {
  const canvas = element.querySelector(".archive-canvas");
  return {
    phase: element.dataset.phase,
    progress: Number(element.dataset.progress),
    capsule: Number(canvas?.dataset.capsule),
    capsuleOpen: Number(canvas?.dataset.capsuleOpen),
  };
});
await page.waitForTimeout(700);
const dropAfterPause = await page.locator("#chapter").evaluate((element) => {
  const canvas = element.querySelector(".archive-canvas");
  return {
    phase: element.dataset.phase,
    progress: Number(element.dataset.progress),
    capsule: Number(canvas?.dataset.capsule),
    capsuleOpen: Number(canvas?.dataset.capsuleOpen),
  };
});

await seekArchive(0.84);
await seekArchive(0.814);
const emergeReverseState = await page
  .locator("#chapter")
  .evaluate((element) => ({
    phase: element.dataset.phase,
    progress: Number(element.dataset.progress),
    activeArchives: [...element.querySelectorAll(".project-archive-reveal")]
      .filter((archive) => getComputedStyle(archive).visibility === "visible")
      .length,
    canvasCount: element.querySelectorAll(".archive-canvas").length,
  }));

await seekArchive(0.84);
const refreshScrollY = await page.evaluate(() => window.scrollY);
await page.reload({ waitUntil: "networkidle" });
await page.locator("#chapter").waitFor();
await page.waitForFunction(() => {
  const status = document.querySelector(".archive-canvas")?.dataset.modelStatus;
  return status && status !== "loading";
});
await page.waitForFunction(() => {
  const progress = Number(
    document.querySelector("#chapter")?.dataset.progress || -1,
  );
  return Math.abs(progress - 0.84) < 0.025;
});
const refreshState = await page.locator("#chapter").evaluate((element) => ({
  phase: element.dataset.phase,
  progress: Number(element.dataset.progress),
  scrollY: window.scrollY,
  activeArchives: [...element.querySelectorAll(".project-archive-reveal")]
    .filter((archive) => getComputedStyle(archive).visibility === "visible")
    .length,
}));
const assets = await page.evaluate(async () => {
  const urls = [
    "/ruan-resume/models/archive-gashapon-web.glb",
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
  "KEY_IDLE",
  "ACCESS_GRANTED",
  "MACHINE_APPROACH",
  "MACHINE_AWAKE",
  "CAPSULE_IDENTIFY",
  "MACHINE_ACTIVATE",
  "CAPSULE_DISPENSE",
  "CAPSULE_OPEN",
  "ARCHIVE_READ",
  "ARCHIVE_CLOSE",
  "NEXT_CHAPTER_BRIDGE",
];
const result = {
  range,
  states,
  reverseStates,
  rapidState,
  dropBeforePause,
  dropAfterPause,
  emergeReverseState,
  refreshState,
  phasesCorrect: states.every((state, index) => state.phase === expected[index]),
  reversePhasesCorrect: reverseStates.every(
    (state, index) =>
      state.phase ===
      [
        "ARCHIVE_READ",
        "CAPSULE_OPEN",
        "MACHINE_ACTIVATE",
        "CAPSULE_IDENTIFY",
        "MACHINE_APPROACH",
      ][index],
  ),
  rapidSeekCorrect:
    rapidState.phase === "ARCHIVE_READ" &&
    rapidState.capsule > 0.9 &&
    rapidState.capsuleOpen > 0.9 &&
    rapidState.activeArchives === 1,
  dropPauseStable:
    dropBeforePause.phase === "CAPSULE_DISPENSE" &&
    dropAfterPause.phase === "CAPSULE_DISPENSE" &&
    Math.abs(dropBeforePause.progress - dropAfterPause.progress) < 0.002 &&
    Math.abs(dropBeforePause.capsule - dropAfterPause.capsule) < 0.002 &&
    dropAfterPause.capsuleOpen === 0,
  emergeReverseCorrect:
    emergeReverseState.phase === "CAPSULE_OPEN" &&
    emergeReverseState.activeArchives === 0 &&
    emergeReverseState.canvasCount === 1,
  cameraAdvanced: states[2].cameraZ < states[0].cameraZ,
  machineBooted: states[5].boot > 0.4,
  capsuleDispensed: states[6].capsule > 0.4,
  capsuleOpened: states[7].capsuleOpen > 0.4,
  archiveCommitted: states[10].archived === 1,
  nextCapsuleReady:
    states[10].hud.includes("02 / 06 READY") &&
    states[10].hud.includes("AWAITING INPUT"),
  archiveAnchored:
    Number.isFinite(states[7].capsuleAnchorX) &&
    Number.isFinite(states[7].capsuleAnchorY) &&
    states[7].revealClipPath.includes("circle"),
  refreshRestored:
    refreshState.phase === "ARCHIVE_EMERGE" &&
    Math.abs(refreshState.scrollY - refreshScrollY) < 80 &&
    refreshState.activeArchives === 1,
  assets,
  errors,
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (
  !result.phasesCorrect ||
  !result.reversePhasesCorrect ||
  !result.rapidSeekCorrect ||
  !result.dropPauseStable ||
  !result.emergeReverseCorrect ||
  !result.cameraAdvanced ||
  !result.machineBooted ||
  !result.capsuleDispensed ||
  !result.capsuleOpened ||
  !result.archiveCommitted ||
  !result.nextCapsuleReady ||
  !result.archiveAnchored ||
  !result.refreshRestored ||
  assets.some((asset) => !asset.ok) ||
  errors.length
) {
  process.exitCode = 1;
}
