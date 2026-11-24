import Link from "next/link";
import { BookingTable } from "@/components/admin/booking-table";
import { CategoryDonut, CoastMap, ForecastGauge, Heatmap, MonthlyChart, PromoChart } from "@/components/admin/charts";
import { DeskFiltersForm } from "@/components/admin/filters";
import type { DeskModel } from "@/lib/desk";

export function SalesBoard({ model, back }: { model: DeskModel; back: string }) {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
      <div className="grid gap-4">
        <section className={card}>
          <DeskFiltersForm
            key={`${model.filters.from}-${model.filters.to}-${model.filters.province}-${model.filters.store}-${model.filters.product}-${model.filters.payment}-${model.filters.promotion}`}
            filters={model.filters}
            locations={model.locations}
            products={model.products}
            provinces={model.provinces}
          />
        </section>
        <Kpi label="Monthly Net Sales (KES)" value={compactNumber(model.kpis.sales)} tone="green">
          <Delta current={model.kpis.sales} previous={model.kpis.prevSales} />
        </Kpi>
        <Kpi label="Average Liquor Basket Size (KES)" value={compactNumber(model.kpis.basket)} tone="green">
          <Delta current={model.kpis.basket} previous={model.kpis.prevBasket} />
        </Kpi>
        <Kpi label="Forecast Accuracy (%)" value={model.kpis.forecast.toFixed(2)} tone="ink">
          <Delta current={model.kpis.forecast} previous={model.kpis.prevForecast} money={false} />
        </Kpi>
      </div>
      <div className="grid gap-4">
        {model.error ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{model.error}</p>
        ) : null}
        <div className="grid gap-4 xl:grid-cols-5">
          <section className={`${card} xl:col-span-3`}>
            <h2 className={title}>Monthly Sales Trend</h2>
            <MonthlyChart points={model.monthly} />
          </section>
          <section className={`${card} xl:col-span-2`}>
            <h2 className={title}>Product Category Distribution</h2>
            <CategoryDonut slices={model.categories} />
          </section>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <section className={card}>
            <h2 className={title}>Day of Week Sales</h2>
            <Heatmap rows={model.heatmap} />
          </section>
          <section className={card}>
            <h2 className={title}>Forecast Accuracy</h2>
            <ForecastGauge value={model.kpis.forecast} />
          </section>
          <section className={card}>
            <h2 className={title}>Provincial Sales</h2>
            <CoastMap regions={model.provinceSales} />
          </section>
        </div>
        <section className={card}>
          <h2 className={title}>Promotional Impact Analysis</h2>
          <PromoChart points={model.promos} />
        </section>
        <section className={card}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className={title}>Booking Requests</h2>
            <Link href="/admin/orders" className="text-[12px] font-semibold text-[#ea2027]">
              Open Orders
            </Link>
          </div>
          <p className="mb-3 text-[12px] text-slate-500">
            A request is accepted only when every bottle is still on hand. Confirm takes those bottles off the shelf count.
          </p>
          <BookingTable bookings={model.pending} back={back} />
        </section>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
  children,
}: {
  label: string;
  value: string;
  tone: "green" | "ink";
  children: React.ReactNode;
}) {
  return (
    <section className={card}>
      <h2 className="text-[12px] font-medium text-slate-500">{label}</h2>
      <p className={`mt-1 text-[28px] leading-none font-bold ${tone === "green" ? "text-emerald-600" : "text-slate-900"}`}>{value}</p>
      {children}
    </section>
  );
}

function Delta({ current, previous, money = true }: { current: number; previous: number; money?: boolean }) {
  const change = previous === 0 ? (current === 0 ? 0 : 100) : Math.round(((current - previous) / previous) * 100);
  const up = change >= 0;
  const previousLabel = money ? compactNumber(previous) : previous.toFixed(2);
  return (
    <p className={`mt-2 text-[11px] font-medium ${up ? "text-emerald-600" : "text-[#ea2027]"}`}>
      vs prev {previousLabel} ({Math.abs(change)}%{up ? "▲" : "▼"})
    </p>
  );
}

function compactNumber(amount: number) {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(2)}K`;
  return `${sign}${abs.toFixed(2)}`;
}

const card = "rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]";
const title = "mb-3 text-[15px] font-semibold text-slate-900";
