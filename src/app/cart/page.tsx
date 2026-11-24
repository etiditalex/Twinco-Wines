import type { Metadata } from "next";
import { Suspense } from "react";
import { CartView } from "@/components/cart-view";
import { RememberProducts } from "@/components/remember-products";
import { addedCatalogProducts } from "@/lib/desk";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review bottles in your TwinCO Wines preview cart.",
};

export default function CartPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-16 text-muted">Loading the cart…</p>}>
      <CartBody />
    </Suspense>
  );
}

async function CartBody() {
  const added = await addedCatalogProducts();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <RememberProducts products={added} />
      <h1 className="text-4xl">Cart</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Change a quantity, remove a line, and check the subtotal. The cart stays in this browser
        after a reload. Delivery is added at checkout.
      </p>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
