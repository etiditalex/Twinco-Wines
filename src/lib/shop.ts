import { catalog, productAisle, productKindLabel, type CatalogProduct, type WineStyleSlug } from "@/content/catalog";
import { searchShelf } from "@/content/shelf";

export type ShopFilters = {
  q: string;
  style: string;
  country: string;
  size: string;
  availability: string;
  sort: string;
};

export function readParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function filtersFromRecord(
  record: Record<string, string | string[] | undefined>,
  lockedStyle?: WineStyleSlug,
): ShopFilters {
  return {
    q: readParam(record.q).trim(),
    style: lockedStyle ?? readParam(record.style),
    country: readParam(record.country),
    size: readParam(record.size),
    availability: readParam(record.availability),
    sort: readParam(record.sort) || "featured",
  };
}

function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function priceForSort(product: CatalogProduct, size: string) {
  const variants = size
    ? product.variants.filter((variant) => String(variant.sizeMl) === size)
    : product.variants;
  const prices = (variants.length > 0 ? variants : product.variants).map((variant) => variant.priceKes);
  return Math.min(...prices);
}

export function filterCatalog(filters: ShopFilters, aisle = "", extra: CatalogProduct[] = []) {
  const tokens = fold(filters.q).split(/\s+/).filter(Boolean);
  const source = [...catalog, ...extra.filter((product) => !catalog.some((item) => item.slug === product.slug))];
  const aisleProducts = !aisle
    ? null
    : aisle === "spirits"
      ? source.filter((product) => ["vodka", "gin", "rum", "cognac", "tequila", "brandy"].includes(productAisle(product)))
      : source.filter((product) => productAisle(product) === aisle);

  const matched = source.filter((product) => {
    if (aisleProducts && !aisleProducts.some((item) => item.slug === product.slug)) return false;
    if (!aisle && !filters.q && productAisle(product) !== "wine") return false;
    if (filters.style && product.style !== filters.style) return false;
    if (filters.country && product.country !== filters.country) return false;
    if (filters.size && !product.variants.some((variant) => String(variant.sizeMl) === filters.size)) {
      return false;
    }
    if (filters.availability === "in-stock") {
      const variants = filters.size
        ? product.variants.filter((variant) => String(variant.sizeMl) === filters.size)
        : product.variants;
      if (!variants.some((variant) => variant.stock > 0)) return false;
    }
    if (tokens.length === 0) return true;
    const haystack = fold([product.name, product.producer, productKindLabel(product)].join(" "));
    return tokens.every((token) => haystack.includes(token));
  });

  const seen = new Set(matched.map((product) => product.slug));
  const shelfHits =
    tokens.length > 0 && !filters.style && !filters.country && !filters.size
      ? searchShelf(filters.q).filter((product) => !seen.has(product.slug) && (!aisle || product.aisle === aisle))
      : [];
  const sorted = [...matched, ...shelfHits];
  sorted.sort((a, b) => {
    if (filters.sort === "price-asc" || filters.sort === "price-desc") {
      const difference = priceForSort(a, filters.size) - priceForSort(b, filters.size);
      return filters.sort === "price-asc" ? difference : -difference;
    }
    if (filters.sort === "name") {
      return a.name.localeCompare(b.name);
    }
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return sorted;
}

export function catalogCountries(extra: CatalogProduct[] = []) {
  return [...new Set([...catalog, ...extra].map((product) => product.country))].sort((a, b) => a.localeCompare(b));
}

export function catalogSizes(extra: CatalogProduct[] = []) {
  const sizes = new Set<number>();
  for (const product of [...catalog, ...extra]) {
    for (const variant of product.variants) sizes.add(variant.sizeMl);
  }
  return [...sizes].sort((a, b) => a - b);
}
