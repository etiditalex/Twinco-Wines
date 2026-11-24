import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearCart } from "@/components/clear-cart";
import { findBooking } from "@/lib/desk";
import { formatKes, formatSize } from "@/lib/format";
import { decodePreview } from "@/lib/preview-token";

export const metadata: Metadata = {
  title: "Booking request",
  description: "A TwinCO Wines booking request waiting for confirmation on the sales desk.",
};

export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-16">Checking this submission…</p>}>
      <Confirmation searchParams={searchParams} />
    </Suspense>
  );
}

async function Confirmation({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const refRaw = params.ref;
  const reference = Array.isArray(refRaw) ? refRaw[0] : refRaw;
  if (reference) {
    const booking = await findBooking(reference);
    if (!booking) {
      return (
        <Notice
          title="This booking was not found"
          body="The reference is missing from the shop database. Send the request again from checkout. Nothing was confirmed."
        />
      );
    }
    const placed = new Date(booking.createdAt);
    const statusLine =
      booking.status === "confirmed"
        ? "TwinCO has confirmed this request."
        : booking.status === "declined"
          ? "TwinCO declined this request. The bottles were not taken off the shelf."
          : "TwinCO has not confirmed this yet. The desk checks that every bottle is still available before it is confirmed. No payment was taken.";
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ClearCart />
        <p className="rounded-2xl bg-mist px-4 py-3 text-sm leading-6 text-navy">{statusLine}</p>
        <h1 className="mt-6 text-4xl">{booking.reference}</h1>
        <p className="mt-2 text-muted">
          {booking.status}
          {Number.isNaN(placed.getTime()) ? "" : ` · ${placed.toLocaleString("en-KE")}`}
        </p>
        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          <Item term="Name" value={booking.customerName} />
          <Item term="Mobile" value={booking.phone} />
          <Item term="Email" value={booking.email} />
          <Item term="Location" value={booking.locationName} />
          <Item term="Address" value={booking.address} />
          <Item term="Payment" value={booking.payment} />
          {booking.notes ? <Item term="Note" value={booking.notes} /> : null}
        </dl>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {booking.lines.map((line) => (
            <li key={`${line.name}-${line.sizeMl}`} className="flex items-start justify-between gap-4 py-4">
              <span>
                <span className="block font-semibold text-navy">
                  {line.quantity} × {line.name}
                </span>
                <span className="text-sm text-muted">
                  {formatSize(line.sizeMl)} · {formatKes(line.unitPriceKes)} each
                </span>
              </span>
              <span className="font-semibold">{formatKes(line.unitPriceKes * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid gap-2 text-sm">
          <Row term="Subtotal" value={formatKes(booking.subtotalKes)} />
          <Row term="Delivery fee" value={formatKes(booking.feeKes)} />
          <Row term="Total" value={formatKes(booking.totalKes)} strong />
        </dl>
        <div className="mt-8">
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-logo px-5 text-sm font-semibold text-white"
          >
            Back to the shop
          </Link>
        </div>
      </div>
    );
  }

  const raw = params.preview;
  const token = Array.isArray(raw) ? raw[0] : raw;

  if (!token) {
    return (
      <Notice
        title="No booking on this page"
        body="A booking appears here after checkout accepts the drinks, the location, and the age confirmations."
      />
    );
  }

  const order = decodePreview(token);
  if (!order) {
    return (
      <Notice
        title="This preview could not be verified"
        body="The link is incomplete or has been altered. Go back to checkout and submit the demo again. No order was placed."
      />
    );
  }

  const placed = new Date(order.createdAt);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="rounded-2xl bg-mist px-4 py-3 text-sm leading-6 text-navy">
        Demo order preview. No order was placed and no payment was taken. Your cart is unchanged.
        This link contains the details you typed. Do not share it.
      </p>
      <h1 className="mt-6 text-4xl">Preview {order.id}</h1>
      <p className="mt-2 text-muted">
        Checked on the server
        {Number.isNaN(placed.getTime()) ? "" : ` · ${placed.toLocaleString("en-KE")}`}
      </p>
      <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
        <Item term="Name" value={order.customerName} />
        <Item term="Mobile" value={order.phoneMasked} />
        <Item term="Email" value={order.email} />
        <Item term="Area" value={order.areaName} />
        <Item term="Address" value={order.address} />
        {order.notes ? <Item term="Note" value={order.notes} /> : null}
      </dl>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {order.lines.map((line) => (
          <li key={`${line.slug}-${line.variantId}`} className="flex items-start justify-between gap-4 py-4">
            <span>
              <span className="block font-semibold text-navy">
                {line.quantity} × {line.name}
              </span>
              <span className="text-sm text-muted">
                {formatSize(line.sizeMl)} · {formatKes(line.unitPriceKes)} each
              </span>
            </span>
            <span className="font-semibold">{formatKes(line.lineTotalKes)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 grid gap-2 text-sm">
        <Row term="Subtotal" value={formatKes(order.subtotalKes)} />
        <Row term="Delivery fee" value={formatKes(order.deliveryFeeKes)} />
        <Row term="Total" value={formatKes(order.totalKes)} strong />
      </dl>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-logo px-5 text-sm font-semibold text-white"
        >
          Back to the shop
        </Link>
        <Link
          href="/cart"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-navy px-5 text-sm font-semibold text-navy"
        >
          Return to cart
        </Link>
      </div>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl">{title}</h1>
      <p className="mt-4 max-w-xl leading-7 text-muted">{body}</p>
      <Link
        href="/checkout"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-logo px-5 text-sm font-semibold text-white"
      >
        Go to checkout
      </Link>
    </div>
  );
}

function Item({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-navy">{term}</dt>
      <dd className="mt-1 text-muted">{value}</dd>
    </div>
  );
}

function Row({ term, value, strong = false }: { term: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "text-base font-semibold text-navy" : ""}`}>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}
