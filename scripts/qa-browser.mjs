import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/wulai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});

const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
const errors = [];

page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`page: ${error.message}`));

await page.goto("http://localhost:5173/?qa=1", {
  waitUntil: "networkidle",
});

await page.locator("#hero-title").waitFor({ state: "visible" });
await page.screenshot({
  path: "implementation-hero-personal.png",
});
await page.locator("#chapter").scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.locator("#chapter").screenshot({
  path: "implementation-chapter-gridscan.png",
});
await page.locator(".chapter-portal__continue").click();
await page.waitForFunction(() => window.location.hash === "#profile");
await page.waitForTimeout(350);
await page.screenshot({
  path: "implementation-profile-viewport.png",
});
await page.locator("#profile").screenshot({
  path: "implementation-profile-personal.png",
});
const profileGuide = await page.locator(".archive-guide").evaluate((element) => ({
  visible: element.classList.contains("is-visible"),
  current: element.querySelector("[aria-current='page']")?.getAttribute("href"),
}));
await page.locator("#projects").screenshot({
  path: "implementation-projects-archive.png",
});
await page.locator("#capabilities").screenshot({
  path: "implementation-capabilities-museum.png",
});
await page.locator("#contact").screenshot({
  path: "implementation-contact-tickets.png",
});

await page.locator(".project-card__image").first().click();
await page.locator(".project-modal").waitFor({ state: "visible" });
const modalTitle = await page.locator("#project-modal-title").textContent();
await page.locator(".project-modal__close").click();
await page.locator(".project-modal").waitFor({ state: "detached" });

await page.locator('a[href="#profile"]').first().click();
await page.waitForFunction(() => window.location.hash === "#profile");

const emailHref = await page
  .locator('.contact__actions a[href^="mailto:"]')
  .getAttribute("href");
const phoneHref = await page
  .locator('.contact__actions a[href^="tel:"]')
  .getAttribute("href");

const mobilePage = await browser.newPage({
  viewport: { width: 390, height: 844 },
});
await mobilePage.goto("http://localhost:5173/?qa=1", {
  waitUntil: "networkidle",
});
await mobilePage.screenshot({
  path: "implementation-mobile-playwright.png",
});
await mobilePage.locator("#chapter").scrollIntoViewIfNeeded();
await mobilePage.waitForTimeout(600);
await mobilePage.locator("#chapter").screenshot({
  path: "implementation-mobile-chapter.png",
});
await mobilePage.locator("#profile").screenshot({
  path: "implementation-mobile-profile.png",
});
await mobilePage.locator("#capabilities").screenshot({
  path: "implementation-mobile-capabilities.png",
});
await mobilePage.locator("#contact").screenshot({
  path: "implementation-mobile-contact.png",
});
const mobileLayout = await mobilePage.evaluate(() => ({
  innerWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  contactRight: document
    .querySelector('.navigation a[href="#contact"]')
    ?.getBoundingClientRect().right,
}));

const interactionPage = await browser.newPage({
  viewport: { width: 1440, height: 1024 },
});
interactionPage.on("console", (message) => {
  if (message.type() === "error") errors.push(`interaction console: ${message.text()}`);
});
interactionPage.on("pageerror", (error) =>
  errors.push(`interaction page: ${error.message}`),
);
await interactionPage.goto("http://localhost:5173/", {
  waitUntil: "networkidle",
});
await interactionPage.waitForTimeout(1350);
const firstProject = interactionPage.locator(".project-card__image").first();
await firstProject.scrollIntoViewIfNeeded();
await interactionPage.waitForTimeout(1250);
await interactionPage.mouse.move(8, 8);
await firstProject.hover({ position: { x: 520, y: 250 } });
await interactionPage.waitForTimeout(220);
const tiltState = await firstProject.evaluate((element) => ({
  active: element.classList.contains("is-tilting"),
  hovered: element.matches(":hover"),
  tiltX: element.style.getPropertyValue("--tilt-x"),
  tiltY: element.style.getPropertyValue("--tilt-y"),
  transform: getComputedStyle(element).transform,
}));
await firstProject.screenshot({
  path: "implementation-project-hover.png",
});
const projectGuideCurrent = await interactionPage
  .locator(".archive-guide [aria-current='page']")
  .getAttribute("href");

const firstCapability = interactionPage.locator(".capability").first();
await firstCapability.scrollIntoViewIfNeeded();
await interactionPage.waitForTimeout(850);
await interactionPage.mouse.move(8, 8);
await firstCapability.hover();
await interactionPage.waitForTimeout(250);
const capabilityState = await firstCapability.evaluate((element) => ({
  iconTransform: getComputedStyle(element.querySelector(".capability__icon")).transform,
  signalWidth: getComputedStyle(
    element.querySelector(".capability__signal i"),
    "::after",
  ).width,
}));
await interactionPage.locator("#capabilities").screenshot({
  path: "implementation-capability-hover.png",
});

const contactTicket = interactionPage.locator(".contact__actions a").first();
await contactTicket.scrollIntoViewIfNeeded();
await interactionPage.waitForTimeout(550);
await interactionPage.mouse.move(8, 8);
await contactTicket.hover();
await interactionPage.waitForTimeout(250);
const ticketTransform = await contactTicket.evaluate(
  (element) => getComputedStyle(element).transform,
);
await interactionPage.locator("#contact").screenshot({
  path: "implementation-contact-ticket-hover.png",
});
const ticketBox = await contactTicket.boundingBox();
if (ticketBox) {
  await interactionPage.mouse.move(
    ticketBox.x + ticketBox.width / 2,
    ticketBox.y + ticketBox.height / 2,
  );
  await interactionPage.mouse.down();
}
const rippleCount = await interactionPage.locator(".memory-ripple").count();
await interactionPage.mouse.up();

const result = {
  heroVisible: true,
  projectModal: modalTitle?.trim(),
  navigationHash: await page.evaluate(() => window.location.hash),
  emailHref,
  phoneHref,
  profileGuide,
  projectGuideCurrent,
  tiltState,
  capabilityState,
  ticketTransform,
  rippleCount,
  mobileLayout,
  consoleErrors: errors,
};

await browser.close();
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

if (errors.length > 0) process.exitCode = 1;
