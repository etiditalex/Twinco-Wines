"use client";

import { useId, useState } from "react";
import { productKindLabel, type CatalogProduct } from "@/content/catalog";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { commerce } from "@/content/commerce";
import { formatKes, formatSize } from "@/lib/format";

export function VariantPicker({ product }: { product: CatalogProduct }) {
  const multiple = product.variants.length > 1;
  const [variantId, setVariantId] = useState(multiple ? "" : product.variants[0]?.id ?? "");
  const [quantityState, setQuantityState] = useState({ variantId: "", quantity: 1 });
  const variant = product.variants.find((item) => item.id === variantId);
  const kind = productKindLabel(product);
  const groupName = useId();
  const quantity = quantityState.variantId === variantId ? quantityState.quantity : 1;
  const max = variant ? Math.min(Math.max(variant.stock, 1), commerce.maxQuantityPerLine) : 1;

  let actionLabel = "Add to cart";
  let disabled = false;
  if (multiple && !variant) {
    actionLabel = "Select a size";
    disabled = true;
  } else if (!variant || variant.stock < 1) {
    actionLabel = "Unavailable";
    disabled = true;
  }

  return (
    <div className="grid gap-5">
      <fieldset id="size" className="grid gap-3">
        <legend className="text-sm font-semibold text-navy">Bottle size</legend>
        {product.variants.map((item) => {
          const unavailable = item.stock < 1;
          return (
            <label
              key={item.id}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 ${
                variantId === item.id ? "border-logo bg-mist" : "border-line bg-white"
              } ${unavailable ? "opacity-80" : ""}`}
            >
              <input
                type="radio"
                name={groupName}
                value={item.id}
                checked={variantId === item.id}
                onChange={() => setVariantId(item.id)}
                className="mt-1"
              />
              <span>
                <span className="block font-semibold text-navy">
                  {formatSize(item.sizeMl)} · {formatKes(item.priceKes)}
                </span>
                <span className="block text-sm text-muted">
                  {unavailable ? "Unavailable in this preview" : `In stock · preview qty ${item.stock}`}
                  {" · "}
                  {kind}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="grid gap-2">
        <label htmlFor="quantity" className="text-sm font-semibold text-navy">
          Quantity
        </label>
        <input
          id="quantity"
          type="number"
          inputMode="numeric"
          min={1}
          max={Math.max(max, 1)}
          value={quantity}
          disabled={!variant || variant.stock < 1}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isFinite(next)) return;
            setQuantityState({
              variantId,
              quantity: Math.max(1, Math.min(max || 1, Math.trunc(next))),
            });
          }}
          className="h-11 w-28 rounded-xl border border-line px-3"
        />
      </div>

      {variant && variant.stock < 1 ? (
        <p role="status" className="text-sm text-red-800">
          The {formatSize(variant.sizeMl)} size of {product.name} is unavailable, so it cannot be
          added.
        </p>
      ) : null}

      <AddToCartButton
        slug={product.slug}
        variantId={variant?.id ?? ""}
        quantity={quantity}
        label={actionLabel}
        disabled={disabled}
      />
      <p className="text-sm text-muted">Preview price. This does not reserve a bottle.</p>
    </div>
  );
}
