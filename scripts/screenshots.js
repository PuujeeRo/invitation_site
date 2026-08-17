// Responsive screenshot + overflow check.
//
// Guests open invitations on phones from Messenger, and the narrowest device we
// support is the Galaxy Fold's 280px outer screen -- so every page gets checked
// there, not just at a comfortable phone width. Also fails on any horizontal
// page overflow, which is the layout bug that actually bites on narrow screens.
//
// Usage:
//   npm run dev -- -p 3002
//   npx playwright install chromium   # first run only
//   node scripts/screenshots.js       # writes into docs/screenshots/
//
// playwright is intentionally NOT a project dependency (it would add ~200MB of
// browser download to every install for a tool only used when checking layout).
// Install it on demand:  npm install --no-save playwright

const { chromium } = require("playwright");
const path = require("path");

const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3002";
const OUT = path.join(__dirname, "..", "docs", "screenshots");

const SHOTS = [
  { name: "landing-galaxy-fold-280px", url: "/", w: 280, h: 1400 },
  { name: "landing-desktop", url: "/", w: 1280, h: 900 },
  { name: "demo-galaxy-fold-280px", url: "/demo", w: 280, h: 900 },
  { name: "demo-phone-390px", url: "/demo", w: 390, h: 900 },
];

(async () => {
  const browser = await chromium.launch();
  const issues = [];

  for (const shot of SHOTS) {
    const ctx = await browser.newContext({ viewport: { width: shot.w, height: shot.h } });
    const page = await ctx.newPage();
    page.on("pageerror", (err) => issues.push(`${shot.name}: ${err}`));

    await page.goto(`${BASE}${shot.url}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (overflow > 0) issues.push(`${shot.name}: horizontal overflow of ${overflow}px`);

    await page.screenshot({ path: path.join(OUT, `${shot.name}.png`), fullPage: true });
    await ctx.close();
  }

  await browser.close();

  if (issues.length) {
    console.error("Issues found:\n" + issues.map((i) => `  - ${i}`).join("\n"));
    process.exit(1);
  }
  console.log(`OK -- ${SHOTS.length} screenshots written to docs/screenshots/`);
})();
