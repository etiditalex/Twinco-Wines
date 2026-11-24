import { cache } from "react";
import { connection } from "next/server";
import { randomBytes } from "crypto";
import { drinkAisles } from "@/content/aisles";
import { catalog, getProduct, productAisle, type CatalogProduct } from "@/content/catalog";
import { allShelfProducts, findShelfProduct } from "@/content/shelf";
import { deliveryConfig } from "@/content/delivery";
import { commerce } from "@/content/commerce";
import {
  categoryOrder,
  drinkCategory,
  isPaymentMethod,
  isPromotion,
  paymentMethods,
  promotionNames,
  provinceFor,
  type DrinkCategory,
} from "@/lib/drink-category";
import { supabaseAdmin } from "@/lib/supabase";

export type DeskFilters = {
  from: string;
  to: string;
  province: string;
  store: string;
  product: string;
  payment: string;
  promotion: string;
};

export type DeskLine = {
  name: string;
  slug: string;
  category: string;
  aisle: string;
  quantity: number;
  sizeMl: number;
  unitPriceKes: number;
  variantId: string;
};

export type DeskBooking = {
  id: string;
  reference: string;
  status: "pending" | "confirmed" | "declined";
  customerName: string;
  phone: string;
  email: string;
  locationId: string;
  locationName: string;
  province: string;
  address: string;
  notes: string;
  payment: string;
  promotion: string;
  totalKes: number;
  subtotalKes: number;
  feeKes: number;
  createdAt: string;
  ageConfirmed: boolean;
  handoverConfirmed: boolean;
  canConfirm: boolean;
  availabilityNote: string;
  lines: DeskLine[];
};

export type DeskVariant = {
  id: string;
  sizeMl: number;
  stock: number;
  priceKes: number;
};

export type DeskProduct = {
  slug: string;
  name: string;
  producer: string;
  category: DrinkCategory;
  aisle: string;
  image: string;
  units: number;
  salesKes: number;
  variants: DeskVariant[];
};

export type DeskLocation = {
  id: string;
  name: string;
  province: string;
  feeKes: number;
  eligible: boolean;
  timing: string;
  note: string;
};

export type DeskModel = {
  connected: boolean;
  mapped: boolean;
  error: string;
  filters: DeskFilters;
  locations: DeskLocation[];
  products: DeskProduct[];
  provinces: string[];
  payments: { label: string; totalKes: number; count: number }[];
  categories: { label: DrinkCategory; units: number }[];
  monthly: { label: string; units: number }[];
  heatmap: { row: DrinkCategory; values: number[] }[];
  promos: { label: string; units: number }[];
  provinceSales: { name: string; totalKes: number }[];
  locationSales: { id: string; name: string; province: string; totalKes: number; units: number }[];
  spiritAisles: { aisle: string; units: number; salesKes: number }[];
  kpis: {
    sales: number;
    prevSales: number;
    basket: number;
    prevBasket: number;
    forecast: number;
    prevForecast: number;
  };
  pending: DeskBooking[];
  openOrders: DeskBooking[];
  bookings: DeskBooking[];
  customers: { email: string; name: string; phone: string; orders: number; totalKes: number }[];
  loyalty: { email: string; name: string; orders: number; totalKes: number }[];
  age: { confirmed: number; total: number };
  declined: DeskBooking[];
  lowStock: { name: string; sizeMl: number; stock: number; slug: string; variantId: string }[];
};

type LocationRow = {
  id: string;
  name: string;
  province: string;
  fee_kes: number;
  eligible: boolean;
  timing: string;
  note: string;
  sort?: number;
};

type ProductRow = {
  slug: string;
  name: string;
  producer: string;
  category: string;
  aisle: string;
  image_url: string;
  country: string;
  style: string | null;
};

type VariantRow = {
  id: string;
  product_slug: string;
  size_ml: number;
  price_kes: number;
  stock: number;
};

type LineRow = {
  product_slug: string;
  variant_id: string;
  name: string;
  category: string;
  aisle: string;
  size_ml: number;
  quantity: number;
  unit_price_kes: number;
};

type BookingRow = {
  id: string;
  reference: string;
  status: string;
  customer_name: string;
  phone: string;
  email: string;
  location_id: string;
  address: string;
  notes: string;
  payment_method: string;
  promotion: string;
  age_confirmed: boolean;
  handover_confirmed: boolean;
  subtotal_kes: number;
  fee_kes: number;
  total_kes: number;
  source: string;
  created_at: string;
  confirmed_at: string | null;
  booking_lines: LineRow[] | null;
  locations: LocationRow | LocationRow[] | null;
};

const weekdayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export { weekdayLabels, paymentMethods, promotionNames };

function readParam(record: Record<string, string | string[] | undefined>, key: string) {
  const value = record[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function parseDeskDate(value: string, fallback: string) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (!us) return fallback;
  return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
}

export function displayDeskDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${Number(month)}/${Number(day)}/${year}`;
}

export function filtersFromParams(record: Record<string, string | string[] | undefined>): DeskFilters {
  const from = parseDeskDate(readParam(record, "from"), "2026-01-01");
  const to = parseDeskDate(readParam(record, "to"), "2026-12-31");
  const [start, end] = from <= to ? [from, to] : [to, from];
  return {
    from: start,
    to: end,
    province: readParam(record, "province"),
    store: readParam(record, "store"),
    product: readParam(record, "product"),
    payment: readParam(record, "payment"),
    promotion: readParam(record, "promotion"),
  };
}

export function keptQuery(record: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const key of ["from", "to", "province", "store", "product", "payment", "promotion"]) {
    const value = readParam(record, key);
    if (value) params.set(key, value);
  }
  return params.toString();
}

function fallbackLocations(): DeskLocation[] {
  return deliveryConfig.areas.map((area) => ({
    id: area.id,
    name: area.name,
    province: provinceFor(area.id),
    feeKes: area.feeKes,
    eligible: area.eligible,
    timing: area.timing,
    note: area.note,
  }));
}

function staticProducts(): DeskProduct[] {
  return catalog.map((product) => ({
    slug: product.slug,
    name: product.name,
    producer: product.producer,
    category: drinkCategory({ style: product.style, aisle: productAisle(product), country: product.country }),
    aisle: productAisle(product),
    image: product.image,
    units: 0,
    salesKes: 0,
    variants: product.variants.map((variant) => ({
      id: `${product.slug}:${variant.id}`,
      sizeMl: variant.sizeMl,
      stock: variant.stock,
      priceKes: variant.priceKes,
    })),
  }));
}

function emptyModel(filters: DeskFilters, extra: Partial<DeskModel> = {}): DeskModel {
  const locations = extra.locations ?? fallbackLocations();
  const products = extra.products ?? staticProducts();
  return {
    connected: false,
    mapped: false,
    error: "",
    filters,
    locations,
    products,
    provinces: [...new Set(locations.map((location) => location.province))],
    payments: paymentMethods.map((label) => ({ label, totalKes: 0, count: 0 })),
    categories: categoryOrder.map((label) => ({ label, units: 0 })),
    monthly: monthSlots(filters.from, filters.to),
    heatmap: categoryOrder.map((row) => ({ row, values: [0, 0, 0, 0, 0, 0, 0] })),
    promos: promotionNames.map((label) => ({ label, units: 0 })),
    provinceSales: [...new Set(locations.map((location) => location.province))].map((name) => ({ name, totalKes: 0 })),
    locationSales: locations.map((location) => ({
      id: location.id,
      name: location.name,
      province: location.province,
      totalKes: 0,
      units: 0,
    })),
    spiritAisles: [],
    kpis: { sales: 0, prevSales: 0, basket: 0, prevBasket: 0, forecast: 0, prevForecast: 0 },
    pending: [],
    openOrders: [],
    bookings: [],
    customers: [],
    loyalty: [],
    age: { confirmed: 0, total: 0 },
    declined: [],
    lowStock: products.flatMap((product) =>
      product.variants
        .filter((variant) => variant.stock <= 5)
        .map((variant) => ({
          name: product.name,
          sizeMl: variant.sizeMl,
          stock: variant.stock,
          slug: product.slug,
          variantId: variant.id,
        })),
    ),
    ...extra,
  };
}

function monthSlots(from: string, to: string) {
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const spanYears = start.getUTCFullYear() !== end.getUTCFullYear();
  const slots: { key: string; label: string }[] = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  while (cursor <= last && slots.length < 24) {
    const month = cursor.getUTCMonth();
    const year = cursor.getUTCFullYear();
    slots.push({
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: spanYears ? `${monthLabels[month]} ${String(year).slice(2)}` : monthLabels[month],
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return slots.map((slot) => ({ label: slot.label, units: 0, key: slot.key }));
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function weekdayIndex(iso: string) {
  const day = new Date(iso).getUTCDay();
  return (day + 6) % 7;
}

function previousWindow(filters: DeskFilters) {
  const start = new Date(`${filters.from}T00:00:00Z`).getTime();
  const end = new Date(`${filters.to}T00:00:00Z`).getTime();
  const span = Math.max(end - start, 24 * 60 * 60 * 1000);
  const prevEnd = start - 24 * 60 * 60 * 1000;
  const prevStart = prevEnd - span;
  const toIso = (time: number) => new Date(time).toISOString().slice(0, 10);
  return { from: toIso(prevStart), to: toIso(prevEnd) };
}

function inRange(iso: string, from: string, to: string) {
  const day = iso.slice(0, 10);
  return day >= from && day <= to;
}

function matches(booking: DeskBooking, filters: DeskFilters) {
  if (filters.province && booking.province !== filters.province) return false;
  if (filters.store && booking.locationId !== filters.store) return false;
  if (filters.payment && booking.payment !== filters.payment) return false;
  if (filters.promotion && booking.promotion !== filters.promotion) return false;
  if (filters.product && !booking.lines.some((line) => line.slug === filters.product)) return false;
  return true;
}

function rate(confirmed: number, declined: number) {
  const total = confirmed + declined;
  if (total === 0) return 0;
  return (confirmed / total) * 100;
}

function average(total: number, count: number) {
  if (count === 0) return 0;
  return total / count;
}

export async function loadDashboard(filters: DeskFilters): Promise<DeskModel> {
  const supabase = supabaseAdmin();
  if (!supabase) {
    return emptyModel(filters, {
      error: "Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env.local, run supabase/schema.sql, then map the catalog.",
    });
  }

  const prev = previousWindow(filters);
  const [locationResult, productResult, variantResult, bookingResult, pendingResult] = await Promise.all([
    supabase.from("locations").select("id, name, province, fee_kes, eligible, timing, note, sort").order("sort"),
    supabase.from("products").select("slug, name, producer, category, aisle, image_url, country, style").order("name"),
    supabase.from("product_variants").select("id, product_slug, size_ml, price_kes, stock"),
    supabase
      .from("bookings")
      .select("*, booking_lines(*), locations!location_id(*)")
      .gte("created_at", `${prev.from}T00:00:00.000Z`)
      .lte("created_at", `${filters.to}T23:59:59.999Z`),
    supabase.from("bookings").select("*, booking_lines(*), locations!location_id(*)").eq("status", "pending"),
  ]);

  const firstError =
    locationResult.error || productResult.error || variantResult.error || bookingResult.error || pendingResult.error;
  if (firstError) {
    return emptyModel(filters, {
      connected: true,
      error: `${firstError.message} Run supabase/schema.sql in the Supabase SQL editor, then map the catalog.`,
    });
  }

  const locationRows = (locationResult.data ?? []) as LocationRow[];
  const productRows = (productResult.data ?? []) as ProductRow[];
  const variantRows = (variantResult.data ?? []) as VariantRow[];
  const locations = locationRows.length
    ? locationRows.map((row) => ({
        id: row.id,
        name: row.name,
        province: row.province,
        feeKes: row.fee_kes,
        eligible: row.eligible,
        timing: row.timing,
        note: row.note,
      }))
    : fallbackLocations();

  const stock = new Map(variantRows.map((row) => [row.id, row.stock]));
  const mappedBookings = new Map<string, DeskBooking>();
  for (const row of [...((bookingResult.data ?? []) as BookingRow[]), ...((pendingResult.data ?? []) as BookingRow[])]) {
    mappedBookings.set(row.id, toBooking(row, stock));
  }
  const all = [...mappedBookings.values()];
  const ranged = all.filter((booking) => inRange(booking.createdAt, filters.from, filters.to) && matches(booking, filters));
  const previous = all.filter((booking) => inRange(booking.createdAt, prev.from, prev.to) && matches(booking, filters));
  const confirmed = ranged.filter((booking) => booking.status === "confirmed");
  const prevConfirmed = previous.filter((booking) => booking.status === "confirmed");
  const sales = confirmed.reduce((sum, booking) => sum + booking.totalKes, 0);
  const prevSales = prevConfirmed.reduce((sum, booking) => sum + booking.totalKes, 0);

  const slots = monthSlots(filters.from, filters.to);
  const slotIndex = new Map(slots.map((slot, index) => [slot.key, index]));
  const categories = new Map<DrinkCategory, number>(categoryOrder.map((label) => [label, 0]));
  const heatmap = categoryOrder.map(() => [0, 0, 0, 0, 0, 0, 0]);
  const promos = new Map<string, number>(promotionNames.map((label) => [label, 0]));
  const provinceSales = new Map(locations.map((location) => [location.province, 0]));
  const locationSales = new Map(locations.map((location) => [location.id, { totalKes: 0, units: 0 }]));
  const spiritAisles = new Map<string, { units: number; salesKes: number }>();
  const productUnits = new Map<string, { units: number; salesKes: number }>();
  const payments = new Map<string, { totalKes: number; count: number }>(
    paymentMethods.map((label) => [label, { totalKes: 0, count: 0 }]),
  );

  for (const booking of confirmed) {
    const monthKey = booking.createdAt.slice(0, 7);
    const month = slotIndex.get(monthKey);
    const pay = payments.get(booking.payment) ?? { totalKes: 0, count: 0 };
    pay.totalKes += booking.totalKes;
    pay.count += 1;
    payments.set(booking.payment, pay);
    provinceSales.set(booking.province, (provinceSales.get(booking.province) ?? 0) + booking.totalKes);
    const location = locationSales.get(booking.locationId) ?? { totalKes: 0, units: 0 };
    location.totalKes += booking.totalKes;
    for (const line of booking.lines) {
      if (month !== undefined) slots[month].units += line.quantity;
      const category = categoryOrder.find((item) => item === line.category) ?? "Wine";
      categories.set(category, (categories.get(category) ?? 0) + line.quantity);
      heatmap[categoryOrder.indexOf(category)][weekdayIndex(booking.createdAt)] += line.quantity;
      if (booking.promotion !== "None") promos.set(booking.promotion, (promos.get(booking.promotion) ?? 0) + line.quantity);
      location.units += line.quantity;
      const current = productUnits.get(line.slug) ?? { units: 0, salesKes: 0 };
      current.units += line.quantity;
      current.salesKes += line.unitPriceKes * line.quantity;
      productUnits.set(line.slug, current);
      if (category === "Spirits") {
        const aisle = spiritAisles.get(line.aisle) ?? { units: 0, salesKes: 0 };
        aisle.units += line.quantity;
        aisle.salesKes += line.unitPriceKes * line.quantity;
        spiritAisles.set(line.aisle, aisle);
      }
    }
    locationSales.set(booking.locationId, location);
  }

  const variantsByProduct = new Map<string, DeskVariant[]>();
  for (const row of variantRows) {
    const list = variantsByProduct.get(row.product_slug) ?? [];
    list.push({ id: row.id, sizeMl: row.size_ml, stock: row.stock, priceKes: row.price_kes });
    variantsByProduct.set(row.product_slug, list);
  }

  const products: DeskProduct[] = productRows.length
    ? productRows.map((row) => {
        const salesForProduct = productUnits.get(row.slug) ?? { units: 0, salesKes: 0 };
        return {
          slug: row.slug,
          name: row.name,
          producer: row.producer,
          category: (categoryOrder.find((item) => item === row.category) ?? "Wine") as DrinkCategory,
          aisle: row.aisle,
          image: row.image_url,
          units: salesForProduct.units,
          salesKes: salesForProduct.salesKes,
          variants: variantsByProduct.get(row.slug) ?? [],
        };
      })
    : staticProducts();

  const customers = new Map<string, { email: string; name: string; phone: string; orders: number; totalKes: number }>();
  for (const booking of confirmed) {
    const key = booking.email.toLowerCase();
    const current = customers.get(key) ?? {
      email: booking.email,
      name: booking.customerName,
      phone: booking.phone,
      orders: 0,
      totalKes: 0,
    };
    current.orders += 1;
    current.totalKes += booking.totalKes;
    customers.set(key, current);
  }
  const customerRows = [...customers.values()].sort((a, b) => b.totalKes - a.totalKes);

  const openOrders = all
    .filter((booking) => booking.status === "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pending = openOrders.filter((booking) => matches(booking, filters));

  return {
    connected: true,
    mapped: productRows.length > 0,
    error: productRows.length ? "" : "The database is connected. Map the TwinCO catalog from Data Integration.",
    filters,
    locations,
    products,
    provinces: [...new Set(locations.map((location) => location.province))],
    payments: [...payments.entries()].map(([label, value]) => ({ label, ...value })),
    categories: categoryOrder.map((label) => ({ label, units: categories.get(label) ?? 0 })),
    monthly: slots.map((slot) => ({ label: slot.label, units: slot.units })),
    heatmap: categoryOrder.map((row, index) => ({ row, values: heatmap[index] })),
    promos: promotionNames.map((label) => ({ label, units: promos.get(label) ?? 0 })),
    provinceSales: [...provinceSales.entries()].map(([name, totalKes]) => ({ name, totalKes })),
    locationSales: locations.map((location) => ({
      id: location.id,
      name: location.name,
      province: location.province,
      totalKes: locationSales.get(location.id)?.totalKes ?? 0,
      units: locationSales.get(location.id)?.units ?? 0,
    })),
    spiritAisles: [...spiritAisles.entries()]
      .map(([aisle, value]) => ({ aisle, ...value }))
      .sort((a, b) => b.units - a.units),
    kpis: {
      sales,
      prevSales,
      basket: average(sales, confirmed.length),
      prevBasket: average(prevSales, prevConfirmed.length),
      forecast: rate(
        confirmed.length,
        ranged.filter((booking) => booking.status === "declined").length,
      ),
      prevForecast: rate(
        prevConfirmed.length,
        previous.filter((booking) => booking.status === "declined").length,
      ),
    },
    pending,
    openOrders,
    bookings: ranged.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    customers: customerRows,
    loyalty: customerRows.filter((customer) => customer.orders > 1),
    age: {
      confirmed: ranged.filter((booking) => booking.ageConfirmed).length,
      total: ranged.length,
    },
    declined: ranged.filter((booking) => booking.status === "declined"),
    lowStock: products.flatMap((product) =>
      product.variants
        .filter((variant) => variant.stock <= 5)
        .map((variant) => ({
          name: product.name,
          sizeMl: variant.sizeMl,
          stock: variant.stock,
          slug: product.slug,
          variantId: variant.id,
        })),
    ),
  };
}

function toBooking(row: BookingRow, stock: Map<string, number>): DeskBooking {
  const location = one(row.locations);
  const lines = (row.booking_lines ?? []).map((line) => ({
    name: line.name,
    slug: line.product_slug,
    category: line.category,
    aisle: line.aisle,
    quantity: line.quantity,
    sizeMl: line.size_ml,
    unitPriceKes: line.unit_price_kes,
    variantId: line.variant_id,
  }));
  const shortages = lines.flatMap((line) => {
    const onHand = stock.get(line.variantId) ?? 0;
    if (onHand >= line.quantity) return [];
    return [`${line.name} has ${onHand} on hand, and this request asks for ${line.quantity}.`];
  });
  const status = row.status === "confirmed" || row.status === "declined" ? row.status : "pending";
  return {
    id: row.id,
    reference: row.reference,
    status,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    locationId: row.location_id,
    locationName: location?.name ?? row.location_id,
    province: location?.province ?? provinceFor(row.location_id),
    address: row.address,
    notes: row.notes,
    payment: row.payment_method,
    promotion: row.promotion,
    totalKes: row.total_kes,
    subtotalKes: row.subtotal_kes,
    feeKes: row.fee_kes,
    createdAt: row.created_at,
    ageConfirmed: row.age_confirmed,
    handoverConfirmed: row.handover_confirmed,
    canConfirm: status === "pending" && shortages.length === 0 && lines.length > 0,
    availabilityNote: shortages.length ? shortages.join(" ") : "In stock",
    lines,
  };
}

export type StorefrontState = {
  connected: boolean;
  error: string;
  images: Record<string, string>;
  variants: Record<string, { stock: number; priceKes: number; sizeMl: number; name: string; category: string; aisle: string }>;
  locations: DeskLocation[];
};

export const storefrontState = cache(async (): Promise<StorefrontState> => {
  const locations = fallbackLocations();
  const supabase = supabaseAdmin();
  if (!supabase) {
    return { connected: false, error: "", images: {}, variants: {}, locations };
  }
  const [productResult, variantResult, locationResult] = await Promise.all([
    supabase.from("products").select("slug, name, image_url, category, aisle"),
    supabase.from("product_variants").select("id, product_slug, size_ml, price_kes, stock"),
    supabase.from("locations").select("id, name, province, fee_kes, eligible, timing, note").order("sort"),
  ]);
  if (productResult.error || variantResult.error || locationResult.error) {
    const message = productResult.error?.message || variantResult.error?.message || locationResult.error?.message || "";
    return { connected: true, error: message, images: {}, variants: {}, locations };
  }
  const products = (productResult.data ?? []) as { slug: string; name: string; image_url: string; category: string; aisle: string }[];
  const names = new Map(products.map((product) => [product.slug, product]));
  const variants: StorefrontState["variants"] = {};
  for (const row of (variantResult.data ?? []) as VariantRow[]) {
    const product = names.get(row.product_slug);
    variants[row.id] = {
      stock: row.stock,
      priceKes: row.price_kes,
      sizeMl: row.size_ml,
      name: product?.name ?? row.product_slug,
      category: product?.category ?? "Wine",
      aisle: product?.aisle ?? "wine",
    };
  }
  const images: Record<string, string> = {};
  for (const product of products) {
    if (product.image_url) images[product.slug] = product.image_url;
  }
  const liveLocations = ((locationResult.data ?? []) as LocationRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    province: row.province,
    feeKes: row.fee_kes,
    eligible: row.eligible,
    timing: row.timing,
    note: row.note,
  }));
  return {
    connected: true,
    error: "",
    images,
    variants,
    locations: liveLocations.length ? liveLocations : locations,
  };
});

export async function withLiveStock<T extends CatalogProduct>(products: T[]): Promise<T[]> {
  const state = await storefrontState();
  if (!state.connected || state.error || Object.keys(state.variants).length === 0) return products;
  return products.map((product) => ({
    ...product,
    image: state.images[product.slug] || product.image,
    variants: product.variants.map((variant) => {
      const live = state.variants[`${product.slug}:${variant.id}`];
      if (!live) return variant;
      return { ...variant, stock: live.stock, priceKes: live.priceKes };
    }),
  }));
}

export type BookingResult =
  | { ok: true; reference: string }
  | { ok: false; errors: Record<string, string>; formError: string };

export async function placeBooking(input: {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  areaId: string;
  payment: string;
  promotion: string;
  lines: { slug: string; variantId: string; quantity: number }[];
}): Promise<BookingResult> {
  const supabase = supabaseAdmin();
  if (!supabase) {
    return {
      ok: false,
      errors: {},
      formError: "Bookings are stored in Supabase. Add the project URL and service role key, then map the catalog from the admin desk.",
    };
  }

  const state = await storefrontState();
  if (state.error || Object.keys(state.variants).length === 0) {
    return {
      ok: false,
      errors: {},
      formError: state.error
        ? `${state.error} Run supabase/schema.sql, then map the catalog.`
        : "The catalog is not in the database yet. Map it from the admin desk before sending a booking.",
    };
  }

  const merged = new Map<string, { slug: string; variantId: string; quantity: number }>();
  for (const line of input.lines) {
    const key = `${line.slug}:${line.variantId}`;
    const current = merged.get(key);
    if (current) current.quantity += line.quantity;
    else merged.set(key, { slug: line.slug, variantId: line.variantId, quantity: line.quantity });
  }
  const requested = [...merged.values()];

  const errors: Record<string, string> = {};
  if (requested.length === 0) errors.cart = "Your cart is empty.";
  if (requested.length > 20) errors.cart = "A booking can include up to 20 lines.";
  const location = state.locations.find((item) => item.id === input.areaId);
  if (!input.areaId) errors.area = "Choose a location.";
  else if (!location) errors.area = "That location is not on the delivery list.";
  else if (!location.eligible) errors.area = `${location.name} is outside the delivery area, so this request cannot include it.`;
  if (!isPaymentMethod(input.payment)) errors.payment = "Choose M-Pesa, cash, or card.";
  if (!isPromotion(input.promotion)) errors.promotion = "Choose a promotion from the list.";

  const priced: {
    slug: string;
    variantId: string;
    name: string;
    category: string;
    aisle: string;
    sizeMl: number;
    quantity: number;
    unitPriceKes: number;
  }[] = [];

  requested.forEach((line, index) => {
    const key = `${line.slug}:${line.variantId}`;
    const variant = state.variants[key];
    if (!variant) {
      errors[`line-${index}`] = "One of the drinks is not on the shop list.";
      return;
    }
    if (line.quantity < 1 || line.quantity > commerce.maxQuantityPerLine) {
      errors[`line-${index}`] = `Choose between 1 and ${commerce.maxQuantityPerLine} of ${variant.name}.`;
      return;
    }
    if (variant.stock < line.quantity) {
      errors[`line-${index}`] =
        variant.stock < 1
          ? `${variant.name} is not available.`
          : `${variant.name} has ${variant.stock} available, which is less than ${line.quantity}.`;
      return;
    }
    priced.push({
      slug: line.slug,
      variantId: key,
      name: variant.name,
      category: variant.category,
      aisle: variant.aisle,
      sizeMl: variant.sizeMl,
      quantity: line.quantity,
      unitPriceKes: variant.priceKes,
    });
  });

  if (Object.keys(errors).length > 0 || !location) {
    return {
      ok: false,
      errors,
      formError: "The booking was not sent. Check the messages below. Nothing was reserved.",
    };
  }

  const subtotal = priced.reduce((sum, line) => sum + line.unitPriceKes * line.quantity, 0);
  const reference = `TW-${randomBytes(4).toString("hex").toUpperCase()}`;
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      reference,
      status: "pending",
      customer_name: input.name,
      phone: input.phone,
      email: input.email,
      location_id: location.id,
      address: input.address,
      notes: input.notes,
      payment_method: input.payment,
      promotion: input.promotion || "None",
      age_confirmed: true,
      handover_confirmed: true,
      subtotal_kes: subtotal,
      fee_kes: location.feeKes,
      total_kes: subtotal + location.feeKes,
      source: "request",
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      errors: {},
      formError: error?.message || "The booking could not be saved.",
    };
  }

  const { error: lineError } = await supabase.from("booking_lines").insert(
    priced.map((line) => ({
      booking_id: data.id,
      product_slug: line.slug,
      variant_id: line.variantId,
      name: line.name,
      category: line.category,
      aisle: line.aisle,
      size_ml: line.sizeMl,
      quantity: line.quantity,
      unit_price_kes: line.unitPriceKes,
    })),
  );

  if (lineError) {
    await supabase.from("bookings").delete().eq("id", data.id);
    return { ok: false, errors: {}, formError: lineError.message };
  }

  return { ok: true, reference };
}

export async function findBooking(reference: string) {
  const supabase = supabaseAdmin();
  if (!supabase || !/^TW-[A-Z0-9]+$/.test(reference)) return null;
  const { data, error } = await supabase
    .from("bookings")
    .select("*, booking_lines(*), locations!location_id(name)")
    .eq("reference", reference)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as BookingRow;
  const location = one(row.locations);
  return {
    reference: row.reference,
    status: row.status,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    locationName: location?.name ?? row.location_id,
    address: row.address,
    notes: row.notes,
    payment: row.payment_method,
    promotion: row.promotion,
    subtotalKes: row.subtotal_kes,
    feeKes: row.fee_kes,
    totalKes: row.total_kes,
    createdAt: row.created_at,
    lines: (row.booking_lines ?? []).map((line) => ({
      name: line.name,
      quantity: line.quantity,
      sizeMl: line.size_ml,
      unitPriceKes: line.unit_price_kes,
    })),
  };
}

export async function confirmBooking(id: string) {
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false as const, message: "Supabase is not connected." };
  const { data, error } = await supabase.rpc("confirm_booking", { booking: id });
  if (error) {
    const message = error.message.replace(/^.*exception:\s*/i, "").replace(/^ERROR:\s*/i, "");
    return { ok: false as const, message: message || "That request could not be confirmed." };
  }
  if (data !== "ok") return { ok: false as const, message: String(data) };
  return { ok: true as const, message: "Booking confirmed. The bottles were taken off the shelf count." };
}

export async function declineBooking(id: string) {
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false as const, message: "Supabase is not connected." };
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "declined" })
    .eq("id", id)
    .eq("status", "pending")
    .select("reference")
    .maybeSingle();
  if (error) return { ok: false as const, message: error.message };
  if (!data) return { ok: false as const, message: "That request is no longer pending." };
  return { ok: true as const, message: `Declined ${data.reference}. Stock was left unchanged.` };
}

const placeholderImage = "/products/bottles/whisky-1.jpg";

type AddedProductRow = {
  slug: string;
  name: string;
  producer: string;
  country: string;
  region: string;
  grape: string;
  style: string | null;
  aisle: string;
  alcohol: string;
  description: string;
  tasting_note: string;
  pairing: string;
  image_url: string;
  featured: boolean;
};

export const addedCatalogProducts = cache(async (): Promise<CatalogProduct[]> => {
  await connection();
  const supabase = supabaseAdmin();
  if (!supabase) return [];
  const [productResult, variantResult] = await Promise.all([
    supabase
      .from("products")
      .select("slug, name, producer, country, region, grape, style, aisle, alcohol, description, tasting_note, pairing, image_url, featured")
      .eq("active", true),
    supabase.from("product_variants").select("id, product_slug, size_ml, price_kes, stock"),
  ]);
  if (productResult.error || variantResult.error) return [];
  const known = new Set(catalog.map((product) => product.slug));
  const variantsBySlug = new Map<string, CatalogProduct["variants"]>();
  for (const row of (variantResult.data ?? []) as VariantRow[]) {
    if (known.has(row.product_slug)) continue;
    const variantId = row.id.startsWith(`${row.product_slug}:`) ? row.id.slice(row.product_slug.length + 1) : row.id;
    const list = variantsBySlug.get(row.product_slug) ?? [];
    list.push({ id: variantId, sizeMl: row.size_ml, priceKes: row.price_kes, stock: row.stock });
    variantsBySlug.set(row.product_slug, list);
  }
  return ((productResult.data ?? []) as AddedProductRow[]).flatMap((row) => {
    if (known.has(row.slug)) return [];
    const variants = variantsBySlug.get(row.slug) ?? [];
    if (variants.length === 0) return [];
    const style = row.style && ["red", "white", "rose", "sparkling"].includes(row.style) ? (row.style as CatalogProduct["style"]) : undefined;
    return [
      {
        slug: row.slug,
        name: row.name,
        producer: row.producer,
        country: row.country,
        region: row.region,
        grape: row.grape,
        style,
        aisle: row.aisle === "wine" ? undefined : row.aisle,
        alcohol: row.alcohol,
        description: row.description,
        tastingNote: row.tasting_note,
        pairing: row.pairing,
        image: row.image_url || placeholderImage,
        featured: row.featured,
        preview: true as const,
        sources: [],
        variants,
      },
    ];
  });
});

export async function resolveShopProduct(slug: string) {
  const listed = getProduct(slug);
  if (listed) return listed;
  const added = await addedCatalogProducts();
  return added.find((product) => product.slug === slug);
}

function slugifyName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function createProduct(input: {
  name: string;
  producer: string;
  country: string;
  region: string;
  grape: string;
  aisle: string;
  style: string;
  alcohol: string;
  description: string;
  tastingNote: string;
  pairing: string;
  featured: boolean;
  sizes: { sizeMl: number; priceKes: number; stock: number }[];
  image: File | null;
}) {
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false as const, message: "Supabase is not connected." };

  const name = input.name.trim();
  const producer = input.producer.trim();
  const country = input.country.trim();
  const aisle = input.aisle.trim();
  if (name.length < 2 || name.length > 120) return { ok: false as const, message: "Enter a drink name between 2 and 120 characters." };
  if (producer.length < 2 || producer.length > 80) return { ok: false as const, message: "Enter the producer." };
  if (country.length < 2 || country.length > 60) return { ok: false as const, message: "Enter the country." };
  if (!drinkAisles.some((item) => item.slug === aisle)) return { ok: false as const, message: "Choose an aisle from the list." };

  const style = aisle === "wine" ? input.style.trim() : "";
  if (aisle === "wine" && !["red", "white", "rose", "sparkling"].includes(style)) {
    return { ok: false as const, message: "Choose red, white, rosé, or sparkling for a wine." };
  }
  const storedStyle = aisle === "champagne" ? "sparkling" : style || null;

  const slug = slugifyName(name);
  if (slug.length < 2) return { ok: false as const, message: "Use a name that can become a shop address." };
  if (catalog.some((product) => product.slug === slug)) {
    return {
      ok: false as const,
      message: "That name is already in the TwinCO list. Map the catalog, then edit the size under Inventory.",
    };
  }

  const sizes = input.sizes.filter((size) => size.sizeMl || size.priceKes || size.stock);
  if (sizes.length === 0) return { ok: false as const, message: "Add at least one bottle size, price, and stock count." };
  const seenSizes = new Set<number>();
  for (const size of sizes) {
    if (!Number.isInteger(size.sizeMl) || size.sizeMl < 50 || size.sizeMl > 6000) {
      return { ok: false as const, message: "Enter each size in millilitres, from 50 to 6000." };
    }
    if (seenSizes.has(size.sizeMl)) return { ok: false as const, message: "Each bottle size can be listed once." };
    seenSizes.add(size.sizeMl);
    if (!Number.isInteger(size.priceKes) || size.priceKes < 0 || size.priceKes > 1_000_000) {
      return { ok: false as const, message: "Enter each price in whole shillings." };
    }
    if (!Number.isInteger(size.stock) || size.stock < 0 || size.stock > 100000) {
      return { ok: false as const, message: "Enter each stock count as 0 or more." };
    }
  }

  const region = input.region.trim().slice(0, 80);
  const grape = input.grape.trim().slice(0, 160);
  const alcohol = input.alcohol.trim().slice(0, 80);
  const description = input.description.trim().slice(0, 1200);
  const tastingNote = input.tastingNote.trim().slice(0, 800);
  const pairing = input.pairing.trim().slice(0, 400);
  const category = drinkCategory({ style: storedStyle, aisle, country });

  const { error: productError } = await supabase.from("products").insert({
    slug,
    name,
    producer,
    country,
    region,
    grape,
    style: storedStyle,
    aisle,
    category,
    alcohol,
    description,
    tasting_note: tastingNote,
    pairing,
    image_url: "",
    featured: input.featured,
    active: true,
    updated_at: new Date().toISOString(),
  });
  if (productError) {
    if (productError.code === "23505") return { ok: false as const, message: "A drink with that name is already on the desk." };
    return { ok: false as const, message: productError.message };
  }

  const { error: variantError } = await supabase.from("product_variants").insert(
    sizes.map((size) => ({
      id: `${slug}:${size.sizeMl}`,
      product_slug: slug,
      size_ml: size.sizeMl,
      price_kes: size.priceKes,
      stock: size.stock,
    })),
  );
  if (variantError) {
    await supabase.from("products").delete().eq("slug", slug);
    return { ok: false as const, message: variantError.message };
  }

  if (!input.image || input.image.size === 0) {
    await supabase.from("product_variants").delete().eq("product_slug", slug);
    await supabase.from("products").delete().eq("slug", slug);
    return { ok: false as const, message: "Choose a product image." };
  }
  const uploaded = await saveProductImage(slug, input.image);
  if (!uploaded.ok) {
    await supabase.from("product_variants").delete().eq("product_slug", slug);
    await supabase.from("products").delete().eq("slug", slug);
    return { ok: false as const, message: uploaded.message };
  }

  return { ok: true as const, message: `${name} is on the shop.`, slug };
}

export type EditorProduct = {
  slug: string;
  name: string;
  producer: string;
  aisle: string;
  image: string;
  description: string;
  variants: { id: string; sizeMl: number; priceKes: number; stock: number }[];
};

function editorFromCatalog(product: CatalogProduct): EditorProduct {
  return {
    slug: product.slug,
    name: product.name,
    producer: product.producer,
    aisle: productAisle(product),
    image: product.image,
    description: product.description,
    variants: product.variants.map((variant) => ({
      id: `${product.slug}:${variant.id}`,
      sizeMl: variant.sizeMl,
      priceKes: variant.priceKes,
      stock: variant.stock,
    })),
  };
}

export async function shopEditorList(): Promise<EditorProduct[]> {
  await connection();
  const merged = new Map<string, EditorProduct>();
  for (const product of allShelfProducts()) merged.set(product.slug, editorFromCatalog(product));
  for (const product of catalog) merged.set(product.slug, editorFromCatalog(product));

  const supabase = supabaseAdmin();
  if (!supabase) return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));

  const [productResult, variantResult] = await Promise.all([
    supabase.from("products").select("slug, name, producer, aisle, image_url, description"),
    supabase.from("product_variants").select("id, product_slug, size_ml, price_kes, stock"),
  ]);
  if (!productResult.error) {
    for (const row of (productResult.data ?? []) as {
      slug: string;
      name: string;
      producer: string;
      aisle: string;
      image_url: string;
      description: string;
    }[]) {
      const current = merged.get(row.slug) ?? {
        slug: row.slug,
        name: row.name,
        producer: row.producer,
        aisle: row.aisle || "wine",
        image: placeholderImage,
        description: row.description ?? "",
        variants: [],
      };
      current.name = row.name || current.name;
      current.producer = row.producer || current.producer;
      if (row.description) current.description = row.description;
      if (row.image_url) current.image = row.image_url;
      merged.set(row.slug, current);
    }
  }
  if (!variantResult.error) {
    for (const row of (variantResult.data ?? []) as VariantRow[]) {
      const product = merged.get(row.product_slug);
      if (!product) continue;
      const variant = product.variants.find((item) => item.id === row.id);
      if (variant) {
        variant.priceKes = row.price_kes;
        variant.stock = row.stock;
        variant.sizeMl = row.size_ml;
      } else {
        product.variants.push({ id: row.id, sizeMl: row.size_ml, priceKes: row.price_kes, stock: row.stock });
      }
    }
  }

  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function shopEditorProduct(slug: string): Promise<EditorProduct | null> {
  await connection();
  const source = catalog.find((product) => product.slug === slug) ?? findShelfProduct(slug);
  const product = source ? editorFromCatalog(source) : null;
  const supabase = supabaseAdmin();
  if (!supabase) return product;

  const [productResult, variantResult] = await Promise.all([
    supabase.from("products").select("slug, name, producer, aisle, image_url, description").eq("slug", slug).maybeSingle(),
    supabase.from("product_variants").select("id, product_slug, size_ml, price_kes, stock").eq("product_slug", slug),
  ]);
  const row = (productResult.data ?? null) as {
    slug: string;
    name: string;
    producer: string;
    aisle: string;
    image_url: string;
    description: string;
  } | null;
  if (!product && !row) return null;

  const current: EditorProduct = product ?? {
    slug: row!.slug,
    name: row!.name,
    producer: row!.producer,
    aisle: row!.aisle || "wine",
    image: row!.image_url || placeholderImage,
    description: row!.description ?? "",
    variants: [],
  };
  if (row) {
    current.name = row.name || current.name;
    current.producer = row.producer || current.producer;
    if (row.description) current.description = row.description;
    if (row.image_url) current.image = row.image_url;
  }
  if (!variantResult.error) {
    for (const variantRow of (variantResult.data ?? []) as VariantRow[]) {
      const variant = current.variants.find((item) => item.id === variantRow.id);
      if (variant) {
        variant.priceKes = variantRow.price_kes;
        variant.stock = variantRow.stock;
        variant.sizeMl = variantRow.size_ml;
      } else {
        current.variants.push({
          id: variantRow.id,
          sizeMl: variantRow.size_ml,
          priceKes: variantRow.price_kes,
          stock: variantRow.stock,
        });
      }
    }
  }
  return current;
}

export async function pendingRequestCount() {
  await connection();
  const supabase = supabaseAdmin();
  if (!supabase) return 0;
  const { count } = await supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending");
  return count ?? 0;
}

export async function saveShopProduct(input: {
  slug: string;
  name: string;
  producer: string;
  description: string;
  variants: { id: string; sizeMl: number; priceKes: number; stock: number }[];
  image: File | null;
}) {
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false as const, message: "Supabase is not connected." };
  const slug = input.slug.trim();
  const name = input.name.trim();
  const producer = input.producer.trim();
  if (slug.length < 2 || slug.length > 160 || /[\s/\\]/.test(slug)) return { ok: false as const, message: "That drink could not be matched." };
  if (name.length < 2 || name.length > 200) return { ok: false as const, message: "Enter a drink name." };
  if (producer.length < 2 || producer.length > 200) return { ok: false as const, message: "Enter the producer." };
  const description = input.description.trim().slice(0, 1200);

  const variants = input.variants.filter((variant) => variant.id.startsWith(`${slug}:`));
  for (const variant of variants) {
    if (!Number.isInteger(variant.sizeMl) || variant.sizeMl < 50 || variant.sizeMl > 6000) {
      return { ok: false as const, message: "Each size must stay between 50 and 6000 ml." };
    }
    if (!Number.isInteger(variant.priceKes) || variant.priceKes < 0 || variant.priceKes > 1_000_000) {
      return { ok: false as const, message: "Enter each price in whole shillings." };
    }
    if (!Number.isInteger(variant.stock) || variant.stock < 0 || variant.stock > 100000) {
      return { ok: false as const, message: "Enter each stock count as 0 or more." };
    }
  }

  const source = catalog.find((product) => product.slug === slug) ?? findShelfProduct(slug);
  const { data: existing, error: lookupError } = await supabase.from("products").select("slug, image_url").eq("slug", slug).maybeSingle();
  if (lookupError) return { ok: false as const, message: lookupError.message };
  if (!existing && !source) return { ok: false as const, message: "That drink is not on the public shop." };

  if (!existing && source) {
    const aisle = productAisle(source);
    const { error } = await supabase.from("products").insert({
      slug,
      name,
      producer,
      country: source.country,
      region: source.region,
      grape: source.grape,
      style: source.style ?? null,
      aisle,
      category: drinkCategory({ style: source.style, aisle, country: source.country }),
      alcohol: source.alcohol,
      description: description || source.description,
      tasting_note: source.tastingNote,
      pairing: source.pairing,
      image_url: "",
      featured: source.featured,
      active: true,
      updated_at: new Date().toISOString(),
    });
    if (error) return { ok: false as const, message: error.message };
  } else if (existing) {
    const { error } = await supabase
      .from("products")
      .update({ name, producer, description, updated_at: new Date().toISOString() })
      .eq("slug", slug);
    if (error) return { ok: false as const, message: error.message };
  }

  if (variants.length > 0) {
    const { error } = await supabase.from("product_variants").upsert(
      variants.map((variant) => ({
        id: variant.id,
        product_slug: slug,
        size_ml: variant.sizeMl,
        price_kes: variant.priceKes,
        stock: variant.stock,
      })),
      { onConflict: "id" },
    );
    if (error) return { ok: false as const, message: error.message };
  }

  if (input.image && input.image.size > 0) {
    const uploaded = await saveProductImage(slug, input.image);
    if (!uploaded.ok) return uploaded;
  }

  return { ok: true as const, message: "Saved" };
}

export async function saveVariant(id: string, priceKes: number, stock: number) {
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false as const, message: "Supabase is not connected." };
  if (!Number.isInteger(priceKes) || priceKes < 0 || priceKes > 1_000_000) {
    return { ok: false as const, message: "Enter a price in whole shillings." };
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
    return { ok: false as const, message: "Enter a stock count of 0 or more." };
  }
  const { error } = await supabase.from("product_variants").update({ price_kes: priceKes, stock }).eq("id", id);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, message: "Stock and price saved." };
}

export async function saveProductImage(slug: string, file: File) {
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false as const, message: "Supabase is not connected." };
  if (!file || file.size === 0) return { ok: false as const, message: "Choose an image first." };
  if (file.size > 5 * 1024 * 1024) return { ok: false as const, message: "Use an image under 5 MB." };
  const allowed: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const ext = allowed[file.type];
  if (!ext) return { ok: false as const, message: "Upload a JPG, PNG, WEBP, or GIF." };
  const { data: product, error: lookupError } = await supabase.from("products").select("slug").eq("slug", slug).maybeSingle();
  if (lookupError || !product) return { ok: false as const, message: "That drink is not in the mapped catalog." };
  const folder = slug.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "drink";
  const path = `${folder}/${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage.from("product-images").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return { ok: false as const, message: uploadError.message };
  const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
  const { error: updateError } = await supabase
    .from("products")
    .update({ image_url: publicUrl.publicUrl, updated_at: new Date().toISOString() })
    .eq("slug", slug);
  if (updateError) return { ok: false as const, message: updateError.message };
  return { ok: true as const, message: "Image uploaded. The shop will show this picture." };
}

function hash(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function pickWeighted(seed: number, rows: readonly (readonly [string, number])[]) {
  const total = rows.reduce((sum, row) => sum + row[1], 0);
  let cursor = Math.floor(hash(seed) * total);
  for (const [name, weight] of rows) {
    cursor -= weight;
    if (cursor < 0) return name;
  }
  return rows[0][0];
}

export async function mapCatalog() {
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false as const, message: "Supabase is not connected." };

  const locationRows = deliveryConfig.areas.map((area, index) => ({
    id: area.id,
    name: area.name,
    province: provinceFor(area.id),
    fee_kes: area.feeKes,
    eligible: area.eligible,
    timing: area.timing,
    note: area.note,
    sort: index,
  }));
  const { error: locationError } = await supabase.from("locations").upsert(locationRows, { onConflict: "id" });
  if (locationError) return { ok: false as const, message: locationError.message };

  const { data: existingProducts, error: existingError } = await supabase.from("products").select("slug, image_url");
  if (existingError) return { ok: false as const, message: existingError.message };
  const currentImages = new Map(
    ((existingProducts ?? []) as { slug: string; image_url: string }[]).map((row) => [row.slug, row.image_url]),
  );

  const productRows = catalog.map((product) => {
    const aisle = productAisle(product);
    const current = currentImages.get(product.slug);
    return {
      slug: product.slug,
      name: product.name,
      producer: product.producer,
      country: product.country,
      region: product.region,
      grape: product.grape,
      style: product.style ?? null,
      aisle,
      category: drinkCategory({ style: product.style, aisle, country: product.country }),
      alcohol: product.alcohol,
      description: product.description,
      tasting_note: product.tastingNote,
      pairing: product.pairing,
      image_url: current?.startsWith("http") ? current : product.image,
      featured: product.featured,
      active: true,
      updated_at: new Date().toISOString(),
    };
  });
  const { error: productError } = await supabase.from("products").upsert(productRows, { onConflict: "slug" });
  if (productError) return { ok: false as const, message: productError.message };

  const { data: existingVariants, error: variantLookupError } = await supabase.from("product_variants").select("id");
  if (variantLookupError) return { ok: false as const, message: variantLookupError.message };
  const known = new Set(((existingVariants ?? []) as { id: string }[]).map((row) => row.id));
  const freshVariants = catalog.flatMap((product) =>
    product.variants.flatMap((variant) => {
      const id = `${product.slug}:${variant.id}`;
      if (known.has(id)) return [];
      return [{ id, product_slug: product.slug, size_ml: variant.sizeMl, price_kes: variant.priceKes, stock: variant.stock }];
    }),
  );
  if (freshVariants.length > 0) {
    const { error: variantError } = await supabase.from("product_variants").insert(freshVariants);
    if (variantError) return { ok: false as const, message: variantError.message };
  }

  const { error: clearError } = await supabase.from("bookings").delete().eq("source", "seed");
  if (clearError) return { ok: false as const, message: clearError.message };

  const seeded = buildSeedBookings();
  for (let index = 0; index < seeded.bookings.length; index += 200) {
    const { error } = await supabase.from("bookings").insert(seeded.bookings.slice(index, index + 200));
    if (error) return { ok: false as const, message: error.message };
  }
  for (let index = 0; index < seeded.lines.length; index += 200) {
    const { error } = await supabase.from("booking_lines").insert(seeded.lines.slice(index, index + 200));
    if (error) return { ok: false as const, message: error.message };
  }

  return {
    ok: true as const,
    message: `Mapped ${productRows.length} drinks, ${locationRows.length} locations, and ${seeded.bookings.length} desk rows.`,
  };
}

function buildSeedBookings() {
  const byCategory = new Map<string, CatalogProduct[]>();
  for (const product of catalog) {
    const category = drinkCategory({ style: product.style, aisle: productAisle(product), country: product.country });
    const list = byCategory.get(category) ?? [];
    list.push(product);
    byCategory.set(category, list);
  }
  const categoryWeights = [
    ["Wine", 36],
    ["Spirits", 19],
    ["Beer", 14],
    ["Aperitifs", 10],
    ["Imported Brands", 21],
  ] as const;
  const promoWeights = [
    ["Seasonal Discount", 8],
    ["Bulk Purchase", 1],
    ["Holiday Bundle", 14],
    ["New Product Launch", 10],
    ["Loyalty Program", 3],
    ["Cross-Category", 1],
    ["Referral Bonus", 1],
    ["Corporate Event", 1],
    ["Online Exclusive", 12],
    ["Clearance Sale", 1],
  ] as const;
  const dayWeights = [
    ["0", 5],
    ["1", 4],
    ["2", 4],
    ["3", 3],
    ["4", 3],
    ["5", 2],
    ["6", 2],
  ] as const;
  const stores = ["nyali", "kongowea", "bamburi", "mombasa-island"] as const;
  const people = [
    ["Amina Hassan", "amina.hassan@example.com", "0712000101"],
    ["David Otieno", "david.otieno@example.com", "0712000102"],
    ["Grace Wanjiku", "grace.wanjiku@example.com", "0712000103"],
    ["Peter Kamau", "peter.kamau@example.com", "0712000104"],
    ["Fatma Ali", "fatma.ali@example.com", "0712000105"],
    ["Joseph Mwangi", "joseph.mwangi@example.com", "0712000106"],
    ["Linet Achieng", "linet.achieng@example.com", "0712000107"],
    ["Samuel Kariuki", "samuel.kariuki@example.com", "0712000108"],
  ];
  const monthUnits = [12, 13, 12, 14, 13, 15, 14, 16, 15, 17, 16, 18];
  const bookings: Record<string, unknown>[] = [];
  const lines: Record<string, unknown>[] = [];
  let serial = 1;

  for (const year of [2025, 2026]) {
    monthUnits.forEach((units, monthIndex) => {
      const target = year === 2026 ? units : Math.max(8, Math.round(units * 0.86));
      let left = target;
      let guard = 0;
      while (left > 0 && guard < 40) {
        guard += 1;
        const seed = year * 1000 + monthIndex * 40 + guard;
        const category = pickWeighted(seed, categoryWeights);
        const options = (byCategory.get(category) ?? []).filter((product) => product.variants.some((variant) => variant.stock > 0));
        const product = options[Math.floor(hash(seed + 3) * options.length)] ?? options[0];
        if (!product) break;
        const variant = product.variants.find((item) => item.stock > 0) ?? product.variants[0];
        const quantity = Math.min(left, hash(seed + 5) > 0.7 ? 2 : 1);
        left -= quantity;
        const person = people[serial % people.length];
        const weekday = Number(pickWeighted(seed + 7, dayWeights));
        const created = dateFor(year, monthIndex, weekday, serial);
        const declined = year === 2026 ? serial % 8 === 0 : serial % 5 === 0;
        const id = deterministicId(serial);
        const unit = variant.priceKes;
        const locationId = stores[serial % stores.length];
        const fee = deliveryConfig.areas.find((area) => area.id === locationId)?.feeKes ?? 0;
        const subtotal = unit * quantity;
        bookings.push({
          id,
          reference: `SEED-${year}-${String(serial).padStart(4, "0")}`,
          status: declined ? "declined" : "confirmed",
          customer_name: person[0],
          phone: person[2],
          email: person[1],
          location_id: locationId,
          address: `${locationId} estate, Links Road, Mombasa`,
          notes: "",
          payment_method: paymentMethods[serial % paymentMethods.length],
          promotion: pickWeighted(seed + 9, promoWeights),
          age_confirmed: true,
          handover_confirmed: true,
          subtotal_kes: subtotal,
          fee_kes: fee,
          total_kes: subtotal + fee,
          source: "seed",
          created_at: created,
          confirmed_at: declined ? null : created,
        });
        lines.push({
          booking_id: id,
          product_slug: product.slug,
          variant_id: `${product.slug}:${variant.id}`,
          name: product.name,
          category,
          aisle: productAisle(product),
          size_ml: variant.sizeMl,
          quantity,
          unit_price_kes: unit,
        });
        serial += 1;
      }
    });
  }

  const pendingId = deterministicId(serial);
  const sampleProduct = catalog[0];
  const sampleVariant = sampleProduct.variants[0];
  bookings.push({
    id: pendingId,
    reference: "SEED-PENDING-1",
    status: "pending",
    customer_name: "Amina Hassan",
    phone: "0712000101",
    email: "amina.hassan@example.com",
    location_id: "nyali",
    address: "Nyali Centre, Links Road, Mombasa",
    notes: "Please call on arrival.",
    payment_method: "M-Pesa",
    promotion: "None",
    age_confirmed: true,
    handover_confirmed: true,
    subtotal_kes: sampleVariant.priceKes,
    fee_kes: 200,
    total_kes: sampleVariant.priceKes + 200,
    source: "seed",
    created_at: new Date().toISOString(),
  });
  lines.push({
    booking_id: pendingId,
    product_slug: sampleProduct.slug,
    variant_id: `${sampleProduct.slug}:${sampleVariant.id}`,
    name: sampleProduct.name,
    category: drinkCategory({ style: sampleProduct.style, aisle: productAisle(sampleProduct), country: sampleProduct.country }),
    aisle: productAisle(sampleProduct),
    size_ml: sampleVariant.sizeMl,
    quantity: 1,
    unit_price_kes: sampleVariant.priceKes,
  });

  const blockedId = deterministicId(serial + 1);
  bookings.push({
    id: blockedId,
    reference: "SEED-PENDING-BLOCK",
    status: "pending",
    customer_name: "Stock check sample",
    phone: "0712000199",
    email: "stock.check@example.com",
    location_id: "bamburi",
    address: "Bamburi, Mombasa",
    notes: "This request asks for more bottles than are on hand, so Confirm must refuse it.",
    payment_method: "Cash",
    promotion: "None",
    age_confirmed: true,
    handover_confirmed: true,
    subtotal_kes: sampleVariant.priceKes * 40,
    fee_kes: 300,
    total_kes: sampleVariant.priceKes * 40 + 300,
    source: "seed",
    created_at: new Date().toISOString(),
  });
  lines.push({
    booking_id: blockedId,
    product_slug: sampleProduct.slug,
    variant_id: `${sampleProduct.slug}:${sampleVariant.id}`,
    name: sampleProduct.name,
    category: drinkCategory({ style: sampleProduct.style, aisle: productAisle(sampleProduct), country: sampleProduct.country }),
    aisle: productAisle(sampleProduct),
    size_ml: sampleVariant.sizeMl,
    quantity: 40,
    unit_price_kes: sampleVariant.priceKes,
  });

  return { bookings, lines };
}

function dateFor(year: number, monthIndex: number, weekday: number, serial: number) {
  const date = new Date(Date.UTC(year, monthIndex, 1, 9, serial % 50, 0));
  const current = (date.getUTCDay() + 6) % 7;
  let day = 1 + ((weekday - current + 7) % 7) + 7 * (serial % 3);
  if (day > 28) day -= 7;
  date.setUTCDate(day);
  return date.toISOString();
}

function deterministicId(serial: number) {
  const hex = serial.toString(16).padStart(12, "0");
  return `00000000-0000-4000-8000-${hex}`;
}
