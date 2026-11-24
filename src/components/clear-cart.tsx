"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart-provider";

export function ClearCart() {
  const { clear } = useCart();
  const once = useRef(false);
  useEffect(() => {
    if (once.current) return;
    once.current = true;
    clear();
  }, [clear]);
  return null;
}
