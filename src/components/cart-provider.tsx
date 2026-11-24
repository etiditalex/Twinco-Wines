"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { commerce } from "@/content/commerce";
import { getProduct } from "@/content/catalog";
import { formatSize } from "@/lib/format";
import type { CartLineInput } from "@/lib/pricing";

const STORAGE_KEY = "twinco-demo-cart";

type CartResult = { ok: boolean; message: string };

type CartContextValue = {
  lines: CartLineInput[];
  ready: boolean;
  count: number;
  addLine: (line: CartLineInput) => CartResult;
  setQuantity: (slug: string, variantId: string, quantity: number) => CartResult;
  removeLine: (slug: string, variantId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const listeners = new Set<() => void>();
let snapshot: CartLineInput[] = [];
let loaded = false;

function sameLine(line: CartLineInput, slug: string, variantId: string) {
  return line.slug === slug && line.variantId === variantId;
}

function readStored(): CartLineInput[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const candidate = entry as Record<string, unknown>;
      const slug = typeof candidate.slug === "string" ? candidate.slug : "";
      const variantId = typeof candidate.variantId === "string" ? candidate.variantId : "";
      const quantity = Number(candidate.quantity);
      if (!slug || !variantId || !Number.isInteger(quantity) || quantity < 1) return [];
      return [{ slug, variantId, quantity }];
    });
  } catch {
    return [];
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  snapshot = readStored();
}

function emit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    loaded = true;
    snapshot = readStored();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  ensureLoaded();
  return snapshot;
}

const emptyLines: CartLineInput[] = [];

function getServerSnapshot() {
  return emptyLines;
}

function subscribeReady() {
  return () => {};
}

function getReadySnapshot() {
  return true;
}

function getReadyServerSnapshot() {
  return false;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribeReady, getReadySnapshot, getReadyServerSnapshot);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);

    function addLine(line: CartLineInput): CartResult {
      const product = getProduct(line.slug);
      const variant = product?.variants.find((item) => item.id === line.variantId);
      if (!product || !variant) {
        return { ok: false, message: "That bottle is not in the shop list." };
      }
      const current = snapshot.find((item) => sameLine(item, line.slug, line.variantId));
      const requested = (current?.quantity ?? 0) + line.quantity;
      if (requested > commerce.maxQuantityPerLine) {
        return {
          ok: false,
          message: `Only ${commerce.maxQuantityPerLine} × ${formatSize(variant.sizeMl)} of ${product.name} can be added.`,
        };
      }
      const next = current
        ? snapshot.map((item) =>
            sameLine(item, line.slug, line.variantId) ? { ...item, quantity: requested } : item,
          )
        : [...snapshot, { ...line, quantity: requested }];
      snapshot = next;
      emit();
      return { ok: true, message: `${product.name} added to the cart.` };
    }

    function setQuantity(slug: string, variantId: string, quantity: number): CartResult {
      const product = getProduct(slug);
      const variant = product?.variants.find((item) => item.id === variantId);
      if (!product || !variant) {
        snapshot = snapshot.filter((item) => !sameLine(item, slug, variantId));
        emit();
        return { ok: false, message: "That drink was removed because it is not in the shop list." };
      }
      if (quantity < 1) {
        snapshot = snapshot.filter((item) => !sameLine(item, slug, variantId));
        emit();
        return { ok: true, message: `${product.name} removed from the cart.` };
      }
      const allowed = commerce.maxQuantityPerLine;
      const nextQuantity = Math.min(quantity, allowed);
      snapshot = snapshot.map((item) =>
        sameLine(item, slug, variantId) ? { ...item, quantity: nextQuantity } : item,
      );
      emit();
      if (quantity > allowed) {
        return {
          ok: false,
          message: `Only ${allowed} × ${formatSize(variant.sizeMl)} of ${product.name} can be included.`,
        };
      }
      return { ok: true, message: "Quantity updated." };
    }

    function removeLine(slug: string, variantId: string) {
      snapshot = snapshot.filter((item) => !sameLine(item, slug, variantId));
      emit();
    }

    function clear() {
      snapshot = [];
      emit();
    }

    return { lines, ready, count, addLine, setQuantity, removeLine, clear };
  }, [lines, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
