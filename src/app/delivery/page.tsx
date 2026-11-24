import type { Metadata } from "next";
import Link from "next/link";
import { deliveryConfig } from "@/content/delivery";
import { formatKes } from "@/lib/format";

export const metadata: Metadata = {
  title: "Delivery information",
  description: "Draft delivery areas, fees, and the checkout process for TwinCO Wines in Mombasa.",
};

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-semibold tracking-[0.16em] text-logo uppercase">Draft</p>
      <h1 className="mt-2 text-4xl">Delivery information</h1>
      <p className="mt-4 leading-7 text-muted">
        {deliveryConfig.summary} TwinCO has not approved these boundaries, fees, or times. Do not
        treat them as a promise of service.
      </p>
      <ol className="mt-8 grid gap-4">
        {[
          "Add a bottle size that the preview marks as in stock.",
          "Open checkout and choose the area that matches the address.",
          "Read the delivery fee and the final total before submitting.",
          "Submit a demo preview. Payment and dispatch stay off until TwinCO approves them.",
        ].map((step, index) => (
          <li key={step} className="flex gap-4 rounded-2xl border border-line p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
              {index + 1}
            </span>
            <span className="leading-7">{step}</span>
          </li>
        ))}
      </ol>
      <h2 className="mt-10 text-3xl">Draft areas</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <caption className="sr-only">Draft delivery areas and example fees in Kenyan shillings</caption>
          <thead>
            <tr className="border-b border-line text-navy">
              <th scope="col" className="py-3 pr-4 font-semibold">
                Area
              </th>
              <th scope="col" className="py-3 pr-4 font-semibold">
                Example fee
              </th>
              <th scope="col" className="py-3 pr-4 font-semibold">
                Status
              </th>
              <th scope="col" className="py-3 font-semibold">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {deliveryConfig.areas.map((area) => (
              <tr key={area.id} className="border-b border-line align-top">
                <th scope="row" className="py-3 pr-4 font-semibold text-navy">
                  {area.name}
                </th>
                <td className="py-3 pr-4">{area.eligible ? formatKes(area.feeKes) : "—"}</td>
                <td className="py-3 pr-4">{area.eligible ? "Eligible in the draft" : "Not served"}</td>
                <td className="py-3 text-muted">
                  {area.note} {area.timing}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-8 leading-7 text-muted">
        An address outside this list cannot finish checkout. Likoni is included as a refused area
        so that check can be tested. Timing, minimum orders, and what happens if nobody is home
        still need TwinCO’s decision.
      </p>
      <Link href="/checkout" className="mt-6 inline-flex min-h-11 items-center font-semibold text-logo underline">
        Review a delivery at checkout
      </Link>
    </div>
  );
}
