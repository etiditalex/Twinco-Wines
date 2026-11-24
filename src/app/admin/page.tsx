import { Suspense } from "react";
import { DashboardShell } from "@/components/admin/shell";
import { SalesBoard } from "@/components/admin/sales-board";
import { requireAdmin } from "@/lib/admin-session";
import { filtersFromParams, keptQuery, loadDashboard } from "@/lib/desk";

export default function AdminHome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading the desk…</p>}>
      <Desk searchParams={searchParams} />
    </Suspense>
  );
}

async function Desk({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const filters = filtersFromParams(params);
  const model = await loadDashboard(filters);
  const query = keptQuery(params);
  const flash = readFlash(params);
  const back = query ? `/admin?${query}` : "/admin";
  return (
    <DashboardShell active="sales" query={query} pendingCount={model.openOrders.length} flash={flash}>
      <SalesBoard model={model} back={back} />
    </DashboardShell>
  );
}

function readFlash(params: Record<string, string | string[] | undefined>) {
  const value = params.flash;
  return (Array.isArray(value) ? value[0] : value) ?? "";
}
