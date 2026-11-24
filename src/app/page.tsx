import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { RememberProducts } from "@/components/remember-products";
import { catalog, isSpiritAisle, productAisle, type CatalogProduct } from "@/content/catalog";
import { addedCatalogProducts, withLiveStock } from "@/lib/desk";
import { drinkAisles } from "@/content/aisles";
import { faqs } from "@/content/faq";
import { brandPath } from "@/content/shelf";
import { HeroBanner } from "@/components/hero-banner";
import { ProductCard } from "@/components/product-card";
import { ReviewNotes } from "@/components/review-notes";

const tileOrder = ["gifts", "extras"];

export default function HomePage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-16 text-muted">Loading the shop…</p>}>
      <HomeBody />
    </Suspense>
  );
}

async function HomeBody() {
  const added = await addedCatalogProducts();
  const live = await withLiveStock([...catalog, ...added]);
  const featured = live.filter((product) => product.featured && productAisle(product) === "wine");
  const more = live.filter((product) => productAisle(product) === "wine" && !product.featured).slice(0, 4);
  const byAisle = (aisle: string) =>
    live.filter((product) =>
      aisle === "spirits" ? isSpiritAisle(productAisle(product)) : productAisle(product) === aisle,
    );
  const drinkSections = [
    { title: "Whisky", href: "/shop?aisle=whisky", products: byAisle("whisky") },
    { title: "Beers", href: "/shop?aisle=beers", products: byAisle("beers") },
    { title: "Spirits", href: "/shop?aisle=spirits", products: byAisle("spirits") },
    { title: "Liqueurs", href: "/shop?aisle=liqueur", products: byAisle("liqueur") },
  ];
  const producers = [...new Set(live.map((product) => product.producer))];
  const brandImage = new Map(producers.map((producer) => [producer, live.find((product) => product.producer === producer)!.image]));
  const tiles = [
    ...drinkAisles.filter((aisle) => !tileOrder.includes(aisle.slug)),
    ...tileOrder.map((slug) => drinkAisles.find((aisle) => aisle.slug === slug)!),
  ];

  return (
    <div className="mx-auto w-full max-w-7xl p-1">
      <RememberProducts products={added} />
      <HeroBanner />

      <section className="my-6">
        <ul className="grid grid-cols-3 sm:grid-cols-7">
          {tiles.map((aisle) => (
            <li key={aisle.slug}>
              <Link href={aisle.href} className="m-2 flex cursor-pointer flex-col items-center rounded-sm p-1">
                <Image
                  src={`/categories/${aisle.slug}.jpg`}
                  alt=""
                  width={64}
                  height={64}
                  className="rounded-md object-contain"
                />
                <span className="p-1 text-sm">{aisle.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ProductBand title="Featured wines" href="/shop" products={featured} />
      <ProductBand title="More wines" href="/shop" products={more} />
      {drinkSections.map((section) => (
        <ProductBand key={section.title} title={section.title} href={section.href} products={section.products} />
      ))}

      <section className="my-12">
        <h2 className="my-2 text-2xl font-bold text-logo">Featured brands</h2>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-12 rounded-sm sm:grid-cols-4 lg:grid-cols-6">
          {producers.map((producer) => (
            <li key={producer} className="flex flex-col justify-between gap-1 bg-white p-2">
              <Link href={brandPath(producer)}>
                <Image
                  src={brandImage.get(producer)!}
                  alt=""
                  width={100}
                  height={100}
                  unoptimized={brandImage.get(producer)!.startsWith("http")}
                  className="mx-auto aspect-square w-full max-w-[100px] object-contain"
                />
              </Link>
              <Link href={brandPath(producer)} className="mx-auto text-center text-sm">
                {producer}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ReviewNotes />

      <section className="my-8">
        <h2 className="my-2 text-2xl font-bold text-logo">Frequently asked questions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {faqs.map((item) => (
            <details key={item.question} className="m-2 h-min rounded-sm bg-white p-3 open:border open:border-slate-200 open:text-logo open:shadow-sm">
              <summary className="my-1 cursor-pointer rounded-md font-semibold">{item.question}</summary>
              <p className="pt-2 text-sm leading-6">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductBand({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: CatalogProduct[];
}) {
  return (
    <section className="my-6">
      <div className="flex justify-between rounded-sm bg-white px-3 py-2">
        <h2>{title}</h2>
        <Link href={href}>View all</Link>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {products.map((product) => (
          <li key={product.slug} className="flex w-full flex-col">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
