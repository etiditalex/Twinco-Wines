import { createProductAction } from "@/app/admin/actions";
import { ProductImageField } from "@/components/admin/product-image-field";
import { drinkAisles } from "@/content/aisles";
import { wineStyles } from "@/content/catalog";

const fieldClass = "h-10 rounded-lg border border-slate-200 px-3 outline-none focus:border-[#ea2027]";

export function AddProductForm() {
  return (
    <section className="max-w-3xl rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <h2 className="text-[15px] font-semibold text-slate-900">Add a drink</h2>
      <p className="mt-1 mb-4 text-[12px] leading-5 text-slate-500">
        Add the drink, its bottle sizes, and the product image. The shop uses this picture.
      </p>
      <form action={createProductAction} className="grid gap-4">
        <ProductImageField />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" name="name" required />
          <Field label="Producer" name="producer" required />
          <Field label="Country" name="country" required />
          <Field label="Region" name="region" />
          <Field label="Grape or base" name="grape" />
          <Field label="Alcohol" name="alcohol" />
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Aisle
            <select name="aisle" required className={fieldClass} defaultValue="wine">
              {drinkAisles.map((aisle) => (
                <option key={aisle.slug} value={aisle.slug}>
                  {aisle.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Wine style
            <select name="style" className={fieldClass} defaultValue="red">
              <option value="">Not a wine</option>
              {wineStyles.map((style) => (
                <option key={style.slug} value={style.slug}>
                  {style.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Area label="Description" name="description" />
        <Area label="Tasting note" name="tasting" />
        <Area label="Pairing" name="pairing" />
        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium text-slate-700">Bottle sizes</legend>
          <p className="text-[12px] text-slate-500">The first size is required. Leave the other rows blank if the drink has one size.</p>
          <SizeRow index={1} required />
          <SizeRow index={2} />
          <SizeRow index={3} />
        </fieldset>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input name="featured" type="checkbox" value="yes" className="h-4 w-4 accent-[#ea2027]" />
          Show this drink with the featured wines
        </label>
        <button type="submit" className="h-11 w-fit rounded-lg bg-[#ea2027] px-5 text-sm font-semibold text-white">
          Add to the shop
        </button>
      </form>
    </section>
  );
}

function Field({ label, name, required = false }: { label: string; name: string; required?: boolean }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      <input name={name} required={required} className={fieldClass} />
    </label>
  );
}

function Area({ label, name }: { label: string; name: string }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      <textarea name={name} rows={3} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#ea2027]" />
    </label>
  );
}

function SizeRow({ index, required = false }: { index: number; required?: boolean }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <label className="grid gap-1 text-[12px] text-slate-500">
        Size (ml)
        <input name={`size${index}`} type="number" min={50} max={6000} required={required} className={fieldClass} />
      </label>
      <label className="grid gap-1 text-[12px] text-slate-500">
        Price (KES)
        <input name={`price${index}`} type="number" min={0} required={required} className={fieldClass} />
      </label>
      <label className="grid gap-1 text-[12px] text-slate-500">
        Stock
        <input name={`stock${index}`} type="number" min={0} required={required} defaultValue={required ? 0 : undefined} className={fieldClass} />
      </label>
    </div>
  );
}
