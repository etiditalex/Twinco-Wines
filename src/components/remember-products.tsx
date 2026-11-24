"use client";

import { rememberProducts, type CatalogProduct } from "@/content/catalog";

export function RememberProducts({ products }: { products: CatalogProduct[] }) {
  rememberProducts(products);
  return null;
}
