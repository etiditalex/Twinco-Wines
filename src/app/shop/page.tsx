import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopResults } from "@/components/shop-results";
import { aisleShelf } from "@/content/shelf";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const record = await searchParams;
  const aisle = typeof record.aisle === "string" ? record.aisle : "";
  const shelf = aisleShelf(aisle);
  if (shelf) return { title: shelf.title, description: shelf.title };
  return {
    title: "Shop wines",
    description: "Search and filter the TwinCO Wines preview catalog.",
  };
}

export default function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-16 text-muted">Loading the catalog…</p>}>
      <ShopResults searchParams={searchParams} />
    </Suspense>
  );
}
