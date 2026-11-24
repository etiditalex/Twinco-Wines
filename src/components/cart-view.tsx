"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { getProduct } from "@/content/catalog";
import { formatKes, formatSize } from "@/lib/format";

export function CartView() {
  const { lines, ready, setQuantity, removeLine } = useCart();
  const [notice, setNotice] = useState("");

  if (!ready) {
    return <p className="text-muted">Loading your cart…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-foam px-6 py-12 text-center">
        <h2 className="text-3xl">Your cart is empty</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Add a bottle from the preview catalog. Sizes that are marked unavailable cannot be added.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-logo px-5 text-sm font-semibold text-white hover:bg-logo-deep"
        >
          Shop wines
        </Link>
      </div>
    );
  }

  const resolved = lines.map((line) => {
    const product = getProduct(line.slug);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    return { line, product, variant };
  });

  const subtotal = resolved.reduce((sum, item) => {
    if (!item.variant || item.variant.stock < 1) return sum;
    return sum + item.variant.priceKes * item.line.quantity;
  }, 0);

  const blocked = resolved.some((item) => !item.product || !item.variant || item.variant.stock < 1);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <ul className="grid gap-4">
        {resolved.map(({ line, product, variant }) => {
          const key = `${line.slug}-${line.variantId}`;
          const unavailable = !product || !variant || variant.stock < 1;
          return (
            <li key={key} className="rounded-2xl border border-line p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl">
                    {product ? (
                      <Link href={`/product/${product.slug}`} className="hover:text-logo">
                        {product.name}
                      </Link>
                    ) : (
                      "Unknown wine"
                    )}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {variant ? formatSize(variant.sizeMl) : "Unknown size"}
                    {product ? ` · ${product.producer}` : ""}
                  </p>
                  {unavailable ? (
                    <p className="mt-2 text-sm text-red-800">
                      This size is unavailable and will be refused at checkout. Remove it to continue.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm font-semibold text-navy">
                      {formatKes(variant.priceKes)} each
                      <span className="ml-2 font-medium text-muted">Preview price</span>
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="min-h-11 rounded-full px-3 text-sm font-semibold text-navy underline"
                  onClick={() => removeLine(line.slug, line.variantId)}
                >
                  Remove {product?.name ?? "item"}
                  {variant ? `, ${formatSize(variant.sizeMl)}` : ""}
                </button>
              </div>
              {variant && product && variant.stock > 0 ? (
                <label className="mt-4 grid w-28 gap-1 text-sm font-semibold text-navy" htmlFor={`qty-${key}`}>
                  Quantity
                  <input
                    id={`qty-${key}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={variant.stock}
                    value={line.quantity}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (!Number.isInteger(next)) return;
                      const result = setQuantity(line.slug, line.variantId, next);
                      setNotice(result.message);
                    }}
                    className="min-h-11 rounded-xl border border-line px-3 font-normal"
                  />
                </label>
              ) : null}
            </li>
          );
        })}
      </ul>
      <aside className="h-fit rounded-3xl bg-mist p-5">
        <h2 className="text-2xl">Subtotal</h2>
        <p className="mt-3 text-3xl font-semibold text-navy">{formatKes(subtotal)}</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Delivery is not included. Choose an area at checkout to see the draft fee and the final
          total before you submit.
        </p>
        <p role="status" className="mt-3 text-sm text-navy">
          {notice}
        </p>
        {blocked ? (
          <p className="mt-4 text-sm text-red-800">Remove unavailable items before checkout.</p>
        ) : (
          <Link
            href="/checkout"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-logo px-5 text-sm font-semibold text-white hover:bg-logo-deep"
          >
            Continue to checkout
          </Link>
        )}
      </aside>
    </div>
  );
}
