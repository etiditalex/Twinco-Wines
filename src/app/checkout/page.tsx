import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";
import { RememberProducts } from "@/components/remember-products";
import { addedCatalogProducts, storefrontState } from "@/lib/desk";

export const metadata: Metadata = {
  title: "Booking request",
  description: "Choose a TwinCO Wines location and send a booking request. Payment is not taken here.",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-16 text-muted">Loading the booking form…</p>}>
      <CheckoutBody />
    </Suspense>
  );
}

async function CheckoutBody() {
  const [state, added] = await Promise.all([storefrontState(), addedCatalogProducts()]);
  const jar = await cookies();
  const saved = jar.get("twinco-location")?.value ?? "";
  const live: Record<string, { stock: number; priceKes: number }> = {};
  for (const [id, variant] of Object.entries(state.variants)) {
    live[id] = { stock: variant.stock, priceKes: variant.priceKes };
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold tracking-[0.16em] text-logo uppercase">Booking request</p>
      <h1 className="mt-2 text-4xl">Find a drink, choose a location, ask TwinCO to confirm</h1>
      <ol className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
        <li>1. Find a drink</li>
        <li>2. Choose a location</li>
        <li>3. Send the request</li>
        <li>4. TwinCO confirms it on the desk</li>
      </ol>
      <RememberProducts products={added} />
      <div className="mt-8">
        <CheckoutForm
          initialArea={saved}
          locations={state.locations.map((location) => ({
            id: location.id,
            name: location.name,
            feeKes: location.feeKes,
            eligible: location.eligible,
          }))}
          live={live}
          connected={state.connected && !state.error && Object.keys(state.variants).length > 0}
        />
      </div>
    </div>
  );
}
