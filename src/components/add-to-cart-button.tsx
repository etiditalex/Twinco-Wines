"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";

export function AddToCartButton({
  slug,
  variantId,
  quantity = 1,
  label,
  disabled = false,
  appearance = "button",
}: {
  slug: string;
  variantId: string;
  quantity?: number;
  label: string;
  disabled?: boolean;
  appearance?: "button" | "icon";
}) {
  const { addLine } = useCart();
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(true);

  return (
    <div className={appearance === "icon" ? "w-min" : undefined}>
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        className={
          appearance === "icon"
            ? "text-ink hover:text-logo disabled:cursor-not-allowed disabled:text-muted"
            : "inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-logo px-4 text-sm font-semibold text-white hover:bg-logo-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        }
        onClick={() => {
          const result = addLine({ slug, variantId, quantity });
          setOk(result.ok);
          setMessage(result.message);
        }}
      >
        {appearance === "icon" ? <CartPlusIcon /> : label}
      </button>
      <p role="status" className={appearance === "icon" ? "sr-only" : `mt-2 text-sm ${ok ? "text-ink" : "text-red-800"}`}>
        {message}
      </p>
    </div>
  );
}

function CartPlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="aspect-square w-5" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0" />
    </svg>
  );
}
