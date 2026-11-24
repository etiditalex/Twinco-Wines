import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/content/store";

export const metadata: Metadata = {
  title: "About",
  description: "About the TwinCO Wines preview storefront for Nyali Centre, Mombasa.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">TwinCO Wines</h1>
      <p className="mt-4 leading-7">
        TwinCO Wines is a wine shop associated with {store.centre} on {store.street} in{" "}
        {store.locality}. This website is a delivery storefront prepared for that shop. It is not a
        history of the business, and it does not invent a founding year or a list of awards.
      </p>
      <p className="mt-4 leading-7 text-muted">
        Public directories place a shop by this name at Nyali Centre. Those listings do not agree
        on hours or on every phone number, so none of them are published here as official customer
        details. The address lines above stay unmarked as verified until TwinCO confirms the text
        that should appear on the site.
      </p>
      <h2 className="mt-10 text-3xl">What you can do on this preview</h2>
      <p className="mt-4 leading-7 text-muted">
        Search the sample catalog, open a style, choose a bottle size, and walk a guest checkout
        through to a server-checked summary. Prices and stock are examples. Payment is not
        connected, and a summary is not an order.
      </p>
      <p className="mt-4 leading-7 text-muted">
        Before any sale, TwinCO needs to approve the real inventory, the public contact details,
        the delivery map, the policies, the licence position for delivery, and a payment check that
        the server can verify. That list is in the project’s launch checklist.
      </p>
      <Link href="/contact" className="mt-6 inline-flex font-semibold text-logo underline">
        Contact and directions
      </Link>
    </div>
  );
}
