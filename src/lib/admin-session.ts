import { createHmac, timingSafeEqual } from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { adminPasswordMatches, findDeskAdminLogin, isAdminRole, type AdminRole } from "@/lib/admin-accounts";

const COOKIE = "twinco_admin";
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export type AdminIdentity = {
  email: string;
  name: string;
  role: AdminRole;
  root: boolean;
};

function password() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function rootEmail() {
  return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

function sign(payload: string) {
  return createHmac("sha256", `${rootEmail()}:${password()}`).update(payload).digest("base64url");
}

export function adminCredentialsSet() {
  return rootEmail().length > 0 && password().length > 0;
}

function signatureMatches(payload: string, mac: string) {
  if (!adminCredentialsSet()) return false;
  const expected = sign(payload);
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function rootIdentity(): AdminIdentity {
  return { email: rootEmail(), name: "Superior admin", role: "super_admin", root: true };
}

export function adminSessionToken(accountEmail: string) {
  const payload = `v2.${Date.now() + MAX_AGE_MS}.${Buffer.from(accountEmail).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

function readSessionEmail(token: string) {
  const parts = token.split(".");
  if (parts[0] === "v1" && parts.length === 3) {
    const payload = `${parts[0]}.${parts[1]}`;
    if (!signatureMatches(payload, parts[2])) return "";
    const expires = Number(parts[1]);
    if (!Number.isFinite(expires) || expires <= Date.now()) return "";
    return rootEmail();
  }
  if (parts[0] !== "v2" || parts.length !== 4) return "";
  const payload = `${parts[0]}.${parts[1]}.${parts[2]}`;
  if (!signatureMatches(payload, parts[3])) return "";
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires <= Date.now()) return "";
  try {
    return Buffer.from(parts[2], "base64url").toString("utf8").trim().toLowerCase();
  } catch {
    return "";
  }
}

export const currentAdmin = cache(async (): Promise<AdminIdentity | null> => {
  await connection();
  if (!adminCredentialsSet()) return null;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const accountEmail = readSessionEmail(token);
  if (!accountEmail) return null;
  if (accountEmail === rootEmail()) return rootIdentity();
  const row = await findDeskAdminLogin(accountEmail);
  if (!row || !row.active || !isAdminRole(row.role)) return null;
  return { email: row.email, name: row.name, role: row.role, root: false };
});

export async function adminIsSignedIn() {
  return (await currentAdmin()) !== null;
}

export async function requireAdmin() {
  if (!(await adminIsSignedIn())) redirect("/admin/login");
}

export async function requireSuperAdmin() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  if (admin.role !== "super_admin") redirect("/admin");
  return admin;
}

export async function authenticateAdmin(givenEmail: string, givenPassword: string): Promise<AdminIdentity | null> {
  const email = givenEmail.trim().toLowerCase();
  if (!adminCredentialsSet() || !email || !givenPassword) return null;
  if (email === rootEmail() && sameSecret(givenPassword, password())) return rootIdentity();
  const row = await findDeskAdminLogin(email);
  if (!row || !row.active) return null;
  if (!(await adminPasswordMatches(givenPassword, row.password_hash))) return null;
  return { email: row.email, name: row.name, role: row.role, root: false };
}

function sameSecret(given: string, expected: string) {
  const left = Buffer.from(given);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export const adminCookie = {
  name: COOKIE,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_MS / 1000,
  },
};

export function superiorAdminEmail() {
  return rootEmail();
}
