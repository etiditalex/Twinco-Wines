import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopResults } from "@/components/shop-results";
import { getStyle, isStyleSlug, wineStyles } from "@/content/catalog";

export function generateStaticParams() {
  return wineStyles.map((style) => ({ category: style.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const style = getStyle(category);
  if (!style) return { title: "Category not found" };
  return {
    title: `${style.label} wine`,
    description: `Browse the ${style.label.toLowerCase()} wines in the TwinCO preview catalog.`,
  };
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-16 text-muted">Loading this style…</p>}>
      <CategoryResults params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryResults({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await params;
  if (!isStyleSlug(category)) notFound();
  return <ShopResults searchParams={searchParams} lockedStyle={category} />;
}
