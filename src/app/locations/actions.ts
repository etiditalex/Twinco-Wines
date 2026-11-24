"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { storefrontState } from "@/lib/desk";

export async function selectLocation(formData: FormData) {
  const id = String(formData.get("location") ?? "");
  const next = String(formData.get("next") ?? "/shop");
  const safe = next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/admin") ? next : "/shop";
  const state = await storefrontState();
  const location = state.locations.find((item) => item.id === id);
  if (!location || !location.eligible) return;
  const jar = await cookies();
  jar.set("twinco-location", id, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  redirect(safe);
}
