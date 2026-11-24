import { writeFileSync } from "node:fs";
import { join } from "node:path";

const products = [
  ["nederburg-classic-cabernet-sauvignon", "Nederburg", "Cabernet", "red"],
  ["casillero-del-diablo-cabernet-sauvignon", "Concha y Toro", "Cabernet", "red"],
  ["jacobs-creek-classic-shiraz", "Jacob's Creek", "Shiraz", "red"],
  ["four-cousins-natural-sweet-red", "Van Loveren", "Sweet red", "red"],
  ["durbanville-hills-sauvignon-blanc", "Durbanville Hills", "Sauvignon", "white"],
  ["nederburg-winemasters-sauvignon-blanc", "Nederburg", "Sauvignon", "white"],
  ["boschendal-1685-chardonnay", "Boschendal", "Chardonnay", "white"],
  ["la-vieille-ferme-rose", "Famille Perrin", "Rosé", "rose"],
  ["nederburg-classic-rose", "Nederburg", "Rosé", "rose"],
  ["graham-beck-brut", "Graham Beck", "Brut", "sparkling"],
  ["pongracz-brut", "Pongrácz", "Brut", "sparkling"],
];

const tones = {
  red: { glass: "#6d1c2b", liquid: "#8e2436", foil: "#c6a15a" },
  white: { glass: "#8ea37a", liquid: "#f4e7b5", foil: "#ded6c6" },
  rose: { glass: "#c47d8b", liquid: "#e7a8b6", foil: "#e7c2ca" },
  sparkling: { glass: "#1d6b43", liquid: "#f3e7b0", foil: "#f4efe4" },
};

function esc(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bottle(producer, short, style) {
  const tone = tones[style];
  const cage =
    style === "sparkling"
      ? `<path d="M-10 2c4 6 5 10 4 14M0 0c4 7 4 11 3 15M10 2c3 6 4 10 3 14" fill="none" stroke="#c9a24a" stroke-width="1.5"/>`
      : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
  <rect width="500" height="500" fill="#ffffff"/>
  <g transform="translate(250 36)">
    <ellipse cx="0" cy="430" rx="72" ry="8" fill="#eef2f6"/>
    <path fill="${tone.glass}" d="M-10 70C-10 96-58 118-58 160V392Q-58 436 0 436Q58 436 58 392V160C58 118 10 96 10 70Z"/>
    <rect x="-9" y="22" width="18" height="52" fill="#f4efe6"/>
    <rect x="-13" y="0" width="26" height="24" rx="2" fill="${tone.foil}"/>
    ${cage}
    <path d="M-42 248H42V360Q42 392 0 392Q-42 392-42 360Z" fill="${tone.liquid}"/>
    <path d="M-48 150C-44 210-44 300-46 390" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="6"/>
    <rect x="-38" y="210" width="76" height="92" fill="#fbf8f2" stroke="#eadfce"/>
    <text x="0" y="250" text-anchor="middle" font-family="Georgia, Times, serif" font-size="12" fill="#1a1a1a" textLength="68" lengthAdjust="spacingAndGlyphs">${esc(producer)}</text>
    <text x="0" y="272" text-anchor="middle" font-family="Georgia, Times, serif" font-size="11" fill="#7a1f2b">${esc(short)}</text>
  </g>
</svg>
`;
}

const root = join(process.cwd(), "public", "products");
for (const [slug, producer, short, style] of products) {
  writeFileSync(join(root, `${slug}.svg`), bottle(producer, short, style));
}
console.log(`wrote ${products.length} bottles`);
