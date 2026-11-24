import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeskSection } from "@/components/admin/sections";
import { DashboardShell } from "@/components/admin/shell";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-session";
import { filtersFromParams, keptQuery, loadDashboard } from "@/lib/desk";

const sections = new Set([
  "orders",
  "admins",
  "products",
  "add",
  "stores",
  "retail",
  "spirits",
  "inventory",
  "procurement",
  "promotions",
  "customers",
  "loyalty",
  "payments",
  "age",
  "loss",
  "data",
]);

export default function AdminSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading the desk…</p>}>
      <Section params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Section({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { section } = await params;
  if (!sections.has(section)) notFound();
  if (section === "admins") await requireSuperAdmin();
  const queryParams = await searchParams;
  const model = await loadDashboard(filtersFromParams(queryParams));
  const query = keptQuery(queryParams);
  const flash = readFlash(queryParams);
  const back = query ? `/admin/${section}?${query}` : `/admin/${section}`;
  const editorQuery = readOne(queryParams, "q");
  const editorAisle = readOne(queryParams, "aisle");
  const editorPage = readOne(queryParams, "page");
  return (
    <DashboardShell active={section} query={query} pendingCount={model.openOrders.length} flash={flash}>
      <DeskSection section={section} model={model} back={back} editorQuery={editorQuery} editorAisle={editorAisle} editorPage={editorPage} />
    </DashboardShell>
  );
}

function readOne(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function readFlash(params: Record<string, string | string[] | undefined>) {
  return readOne(params, "flash");
}
