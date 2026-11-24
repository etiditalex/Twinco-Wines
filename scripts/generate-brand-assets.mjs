import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const brandDir = path.join(root, "public", "brand");
const productDir = path.join(root, "public", "products");
const logoSource = "C:\\Users\\ZBook\\Downloads\\twinco wines logo.jpeg";

fs.mkdirSync(brandDir, { recursive: true });
fs.mkdirSync(productDir, { recursive: true });

function bottleSvg(styleLabel, wine) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <rect width="600" height="800" fill="#f4f8fc"/>
  <text x="300" y="58" text-anchor="middle" font-family="Georgia, serif" font-size="16" letter-spacing="4" fill="#0c2340">PREVIEW IMAGE</text>
  <rect x="274" y="92" width="52" height="58" rx="3" fill="#0c2340"/>
  <rect x="286" y="148" width="28" height="118" fill="#f7f5f2" stroke="#0c2340" stroke-width="3"/>
  <path d="M286 262 C286 262 214 300 206 372 L206 620 C206 676 246 712 300 712 C354 712 394 676 394 620 L394 372 C386 300 314 262 314 262 Z" fill="#f7f5f2" stroke="#0c2340" stroke-width="3"/>
  <path d="M214 500 L214 620 C214 668 250 700 300 700 C350 700 386 668 386 620 L386 500 Z" fill="${wine}"/>
  <rect x="232" y="430" width="136" height="108" rx="2" fill="#ffffff" stroke="#d3e1f0"/>
  <text x="300" y="478" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="#0c2340">TwinCO</text>
  <text x="300" y="506" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#0048e0">${styleLabel}</text>
  <text x="300" y="756" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#4d5d73">Replace this file with approved photography</text>
</svg>`;
}

const products = [
  ["nederburg-classic-cabernet-sauvignon", "Red", "#6e2433"],
  ["casillero-del-diablo-cabernet-sauvignon", "Red", "#6e2433"],
  ["jacobs-creek-classic-shiraz", "Red", "#6e2433"],
  ["four-cousins-natural-sweet-red", "Red", "#8a3a4a"],
  ["durbanville-hills-sauvignon-blanc", "White", "#c6a15a"],
  ["nederburg-winemasters-sauvignon-blanc", "White", "#c6a15a"],
  ["boschendal-1685-chardonnay", "White", "#b9924a"],
  ["la-vieille-ferme-rose", "Rosé", "#d98aa0"],
  ["nederburg-classic-rose", "Rosé", "#e2a0b4"],
  ["graham-beck-brut", "Sparkling", "#8eacc8"],
  ["pongracz-brut", "Sparkling", "#8eacc8"],
];

const hero = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="#e7f0fa"/>
  <circle cx="600" cy="470" r="280" fill="#d7e6f6"/>
  <rect x="548" y="120" width="64" height="72" rx="4" fill="#0c2340"/>
  <rect x="564" y="190" width="32" height="130" fill="#f7f5f2" stroke="#0c2340" stroke-width="4"/>
  <path d="M564 316 C564 316 470 360 460 450 L460 680 C460 748 510 792 600 792 C690 792 740 748 740 680 L740 450 C730 360 636 316 636 316 Z" fill="#f7f5f2" stroke="#0c2340" stroke-width="4"/>
  <path d="M476 560 L476 680 C476 736 528 772 600 772 C672 772 724 736 724 680 L724 560 Z" fill="#6e2433"/>
  <rect x="500" y="470" width="200" height="130" fill="#ffffff" stroke="#d3e1f0"/>
  <text x="600" y="530" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#0c2340">TwinCO</text>
  <text x="600" y="566" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#0048e0">Nyali</text>
  <g transform="translate(860 250)">
    <path d="M70 20 C70 20 20 20 20 78 C20 130 50 160 70 168 C90 160 120 130 120 78 C120 20 70 20 70 20 Z" fill="none" stroke="#0c2340" stroke-width="6"/>
    <path d="M36 78 C48 108 60 124 70 130 C80 124 92 108 104 78 Z" fill="#6e2433"/>
    <rect x="64" y="168" width="12" height="90" fill="#0c2340"/>
    <ellipse cx="70" cy="268" rx="46" ry="10" fill="#0c2340"/>
  </g>
  <text x="600" y="860" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#4d5d73">Placeholder illustration. Replace public/brand/hero-placeholder.png</text>
</svg>`;

const logoImage = sharp(logoSource).flatten({ background: "#ffffff" });
const { data, info } = await logoImage
  .clone()
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

let best = null;
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const score = b - Math.max(r, g);
  if (b > 90 && score > 50 && (!best || score > best.score)) {
    best = { r, g, b, score };
  }
}

const logoPath = path.join(brandDir, "twinco-wines-logo.png");
const trimmed = await sharp(logoSource)
  .flatten({ background: "#ffffff" })
  .trim({ threshold: 18 })
  .png()
  .toBuffer({ resolveWithObject: true });
await sharp(trimmed.data).png().toFile(logoPath);

await sharp(Buffer.from(hero)).png().toFile(path.join(brandDir, "hero-placeholder.png"));

for (const [slug, label, wine] of products) {
  await sharp(Buffer.from(bottleSvg(label, wine)))
    .png()
    .toFile(path.join(productDir, `${slug}.png`));
}

const hex = best
  ? `#${[best.r, best.g, best.b].map((n) => n.toString(16).padStart(2, "0")).join("")}`
  : "not-found";

console.log(JSON.stringify({ logoBlue: hex, logo: trimmed.info, source: info }, null, 2));
