export const categoryOrder = ["Wine", "Spirits", "Beer", "Aperitifs", "Imported Brands"] as const;

export type DrinkCategory = (typeof categoryOrder)[number];

const spiritAisles = ["whisky", "vodka", "gin", "rum", "cognac", "tequila", "brandy"];

export const categoryColors: Record<DrinkCategory, string> = {
  Wine: "#ea2027",
  Spirits: "#f97316",
  Beer: "#16a34a",
  Aperitifs: "#0d9488",
  "Imported Brands": "#4f46e5",
};

export function drinkCategory(product: { style?: string | null; aisle?: string | null; country?: string | null }): DrinkCategory {
  const aisle = product.aisle || "wine";
  if (aisle === "beers") return "Beer";
  if (aisle === "liqueur") return "Aperitifs";
  if (spiritAisles.includes(aisle)) return "Spirits";
  if (product.style === "sparkling" || aisle === "champagne") return "Imported Brands";
  if (product.style) return "Wine";
  if (product.country && product.country !== "Kenya") return "Imported Brands";
  return "Wine";
}

export const provinceByLocation: Record<string, string> = {
  nyali: "North Coast",
  kongowea: "North Coast",
  bamburi: "North Coast",
  "mombasa-island": "Mombasa Island",
  likoni: "South Coast",
};

export function provinceFor(locationId: string) {
  return provinceByLocation[locationId] ?? "Mombasa";
}

export const paymentMethods = ["M-Pesa", "Cash", "Card"] as const;

export const promotionNames = [
  "Seasonal Discount",
  "Bulk Purchase",
  "Holiday Bundle",
  "New Product Launch",
  "Loyalty Program",
  "Cross-Category",
  "Referral Bonus",
  "Corporate Event",
  "Online Exclusive",
  "Clearance Sale",
] as const;

export function isPaymentMethod(value: string) {
  return paymentMethods.some((method) => method === value);
}

export function isPromotion(value: string) {
  return value === "None" || promotionNames.some((name) => name === value);
}
