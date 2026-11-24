import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl">That page is not in the shop</h1>
      <p className="mt-4 leading-7 text-muted">
        The wine, style, or policy you asked for is not in this preview. Check the name or go back
        to the catalog.
      </p>
      <Link
        href="/shop"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-logo px-5 text-sm font-semibold text-white"
      >
        Browse wines
      </Link>
    </div>
  );
}
