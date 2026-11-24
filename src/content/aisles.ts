export const drinkAisles = [
  { slug: "whisky", label: "Whisky", href: "/shop?aisle=whisky" },
  { slug: "wine", label: "Wine", href: "/shop" },
  { slug: "beers", label: "Beers", href: "/shop?aisle=beers" },
  { slug: "cognac", label: "Cognac", href: "/shop?aisle=cognac" },
  { slug: "vodka", label: "Vodka", href: "/shop?aisle=vodka" },
  { slug: "rum", label: "Rum", href: "/shop?aisle=rum" },
  { slug: "tequila", label: "Tequila", href: "/shop?aisle=tequila" },
  { slug: "champagne", label: "Champagne", href: "/shop?aisle=champagne" },
  { slug: "gin", label: "Gin", href: "/shop?aisle=gin" },
  { slug: "liqueur", label: "Liqueur", href: "/shop?aisle=liqueur" },
  { slug: "brandy", label: "Brandy", href: "/shop?aisle=brandy" },
  { slug: "vape", label: "Vape", href: "/shop?aisle=vape" },
  { slug: "soft-drinks", label: "Soft drinks", href: "/shop?aisle=soft-drinks" },
  { slug: "extras", label: "Extras", href: "/shop?aisle=extras" },
  { slug: "gifts", label: "Gifts", href: "/shop?aisle=gifts" },
] as const;

export function aisleLabel(slug: string) {
  return drinkAisles.find((aisle) => aisle.slug === slug)?.label ?? slug;
}
