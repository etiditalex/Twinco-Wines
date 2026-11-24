import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import shelf from "../src/content/shelf.json" with { type: "json" };

const root = path.resolve(import.meta.dirname, "..");
const assets = "C:/Users/ZBook/.cursor/projects/c-Users-ZBook-Desktop-Twinco-Wines/assets";
const sampleOnly = process.argv.includes("--sample");

const molds = {
  "round-amber": { file: "whisky-bottle-1.jpg", box: [0.355, 0.44, 0.29, 0.36] },
  "green-malt": { file: "whisky-bottle-2.jpg", box: [0.375, 0.4, 0.25, 0.38] },
  "square-bourbon": { file: "whisky-bottle-3.jpg", box: [0.34, 0.42, 0.32, 0.3] },
  "square-dark": { file: "bottle-square-dark.jpg", box: [0.31, 0.39, 0.38, 0.38] },
  "triangular-green": { file: "bottle-triangular-green.jpg", box: [0.375, 0.38, 0.25, 0.34] },
  "beer-brown": { file: "beer-bottle-1.jpg", box: [0.385, 0.44, 0.23, 0.32] },
  "beer-can": { file: "beer-bottle-2.jpg", box: [0.36, 0.4, 0.28, 0.26] },
  "beer-green": { file: "bottle-green-beer.jpg", box: [0.385, 0.44, 0.23, 0.26] },
  stout: { file: "bottle-stout.jpg", box: [0.39, 0.48, 0.22, 0.22] },
  wine: { file: "wine-bottle-1.jpg", box: [0.385, 0.44, 0.23, 0.28] },
  cognac: { file: "cognac-bottle-1.jpg", box: [0.36, 0.42, 0.28, 0.28] },
  "slender-clear": { file: "vodka-bottle-1.jpg", box: [0.39, 0.44, 0.22, 0.26] },
  frosted: { file: "bottle-frosted.jpg", box: [0.39, 0.46, 0.22, 0.2] },
  rum: { file: "rum-bottle-1.jpg", box: [0.36, 0.48, 0.28, 0.22] },
  tequila: { file: "tequila-bottle-1.jpg", box: [0.4, 0.5, 0.2, 0.22] },
  champagne: { file: "champagne-bottle-1.jpg", box: [0.38, 0.64, 0.24, 0.16] },
  "gin-green": { file: "gin-bottle-1.jpg", box: [0.37, 0.4, 0.26, 0.28] },
  "blue-gin": { file: "bottle-blue-gin.jpg", box: [0.4, 0.36, 0.2, 0.3] },
  liqueur: { file: "liqueur-bottle-1.jpg", box: [0.32, 0.4, 0.36, 0.32] },
  brandy: { file: "brandy-bottle-1.jpg", box: [0.37, 0.44, 0.26, 0.26] },
};

const aisleMolds = {
  whisky: ["round-amber", "green-malt", "square-bourbon", "square-dark", "triangular-green"],
  beers: ["beer-brown", "beer-green", "beer-can", "stout"],
  cognac: ["cognac", "brandy", "round-amber"],
  vodka: ["slender-clear", "frosted", "blue-gin"],
  rum: ["rum", "round-amber", "square-bourbon"],
  tequila: ["tequila", "slender-clear", "frosted"],
  gin: ["gin-green", "blue-gin", "slender-clear", "square-dark"],
  brandy: ["brandy", "cognac", "round-amber"],
  liqueur: ["liqueur", "cognac", "square-dark", "slender-clear"],
  champagne: ["champagne"],
  wine: ["wine", "green-malt", "champagne"],
};

const palettes = [
  { label: "#14110e", text: "#f0d78c", accent: "#f0d78c" },
  { label: "#f6f1e6", text: "#1c140c", accent: "#8a1c1c" },
  { label: "#7a1420", text: "#f7f1e3", accent: "#e8d5a3" },
  { label: "#10281c", text: "#f3e7c5", accent: "#d4af37" },
  { label: "#10243f", text: "#f4f7fb", accent: "#d4af37" },
  { label: "#f7f4ee", text: "#1a2744", accent: "#1a2744" },
  { label: "#3b2415", text: "#f6e7c1", accent: "#e0b15a" },
  { label: "#2a1248", text: "#f6e7a8", accent: "#f6e7a8" },
  { label: "#f3c31a", text: "#1a1a1a", accent: "#1a1a1a" },
  { label: "#0e6b3c", text: "#f4f7fb", accent: "#d4af37" },
];

const styled = {
  "johnnie walker": { mold: "square-dark", label: "#111111", text: "#e8c872", accent: "#e8c872", display: "Johnnie Walker" },
  "jack daniel's": { mold: "square-bourbon", label: "#111111", text: "#ffffff", accent: "#c4a35a", display: "Jack Daniel's" },
  "jack daniels": { mold: "square-bourbon", label: "#111111", text: "#ffffff", accent: "#c4a35a", display: "Jack Daniel's" },
  "jack daniel": { mold: "square-bourbon", label: "#111111", text: "#ffffff", accent: "#c4a35a", display: "Jack Daniel's" },
  "gentleman jack": { mold: "square-bourbon", label: "#111111", text: "#ffffff", accent: "#c4a35a", display: "Gentleman Jack" },
  "jim beam": { mold: "square-bourbon", label: "#f7f4ee", text: "#9b1b1b", accent: "#9b1b1b", display: "Jim Beam" },
  "chivas regal": { mold: "round-amber", label: "#1a140c", text: "#f0d78c", accent: "#f0d78c", display: "Chivas Regal" },
  chivas: { mold: "round-amber", label: "#1a140c", text: "#f0d78c", accent: "#f0d78c", display: "Chivas" },
  glenfiddich: { mold: "triangular-green", label: "#f7f1e4", text: "#1d3b2a", accent: "#b08d3e", display: "Glenfiddich" },
  "the glenlivet": { mold: "green-malt", label: "#f6f0e4", text: "#163024", accent: "#8a6232", display: "The Glenlivet" },
  glenlivet: { mold: "green-malt", label: "#f6f0e4", text: "#163024", accent: "#8a6232", display: "Glenlivet" },
  "the macallan": { mold: "round-amber", label: "#f3e6cf", text: "#3a2415", accent: "#8c1d1d", display: "The Macallan" },
  macallan: { mold: "round-amber", label: "#f3e6cf", text: "#3a2415", accent: "#8c1d1d", display: "Macallan" },
  jameson: { mold: "green-malt", label: "#f4efe2", text: "#14281c", accent: "#1b4d2e", display: "Jameson" },
  "highland park": { mold: "square-dark", label: "#1c120c", text: "#f0d2a0", accent: "#d4652f", display: "Highland Park" },
  aberlour: { mold: "round-amber", label: "#140e0a", text: "#f2e2b8", accent: "#c6a15b", display: "Aberlour" },
  "the balvenie": { mold: "green-malt", label: "#f7f3ea", text: "#2a2118", accent: "#8a6a32", display: "The Balvenie" },
  balvenie: { mold: "green-malt", label: "#f7f3ea", text: "#2a2118", accent: "#8a6a32", display: "Balvenie" },
  "the famous grouse": { mold: "round-amber", label: "#f4efe6", text: "#7d1d1d", accent: "#7d1d1d", display: "Famous Grouse" },
  "famous grouse": { mold: "round-amber", label: "#f4efe6", text: "#7d1d1d", accent: "#7d1d1d", display: "Famous Grouse" },
  "crown royal": { mold: "square-dark", label: "#3a1864", text: "#f6e7a8", accent: "#f6e7a8", display: "Crown Royal" },
  ballantines: { mold: "round-amber", label: "#f7f4ee", text: "#1a2744", accent: "#8a1c1c", display: "Ballantine's" },
  ballantine: { mold: "round-amber", label: "#f7f4ee", text: "#1a2744", accent: "#8a1c1c", display: "Ballantine's" },
  "dewar's": { mold: "round-amber", label: "#10233f", text: "#f4f7fb", accent: "#d4af37", display: "Dewar's" },
  dewars: { mold: "round-amber", label: "#10233f", text: "#f4f7fb", accent: "#d4af37", display: "Dewar's" },
  dewar: { mold: "round-amber", label: "#10233f", text: "#f4f7fb", accent: "#d4af37", display: "Dewar's" },
  "grant's": { mold: "triangular-green", label: "#f4efe4", text: "#6b1d1d", accent: "#6b1d1d", display: "Grant's" },
  grants: { mold: "triangular-green", label: "#f4efe4", text: "#6b1d1d", accent: "#6b1d1d", display: "Grant's" },
  "the singleton": { mold: "green-malt", label: "#0e2418", text: "#f3e7c4", accent: "#d4af37", display: "The Singleton" },
  singleton: { mold: "green-malt", label: "#0e2418", text: "#f3e7c4", accent: "#d4af37", display: "Singleton" },
  glenmorangie: { mold: "slender-clear", label: "#f6f1e6", text: "#1c140c", accent: "#8a6232", display: "Glenmorangie" },
  laphroaig: { mold: "green-malt", label: "#f4f0e6", text: "#1a1a1a", accent: "#1a1a1a", display: "Laphroaig" },
  talisker: { mold: "green-malt", label: "#14281f", text: "#f4ead2", accent: "#c45a2a", display: "Talisker" },
  "monkey shoulder": { mold: "round-amber", label: "#f6f1e4", text: "#1a1a1a", accent: "#c45a2a", display: "Monkey Shoulder" },
  "wild turkey": { mold: "square-bourbon", label: "#6b1d1d", text: "#f6e7c1", accent: "#f6e7c1", display: "Wild Turkey" },
  "caol ila": { mold: "green-malt", label: "#f4f0e6", text: "#1a1a1a", accent: "#1a1a1a", display: "Caol Ila" },
  "glen moray": { mold: "green-malt", label: "#f6f0e4", text: "#163024", accent: "#8a6232", display: "Glen Moray" },
  "paul john": { mold: "round-amber", label: "#1a140c", text: "#f0d78c", accent: "#f0d78c", display: "Paul John" },
  "cutty sark": { mold: "slender-clear", label: "#f7f4ee", text: "#1a2744", accent: "#c9a227", display: "Cutty Sark" },
  jura: { mold: "green-malt", label: "#f4efe2", text: "#1a1a1a", accent: "#1a1a1a", display: "Jura" },
  "tullamore dew": { mold: "green-malt", label: "#f4efe2", text: "#1a3a24", accent: "#1a3a24", display: "Tullamore Dew" },
  tullamore: { mold: "green-malt", label: "#f4efe2", text: "#1a3a24", accent: "#1a3a24", display: "Tullamore" },
  bushmills: { mold: "green-malt", label: "#10233f", text: "#f4f7fb", accent: "#d4af37", display: "Bushmills" },
  nikka: { mold: "round-amber", label: "#111111", text: "#f4f1ea", accent: "#c4a35a", display: "Nikka" },
  hibiki: { mold: "round-amber", label: "#f6f1e6", text: "#1a1a1a", accent: "#8a6232", display: "Hibiki" },
  yamazaki: { mold: "round-amber", label: "#f3e6cf", text: "#3a2415", accent: "#8c1d1d", display: "Yamazaki" },
  hakushu: { mold: "green-malt", label: "#f6f0e4", text: "#163024", accent: "#163024", display: "Hakushu" },
  hennessy: { mold: "cognac", label: "#1a120c", text: "#f0d78c", accent: "#f0d78c", display: "Hennessy" },
  "remy martin": { mold: "cognac", label: "#1a120c", text: "#f6e7b2", accent: "#a67c2d", display: "Rémy Martin" },
  martell: { mold: "cognac", label: "#0e1c33", text: "#f4e7c3", accent: "#d4af37", display: "Martell" },
  courvoisier: { mold: "cognac", label: "#f6f1e6", text: "#1a140e", accent: "#8a1c1c", display: "Courvoisier" },
  camus: { mold: "cognac", label: "#1a120c", text: "#f0d78c", accent: "#f0d78c", display: "Camus" },
  absolut: { mold: "slender-clear", label: "#f7f7f7", text: "#1a3c8b", accent: "#1a3c8b", display: "Absolut" },
  "grey goose": { mold: "frosted", label: "#f4f2ee", text: "#1c1c1c", accent: "#b08d3e", display: "Grey Goose" },
  smirnoff: { mold: "slender-clear", label: "#f7f7f7", text: "#b11226", accent: "#1a1a1a", display: "Smirnoff" },
  ciroc: { mold: "frosted", label: "#f7f7f7", text: "#111111", accent: "#b0b0b0", display: "Cîroc" },
  belvedere: { mold: "frosted", label: "#f7f7f7", text: "#1a1a1a", accent: "#8a6232", display: "Belvedere" },
  "ketel one": { mold: "frosted", label: "#f7f7f7", text: "#1a2744", accent: "#1a2744", display: "Ketel One" },
  "russian standard": { mold: "slender-clear", label: "#f7f7f7", text: "#1a2744", accent: "#8a1c1c", display: "Russian Standard" },
  stolichnaya: { mold: "slender-clear", label: "#f7f7f7", text: "#b11226", accent: "#c9a227", display: "Stolichnaya" },
  skyy: { mold: "blue-gin", label: "#12315c", text: "#f4f7fb", accent: "#f4f7fb", display: "Skyy" },
  bacardi: { mold: "slender-clear", label: "#f7f7f7", text: "#b11226", accent: "#b11226", display: "Bacardi" },
  "captain morgan": { mold: "rum", label: "#1a120c", text: "#f0d78c", accent: "#f0d78c", display: "Captain Morgan" },
  "havana club": { mold: "rum", label: "#f6f1e4", text: "#8a1c1c", accent: "#1a1a1a", display: "Havana Club" },
  "mount gay": { mold: "rum", label: "#f6f1e4", text: "#1a2744", accent: "#8a6232", display: "Mount Gay" },
  "appleton estate": { mold: "rum", label: "#f4efe6", text: "#6b1d1d", accent: "#1a1a1a", display: "Appleton Estate" },
  appleton: { mold: "rum", label: "#f4efe6", text: "#6b1d1d", accent: "#1a1a1a", display: "Appleton" },
  "ron zacapa": { mold: "rum", label: "#1a120c", text: "#f0d78c", accent: "#f0d78c", display: "Ron Zacapa" },
  "don julio": { mold: "slender-clear", label: "#f7f4ee", text: "#1a1a1a", accent: "#1a1a1a", display: "Don Julio" },
  "roca patron": { mold: "slender-clear", label: "#f7f7f7", text: "#1a1a1a", accent: "#c0a36e", display: "Roca Patrón" },
  patron: { mold: "slender-clear", label: "#f7f7f7", text: "#1a1a1a", accent: "#c0a36e", display: "Patrón" },
  "jose cuervo": { mold: "slender-clear", label: "#f6efd2", text: "#1a1a1a", accent: "#1f6b3a", display: "Jose Cuervo" },
  cuervo: { mold: "slender-clear", label: "#f6efd2", text: "#1a1a1a", accent: "#1f6b3a", display: "Cuervo" },
  "clase azul": { mold: "cognac", label: "#f4efe4", text: "#1a3a6b", accent: "#c6a15b", display: "Clase Azul" },
  olmeca: { mold: "slender-clear", label: "#f7f4ee", text: "#6b1d1d", accent: "#1a1a1a", display: "Olmeca" },
  espolon: { mold: "slender-clear", label: "#f7f4ee", text: "#1a1a1a", accent: "#c45a2a", display: "Espolòn" },
  "bombay sapphire": { mold: "blue-gin", label: "#12315c", text: "#f4f7fb", accent: "#d4af37", display: "Bombay Sapphire" },
  bombay: { mold: "blue-gin", label: "#12315c", text: "#f4f7fb", accent: "#d4af37", display: "Bombay" },
  tanqueray: { mold: "gin-green", label: "#f4f1ea", text: "#b11226", accent: "#1a1a1a", display: "Tanqueray" },
  hendrick: { mold: "square-dark", label: "#f6f1e6", text: "#1a1a1a", accent: "#1a1a1a", display: "Hendrick's" },
  "whitley neill": { mold: "gin-green", label: "#10233f", text: "#f4f7fb", accent: "#d4af37", display: "Whitley Neill" },
  "whitley neil": { mold: "gin-green", label: "#10233f", text: "#f4f7fb", accent: "#d4af37", display: "Whitley Neill" },
  gordons: { mold: "gin-green", label: "#f4f1ea", text: "#b11226", accent: "#1a1a1a", display: "Gordon's" },
  gordon: { mold: "gin-green", label: "#f4f1ea", text: "#b11226", accent: "#1a1a1a", display: "Gordon's" },
  beefeater: { mold: "slender-clear", label: "#f7f4ee", text: "#8a1c1c", accent: "#1a1a1a", display: "Beefeater" },
  "monkey 47": { mold: "square-dark", label: "#111111", text: "#f4f1ea", accent: "#c4a35a", display: "Monkey 47" },
  "moet & chandon": { mold: "champagne", label: "#f6f1e6", text: "#1a1a1a", accent: "#b08d3e", display: "Moët & Chandon" },
  moet: { mold: "champagne", label: "#f6f1e6", text: "#1a1a1a", accent: "#b08d3e", display: "Moët" },
  "veuve clicquot": { mold: "champagne", label: "#e2b423", text: "#1a1a1a", accent: "#1a1a1a", display: "Veuve Clicquot" },
  veuve: { mold: "champagne", label: "#e2b423", text: "#1a1a1a", accent: "#1a1a1a", display: "Veuve" },
  "dom perignon": { mold: "champagne", label: "#111111", text: "#f0d78c", accent: "#f0d78c", display: "Dom Pérignon" },
  "louis roederer": { mold: "champagne", label: "#f6f1e6", text: "#1a1a1a", accent: "#8a6232", display: "Louis Roederer" },
  "perrier jouet": { mold: "champagne", label: "#f6f1e6", text: "#1a2744", accent: "#c45a2a", display: "Perrier-Jouët" },
  "nicolas feuillatte": { mold: "champagne", label: "#f6f1e6", text: "#1a1a1a", accent: "#b08d3e", display: "Nicolas Feuillatte" },
  taittinger: { mold: "champagne", label: "#f6f1e6", text: "#1a1a1a", accent: "#8a1c1c", display: "Taittinger" },
  ruinart: { mold: "champagne", label: "#f6f1e6", text: "#1a1a1a", accent: "#8a6232", display: "Ruinart" },
  krug: { mold: "champagne", label: "#f6f1e6", text: "#6b1d1d", accent: "#6b1d1d", display: "Krug" },
  tusker: { mold: "beer-brown", label: "#e3b13a", text: "#1a1a1a", accent: "#8a1c1c", display: "Tusker" },
  "white cap": { mold: "beer-brown", label: "#f4f7fb", text: "#16324f", accent: "#c9a227", display: "White Cap" },
  guinness: { mold: "stout", label: "#111111", text: "#f4f1ea", accent: "#c6a15b", display: "Guinness" },
  heineken: { mold: "beer-green", label: "#f4f7fb", text: "#0e6b3c", accent: "#c9a227", display: "Heineken" },
  corona: { mold: "slender-clear", label: "#f7f4ee", text: "#1a3c6e", accent: "#c9a227", display: "Corona" },
  carlsberg: { mold: "beer-green", label: "#f4f7fb", text: "#0e6b3c", accent: "#c9a227", display: "Carlsberg" },
  tuborg: { mold: "beer-green", label: "#f4f7fb", text: "#0e6b3c", accent: "#c9a227", display: "Tuborg" },
  bavaria: { mold: "beer-brown", label: "#f4efe6", text: "#6b1d1d", accent: "#1a1a1a", display: "Bavaria" },
  windhoek: { mold: "beer-brown", label: "#f4f7fb", text: "#1a3c6e", accent: "#c9a227", display: "Windhoek" },
  baileys: { mold: "liqueur", label: "#1a120c", text: "#f0d78c", accent: "#f0d78c", display: "Baileys" },
  amarula: { mold: "liqueur", label: "#6b3a12", text: "#f6e7c1", accent: "#f6e7c1", display: "Amarula" },
  kahlua: { mold: "liqueur", label: "#c6a15b", text: "#1a120c", accent: "#1a120c", display: "Kahlúa" },
  "southern comfort": { mold: "liqueur", label: "#6b1d1d", text: "#f6e7c1", accent: "#f6e7c1", display: "Southern Comfort" },
  "grand marnier": { mold: "cognac", label: "#b11226", text: "#f6e7c1", accent: "#f0d78c", display: "Grand Marnier" },
  "st remy": { mold: "cognac", label: "#1a120c", text: "#f0d78c", accent: "#f0d78c", display: "St-Rémy" },
  kwv: { mold: "brandy", label: "#f6f1e6", text: "#6b1d1d", accent: "#1a1a1a", display: "KWV" },
};

const styleKeys = Object.keys(styled).sort((a, b) => b.length - a.length);
const skipSecond = new Set([
  "old", "year", "years", "yo", "vs", "vsop", "xo", "extra", "special", "reserve", "premium",
  "original", "black", "red", "gold", "blue", "white", "green", "pink", "silver", "dark", "light",
  "aged", "rare", "double", "single", "malt", "blended", "whisky", "whiskey", "vodka", "gin", "rum",
  "beer", "brandy", "cognac", "tequila", "champagne", "bottle", "can", "pack", "label", "litre", "liter",
]);

function hash(value) {
  let h = 2166136261;
  for (const char of value) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return h >>> 0;
}

function titleCase(value) {
  return value.replace(/\p{L}[\p{L}\p{N}'’]*/gu, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function fileName(slug) {
  return slug.replace(/[<>:"/\\|?*]/g, "-");
}

function splitName(name) {
  const folded = name.toLowerCase().replace(/\s+/g, " ").trim();
  for (const key of styleKeys) {
    if (folded === key || folded.startsWith(`${key} `)) {
      return { key, brand: styled[key].display, expression: titleCase(name.slice(key.length).trim()) };
    }
  }
  const words = name.trim().split(/\s+/);
  let count = 1;
  if (words[1] && !skipSecond.has(words[1].toLowerCase()) && !/^\d/.test(words[1])) count = 2;
  const raw = words.slice(0, count).join(" ");
  return { key: raw.toLowerCase(), brand: titleCase(raw), expression: titleCase(words.slice(count).join(" ")) };
}

function lookFor(aisle, key) {
  const known = styled[key];
  if (known && molds[known.mold]) return known;
  const pool = aisleMolds[aisle] ?? aisleMolds.whisky;
  const palette = palettes[hash(key) % palettes.length];
  return { mold: pool[hash(`${key}:${aisle}`) % pool.length], ...palette, display: titleCase(key) };
}

function linesFor(value, maxChars, limit) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, limit);
}

function labelSvg(brand, expression, style, width, height) {
  const [fx, fy, fw, fh] = molds[style.mold].box;
  const x = fx * width;
  const y = fy * height;
  const w = fw * width;
  const h = fh * height;
  const brandLines = linesFor(brand.toUpperCase(), 11, 2);
  const expressionLines = linesFor(expression, 18, h < 190 ? 1 : 2).filter(Boolean);
  const longest = Math.max(...brandLines.map((line) => line.length), 1);
  const brandSize = Math.max(15, Math.min(h * 0.24, (w * 0.88) / (longest * 0.95)));
  const expressionSize = Math.max(14, Math.min(brandSize * 0.62, h * 0.16));
  const block = brandLines.length * brandSize * 1.05 + (expressionLines.length ? 8 + expressionLines.length * expressionSize * 1.15 : 0);
  let cursor = y + (h - block) / 2 + brandSize * 0.8;
  const brandText = brandLines
    .map((line, index) => {
      const dy = index === 0 ? 0 : brandSize * 1.05;
      return `<tspan x="${x + w / 2}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");
  const expressionStart = cursor + brandLines.length * brandSize * 1.05 + 8;
  const expressionText = expressionLines
    .map((line, index) => `<tspan x="${x + w / 2}" dy="${index === 0 ? 0 : expressionSize * 1.15}">${escapeXml(line)}</tspan>`)
    .join("");
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${style.label}"/>
    <rect x="${x}" y="${y}" width="${w}" height="5" fill="${style.accent}"/>
    <text x="${x + w / 2}" y="${cursor}" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="${brandSize}" font-weight="700" fill="${style.text}">${brandText}</text>
    ${expressionLines.length ? `<text x="${x + w / 2}" y="${expressionStart}" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="${expressionSize}" fill="${style.text}">${expressionText}</text>` : ""}
  </svg>`;
}

const loaded = {};
for (const [key, spec] of Object.entries(molds)) {
  const buf = await sharp(path.join(assets, spec.file)).jpeg({ quality: 86 }).toBuffer();
  const meta = await sharp(buf).metadata();
  loaded[key] = { buf, width: meta.width ?? 1024, height: meta.height ?? 1024 };
}

const labeledDir = path.join(root, "public", "products", sampleOnly ? "labeled-sample" : "labeled");
await mkdir(labeledDir, { recursive: true });

const images = {};
let labeled = 0;
const sampleNames = ["aberlour 18", "johnnie walker red", "chivas regal 12", "glenfiddich 15", "jameson black", "tusker cider", "moet", "grey goose", "captain morgan", "highland park"];
const seenSamples = new Set();
for (const [aisle, page] of Object.entries(shelf.aisles)) {
  for (const drink of page.drinks) {
    if (sampleOnly) {
      const hit = sampleNames.find((name) => drink.name.toLowerCase().includes(name));
      if (!hit || seenSamples.has(hit)) continue;
      seenSamples.add(hit);
    }
    const parts = splitName(drink.name);
    const style = lookFor(aisle, parts.key);
    const base = loaded[style.mold];
    const svg = labelSvg(parts.brand, parts.expression, style, base.width, base.height);
    const out = path.join(labeledDir, `${fileName(drink.slug)}.jpg`);
    await sharp(base.buf)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 82 })
      .toFile(out);
    images[drink.slug] = `/products/labeled/${fileName(drink.slug)}.jpg`;
    labeled += 1;
  }
}

if (!sampleOnly) {
  await writeFile(path.join(root, "src", "content", "bottle-images.json"), JSON.stringify(images));
}
console.log(JSON.stringify({ drinks: Object.keys(images).length, labeled, sampleOnly }));
