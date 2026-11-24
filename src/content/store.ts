/**
 * Public customer details. Leave verified flags false until TwinCO confirms
 * the exact text that should be published. Directory research is recorded in
 * CATALOG-SOURCES.md and must not be shown as an official contact card.
 */
export const store = {
  tradingName: "TwinCO Wines",
  centre: "Nyali Centre",
  street: "Links Road",
  locality: "Nyali, Mombasa",
  country: "Kenya",
  addressVerified: false,
  phone: "",
  phoneVerified: false,
  email: "",
  emailVerified: false,
  whatsapp: "",
  hours: [] as { day: string; hours: string }[],
  hoursVerified: false,
  mapsSearchQuery: "TwinCO Wines Nyali Centre Links Road Mombasa",
};

export const homepageCopy = {
  heading: "Shop Wine in Nyali, Mombasa",
  supporting:
    "Explore red, white, rosé, and sparkling wines from TwinCO Wines. Browse by style, find a bottle for the occasion, and check delivery availability before ordering.",
  primaryLabel: "Shop Wines",
  primaryHref: "/shop",
  secondaryLabel: "Delivery Information",
  secondaryHref: "/delivery",
  heroImage: "/brand/hero-placeholder.png",
  heroImageAlt:
    "Placeholder illustration of a wine bottle and glass. Replace public/brand/hero-placeholder.png with approved photography.",
};
