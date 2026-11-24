import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { drinkAisles } from "@/content/aisles";
import { getProduct } from "@/content/catalog";
import { withLiveStock } from "@/lib/desk";
import { brandShelf, brandSlugs } from "@/content/shelf";

export function generateStaticParams() {
  return brandSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = brandShelf(slug);
  if (!page) return { title: "Brand not found" };
  return { title: page.title, description: page.title };
}

export default function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-16 text-muted">Loading this brand…</p>}>
      <BrandShelf params={params} />
    </Suspense>
  );
}

async function BrandShelf({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = brandShelf(slug);
  if (!page) notFound();
  const products = await withLiveStock(
    page.drinks.map((drink) => getProduct(drink.slug)).filter((product) => product !== undefined),
  );

  return (
    <div className="mx-auto w-full max-w-7xl p-1">
      <div className="mt-2 flex h-52 flex-col items-center justify-center rounded-sm bg-gradient-to-br from-[#1a62f0] via-[#0d41be] to-[#003090] px-4 text-center">
        <h1 className="py-3 text-center text-3xl font-black text-white capitalize sm:text-5xl">
          {page.title}
        </h1>
      </div>
      {page.crumbs.length > 0 ? (
        <ul className="my-4 flex w-full flex-wrap justify-end gap-6 py-6">
          {page.crumbs.map((crumb) => {
            const label = crumb.split("-").pop()?.trim().toLowerCase() ?? "";
            const aisle = drinkAisles.find((item) => item.label.toLowerCase() === label);
            return (
              <li key={crumb} className="rounded-md bg-white p-2">
                <Link href={aisle?.href ?? "/shop"}>{crumb}</Link>
              </li>
            );
          })}
        </ul>
      ) : null}
      <ul className="grid grid-cols-2 gap-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {products.map((product) => (
          <li key={product.slug} className="flex w-full flex-col">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}
