import Link from "next/link";
import { cookies } from "next/headers";
import { ShopControls } from "@/components/shop-controls";
import { ProductCard } from "@/components/product-card";
import { aisleLabel } from "@/content/aisles";
import { RememberProducts } from "@/components/remember-products";
import { catalog, getStyle, isSpiritAisle, productAisle, productsForAisle, wineStyles, type WineStyleSlug } from "@/content/catalog";
import { aisleShelf, shelfProducts } from "@/content/shelf";
import { addedCatalogProducts, storefrontState, withLiveStock } from "@/lib/desk";
import { catalogCountries, catalogSizes, filterCatalog, filtersFromRecord, readParam } from "@/lib/shop";

export async function ShopResults({
  searchParams,
  lockedStyle,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  lockedStyle?: WineStyleSlug;
}) {
  const record = await searchParams;
  const filters = filtersFromRecord(record, lockedStyle);
  const aisle = readParam(record.aisle);
  const kind = readParam(record.kind);
  const added = await addedCatalogProducts();
  const shelf = aisleShelf(aisle);
  const ownedFromCatalog =
    aisle === "champagne"
      ? catalog.filter((product) => product.style === "sparkling")
      : productsForAisle(aisle);
  const ownedFromDesk = added.filter((product) => {
    if (!aisle) return false;
    if (aisle === "champagne") return product.style === "sparkling" || product.aisle === "champagne";
    if (aisle === "spirits") return isSpiritAisle(productAisle(product));
    return productAisle(product) === aisle;
  });
  const owned = [
    ...ownedFromCatalog,
    ...ownedFromDesk.filter((product) => !ownedFromCatalog.some((item) => item.slug === product.slug)),
  ];
  const stockedAisle = aisle === "spirits" || owned.length > 0;
  const outsideCatalog = aisle.length > 0 && !stockedAisle && !shelf;
  const listed = shelf ? shelfProducts(aisle, kind) : [];
  const seen = new Set(owned.map((product) => product.slug));
  const products = shelf
    ? [...(kind ? [] : owned), ...listed.filter((product) => !seen.has(product.slug))]
    : outsideCatalog
      ? []
      : filterCatalog(filters, aisle, added);
  const shown = await withLiveStock(products);
  const shopState = await storefrontState();
  const savedLocation = (await cookies()).get("twinco-location")?.value ?? "";
  const chosen = shopState.locations.find((location) => location.id === savedLocation);
  const style = lockedStyle ? getStyle(lockedStyle) : undefined;
  const action = lockedStyle ? `/shop/${lockedStyle}` : "/shop";
  const title = shelf?.title
    ? shelf.title
    : aisle === "spirits"
      ? "Spirits"
      : outsideCatalog || stockedAisle
        ? aisleLabel(aisle)
        : style
          ? `${style.label} wines`
          : "All wines";

  return (
    <div className="mx-auto w-full max-w-7xl p-1">
      <p className="mx-1 mt-2 rounded-sm bg-white px-3 py-2 text-sm">
        {chosen ? (
          <>
            Delivery location: <span className="font-semibold">{chosen.name}</span>.{" "}
          </>
        ) : (
          "Choose a location before you send a booking request. "
        )}
        <Link href="/locations" className="font-semibold text-logo">
          {chosen ? "Change location" : "Open locations"}
        </Link>
      </p>
      <div className="mt-2 flex h-52 flex-col items-center justify-center rounded-sm bg-gradient-to-br from-[#1a62f0] via-[#0d41be] to-[#003090] px-4 text-center">
        <h1 className="py-3 text-3xl font-extrabold text-white first-letter:capitalize md:text-5xl">
          {title}
        </h1>
        {shelf ? null : (
          <p className="max-w-xl text-sm text-white/90">
            {filters.q
              ? `Showing matches for “${filters.q}” in the name, producer, or drink.`
              : outsideCatalog
                ? "This preview aisle is not stocked yet. Vape, gifts, soft drinks, and extras are still empty."
                : stockedAisle
                  ? "Preview bottles in this aisle. Prices and stock counts are examples."
                  : "Search by name, producer, or style. Filters stay in the page address."}
          </p>
        )}
      </div>
      {shelf && shelf.types.length > 0 ? (
        <div className="my-8 rounded-md bg-white p-4">
          <h2 className="my-4 mb-6 text-2xl font-bold">Types of {aisleLabel(aisle).toLowerCase()}</h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {shelf.types.map((type) => {
              const kindSlug = type.href.split("/").pop() ?? "";
              return (
                <li key={type.href} className="first-letter:capitalize">
                  <Link href={`/shop?aisle=${aisle}&kind=${kindSlug}`} className="text-logo">
                    {type.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {outsideCatalog || stockedAisle || lockedStyle || shelf ? null : (
        <ul className="my-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {wineStyles.map((item) => (
            <li key={item.slug} className="first-letter:capitalize">
              <Link href={`/shop/${item.slug}`} className="text-logo">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {shelf ? null : (
      <div className="my-4">
        <ShopControls
          action={action}
          lockedStyle={lockedStyle}
          countries={catalogCountries(added)}
          sizes={catalogSizes(added)}
        />
      </div>
      )}
      <RememberProducts products={added} />
      {shown.length === 0 ? (
        <p className="rounded-sm bg-white px-5 py-10 text-muted">
          Nothing in the preview catalog matches those filters. Clear them and try a producer name
          or a style such as rosé.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {shown.map((product) => (
            <li key={product.slug} className="flex w-full flex-col">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
