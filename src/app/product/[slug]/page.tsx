import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { VariantPicker } from "@/components/variant-picker";
import { RememberProducts } from "@/components/remember-products";
import { catalog, getStyle, productAisle, productKindLabel } from "@/content/catalog";
import { resolveShopProduct, withLiveStock } from "@/lib/desk";
import { drinkAisles } from "@/content/aisles";

export function generateStaticParams() {
  return catalog.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await resolveShopProduct(slug);
  if (!product) return { title: "Wine not found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-16 text-muted">Loading this drink…</p>}>
      <ProductBody params={params} />
    </Suspense>
  );
}

async function ProductBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const base = await resolveShopProduct(slug);
  if (!base) notFound();
  const [product] = await withLiveStock([base]);
  const style = getStyle(product.style);
  const aisle = drinkAisles.find((item) => item.slug === productAisle(product));

  return (
    <article className="mx-auto grid max-w-7xl gap-8 px-2 py-6 lg:grid-cols-2">
      <RememberProducts products={[product]} />
      <div className="overflow-hidden rounded-sm bg-white shadow-sm">
        <Image
          src={product.image}
          alt={product.name}
          width={600}
          height={800}
          priority
          className="h-auto max-h-[520px] w-full object-contain"
          unoptimized={product.image.endsWith(".svg") || product.image.startsWith("http")}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-logo">
          <Link href={style ? `/shop/${product.style}` : (aisle?.href ?? "/shop")}>{productKindLabel(product)}</Link>
          <span className="text-muted"> · Preview</span>
        </p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight">{product.name}</h1>
        <p className="mt-2 text-lg text-muted">{product.producer}</p>
        <p className="mt-4 leading-7">{product.description}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <Fact term="Country" value={product.country} />
          <Fact term="Origin" value={product.region} />
          <Fact term={product.style ? "Grape" : "Base"} value={product.grape} />
          <Fact term="Alcohol" value={product.alcohol} />
        </dl>
        <div className="mt-8">
          <VariantPicker product={product} />
        </div>
        <p className="mt-4 text-sm">
          <Link href={`/locations?next=/product/${product.slug}`} className="font-semibold text-navy underline">
            Choose a delivery location
          </Link>
          <span className="text-muted"> before you send the booking request.</span>
        </p>
      </div>
      <div className="grid gap-6 lg:col-span-2 lg:grid-cols-2">
        <section className="rounded-sm bg-white p-6 shadow-sm">
          <h2 className="text-2xl">Tasting note</h2>
          <p className="mt-3 leading-7 text-muted">{product.tastingNote}</p>
          <p className="mt-3 leading-7 text-muted">
            <span className="font-semibold text-navy">With food. </span>
            {product.pairing}
          </p>
        </section>
        <section className="rounded-sm bg-white p-6 shadow-sm">
          <h2 className="text-2xl">Fact sources</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The description is original. Producer, country, base, size, and alcohol follow the
            publications below for the vintage or listing cited. The bottle label is the authority
            for the bottle in hand. Price and stock are preview values.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {product.sources.map((source) => (
              <li key={source.url}>
                <a className="font-semibold text-logo underline" href={source.url}>
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="rounded-sm bg-white px-4 py-3 shadow-sm">
      <dt className="font-semibold text-navy">{term}</dt>
      <dd className="mt-1 text-muted">{value}</dd>
    </div>
  );
}
