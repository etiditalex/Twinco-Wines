"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createDeskAdmin, setDeskAdminActive } from "@/lib/admin-accounts";
import { adminCookie, adminCredentialsSet, adminSessionToken, authenticateAdmin, requireAdmin, requireSuperAdmin, superiorAdminEmail } from "@/lib/admin-session";
import { confirmBooking, createProduct, declineBooking, mapCatalog, saveProductImage, saveShopProduct, saveVariant } from "@/lib/desk";

export type LoginState = { error: string };

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminCredentialsSet()) {
    return { error: "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local, then restart the app." };
  }
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const admin = await authenticateAdmin(email, password);
  if (!admin) return { error: "That email or password does not open the desk." };
  const jar = await cookies();
  jar.set(adminCookie.name, adminSessionToken(admin.email), adminCookie.options);
  redirect("/admin");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(adminCookie.name);
  redirect("/admin/login");
}

function backTo(formData: FormData) {
  const back = String(formData.get("back") ?? "/admin");
  if (!back.startsWith("/admin") || back.startsWith("//")) return "/admin";
  return back;
}

function go(back: string, message: string): never {
  const url = new URL(back, "http://desk.local");
  url.searchParams.set("flash", message);
  redirect(`${url.pathname}${url.search}`);
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function confirmBookingAction(formData: FormData) {
  await requireAdmin();
  const result = await confirmBooking(String(formData.get("id") ?? ""));
  refresh();
  go(backTo(formData), result.message);
}

export async function declineBookingAction(formData: FormData) {
  await requireAdmin();
  const result = await declineBooking(String(formData.get("id") ?? ""));
  refresh();
  go(backTo(formData), result.message);
}

export async function saveVariantAction(formData: FormData) {
  await requireAdmin();
  const result = await saveVariant(String(formData.get("id") ?? ""), Number(formData.get("price")), Number(formData.get("stock")));
  refresh();
  go(backTo(formData), result.message);
}

export async function uploadImageAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("image");
  const result = await saveProductImage(String(formData.get("slug") ?? ""), file instanceof File ? file : new File([], ""));
  refresh();
  go(backTo(formData), result.message);
}

export async function saveShopProductAction(formData: FormData) {
  await requireAdmin();
  const ids = formData.getAll("variantId").map(String);
  const prices = formData.getAll("price").map((value) => Number(value));
  const stocks = formData.getAll("stock").map((value) => Number(value));
  const sizes = formData.getAll("sizeMl").map((value) => Number(value));
  const file = formData.get("image");
  const result = await saveShopProduct({
    slug: String(formData.get("slug") ?? ""),
    name: String(formData.get("name") ?? ""),
    producer: String(formData.get("producer") ?? ""),
    description: String(formData.get("description") ?? ""),
    variants: ids.map((id, index) => ({
      id,
      sizeMl: sizes[index],
      priceKes: prices[index],
      stock: stocks[index],
    })),
    image: file instanceof File ? file : null,
  });
  refresh();
  go(backTo(formData), result.message);
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const sizes = [1, 2, 3].map((index) => ({
    sizeMl: Number(formData.get(`size${index}`) || 0),
    priceKes: Number(formData.get(`price${index}`) || 0),
    stock: Number(formData.get(`stock${index}`) || 0),
  }));
  const file = formData.get("image");
  const result = await createProduct({
    name: String(formData.get("name") ?? ""),
    producer: String(formData.get("producer") ?? ""),
    country: String(formData.get("country") ?? ""),
    region: String(formData.get("region") ?? ""),
    grape: String(formData.get("grape") ?? ""),
    aisle: String(formData.get("aisle") ?? ""),
    style: String(formData.get("style") ?? ""),
    alcohol: String(formData.get("alcohol") ?? ""),
    description: String(formData.get("description") ?? ""),
    tastingNote: String(formData.get("tasting") ?? ""),
    pairing: String(formData.get("pairing") ?? ""),
    featured: formData.get("featured") === "yes",
    sizes,
    image: file instanceof File ? file : null,
  });
  refresh();
  const target = result.ok ? "/admin/products" : "/admin/add";
  redirect(`${target}?flash=${encodeURIComponent(result.message)}`);
}

export async function createDeskAdminAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  const result = await createDeskAdmin({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? ""),
    createdBy: admin.email,
    rootEmail: superiorAdminEmail(),
  });
  refresh();
  go("/admin/admins", result.message);
}

export async function setDeskAdminActiveAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  const result = await setDeskAdminActive(String(formData.get("id") ?? ""), formData.get("active") === "yes", admin.email);
  refresh();
  go("/admin/admins", result.message);
}

export async function mapCatalogAction() {
  await requireAdmin();
  const result = await mapCatalog();
  refresh();
  redirect(`/admin/data?flash=${encodeURIComponent(result.message)}`);
}
