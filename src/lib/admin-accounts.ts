import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { supabaseAdmin } from "@/lib/supabase";

const scrypt = promisify(scryptCallback);

export const adminRoles = [
  { id: "super_admin", label: "Super admin" },
  { id: "manager", label: "Admin manager" },
  { id: "admin", label: "Admin" },
] as const;

export type AdminRole = (typeof adminRoles)[number]["id"];

export type DeskAdminRow = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  createdBy: string;
  createdAt: string;
};

export function adminRoleLabel(role: AdminRole) {
  return adminRoles.find((item) => item.id === role)?.label ?? "Admin";
}

export function isAdminRole(value: string): value is AdminRole {
  return adminRoles.some((item) => item.id === value);
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16);
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function adminPasswordMatches(password: string, stored: string) {
  const [kind, salt, hash] = stored.split("$");
  if (kind !== "scrypt" || !salt || !hash) return false;
  const actual = (await scrypt(password, Buffer.from(salt, "base64url"), 32)) as Buffer;
  const expected = Buffer.from(hash, "base64url");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function missingTable(message: string) {
  return /desk_admins|schema cache|does not exist/i.test(message);
}

export function adminSetupMessage(message: string) {
  if (missingTable(message)) {
    return "Run supabase/schema.sql in the Supabase SQL editor once so admin accounts can be stored.";
  }
  return message;
}

export async function listDeskAdmins(): Promise<{ rows: DeskAdminRow[]; error: string }> {
  const supabase = supabaseAdmin();
  if (!supabase) return { rows: [], error: "Supabase is not connected." };
  const { data, error } = await supabase
    .from("desk_admins")
    .select("id, email, name, role, active, created_by, created_at")
    .order("created_at", { ascending: true });
  if (error) return { rows: [], error: adminSetupMessage(error.message) };
  const rows: DeskAdminRow[] = [];
  for (const row of (data ?? []) as {
    id: string;
    email: string;
    name: string;
    role: string;
    active: boolean;
    created_by: string;
    created_at: string;
  }[]) {
    if (!isAdminRole(row.role)) continue;
    rows.push({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      active: row.active,
      createdBy: row.created_by,
      createdAt: row.created_at,
    });
  }
  return { rows, error: "" };
}

export async function findDeskAdminLogin(email: string) {
  const supabase = supabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("desk_admins")
    .select("email, name, role, active, password_hash")
    .eq("email", email)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as { email: string; name: string; role: string; active: boolean; password_hash: string };
  if (!isAdminRole(row.role)) return null;
  return {
    email: row.email,
    name: row.name,
    role: row.role,
    active: row.active,
    password_hash: row.password_hash,
  };
}

export async function createDeskAdmin(input: {
  name: string;
  email: string;
  password: string;
  role: string;
  createdBy: string;
  rootEmail: string;
}) {
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false as const, message: "Supabase is not connected." };
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  if (name.length < 2 || name.length > 80) return { ok: false as const, message: "Enter the admin name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false as const, message: "Enter a valid email." };
  if (email === input.rootEmail) return { ok: false as const, message: "That email is the superior admin." };
  if (password.length < 8 || password.length > 72) return { ok: false as const, message: "Use a password of 8 to 72 characters." };
  if (!isAdminRole(input.role)) return { ok: false as const, message: "Choose an admin level." };

  const passwordHash = await hashAdminPassword(password);
  const { error } = await supabase.from("desk_admins").insert({
    email,
    name,
    role: input.role,
    password_hash: passwordHash,
    active: true,
    created_by: input.createdBy,
  });
  if (error) {
    if (/duplicate|unique/i.test(error.message)) return { ok: false as const, message: "An admin with that email already exists." };
    return { ok: false as const, message: adminSetupMessage(error.message) };
  }
  return { ok: true as const, message: "Admin created" };
}

export async function setDeskAdminActive(id: string, active: boolean, actorEmail: string) {
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false as const, message: "Supabase is not connected." };
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false as const, message: "That admin could not be matched." };
  const { data, error: lookupError } = await supabase.from("desk_admins").select("email").eq("id", id).maybeSingle();
  if (lookupError) return { ok: false as const, message: adminSetupMessage(lookupError.message) };
  const row = data as { email: string } | null;
  if (!row) return { ok: false as const, message: "That admin could not be matched." };
  if (row.email === actorEmail) return { ok: false as const, message: "The superior admin keeps their own access." };
  const { error } = await supabase.from("desk_admins").update({ active }).eq("id", id);
  if (error) return { ok: false as const, message: adminSetupMessage(error.message) };
  return { ok: true as const, message: active ? "Access updated" : "Access updated" };
}
