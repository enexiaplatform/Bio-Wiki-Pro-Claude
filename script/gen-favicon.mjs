// One-off: rasterize client/public/favicon.svg → favicon.png (256x256) so the
// PNG fallback matches the current brand mark. Run: node script/gen-favicon.mjs
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const svg = await readFile(path.join(root, "client/public/favicon.svg"), "utf-8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 256, height: 256 }, deviceScaleFactor: 1 });
await page.setContent(
  `<!doctype html><html><body style="margin:0;padding:0">
   <div style="width:256px;height:256px">${svg.replace("<svg ", '<svg width="256" height="256" ')}</div>
   </body></html>`,
  { waitUntil: "networkidle" }
);
const buf = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: 256, height: 256 } });
await writeFile(path.join(root, "client/public/favicon.png"), buf);
await browser.close();
console.log("favicon.png written:", buf.length, "bytes");
