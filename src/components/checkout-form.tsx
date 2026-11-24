"use client";

import Link from "next/link";
import { cloneElement, isValidElement, useActionState, useState, type ReactElement } from "react";
import { getProduct } from "@/content/catalog";
import { paymentMethods, promotionNames } from "@/lib/drink-category";
import { useCart } from "@/components/cart-provider";
import { formatKes, formatSize } from "@/lib/format";
import { submitDemoCheckout, type CheckoutState } from "@/app/checkout/actions";

type CheckoutLocation = { id: string; name: string; feeKes: number; eligible: boolean };

const initialCheckoutState: CheckoutState = { errors: {}, formError: "" };

export function CheckoutForm({
  initialArea,
  locations,
  live,
  connected,
}: {
  initialArea: string;
  locations: CheckoutLocation[];
  live: Record<string, { stock: number; priceKes: number }>;
  connected: boolean;
}) {
  const { lines, ready } = useCart();
  const [state, formAction, pending] = useActionState(submitDemoCheckout, initialCheckoutState);
  const [areaId, setAreaId] = useState(initialArea);
  const errors = state?.errors ?? {};
  const formError = state?.formError ?? "";
  const selectedArea = locations.find((area) => area.id === areaId);
  const liveAreaMessage =
    selectedArea && !selectedArea.eligible
      ? `${selectedArea.name} is outside the delivery area, so this request cannot include it.`
      : "";
  const areaError = errors.area || liveAreaMessage;

  const displayLines = lines.flatMap((line) => {
    const product = getProduct(line.slug);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    const offered = live[`${line.slug}:${line.variantId}`];
    if (!product || !variant) {
      return [
        {
          key: `${line.slug}-${line.variantId}`,
          label: "Unknown catalog line",
          detail: "This line will be refused.",
          amount: null as number | null,
        },
      ];
    }
    const stock = offered?.stock ?? variant.stock;
    const price = offered?.priceKes ?? variant.priceKes;
    const blocked = stock < 1 || line.quantity > stock;
    return [
      {
        key: `${line.slug}-${line.variantId}`,
        label: `${line.quantity} × ${product.name}`,
        detail: blocked ? `${formatSize(variant.sizeMl)} is not available for this quantity` : formatSize(variant.sizeMl),
        amount: blocked ? null : price * line.quantity,
      },
    ];
  });
  const subtotal = displayLines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
  const fee = selectedArea?.eligible ? selectedArea.feeKes : null;
  const total = fee === null ? null : subtotal + fee;

  if (!ready) {
    return <p className="text-muted">Loading your cart…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-foam px-6 py-12">
        <h2 className="text-3xl">Nothing to check out</h2>
        <p className="mt-3 max-w-lg text-muted">Find a drink before you choose a location and send a booking request.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-logo px-5 text-sm font-semibold text-white"
        >
          Shop wines
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]" noValidate>
      <div className="grid gap-5">
        {connected ? null : (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            The shop database is not connected yet, so this request cannot be saved.
          </p>
        )}
        {formError ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {formError}
          </p>
        ) : null}
        <input type="hidden" name="lines" value={JSON.stringify(lines)} />

        <Field id="name" label="Full name" error={errors.name}>
          <input id="name" name="name" autoComplete="name" required className={inputClass} />
        </Field>
        <Field id="phone" label="Mobile number" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="07… or +254…"
            className={inputClass}
          />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
        </Field>
        <Field id="area" label="Location" error={areaError}>
          <select
            id="area"
            name="area"
            required
            value={areaId}
            onChange={(event) => setAreaId(event.target.value)}
            className={inputClass}
          >
            <option value="">Choose a location</option>
            {locations.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
                {area.eligible ? ` · ${formatKes(area.feeKes)} delivery` : " · not served"}
              </option>
            ))}
          </select>
        </Field>
        <p className="-mt-3 text-sm">
          <Link href="/locations?next=/checkout" className="font-semibold text-navy underline">
            Open the location map
          </Link>
        </p>
        <Field id="payment" label="Payment" error={errors.payment}>
          <select id="payment" name="payment" required defaultValue="M-Pesa" className={inputClass}>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </Field>
        <Field id="promotion" label="Promotion" error={errors.promotion}>
          <select id="promotion" name="promotion" defaultValue="None" className={inputClass}>
            <option value="None">No promotion</option>
            {promotionNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="address" label="Estate, street, and landmark" error={errors.address}>
          <textarea id="address" name="address" required rows={3} className={inputClass} />
        </Field>
        <Field id="notes" label="Note for the driver (optional)" error={errors.notes}>
          <textarea id="notes" name="notes" rows={3} className={inputClass} />
        </Field>

        <Check
          id="age"
          name="age"
          error={errors.age}
          label="I am 18 or older, and I am not buying wine for anyone under 18."
        />
        <Check
          id="handover"
          name="handover"
          error={errors.handover}
          label="The adult who receives the wine will show a Kenyan national ID or a passport."
        />
        <Check
          id="request"
          name="request"
          error={errors.request}
          label="I understand this sends a booking request. TwinCO confirms it after checking the bottles are still available. No payment is taken on this page."
        />

        {errors.cart ? (
          <p role="alert" className="text-sm text-red-800">
            {errors.cart}
          </p>
        ) : null}
        {Object.entries(errors)
          .filter(([key]) => key.startsWith("line-"))
          .map(([key, message]) => (
            <p key={key} role="alert" className="text-sm text-red-800">
              {message}
            </p>
          ))}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-logo px-5 text-sm font-semibold text-white hover:bg-logo-deep disabled:cursor-wait disabled:bg-logo/70"
        >
          {pending ? "Checking availability…" : "Send booking request"}
        </button>
      </div>

      <aside className="h-fit rounded-3xl bg-mist p-5">
        <h2 className="text-2xl">Review</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          The fee and total update when you choose a location. Availability is checked against the
          shelf count when you send the request.
        </p>
        <ul className="mt-4 grid gap-3 text-sm">
          {displayLines.map((line) => (
            <li key={line.key} className="flex justify-between gap-3">
              <span>
                {line.label}
                <span className="block text-muted">{line.detail}</span>
              </span>
              <span className="font-semibold text-navy">{line.amount === null ? "—" : formatKes(line.amount)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid gap-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt>Subtotal</dt>
            <dd className="font-semibold">{formatKes(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Delivery fee</dt>
            <dd className="font-semibold">{fee === null ? "Choose an area" : formatKes(fee)}</dd>
          </div>
          <div className="flex justify-between gap-3 text-base">
            <dt className="font-semibold text-navy">Total</dt>
            <dd className="font-semibold text-navy">{total === null ? "—" : formatKes(total)}</dd>
          </div>
        </dl>
        {liveAreaMessage ? <p className="mt-3 text-sm text-red-800">{liveAreaMessage}</p> : null}
        <p className="mt-4 text-sm text-muted">
          <Link href="/cart" className="font-semibold text-navy underline">
            Edit the cart
          </Link>
        </p>
      </aside>
    </form>
  );
}

const inputClass =
  "min-h-11 w-full rounded-xl border border-line bg-white px-3 py-2 text-base font-normal text-ink";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactElement<{ "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}) {
  const describedBy = error ? `${id}-error` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </label>
      {control}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Check({
  id,
  name,
  label,
  error,
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3 text-sm leading-6">
        <input
          id={id}
          name={name}
          type="checkbox"
          value="yes"
          className="mt-1"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span>{label}</span>
      </label>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
