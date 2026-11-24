import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { PricedLine } from "@/lib/pricing";

export type PreviewOrder = {
  mode: "demo-preview";
  id: string;
  createdAt: string;
  customerName: string;
  phoneMasked: string;
  email: string;
  areaId: string;
  areaName: string;
  address: string;
  notes: string;
  lines: PricedLine[];
  subtotalKes: number;
  deliveryFeeKes: number;
  totalKes: number;
};

function secret() {
  return process.env.ORDER_PREVIEW_SECRET ?? "twinco-demo-preview-secret-replace-before-launch";
}

function sign(body: string) {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function createPreviewId() {
  return `DEMO-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function encodePreview(order: PreviewOrder) {
  const body = Buffer.from(JSON.stringify(order), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodePreview(token: string): PreviewOrder | null {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const body = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = sign(body);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PreviewOrder;
    if (parsed.mode !== "demo-preview" || !parsed.id?.startsWith("DEMO-")) return null;
    if (!Array.isArray(parsed.lines) || typeof parsed.totalKes !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const tail = digits.slice(-3);
  return tail ? `•••• ${tail}` : "Hidden";
}
