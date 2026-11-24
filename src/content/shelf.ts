import type { CatalogProduct } from "@/content/catalog";
import bottleImageData from "@/content/bottle-images.json";
import shelfData from "@/content/shelf.json";

type ShelfDrink = { slug: string; name: string; sizes: number[] };
type ShelfAisle = { title: string; types: { href: string; label: string }[]; drinks: ShelfDrink[] };
type ShelfBrand = { title: string; crumbs: string[]; drinks: ShelfDrink[] };

const bottleImages = bottleImageData as Record<string, string>;

const data = shelfData as {
  aisles: Record<string, ShelfAisle>;
  brands: Record<string, ShelfBrand>;
};

const kindWords: Record<string, string[]> = {
  "japanese-whisky": ["nikka", "hibiki", "yamazaki", "hakushu", "suntory", "japanese", "iwai", "akashi", "kamiki", "mars maltage"],
  "canadian-whisky": ["canadian", "crown royal"],
  "blended-scotch-whisky": ["johnnie", "chivas", "dewar", "grant", "ballantine", "famous grouse", "j&b", "monkey shoulder"],
  "american-bourbon-whisky": ["bourbon", "buffalo", "woodford", "maker", "knob creek", "jim beam", "bulleit", "benchmark", "basil hayden"],
  "tennessee-whiskey": ["jack daniel", "gentleman jack"],
  "indian-whisky": ["indian", "amrut", "paul john", "8 pm", "neptune", "aristocrat", "after dark"],
  "irish-whisky": ["jameson", "tullamore", "bushmills", "teeling", "proper no", "midleton", "powers", "sexton"],
  "single-malt": ["glenfiddich", "glenlivet", "macallan", "laphroaig", "glenmorangie", "singleton", "talisker", "balvenie", "highland park", "aberlour", "single malt"],
  "rye-whisky": [" rye", "rye"],
  "blended-whisky": ["johnnie", "chivas", "dewar", "blended"],
};

const producerBrand: Record<string, string> = {
  "Johnnie Walker": "johnnie-walker",
  Glenfiddich: "glenfiddich",
  Jameson: "jameson-irish-whiskey",
  Tusker: "tusker",
  Absolut: "absolut-vodka",
  Tanqueray: "tanqueray",
  Bacardi: "bacardi-rum",
  Hennessy: "hennessy",
  "Jose Cuervo": "jose-cuervo",
  Baileys: "baileys-brand",
  Amarula: "amarula",
  Nederburg: "nederburg",
  "Four Cousins": "four-cousins",
  "Van Loveren": "four-cousins",
};

const slugAisle = new Map<string, string>();
for (const [aisle, page] of Object.entries(data.aisles)) {
  for (const drink of page.drinks) {
    if (!slugAisle.has(drink.slug)) slugAisle.set(drink.slug, aisle);
  }
}

function examplePrice(sizeMl: number) {
  if (sizeMl <= 330) return 280;
  if (sizeMl <= 500) return 350;
  if (sizeMl >= 4000) return 14000;
  if (sizeMl >= 1000) return 4800;
  return 3600;
}

export function toShelfProduct(aisle: string, drink: ShelfDrink): CatalogProduct {
  const sizes = drink.sizes.length > 0 ? drink.sizes : [750];
  return {
    slug: drink.slug,
    name: drink.name,
    producer: drink.name,
    country: "See the bottle",
    region: aisle,
    grape: "See the bottle",
    aisle,
    alcohol: "Confirm the figure on the bottle",
    description: `${drink.name} is listed by the name used on the drinks page. This preview has not checked a producer fact sheet, and the price is an example.`,
    tastingNote: "The taste is whatever is in the bottle you receive.",
    pairing: "Drink it the way that bottle is made to be served.",
    image: bottleImages[drink.slug] ?? "/products/bottles/whisky-1.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "Drink name as listed on the public menu this page follows",
        url: `https://drinkszone.co.ke/${aisle}`,
      },
    ],
    variants: sizes.map((sizeMl) => ({
      id: String(sizeMl),
      sizeMl,
      priceKes: examplePrice(sizeMl),
      stock: 6,
    })),
  };
}

const bySlug = new Map<string, CatalogProduct>();
for (const [slug, aisle] of slugAisle) {
  const drink = data.aisles[aisle].drinks.find((item) => item.slug === slug);
  if (drink) bySlug.set(slug, toShelfProduct(aisle, drink));
}

export function findShelfProduct(slug: string) {
  return bySlug.get(slug);
}

export function allShelfProducts() {
  return [...bySlug.values()];
}

export function searchShelf(query: string) {
  const tokens = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return [];
  return [...bySlug.values()].filter((product) => {
    const haystack = product.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return tokens.every((token) => haystack.includes(token));
  });
}

export function aisleShelf(aisle: string) {
  return data.aisles[aisle];
}

export function shelfProducts(aisle: string, kind = "") {
  const page = data.aisles[aisle];
  if (!page) return [];
  const words = kindWords[kind] ?? [];
  const drinks = words.length
    ? page.drinks.filter((drink) => words.some((word) => drink.name.toLowerCase().includes(word.trim())))
    : page.drinks;
  return drinks.map((drink) => toShelfProduct(aisle, drink));
}

export function brandShelf(slug: string) {
  return data.brands[slug];
}

export function brandPath(producer: string) {
  const slug = producerBrand[producer];
  if (!slug || !data.brands[slug]) return `/shop?q=${encodeURIComponent(producer)}`;
  return `/brand/${slug}`;
}

export function brandSlugs() {
  return Object.keys(data.brands);
}
