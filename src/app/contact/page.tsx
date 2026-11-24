import type { Metadata } from "next";
import { store } from "@/content/store";

export const metadata: Metadata = {
  title: "Contact",
  description: "Customer contact details for TwinCO Wines. Unpublished fields are marked as unconfirmed.",
};

export default function ContactPage() {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.mapsSearchQuery)}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Contact</h1>
      <p className="mt-4 leading-7 text-muted">
        Only details TwinCO has confirmed are shown as the shop’s public contacts. Empty rows
        below are waiting for that confirmation. Edit them in <code>src/content/store.ts</code>.
      </p>
      <dl className="mt-8 grid gap-4">
        <Row
          term="Shop"
          value={`${store.tradingName}, ${store.centre}`}
          note={store.addressVerified ? "Confirmed by TwinCO." : "Location text is not marked verified."}
        />
        <Row
          term="Address"
          value={`${store.street}, ${store.locality}, ${store.country}`}
          note={
            store.addressVerified
              ? "Confirmed by TwinCO."
              : "Directories mention Nyali Centre on Links Road. Confirm the public address before relying on it."
          }
        />
        <Row
          term="Phone"
          value={store.phoneVerified && store.phone ? store.phone : "Not confirmed"}
          note={
            store.phoneVerified
              ? "Confirmed by TwinCO."
              : "A business directory has listed +254 720 044444 for a shop by this name. That number is not published here as the order line."
          }
        />
        <Row
          term="Email"
          value={store.emailVerified && store.email ? store.email : "Not confirmed"}
          note={store.emailVerified ? "Confirmed by TwinCO." : "No customer email has been confirmed."}
        />
        <Row
          term="WhatsApp"
          value={store.whatsapp || "Not confirmed"}
          note="Add a number in the store file only if TwinCO wants it used for customer messages."
        />
        <Row
          term="Hours"
          value={
            store.hoursVerified && store.hours.length > 0
              ? store.hours.map((slot) => `${slot.day}: ${slot.hours}`).join(" · ")
              : "Not confirmed"
          }
          note="Public directories disagree, so no opening hours are shown as official."
        />
      </dl>
      <p className="mt-8 leading-7">
        <a className="font-semibold text-logo underline" href={maps}>
          Search this name on Google Maps
        </a>
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">
        The map link is a search, not a pin TwinCO has checked. Replace it with a confirmed map
        link when the shop approves one.
      </p>
    </div>
  );
}

function Row({ term, value, note }: { term: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-line px-4 py-4">
      <dt className="text-sm font-semibold text-navy">{term}</dt>
      <dd className="mt-1 text-lg">{value}</dd>
      <dd className="mt-1 text-sm text-muted">{note}</dd>
    </div>
  );
}
