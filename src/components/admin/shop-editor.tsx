"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { aisleLabel } from "@/content/aisles";
import type { EditorProduct } from "@/lib/desk";
import { formatKes } from "@/lib/format";

function priceLabel(product: EditorProduct) {
  const prices = product.variants.map((variant) => variant.priceKes);
  if (prices.length === 0) return "No price yet";
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return low === high ? formatKes(low) : `${formatKes(low)} – ${formatKes(high)}`;
}

const pageSize = 10;

function startPage(value: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page - 1 : 0;
}

export function ShopEditor({
  products,
  initialQuery = "",
  initialAisle = "",
  initialPage = "",
}: {
  products: EditorProduct[];
  initialQuery?: string;
  initialAisle?: string;
  initialPage?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [aisle, setAisle] = useState(initialAisle);
  const [page, setPage] = useState(startPage(initialPage));
  const aisles = useMemo(() => [...new Set(products.map((product) => product.aisle))].sort(), [products]);
  const filtered = products.filter((product) => {
    if (aisle && product.aisle !== aisle) return false;
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return true;
    const haystack = `${product.name} ${product.producer}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const returnTo = `/admin/add?q=${encodeURIComponent(query)}&aisle=${encodeURIComponent(aisle)}&page=${safePage + 1}`;

  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <h2 className="text-[15px] font-semibold text-slate-900">Drinks on the public shop</h2>
      <p className="mt-1 text-[12px] leading-5 text-slate-500">
        {products.length.toLocaleString("en-KE")} drinks are on the website. Open Edit to change the picture, price, or description.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          placeholder="Search by drink or producer"
          aria-label="Search drinks on the shop"
          className="h-10 rounded-lg border border-slate-200 px-3 outline-none focus:border-[#ea2027]"
        />
        <select
          value={aisle}
          onChange={(event) => {
            setAisle(event.target.value);
            setPage(0);
          }}
          aria-label="Aisle"
          className="h-10 rounded-lg border border-slate-200 px-3 outline-none focus:border-[#ea2027]"
        >
          <option value="">All aisles</option>
          {aisles.map((item) => (
            <option key={item} value={item}>
              {aisleLabel(item)}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-3 text-[12px] text-slate-500">
        {filtered.length === 0
          ? "No drinks"
          : `Rows ${start + 1}–${start + visible.length} of ${filtered.length.toLocaleString("en-KE")}`}
      </p>
      {filtered.length === 0 ? <p className="py-6 text-sm text-slate-500">No drink matches that search.</p> : null}
      {filtered.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[11px] tracking-wide text-slate-400 uppercase">
              <tr>
                <th className="py-2 pr-3 font-medium">Picture</th>
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Description</th>
                <th className="py-2 pr-3 font-medium">Price</th>
                <th className="py-2 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => (
                <tr key={product.slug} className="border-t border-slate-100 align-middle">
                  <td className="py-2 pr-3">
                    {product.image ? (
                      // Uploaded pictures live on Supabase. A plain image avoids the optimizer allow-list.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt="" className="h-14 w-10 rounded-md bg-slate-50 object-contain" />
                    ) : (
                      <span className="block h-14 w-10 rounded-md bg-slate-50" />
                    )}
                  </td>
                  <td className="py-2 pr-3 font-semibold text-slate-900">{product.name}</td>
                  <td className="max-w-md py-2 pr-3 text-[12px] leading-5 text-slate-500">
                    {product.description ? <span className="line-clamp-2">{product.description}</span> : null}
                  </td>
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap text-[#ea2027]">{priceLabel(product)}</td>
                  <td className="py-2 text-right">
                    <Link
                      href={`/admin/edit/${encodeURIComponent(product.slug)}?from=${encodeURIComponent(returnTo)}`}
                      className="inline-flex h-9 items-center rounded-lg bg-[#ea2027] px-3 text-sm font-semibold text-white"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {pageCount > 1 ? (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[12px] text-slate-500">
            Page {safePage + 1} of {pageCount.toLocaleString("en-KE")}
          </span>
          <button
            type="button"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
