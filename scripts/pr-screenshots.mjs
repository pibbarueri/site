// Takes full-page screenshots of the site for pull request descriptions.
//
// Usage (the site must already be running, e.g. `npm run build && npm run start`):
//   node scripts/pr-screenshots.mjs <out-dir> [path ...]
//
// Examples:
//   node scripts/pr-screenshots.mjs /tmp/shots              # every page
//   node scripts/pr-screenshots.mjs /tmp/shots / /contato   # only these pages
//
// Env: BASE_URL (default http://localhost:3000), CHROME_PATH (default: Chromium or Chrome on macOS).
// Writes <name>-desktop.png and <name>-mobile.png for each page.
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const DEFAULT_PATHS = ["/", "/quem-somos", "/ministerios", "/agenda", "/mensagens", "/contato"];
const VIEWPORTS = {
  desktop: { width: 1280, height: 800, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const [outDir, ...pathArgs] = process.argv.slice(2);
if (!outDir) {
  console.error("Usage: node scripts/pr-screenshots.mjs <out-dir> [path ...]");
  process.exit(1);
}

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const executablePath =
  process.env.CHROME_PATH ??
  [
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].find(existsSync);
if (!executablePath) {
  console.error("Chrome not found. Set CHROME_PATH.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const paths = pathArgs.length ? pathArgs : DEFAULT_PATHS;
const nameFor = (path) => (path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-"));

// Lazy images only load when scrolled into view. Smooth scrolling is turned off first,
// otherwise the page is still animating back to the top (with the sticky header offset)
// when the screenshot is taken.
async function scrollThroughPage(page) {
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
}

const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
try {
  for (const [label, viewport] of Object.entries(VIEWPORTS)) {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    for (const path of paths) {
      await page.goto(baseUrl + path, { waitUntil: "load" });
      await scrollThroughPage(page);
      // Embeds (YouTube) and prefetching can keep the network busy forever, so don't fail on it.
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 8000 }).catch(() => {});
      const file = join(outDir, `${nameFor(path)}-${label}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(file);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
