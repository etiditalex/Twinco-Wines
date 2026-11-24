"use client";

import { usePathname, useRouter } from "next/navigation";
import { displayDeskDate, type DeskFilters, type DeskLocation, type DeskProduct } from "@/lib/desk";
import { paymentMethods, promotionNames } from "@/lib/drink-category";

export function DeskFiltersForm({
  filters,
  locations,
  products,
  provinces,
}: {
  filters: DeskFilters;
  locations: DeskLocation[];
  products: DeskProduct[];
  provinces: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  function apply(form: HTMLFormElement) {
    const data = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (typeof value === "string" && value.trim()) params.set(key, value.trim());
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <form
      className="grid gap-3"
      onChange={(event) => apply(event.currentTarget)}
      onSubmit={(event) => {
        event.preventDefault();
        apply(event.currentTarget);
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-[11px] font-medium text-slate-500">
          Start date
          <input
            name="from"
            defaultValue={displayDeskDate(filters.from)}
            className={fieldClass}
            aria-label="Start date"
          />
        </label>
        <label className="grid gap-1 text-[11px] font-medium text-slate-500">
          End date
          <input name="to" defaultValue={displayDeskDate(filters.to)} className={fieldClass} aria-label="End date" />
        </label>
      </div>
      <Select label="Province" name="province" value={filters.province} options={provinces} />
      <Select label="Store" name="store" value={filters.store} options={locations.map((location) => ({ value: location.id, label: location.name }))} />
      <Select label="Product" name="product" value={filters.product} options={products.map((product) => ({ value: product.slug, label: product.name }))} />
      <Select label="Payment" name="payment" value={filters.payment} options={[...paymentMethods]} />
      <Select label="Promotion" name="promotion" value={filters.promotion} options={[...promotionNames]} />
    </form>
  );
}

function Select({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value: string;
  options: (string | { value: string; label: string })[];
}) {
  return (
    <label className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-2 text-[12px] text-slate-600">
      <span>{label}</span>
      <select name={name} defaultValue={value} className={fieldClass} aria-label={label}>
        <option value="">(All)</option>
        {options.map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

const fieldClass =
  "h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-slate-800 outline-none focus:border-[#ea2027]";
