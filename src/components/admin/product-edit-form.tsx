"use client";

import { useFormStatus } from "react-dom";
import { saveShopProductAction } from "@/app/admin/actions";
import { ProductImageField } from "@/components/admin/product-image-field";
import { aisleLabel } from "@/content/aisles";
import type { EditorProduct } from "@/lib/desk";
import { formatSize } from "@/lib/format";

const fieldClass = "h-10 rounded-lg border border-slate-200 px-3 outline-none focus:border-[#ea2027]";

function SaveChangesButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="h-11 w-fit rounded-lg bg-[#ea2027] px-5 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export function ProductEditForm({ product, back }: { product: EditorProduct; back: string }) {
  return (
    <form action={saveShopProductAction} className="grid max-w-3xl gap-4 rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <input type="hidden" name="slug" value={product.slug} />
      <input type="hidden" name="back" value={back} />
      <p className="text-[12px] text-slate-500">{aisleLabel(product.aisle)}</p>
      <ProductImageField currentImage={product.image} required={false} />
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Name
        <input name="name" defaultValue={product.name} required className={fieldClass} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Producer
        <input name="producer" defaultValue={product.producer} required className={fieldClass} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Description
        <textarea
          name="description"
          rows={4}
          defaultValue={product.description}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#ea2027]"
        />
      </label>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-slate-700">Price and stock</legend>
        {product.variants.map((variant) => (
          <div key={variant.id} className="grid gap-2 sm:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-end">
            <input type="hidden" name="variantId" value={variant.id} />
            <input type="hidden" name="sizeMl" value={variant.sizeMl} />
            <span className="pb-2 text-sm text-slate-600">{formatSize(variant.sizeMl)}</span>
            <label className="grid gap-1 text-[12px] text-slate-500">
              Price (KES)
              <input name="price" type="number" min={0} defaultValue={variant.priceKes} required className={fieldClass} />
            </label>
            <label className="grid gap-1 text-[12px] text-slate-500">
              Stock
              <input name="stock" type="number" min={0} defaultValue={variant.stock} required className={fieldClass} />
            </label>
          </div>
        ))}
      </fieldset>
      <SaveChangesButton />
    </form>
  );
}
