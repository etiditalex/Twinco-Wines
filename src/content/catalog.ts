import { aisleLabel } from "@/content/aisles";
import { findShelfProduct } from "@/content/shelf";

/**
 * Preview catalog. Every price and stock count is an example for testing.
 * Replace this list with TwinCO’s approved inventory before live ordering.
 * Keep `preview: true` on any row that has not been approved. Product
 * structured data is withheld while commerce.catalogMode is "preview".
 *
 * Facts and sources: CATALOG-SOURCES.md. Descriptions below are original.
 * Alcohol and blend figures follow the cited publication for one vintage
 * or listing. The bottle label remains the authority for the bottle in hand.
 */

export const wineStyles = [
  {
    slug: "red",
    label: "Red",
    blurb: "Cabernet, Shiraz, and a softer sweet red for easy drinking.",
  },
  {
    slug: "white",
    label: "White",
    blurb: "Sauvignon Blanc and Chardonnay, served cool rather than icy.",
  },
  {
    slug: "rose",
    label: "Rosé",
    blurb: "Lighter bottles for lunch, seafood, and warm evenings.",
  },
  {
    slug: "sparkling",
    label: "Sparkling",
    blurb: "South African Cap Classique for a toast or a long meal.",
  },
] as const;

export type WineStyleSlug = (typeof wineStyles)[number]["slug"];

export type CatalogSource = {
  label: string;
  url: string;
};

export type CatalogVariant = {
  id: string;
  sizeMl: number;
  /** Example price in Kenyan shillings. Not a TwinCO selling price. */
  priceKes: number;
  /** Example units. Zero means this size cannot be added. */
  stock: number;
};

export type CatalogProduct = {
  slug: string;
  name: string;
  producer: string;
  country: string;
  region: string;
  grape: string;
  /** Set on wine. Other drinks use `aisle` instead. */
  style?: WineStyleSlug;
  /** Drink aisle. Omitted on wine, which stays on /shop. */
  aisle?: string;
  alcohol: string;
  description: string;
  tastingNote: string;
  pairing: string;
  image: string;
  featured: boolean;
  preview: true;
  sources: CatalogSource[];
  variants: CatalogVariant[];
};

export const catalog: CatalogProduct[] = [
  {
    slug: "nederburg-classic-cabernet-sauvignon",
    name: "Nederburg Classic Cabernet Sauvignon",
    producer: "Nederburg",
    country: "South Africa",
    region: "Western Cape",
    grape: "Cabernet Sauvignon 87%, Petit Verdot 13% (2023 fact sheet)",
    style: "red",
    alcohol: "13.77% on the 2023 Nederburg fact sheet",
    description:
      "A Western Cape red from Nederburg’s Classic range, built mostly on Cabernet Sauvignon with Petit Verdot in the 2023 blend. It is a useful preview bottle when the table is heading toward grilled beef or a slow stew.",
    tastingNote:
      "Dark berry fruit with a thread of cocoa and oak spice, and tannins that stay present rather than sharp. Give it a few minutes in the glass.",
    pairing: "Stews, roast beef, and mature hard cheese.",
    image: "/products/nederburg-classic-cabernet-sauvignon.jpg",
    featured: true,
    preview: true,
    sources: [
      {
        label: "Nederburg Classic Cabernet Sauvignon 2023 fact sheet",
        url: "https://dam.distell.co.za/m/519bad23f98f51f5/original/Nederburg-Classic-Cabernet-Sauvignon-2023-Fact-Sheet.pdf",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 2450, stock: 18 }],
  },
  {
    slug: "casillero-del-diablo-cabernet-sauvignon",
    name: "Casillero del Diablo Reserva Cabernet Sauvignon",
    producer: "Concha y Toro",
    country: "Chile",
    region: "Central Valley",
    grape: "Cabernet Sauvignon",
    style: "red",
    alcohol: "13.5% on SAQ and LCBO listings for the 750 ml bottle",
    description:
      "Concha y Toro’s widely shipped Central Valley Cabernet, sold under the Casillero del Diablo Reserva name. SAQ describes the current bottle as 100% Cabernet Sauvignon. An older US technical sheet listed a small supporting blend, so the label on the bottle TwinCO stocks should be checked.",
    tastingNote:
      "Cassis and dark cherry with a little coffee from oak, and a dry finish. It is built for food more than for sipping on its own.",
    pairing: "Grilled meat, rich pasta, and firm cheese.",
    image: "/products/casillero-del-diablo-cabernet-sauvignon.jpg",
    featured: true,
    preview: true,
    sources: [
      {
        label: "SAQ product page",
        url: "https://www.saq.com/en/278416",
      },
      {
        label: "LCBO product page",
        url: "https://www.lcbo.com/en/casillero-del-diablo-reserva-cabernet-sauvignon-278416",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 2190, stock: 22 }],
  },
  {
    slug: "jacobs-creek-classic-shiraz",
    name: "Jacob's Creek Classic Shiraz",
    producer: "Jacob's Creek",
    country: "Australia",
    region: "South Australia",
    grape: "Shiraz",
    style: "red",
    alcohol: "13% on Dan Murphy’s and IGA listings for the 750 ml bottle",
    description:
      "An approachable South Australian Shiraz from the Jacob’s Creek Classic range. Retail listings describe it as a drink-now bottle rather than a wine to cellar. Confirm the alcohol on the label, because other pack sizes have been listed with a different figure.",
    tastingNote:
      "Blackberry and raspberry fruit with a soft tannin and a hint of vanilla oak. Medium in weight, without a heavy dry-down.",
    pairing: "Roast lamb, pizza, and cheddar.",
    image: "/products/jacobs-creek-classic-shiraz.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "Dan Murphy’s 750 ml listing",
        url: "https://www.danmurphys.com.au/product/DM_902874/jacob-s-creek-classic-shiraz",
      },
      {
        label: "IGA 750 ml listing",
        url: "https://www.igashop.com.au/product/jacobs-creek-classic-shiraz-6604258",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 1890, stock: 11 }],
  },
  {
    slug: "four-cousins-natural-sweet-red",
    name: "Four Cousins Natural Sweet Red",
    producer: "Van Loveren",
    country: "South Africa",
    region: "Robertson",
    grape: "Ruby Cabernet 80%, Merlot 20% (wine.co.za listing)",
    style: "red",
    alcohol: "9.41% on the wine.co.za technical listing",
    description:
      "A sweet Robertson red from Van Loveren, bottled as Four Cousins. The published listing is mostly Ruby Cabernet with Merlot, and it is made to be easy rather than dry. The 1.5 L size is in the preview on purpose with no stock, so an unavailable size can be tested. Both sizes and the price are examples.",
    tastingNote:
      "Ripe plum and strawberry with a clearly sweet finish. Serve it cooler than a dry Cabernet.",
    pairing: "Spicy dishes, fruit, and mild desserts.",
    image: "/products/four-cousins-natural-sweet-red.png",
    featured: true,
    preview: true,
    sources: [
      {
        label: "wine.co.za technical listing",
        url: "https://wine.co.za/wine/wine.aspx?WINEID=42974",
      },
    ],
    variants: [
      { id: "750", sizeMl: 750, priceKes: 1350, stock: 26 },
      { id: "1500", sizeMl: 1500, priceKes: 2490, stock: 0 },
    ],
  },
  {
    slug: "durbanville-hills-sauvignon-blanc",
    name: "Durbanville Hills Sauvignon Blanc",
    producer: "Durbanville Hills",
    country: "South Africa",
    region: "Durbanville",
    grape: "Sauvignon Blanc",
    style: "white",
    alcohol: "13.61% on the 2025 Durbanville Hills fact sheet",
    description:
      "A Durbanville Sauvignon Blanc from the cellar Distell built with local growers. The 2025 fact sheet describes fruit from the shareholder farms in that ward, where sea air keeps the ripening slow. The preview uses the 2025 analysis and should be checked against whichever vintage TwinCO receives.",
    tastingNote:
      "Passion fruit, fig leaf, and stone fruit, with a saline edge and a creamy mid-palate. Drink it within a year or two of the vintage.",
    pairing: "Salads, sushi, and oily fish.",
    image: "/products/durbanville-hills-sauvignon-blanc.webp",
    featured: true,
    preview: true,
    sources: [
      {
        label: "Durbanville Hills Sauvignon Blanc 2025 fact sheet",
        url: "https://dam.distell.co.za/m/140685d2a1c9cd5b/original/Durbanville-Hills-Sauvignon-Blanc-2025-Fact-Sheet.pdf",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 1690, stock: 15 }],
  },
  {
    slug: "nederburg-winemasters-sauvignon-blanc",
    name: "Nederburg The Winemasters Sauvignon Blanc",
    producer: "Nederburg",
    country: "South Africa",
    region: "Western Cape",
    grape: "Sauvignon Blanc 89%, Semillon 11% (2024 fact sheet)",
    style: "white",
    alcohol: "12.34% on the 2024 Nederburg fact sheet",
    description:
      "Nederburg’s Winemasters Sauvignon Blanc is a Western Cape white with a little Semillon in the 2024 blend. Later fact sheets change the percentages and the alcohol, so this row records the 2024 sheet that matches the vintage on Nederburg’s own wine page at the time of writing.",
    tastingNote:
      "Fig, pear, and apple rather than a sharp grassy style, with lemon and lime keeping it fresh. It is dry enough for the table.",
    pairing: "Chicken salads, grilled prawns, and quiche.",
    image: "/products/nederburg-winemasters-sauvignon-blanc.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "Nederburg 2024 fact sheet",
        url: "https://dam.distell.co.za/m/4ec2847646146102/original/Nederburg-Fact-Sheet-The-Winemasters-Sauvignon-Blanc-2024-Fact-Sheet.pdf",
      },
      {
        label: "Nederburg wine page",
        url: "https://www.nederburg.com/wines/nederburg-sauvignon-blanc",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 1790, stock: 14 }],
  },
  {
    slug: "boschendal-1685-chardonnay",
    name: "Boschendal 1685 Chardonnay",
    producer: "Boschendal",
    country: "South Africa",
    region: "Confirm the wine of origin on the bottle",
    grape: "Chardonnay",
    style: "white",
    alcohol: "13.5% on the Boschendal product page",
    description:
      "Boschendal’s 1685 Chardonnay is stated by the producer as 100% Chardonnay at 13.5% alcohol. The page consulted does not spell out the wine of origin, so this preview leaves that field for the bottle label rather than guessing the estate ward.",
    tastingNote:
      "Citrus zest and yellow stone fruit, with a soft texture and a little spice. It is broader than the Sauvignon Blancs in this list.",
    pairing: "Roast chicken, creamy pasta, and mild curries.",
    image: "/products/boschendal-1685-chardonnay.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "Boschendal 1685 Chardonnay page",
        url: "https://www.boschendalwines.com/white-wine/chardonnay/boschendal-1685-chardonnay",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 2590, stock: 9 }],
  },
  {
    slug: "la-vieille-ferme-rose",
    name: "La Vieille Ferme Rosé",
    producer: "Famille Perrin",
    country: "France",
    region: "Vin de France",
    grape: "Cinsault, Grenache, and Syrah",
    style: "rose",
    alcohol: "12.5% on the Famille Perrin page and the SAQ listing",
    description:
      "A pale dry rosé from Famille Perrin, bottled as La Vieille Ferme. The producer lists Cinsault, Grenache, and Syrah. A SAQ listing for a current bottle gives Cinsault and Grenache as the main share, which is a reminder that the blend can move.",
    tastingNote:
      "Strawberry, raspberry, and a little peach, kept dry by the acidity. Chill it well.",
    pairing: "Seafood, salads, and food from the grill.",
    image: "/products/la-vieille-ferme-rose.jpg",
    featured: true,
    preview: true,
    sources: [
      {
        label: "Famille Perrin product page",
        url: "https://us.familleperrin.com/products/la-vieille-ferme-rose",
      },
      {
        label: "SAQ product page",
        url: "https://www.saq.com/en/13288832",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 1990, stock: 13 }],
  },
  {
    slug: "nederburg-classic-rose",
    name: "Nederburg Classic Rosé",
    producer: "Nederburg",
    country: "South Africa",
    region: "Western Cape",
    grape: "Pinotage 52%, Grenache 21%, Cinsault 16%, Shiraz 11% (2024 fact sheet)",
    style: "rose",
    alcohol: "12.98% on the 2024 Nederburg fact sheet",
    description:
      "Nederburg’s Classic Rosé from the 2024 fact sheet is a Western Cape blend led by Pinotage. Residual sugar on that sheet is about 16 g/l, so it is off-dry rather than a bone-dry Provence style. The 2022 sheet used a different blend. Match the row to the vintage in the shop.",
    tastingNote:
      "Rose petal and strawberry with a gentle sweetness and a fresh finish. Serve it cold.",
    pairing: "Smoked fish, summer salads, and lightly spiced dishes.",
    image: "/products/nederburg-classic-rose.webp",
    featured: false,
    preview: true,
    sources: [
      {
        label: "Nederburg Classic Rosé 2024 fact sheet",
        url: "https://dam.distell.co.za/m/1a9242a52c4b4e15/original/Nederburg-Fact-Sheet-Classic-Rose-2024.pdf",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 1550, stock: 17 }],
  },
  {
    slug: "graham-beck-brut",
    name: "Graham Beck Brut",
    producer: "Graham Beck",
    country: "South Africa",
    region: "Western Cape",
    grape: "Chardonnay and Pinot Noir",
    style: "sparkling",
    alcohol: "11.85% and 12.18% on two Graham Beck spec sheets",
    description:
      "A Western Cape Méthode Cap Classique from Graham Beck’s Robertson cellar. Published spec sheets split the blend close to half Chardonnay and half Pinot Noir, and the alcohol moves with the disgorgement. The magnum is listed with no preview stock so an unavailable sparkling size can be refused at checkout.",
    tastingNote:
      "Light yeast and lime, then a creamy mid-palate and a fine bubble. Open it cold.",
    pairing: "Oysters, fried snacks, and a first course.",
    image: "/products/graham-beck-brut.jpg",
    featured: true,
    preview: true,
    sources: [
      {
        label: "Graham Beck Brut page",
        url: "https://grahambeckusa.com/wine-brutnv/",
      },
      {
        label: "Graham Beck non-vintage spec sheet",
        url: "https://grahambeck.com/tasting-notes/1/Graham%20Beck%20Brut%20NV%20Specsheet.pdf",
      },
      {
        label: "Graham Beck later spec sheet",
        url: "https://www.grahambeck.com/public/tasting-notes/Graham%20Beck%20Brut%20Spec%20sheet%20(2022v)%20(1).pdf",
      },
    ],
    variants: [
      { id: "750", sizeMl: 750, priceKes: 3450, stock: 8 },
      { id: "1500", sizeMl: 1500, priceKes: 6900, stock: 0 },
    ],
  },
  {
    slug: "pongracz-brut",
    name: "Pongrácz Brut",
    producer: "Pongrácz",
    country: "South Africa",
    region: "Confirm the wine of origin on the bottle",
    grape: "Pinot Noir 60%, Chardonnay 40%",
    style: "sparkling",
    alcohol: "11.68% on the Pongrácz technical analysis",
    description:
      "Pongrácz Brut is a Cap Classique the producer describes as 60% Pinot Noir and 40% Chardonnay, with the second fermentation in the bottle and time on the lees. The producer page does not state a wine of origin in the summary used here, so that line is left for the label. A retailer listing rounds the alcohol differently.",
    tastingNote:
      "Apple and a little brioche, with a dry brut finish and a steady bead. Chill it before opening.",
    pairing: "Canapés, fried fish, and mild cheese.",
    image: "/products/pongracz-brut.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "Pongrácz Brut page",
        url: "https://www.pongracz.co.za/our-range/pongracz-brut",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 2950, stock: 7 }],
  },
  {
    slug: "johnnie-walker-black-label",
    name: "Johnnie Walker Black Label",
    producer: "Johnnie Walker",
    country: "Scotland",
    region: "Blended from whiskies across Scotland",
    grape: "Single malt and grain whiskies, aged at least 12 years",
    aisle: "whisky",
    alcohol: "40% on the Johnnie Walker US page",
    description:
      "A blended Scotch from Johnnie Walker, built from single malt and grain whiskies that the producer says have spent at least 12 years in cask. The preview lists the 750 ml size named on the US page.",
    tastingNote:
      "The producer describes sweet fruit, spice, and vanilla with a cloak of smoke. It is made to drink neat, on ice, or in a highball.",
    pairing: "Dark chocolate, smoked nuts, and a long drink with ginger ale.",
    image: "/products/johnnie-walker-black-label.jpg",
    featured: true,
    preview: true,
    sources: [
      {
        label: "Johnnie Walker Black Label US page",
        url: "https://www.johnniewalker.com/en-us/our-whisky/core-range/johnnie-walker-black-label",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 4800, stock: 12 }],
  },
  {
    slug: "glenfiddich-12",
    name: "Glenfiddich 12 Year Old",
    producer: "Glenfiddich",
    country: "Scotland",
    region: "Speyside",
    grape: "Single malt, matured in oloroso sherry and bourbon casks",
    aisle: "whisky",
    alcohol: "40% on the Glenfiddich US shop page",
    description:
      "Glenfiddich’s flagship single malt, matured for 12 years in oloroso sherry and bourbon casks and then married in oak. The US shop page lists it at 40% alcohol.",
    tastingNote:
      "The producer’s note is fresh pear on the nose, then butterscotch, cream, malt, and a little oak, with a long smooth finish.",
    pairing: "Apple tart, mild cheddar, and a highball.",
    image: "/products/glenfiddich-12.jpg",
    featured: true,
    preview: true,
    sources: [
      {
        label: "Glenfiddich 12 Year Old US shop page",
        url: "https://shop.us.glenfiddich.com/products/glenfiddich-12-year-old",
      },
    ],
    variants: [{ id: "700", sizeMl: 700, priceKes: 6900, stock: 8 }],
  },
  {
    slug: "jameson-original",
    name: "Jameson Original",
    producer: "Jameson",
    country: "Ireland",
    region: "Midleton, County Cork",
    grape: "Pot still and grain whiskey from barley and maize, triple distilled",
    aisle: "whisky",
    alcohol: "40% on the Jameson UK nutrition page and the Pernod Ricard 70 cl listing",
    description:
      "Jameson’s blended Irish whiskey, triple distilled at Midleton and aged in oak for at least four years. The 70 cl listing names water, barley, and maize.",
    tastingNote:
      "The producer’s note is floral and spicy on the nose, then nutty and vanilla with a hint of sherry, and a smooth finish.",
    pairing: "Ginger ale and lime, or a mild hard cheese.",
    image: "/products/jameson-original.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "Jameson UK nutrition page",
        url: "https://www.jamesonwhiskey.com/uk-ua/nutritional-information/",
      },
      {
        label: "Pernod Ricard 70 cl listing",
        url: "https://wecommerce.pernod-ricard.com/products/product?id=PRPECOM000418&market=en_UK",
      },
    ],
    variants: [{ id: "700", sizeMl: 700, priceKes: 4200, stock: 14 }],
  },
  {
    slug: "tusker-lager",
    name: "Tusker Lager",
    producer: "Tusker",
    country: "Kenya",
    region: "Brewed by East African Breweries",
    grape: "Barley malt, with hops. A retailer listing also names corn starch",
    aisle: "beers",
    alcohol: "4.2% on the Carrefour Kenya listing and on Tesco. The producer page prints 4.2% and, beside one size, 4.5%",
    description:
      "Kenya’s pale lager from East African Breweries, in the 500 ml bottle the producer lists. Two retail pages print 4.2% alcohol. The producer page also prints 4.2% in one line and 4.5% next to a size, so the bottle in hand should be checked.",
    tastingNote:
      "A bright, highly carbonated lager with a light malt finish. Serve it cold, around the 3–5° the producer suggests.",
    pairing: "Nyama choma, chips, and salty snacks.",
    image: "/products/tusker-lager.jpg",
    featured: true,
    preview: true,
    sources: [
      {
        label: "Tusker Lager page",
        url: "https://www.tusker.beer/lager",
      },
      {
        label: "Carrefour Kenya 500 ml listing",
        url: "https://www.carrefour.ke/beer/tusker-can-500ml/p/41864",
      },
    ],
    variants: [{ id: "500", sizeMl: 500, priceKes: 280, stock: 48 }],
  },
  {
    slug: "whitecap-lager",
    name: "White Cap Lager",
    producer: "White Cap",
    country: "Kenya",
    region: "Brewed by East African Breweries",
    grape: "Barley and hops, with no added sugar on the EABL page",
    aisle: "beers",
    alcohol: "4.2% on the EABL brands page",
    description:
      "A Kenyan lager EABL describes as 4.2% alcohol, brewed with barley and hops and sold in a 500 ml bottle or can. This preview uses the bottle.",
    tastingNote: "Clean malt and a short hop finish. Drink it cold.",
    pairing: "Grilled chicken, pizza, and a light lunch.",
    image: "/products/whitecap-lager.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "EABL brands page",
        url: "https://www.eabl.com/our-brands",
      },
    ],
    variants: [{ id: "500", sizeMl: 500, priceKes: 260, stock: 36 }],
  },
  {
    slug: "whitecap-crisp",
    name: "White Cap Crisp",
    producer: "White Cap",
    country: "Kenya",
    region: "Brewed by East African Breweries",
    grape: "A lighter lager. EABL says no sugar is added",
    aisle: "beers",
    alcohol: "3% on the EABL brands page",
    description:
      "EABL’s lighter White Cap, described there as a crisp beer at 3% alcohol with no added sugar. The page also mentions a 330 ml can. This preview uses a 500 ml bottle, which should be checked against the pack TwinCO receives.",
    tastingNote: "Lighter and drier than the standard lager, with a short clean finish. Serve it ice cold.",
    pairing: "Salads, fish, and afternoon drinking.",
    image: "/products/whitecap-crisp.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "EABL brands page",
        url: "https://www.eabl.com/our-brands",
      },
    ],
    variants: [{ id: "500", sizeMl: 500, priceKes: 250, stock: 30 }],
  },
  {
    slug: "absolut-vodka",
    name: "Absolut Vodka",
    producer: "Absolut",
    country: "Sweden",
    region: "Åhus",
    grape: "Swedish winter wheat and local well water",
    aisle: "vodka",
    alcohol: "40% on the Absolut product page",
    description:
      "Absolut’s original vodka, produced and bottled in Åhus from Swedish winter wheat. The producer’s own FAQ states 40% alcohol.",
    tastingNote: "The producer describes a grain character with a little citrus. It is built for mixing.",
    pairing: "Tonic, soda, or a tomato mixer.",
    image: "/products/absolut-vodka.jpg",
    featured: true,
    preview: true,
    sources: [
      {
        label: "Absolut Vodka page",
        url: "https://www.absolut.com/en/products/absolut-vodka/",
      },
    ],
    variants: [{ id: "700", sizeMl: 700, priceKes: 2800, stock: 16 }],
  },
  {
    slug: "tanqueray-london-dry",
    name: "Tanqueray London Dry Gin",
    producer: "Tanqueray",
    country: "United Kingdom",
    region: "London Dry. The US bottle is imported by Charles Tanqueray & Co., New York",
    grape: "Grain neutral spirit with juniper, coriander, angelica, and liquorice",
    aisle: "gin",
    alcohol: "47.3% on the Tanqueray US page. Other markets bottle it lower, so check the label",
    description:
      "Tanqueray’s London Dry, distilled four times and flavoured with four botanicals. This row follows the US page, which prints 47.3% alcohol. A bottle bought for Kenya may differ.",
    tastingNote: "Piney juniper, peppery coriander, angelica, and sweet liquorice, then a floral finish.",
    pairing: "Tonic and a citrus peel.",
    image: "/products/tanqueray-london-dry.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "Tanqueray London Dry US page",
        url: "https://www.tanqueray.com/en-us/tanqueray-london-dry-gin",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 3900, stock: 10 }],
  },
  {
    slug: "bacardi-carta-blanca",
    name: "Bacardi Carta Blanca",
    producer: "Bacardi",
    country: "United States",
    region: "Ocado lists the country of origin as the United States. Confirm the bottle",
    grape: "Sugar cane, aged in American white oak and charcoal filtered",
    aisle: "rum",
    alcohol: "37.5% on the Ocado 70 cl listing. The producer page used here does not print the alcohol",
    description:
      "Bacardi’s white rum, aged in American white oak and charcoal filtered. The producer describes orange blossom, lavender, apricot, and lime. The 37.5% figure is from a UK retail listing, not from the producer page.",
    tastingNote: "Almond and light fruit, then a dry clean finish. It is a mixing rum.",
    pairing: "Lime and mint, or cola.",
    image: "/products/bacardi-carta-blanca.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "Bacardi Carta Blanca page",
        url: "https://www.bacardi.com/our-rums/carta-blanca-rum/",
      },
      {
        label: "Ocado 70 cl listing",
        url: "https://www.ocado.com/products/bacardi-carta-blanca-superior-white-rum/16700011",
      },
    ],
    variants: [{ id: "700", sizeMl: 700, priceKes: 2600, stock: 11 }],
  },
  {
    slug: "hennessy-vs",
    name: "Hennessy V.S.",
    producer: "Hennessy",
    country: "France",
    region: "Cognac",
    grape: "A blend of eaux-de-vie, matured in new oak",
    aisle: "cognac",
    alcohol: "40% on the Hennessy 70 cl page",
    description:
      "Hennessy Very Special, the house’s V.S. cognac, matured in new oak. The producer’s 70 cl page titles the bottle at 40% alcohol and describes toasted oak, roasted almond, and vine fruit.",
    tastingNote: "Toast, roasted almond, and brown sugar, then vanilla and a fresh floral finish.",
    pairing: "Ginger ale, or a small glass after dinner.",
    image: "/products/hennessy-vs.jpg",
    featured: true,
    preview: true,
    sources: [
      {
        label: "Hennessy V.S. 70 cl page",
        url: "https://www.hennessy.com/en-int/collection/hennessy-very-special",
      },
    ],
    variants: [{ id: "700", sizeMl: 700, priceKes: 6500, stock: 9 }],
  },
  {
    slug: "jose-cuervo-especial-silver",
    name: "Jose Cuervo Especial Silver",
    producer: "Jose Cuervo",
    country: "Mexico",
    region: "Jalisco",
    grape: "Blended tequila from blue agave grown on the family estate",
    aisle: "tequila",
    alcohol: "40% on the Jose Cuervo US and global pages",
    description:
      "Jose Cuervo Especial Silver, a double-distilled blended tequila. Both the US and global pages print 40% alcohol and describe blue agave from the family estate in Jalisco. This row does not call it 100% agave.",
    tastingNote: "Fresh agave on the nose, then a crisp palate and a warm finish. The global page also mentions caramel and herbs.",
    pairing: "Lime and salt, or a margarita.",
    image: "/products/jose-cuervo-especial-silver.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "Jose Cuervo Especial Silver US page",
        url: "https://cuervo.com/products/especial-silver/",
      },
      {
        label: "Jose Cuervo Especial Silver global page",
        url: "https://global.cuervo.com/products/especial/",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 3600, stock: 10 }],
  },
  {
    slug: "baileys-original",
    name: "Baileys Original Irish Cream",
    producer: "Baileys",
    country: "Ireland",
    region: "Irish cream liqueur",
    grape: "Irish whiskey, dairy cream, chocolate, and vanilla",
    aisle: "liqueur",
    alcohol: "17% on the Baileys US page",
    description:
      "Baileys Original, a cream liqueur of Irish whiskey and dairy cream. The US page prints 17% alcohol and lists milk as an allergen.",
    tastingNote: "Chocolate, vanilla, and cream, with a soft whiskey warmth. Serve it over ice.",
    pairing: "Coffee, ice cream, or on its own after dinner.",
    image: "/products/baileys-original.jpg",
    featured: true,
    preview: true,
    sources: [
      {
        label: "Baileys Original US page",
        url: "https://www.baileys.com/en-us/products/baileys-original-irish-cream",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 3200, stock: 13 }],
  },
  {
    slug: "amarula-cream",
    name: "Amarula Cream",
    producer: "Amarula",
    country: "South Africa",
    region: "Cream liqueur from marula fruit",
    grape: "Marula fruit spirit, aged in French oak, then blended with cream",
    aisle: "liqueur",
    alcohol: "17% on the Amarula FAQ. Flavoured Amarula bottles are listed at 15.5%",
    description:
      "Amarula’s original cream liqueur. The producer says the marula fruit is fermented, distilled, matured in French oak for two years, and blended with cream. The FAQ prints 17% alcohol for the cream liqueur.",
    tastingNote: "Caramel and fruit from the marula spirit, softened by cream. Serve it cold, over ice.",
    pairing: "Coffee, or poured over vanilla ice cream.",
    image: "/products/amarula-cream.jpg",
    featured: false,
    preview: true,
    sources: [
      {
        label: "Amarula FAQ",
        url: "https://www.amarula.com/faqs",
      },
    ],
    variants: [{ id: "750", sizeMl: 750, priceKes: 2900, stock: 12 }],
  },
];

const spiritAisles = ["vodka", "gin", "rum", "cognac", "tequila", "brandy"];

export function productAisle(product: CatalogProduct) {
  return product.aisle ?? "wine";
}

export function isSpiritAisle(aisle: string) {
  return aisle === "spirits" || spiritAisles.includes(aisle);
}

export function productsForAisle(aisle: string) {
  if (aisle === "spirits") return catalog.filter((product) => spiritAisles.includes(productAisle(product)));
  return catalog.filter((product) => productAisle(product) === aisle);
}

export function productKindLabel(product: CatalogProduct) {
  if (product.style) return getStyle(product.style)?.label ?? product.style;
  return aisleLabel(product.aisle ?? "wine");
}

export function isStyleSlug(value: string): value is WineStyleSlug {
  return wineStyles.some((style) => style.slug === value);
}

export function getStyle(slug?: string) {
  if (!slug) return undefined;
  return wineStyles.find((style) => style.slug === slug);
}

const remembered = new Map<string, CatalogProduct>();

export function rememberProducts(products: CatalogProduct[]) {
  for (const product of products) remembered.set(product.slug, product);
}

export function getProduct(slug: string) {
  return remembered.get(slug) ?? catalog.find((product) => product.slug === slug) ?? findShelfProduct(slug);
}

export function featuredProducts() {
  return catalog.filter((product) => product.featured);
}
