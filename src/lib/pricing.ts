import { commerce } from "@/content/commerce";
import { getDeliveryArea } from "@/content/delivery";
import { getProduct } from "@/content/catalog";
import { formatSize } from "@/lib/format";

export type CartLineInput = {
  slug: string;
  variantId: string;
  quantity: number;
};

export type PricedLine = {
  slug: string;
  variantId: string;
  name: string;
  sizeMl: number;
  quantity: number;
  unitPriceKes: number;
  lineTotalKes: number;
  stock: number;
};

export type QuoteSuccess = {
  ok: true;
  lines: PricedLine[];
  subtotalKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  areaId: string;
  areaName: string;
};

export type QuoteFailure = {
  ok: false;
  errors: Record<string, string>;
  formError: string;
};

export function parseCartLines(value: unknown): CartLineInput[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry as Record<string, unknown>;
    const slug = typeof candidate.slug === "string" ? candidate.slug : "";
    const variantId = typeof candidate.variantId === "string" ? candidate.variantId : "";
    const quantity = Number(candidate.quantity);
    if (!slug || !variantId || !Number.isInteger(quantity)) return [];
    return [{ slug, variantId, quantity }];
  });
}

export function quoteCart(lines: CartLineInput[], areaId: string): QuoteSuccess | QuoteFailure {
  const errors: Record<string, string> = {};

  if (lines.length === 0) {
    errors.cart = "Your cart is empty.";
  }
  if (lines.length > 20) {
    errors.cart = "This preview accepts up to 20 lines.";
  }

  const priced: PricedLine[] = [];
  lines.forEach((line, index) => {
    const product = getProduct(line.slug);
    if (!product) {
      errors[`line-${index}`] = "One of the wines in the cart is not in the catalog.";
      return;
    }
    const variant = product.variants.find((item) => item.id === line.variantId);
    if (!variant) {
      errors[`line-${index}`] = `${product.name} does not have that bottle size.`;
      return;
    }
    const sizeLabel = formatSize(variant.sizeMl);
    if (variant.stock < 1) {
      errors[`line-${index}`] = `The ${sizeLabel} size of ${product.name} is unavailable.`;
      return;
    }
    if (line.quantity < 1) {
      errors[`line-${index}`] = `Choose at least one bottle of ${product.name}.`;
      return;
    }
    const max = Math.min(variant.stock, commerce.maxQuantityPerLine);
    if (line.quantity > max) {
      errors[`line-${index}`] =
        `Only ${max} × ${sizeLabel} of ${product.name} can be included in this preview.`;
      return;
    }
    priced.push({
      slug: product.slug,
      variantId: variant.id,
      name: product.name,
      sizeMl: variant.sizeMl,
      quantity: line.quantity,
      unitPriceKes: variant.priceKes,
      lineTotalKes: variant.priceKes * line.quantity,
      stock: variant.stock,
    });
  });

  const area = getDeliveryArea(areaId);
  if (!areaId) {
    errors.area = "Choose a delivery area.";
  } else if (!area) {
    errors.area = "That delivery area is not on the draft list.";
  } else if (!area.eligible) {
    errors.area = `${area.name} is outside the draft delivery area, so this preview cannot include it.`;
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors,
      formError: "The preview was not accepted. Check the messages below.",
    };
  }

  const subtotalKes = priced.reduce((sum, line) => sum + line.lineTotalKes, 0);
  const deliveryFeeKes = area?.feeKes ?? 0;
  return {
    ok: true,
    lines: priced,
    subtotalKes,
    deliveryFeeKes,
    totalKes: subtotalKes + deliveryFeeKes,
    areaId: area?.id ?? areaId,
    areaName: area?.name ?? areaId,
  };
}
