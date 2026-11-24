"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { wineStyles } from "@/content/catalog";
import { formatSize } from "@/lib/format";

type ShopControlsProps = {
  action: string;
  lockedStyle?: string;
  countries: string[];
  sizes: number[];
};

export function ShopControls(props: ShopControlsProps) {
  const params = useSearchParams();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const keys = ["q", "country", "size", "availability"];
  if (!props.lockedStyle) keys.push("style");
  const activeCount = keys.filter((key) => params.get(key)).length;

  return (
    <>
      <div className="hidden rounded-sm bg-white p-3 shadow-sm md:block">
        <FilterForm {...props} idPrefix="desk" />
      </div>
      <div className="md:hidden">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-sm border border-navy bg-white px-4 text-sm font-semibold text-navy"
          onClick={() => dialogRef.current?.showModal()}
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <dialog ref={dialogRef} className="sheet" aria-labelledby="filter-title">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="filter-title" className="text-2xl">
              Filters
            </h2>
            <button
              type="button"
              className="min-h-11 rounded-full px-3 text-sm font-semibold text-navy"
              onClick={() => dialogRef.current?.close()}
            >
              Close
            </button>
          </div>
          <FilterForm {...props} idPrefix="drawer" onDone={() => dialogRef.current?.close()} />
        </dialog>
      </div>
    </>
  );
}

function FilterForm({
  action,
  lockedStyle,
  countries,
  sizes,
  idPrefix,
  onDone,
}: ShopControlsProps & { idPrefix: string; onDone?: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const urlValues = {
    q: params.get("q") ?? "",
    style: params.get("style") ?? "",
    country: params.get("country") ?? "",
    size: params.get("size") ?? "",
    availability: params.get("availability") ?? "",
    sort: params.get("sort") || "featured",
  };
  const signature = JSON.stringify(urlValues);
  const [draft, setDraft] = useState<{ signature: string; values: typeof urlValues } | null>(null);
  const values = draft?.signature === signature ? draft.values : urlValues;

  function update(partial: Partial<typeof urlValues>) {
    setDraft({ signature, values: { ...values, ...partial } });
  }

  return (
    <form
      action={action}
      method="get"
      className={idPrefix === "desk" ? "grid gap-3 md:grid-cols-3 xl:grid-cols-6" : "grid gap-4"}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const next = new URLSearchParams();
        for (const [key, value] of data.entries()) {
          if (typeof value !== "string" || value === "") continue;
          if (key === "sort" && value === "featured") continue;
          next.set(key, value);
        }
        const query = next.toString();
        router.push(query ? `${action}?${query}` : action);
        onDone?.();
      }}
    >
      <label className="grid gap-1 text-sm font-semibold text-navy" htmlFor={`${idPrefix}-q`}>
        Search
        <input
          id={`${idPrefix}-q`}
          name="q"
          value={values.q}
          onChange={(event) => update({ q: event.target.value })}
          placeholder="Name, producer, or style"
          className="min-h-11 rounded-sm border border-line px-3 font-normal text-ink"
        />
      </label>

      {lockedStyle ? null : (
        <label className="grid gap-1 text-sm font-semibold text-navy" htmlFor={`${idPrefix}-style`}>
          Style
          <select
            id={`${idPrefix}-style`}
            name="style"
            value={values.style}
            onChange={(event) => update({ style: event.target.value })}
            className="min-h-11 rounded-sm border border-line bg-white px-3 font-normal text-ink"
          >
            <option value="">All styles</option>
            {wineStyles.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="grid gap-1 text-sm font-semibold text-navy" htmlFor={`${idPrefix}-country`}>
        Country
        <select
          id={`${idPrefix}-country`}
          name="country"
          value={values.country}
          onChange={(event) => update({ country: event.target.value })}
          className="min-h-11 rounded-sm border border-line bg-white px-3 font-normal text-ink"
        >
          <option value="">All countries</option>
          {countries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-navy" htmlFor={`${idPrefix}-size`}>
        Bottle size
        <select
          id={`${idPrefix}-size`}
          name="size"
          value={values.size}
          onChange={(event) => update({ size: event.target.value })}
          className="min-h-11 rounded-sm border border-line bg-white px-3 font-normal text-ink"
        >
          <option value="">All sizes</option>
          {sizes.map((item) => (
            <option key={item} value={String(item)}>
              {formatSize(item)}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-navy" htmlFor={`${idPrefix}-stock`}>
        Availability
        <select
          id={`${idPrefix}-stock`}
          name="availability"
          value={values.availability}
          onChange={(event) => update({ availability: event.target.value })}
          className="min-h-11 rounded-sm border border-line bg-white px-3 font-normal text-ink"
        >
          <option value="">Any preview stock</option>
          <option value="in-stock">In stock only</option>
        </select>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-navy" htmlFor={`${idPrefix}-sort`}>
        Sort
        <select
          id={`${idPrefix}-sort`}
          name="sort"
          value={values.sort}
          onChange={(event) => {
            update({ sort: event.target.value });
            event.currentTarget.form?.requestSubmit();
          }}
          className="min-h-11 rounded-sm border border-line bg-white px-3 font-normal text-ink"
        >
          <option value="featured">Featured</option>
          <option value="name">Name</option>
          <option value="price-asc">Price, low to high</option>
          <option value="price-desc">Price, high to low</option>
        </select>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-logo px-5 text-sm font-semibold text-white hover:bg-logo-deep"
        >
          Apply filters
        </button>
        <a
          href={action}
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-navy px-5 text-sm font-semibold text-navy"
        >
          Clear
        </a>
      </div>
    </form>
  );
}
