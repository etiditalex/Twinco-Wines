import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { selectLocation } from "@/app/locations/actions";
import { formatKes } from "@/lib/format";
import { storefrontState } from "@/lib/desk";

export const metadata: Metadata = {
  title: "Locations",
  description: "Choose a TwinCO Wines delivery location around Mombasa before you send a booking request.",
};

export default function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-16 text-muted">Loading locations…</p>}>
      <Locations searchParams={searchParams} />
    </Suspense>
  );
}

async function Locations({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : "/shop";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/admin") ? rawNext : "/shop";
  const state = await storefrontState();
  const selected = (await cookies()).get("twinco-location")?.value ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold tracking-[0.16em] text-logo uppercase">Locations</p>
      <h1 className="mt-2 text-4xl">Where should the bottles go?</h1>
      <ol className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
        <li>1. Find a drink</li>
        <li className="font-semibold text-navy">2. Choose a location</li>
        <li>3. Send the request</li>
        <li>4. TwinCO confirms it on the desk</li>
      </ol>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <CoastSketch />
        </div>
        <ul className="grid gap-3">
          {state.locations.map((location) => {
            const active = location.id === selected;
            return (
              <li key={location.id} className={`rounded-2xl border bg-white p-4 ${active ? "border-logo" : "border-line"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl">{location.name}</h2>
                    <p className="text-sm text-muted">{location.province}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{location.note}</p>
                  </div>
                  <p className="text-sm font-semibold text-navy">
                    {location.eligible ? formatKes(location.feeKes) : "Not served"}
                  </p>
                </div>
                {location.eligible ? (
                  <form action={selectLocation} className="mt-3">
                    <input type="hidden" name="location" value={location.id} />
                    <input type="hidden" name="next" value={next} />
                    <button type="submit" className="inline-flex min-h-11 items-center rounded-full bg-logo px-4 text-sm font-semibold text-white">
                      {active ? "Keep this location" : "Deliver here"}
                    </button>
                  </form>
                ) : (
                  <p className="mt-3 text-sm text-red-800">This location is on the map so a request can be refused.</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-6 text-sm">
        <Link href="/shop" className="font-semibold text-navy underline">
          Back to the drinks
        </Link>
      </p>
    </div>
  );
}

function CoastSketch() {
  return (
    <svg viewBox="0 0 200 230" className="h-full w-full" role="img" aria-label="Mombasa coast, with North Coast, the island, and the South Coast">
      <rect width="200" height="230" rx="16" fill="#f8fafc" />
      <path d="M118 16c32 4 66 34 58 78-8 32-30 42-52 30-16-10-22-40-6-108z" fill="#fecaca" />
      <path d="M78 96c22-10 48 4 44 40-4 32-30 42-50 22-16-16-14-48 6-62z" fill="#ea2027" />
      <path d="M68 168c30-10 82 8 88 46-16 22-70 24-96 2-12-16-8-40 8-48z" fill="#fda4af" />
      <text x="132" y="58" fontSize="9" fill="#7f1d1d">
        North Coast
      </text>
      <text x="78" y="124" fontSize="9" fill="#fff">
        Island
      </text>
      <text x="92" y="198" fontSize="9" fill="#7f1d1d">
        South Coast
      </text>
    </svg>
  );
}
