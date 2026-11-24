import Link from "next/link";
import { mapCatalogAction, saveVariantAction, uploadImageAction } from "@/app/admin/actions";
import { AddProductForm } from "@/components/admin/add-product";
import { AdminRoster } from "@/components/admin/admin-roster";
import { ShopCatalog } from "@/components/admin/shop-catalog";
import { BookingTable } from "@/components/admin/booking-table";
import { CoastMap, ForecastGauge, PromoChart } from "@/components/admin/charts";
import { DeskFiltersForm } from "@/components/admin/filters";
import { aisleLabel } from "@/content/aisles";
import type { DeskModel } from "@/lib/desk";
import { formatKes, formatSize } from "@/lib/format";

export function DeskSection({
  section,
  model,
  back,
  editorQuery = "",
  editorAisle = "",
  editorPage = "",
}: {
  section: string;
  model: DeskModel;
  back: string;
  editorQuery?: string;
  editorAisle?: string;
  editorPage?: string;
}) {
  return (
    <div className="grid gap-4">
      {model.error ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{model.error}</p> : null}
      {section === "add" || section === "orders" || section === "admins" ? null : (
        <section className={card}>
          <DeskFiltersForm
            key={`${section}-${model.filters.from}-${model.filters.product}-${model.filters.store}`}
            filters={model.filters}
            locations={model.locations}
            products={model.products}
            provinces={model.provinces}
          />
        </section>
      )}
      {section === "orders" ? <Orders model={model} back={back} /> : null}
      {section === "admins" ? <AdminRoster /> : null}
      {section === "products" ? <Products model={model} back={back} /> : null}
      {section === "add" ? (
        <>
          <AddProductForm />
          <ShopCatalog query={editorQuery} aisle={editorAisle} page={editorPage} />
        </>
      ) : null}
      {section === "stores" ? <Stores model={model} /> : null}
      {section === "retail" ? <Retail model={model} /> : null}
      {section === "spirits" ? <Spirits model={model} /> : null}
      {section === "inventory" ? <Inventory model={model} back={back} /> : null}
      {section === "procurement" ? <Procurement model={model} /> : null}
      {section === "promotions" ? <Promotions model={model} /> : null}
      {section === "customers" ? <Customers model={model} /> : null}
      {section === "loyalty" ? <Loyalty model={model} /> : null}
      {section === "payments" ? <Payments model={model} /> : null}
      {section === "age" ? <Age model={model} /> : null}
      {section === "loss" ? <Loss model={model} back={back} /> : null}
      {section === "data" ? <Data model={model} /> : null}
    </div>
  );
}

function Products({ model, back }: { model: DeskModel; back: string }) {
  return (
    <section className={card}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className={title}>Product Performance</h2>
          <p className="text-[12px] text-slate-500">Pictures on the shop come from the image you upload here.</p>
        </div>
        <Link href="/admin/add" className="rounded-lg bg-[#ea2027] px-3 py-2 text-[12px] font-semibold text-white">
          Add a drink
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[12px]">
          <thead className="text-[11px] text-slate-400 uppercase">
            <tr>
              <th className="py-2 font-medium">Drink</th>
              <th className="py-2 font-medium">Category</th>
              <th className="py-2 font-medium">Units</th>
              <th className="py-2 font-medium">Sales</th>
              <th className="py-2 font-medium">Picture</th>
            </tr>
          </thead>
          <tbody>
            {model.products.map((product) => (
              <tr key={product.slug} className="border-t border-slate-100 align-top">
                <td className="py-3 pr-3">
                  <span className="flex items-center gap-3">
                    {product.image ? (
                      // Admin uploads may live on Supabase storage. A plain image avoids the optimizer allow-list.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt="" className="h-14 w-10 object-contain" />
                    ) : (
                      <span className="flex h-14 w-10 items-center justify-center bg-slate-50 text-[10px] text-slate-400">None</span>
                    )}
                    <span>
                      <span className="block font-semibold">{product.name}</span>
                      <span className="text-slate-500">{product.producer}</span>
                    </span>
                  </span>
                </td>
                <td className="py-3 pr-3">{product.category}</td>
                <td className="py-3 pr-3">{product.units}</td>
                <td className="py-3 pr-3">{formatKes(product.salesKes)}</td>
                <td className="py-3">
                  <form action={uploadImageAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="slug" value={product.slug} />
                    <input type="hidden" name="back" value={back} />
                    <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" aria-label={`Upload an image for ${product.name}`} className="max-w-44 text-[11px]" />
                    <button type="submit" className="rounded-md bg-[#ea2027] px-2.5 py-1.5 text-[11px] font-semibold text-white">
                      Upload
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Stores({ model }: { model: DeskModel }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className={card}>
        <h2 className={title}>Store Performance</h2>
        <table className="w-full text-left text-[12px]">
          <thead className="text-[11px] text-slate-400 uppercase">
            <tr>
              <th className="py-2 font-medium">Location</th>
              <th className="py-2 font-medium">Province</th>
              <th className="py-2 font-medium">Units</th>
              <th className="py-2 font-medium">Sales</th>
              <th className="py-2 font-medium">Fee</th>
            </tr>
          </thead>
          <tbody>
            {model.locationSales.map((location) => {
              const source = model.locations.find((item) => item.id === location.id);
              return (
                <tr key={location.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium">{location.name}</td>
                  <td className="py-2">{location.province}</td>
                  <td className="py-2">{location.units}</td>
                  <td className="py-2">{formatKes(location.totalKes)}</td>
                  <td className="py-2">{source ? (source.eligible ? formatKes(source.feeKes) : "Not served") : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <section className={card}>
        <h2 className={title}>Provincial Sales</h2>
        <CoastMap regions={model.provinceSales} />
      </section>
    </div>
  );
}

function Retail({ model }: { model: DeskModel }) {
  const lines = model.bookings
    .filter((booking) => booking.status === "confirmed")
    .flatMap((booking) => booking.lines.map((line) => ({ ...line, reference: booking.reference, when: booking.createdAt })));
  return (
    <section className={card}>
      <h2 className={title}>Retail Alcohol Sales</h2>
      {lines.length === 0 ? (
        <p className="text-sm text-slate-500">No confirmed sales in this range.</p>
      ) : (
        <table className="w-full text-left text-[12px]">
          <thead className="text-[11px] text-slate-400 uppercase">
            <tr>
              <th className="py-2 font-medium">When</th>
              <th className="py-2 font-medium">Request</th>
              <th className="py-2 font-medium">Drink</th>
              <th className="py-2 font-medium">Qty</th>
              <th className="py-2 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.slice(0, 80).map((line) => (
              <tr key={`${line.reference}-${line.variantId}`} className="border-t border-slate-100">
                <td className="py-2">{line.when.slice(0, 10)}</td>
                <td className="py-2">{line.reference}</td>
                <td className="py-2">{line.name}</td>
                <td className="py-2">{line.quantity}</td>
                <td className="py-2">{formatKes(line.unitPriceKes * line.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Spirits({ model }: { model: DeskModel }) {
  return (
    <section className={card}>
      <h2 className={title}>Spirits Distribution</h2>
      {model.spiritAisles.length === 0 ? (
        <p className="text-sm text-slate-500">No confirmed spirit sales in this range.</p>
      ) : (
        <table className="w-full text-left text-[12px]">
          <thead className="text-[11px] text-slate-400 uppercase">
            <tr>
              <th className="py-2 font-medium">Aisle</th>
              <th className="py-2 font-medium">Units</th>
              <th className="py-2 font-medium">Sales</th>
            </tr>
          </thead>
          <tbody>
            {model.spiritAisles.map((aisle) => (
              <tr key={aisle.aisle} className="border-t border-slate-100">
                <td className="py-2 font-medium">{aisleLabel(aisle.aisle)}</td>
                <td className="py-2">{aisle.units}</td>
                <td className="py-2">{formatKes(aisle.salesKes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Inventory({ model, back }: { model: DeskModel; back: string }) {
  const rows = model.products.flatMap((product) =>
    product.variants.map((variant) => ({ product, variant })),
  );
  return (
    <section className={card}>
      <h2 className={title}>Inventory & Shrinkage</h2>
      <p className="mb-3 text-[12px] text-slate-500">A booking can be confirmed only while this count covers the request.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[12px]">
          <thead className="text-[11px] text-slate-400 uppercase">
            <tr>
              <th className="py-2 font-medium">Drink</th>
              <th className="py-2 font-medium">Size</th>
              <th className="py-2 font-medium">On hand</th>
              <th className="py-2 font-medium">Price (KES)</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, variant }) => (
              <tr key={variant.id} className="border-t border-slate-100">
                <td className="py-2 pr-3 font-medium">{product.name}</td>
                <td className="py-2 pr-3">{formatSize(variant.sizeMl)}</td>
                <td className="py-2" colSpan={3}>
                  <form action={saveVariantAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={variant.id} />
                    <input type="hidden" name="back" value={back} />
                    <input name="stock" type="number" min={0} defaultValue={variant.stock} aria-label={`Stock for ${product.name}`} className="h-8 w-20 rounded-md border border-slate-200 px-2" />
                    <input name="price" type="number" min={0} defaultValue={variant.priceKes} aria-label={`Price for ${product.name}`} className="h-8 w-28 rounded-md border border-slate-200 px-2" />
                    <button type="submit" className="rounded-md bg-[#ea2027] px-2.5 py-1.5 text-[11px] font-semibold text-white">
                      Save
                    </button>
                    {variant.stock < 1 ? <span className="text-[#ea2027]">Unavailable</span> : null}
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Procurement({ model }: { model: DeskModel }) {
  return (
    <section className={card}>
      <h2 className={title}>Procurement Performance</h2>
      <p className="mb-3 text-[12px] text-slate-500">Sizes with 5 or fewer bottles left.</p>
      {model.lowStock.length === 0 ? (
        <p className="text-sm text-slate-500">Nothing is at the reorder line.</p>
      ) : (
        <table className="w-full text-left text-[12px]">
          <thead className="text-[11px] text-slate-400 uppercase">
            <tr>
              <th className="py-2 font-medium">Drink</th>
              <th className="py-2 font-medium">Size</th>
              <th className="py-2 font-medium">On hand</th>
            </tr>
          </thead>
          <tbody>
            {model.lowStock.map((row) => (
              <tr key={row.variantId} className="border-t border-slate-100">
                <td className="py-2 font-medium">{row.name}</td>
                <td className="py-2">{formatSize(row.sizeMl)}</td>
                <td className={`py-2 ${row.stock < 1 ? "text-[#ea2027]" : ""}`}>{row.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Promotions({ model }: { model: DeskModel }) {
  return (
    <section className={card}>
      <h2 className={title}>Promotional Impact Analysis</h2>
      <PromoChart points={model.promos} />
    </section>
  );
}

function Orders({ model, back }: { model: DeskModel; back: string }) {
  const waiting = model.openOrders.length;
  const earlier = model.bookings.filter((booking) => booking.status !== "pending");
  return (
    <div className="grid gap-4">
      <section className={card}>
        <h2 className={title}>Orders</h2>
        {waiting > 0 ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950" role="status">
            {waiting === 1 ? "1 new order is waiting for the desk." : `${waiting} new orders are waiting for the desk.`}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No new orders. A customer booking shows up here.</p>
        )}
      </section>
      <section className={card}>
        <h2 className={title}>New orders</h2>
        <div className="mt-3">
          <BookingTable bookings={model.openOrders} back={back} empty="No new orders." />
        </div>
      </section>
      <section className={card}>
        <h2 className={title}>Earlier orders</h2>
        <p className="mt-1 mb-3 text-[12px] text-slate-500">Confirmed and declined bookings for the current sales range.</p>
        <BookingTable bookings={earlier} back={back} empty="No earlier orders in this range." />
      </section>
    </div>
  );
}

function Customers({ model }: { model: DeskModel }) {
  return (
    <section className={card}>
      <h2 className={title}>Customer Insights</h2>
      <CustomerRows rows={model.customers} />
    </section>
  );
}

function Loyalty({ model }: { model: DeskModel }) {
  return (
    <section className={card}>
      <h2 className={title}>Loyalty Program</h2>
      <p className="mb-3 text-[12px] text-slate-500">Customers with more than one confirmed booking in this range.</p>
      <CustomerRows rows={model.loyalty} />
    </section>
  );
}

function Payments({ model }: { model: DeskModel }) {
  const total = model.payments.reduce((sum, row) => sum + row.totalKes, 0);
  return (
    <section className={card}>
      <h2 className={title}>Payment Channel</h2>
      <ul className="grid gap-3">
        {model.payments.map((row) => {
          const share = total === 0 ? 0 : (row.totalKes / total) * 100;
          return (
            <li key={row.label}>
              <div className="mb-1 flex justify-between text-[12px]">
                <span className="font-medium">{row.label}</span>
                <span>
                  {formatKes(row.totalKes)} · {row.count} · {share.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-[#ea2027]" style={{ width: `${share}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Age({ model }: { model: DeskModel }) {
  const percent = model.age.total === 0 ? 0 : (model.age.confirmed / model.age.total) * 100;
  return (
    <section className={`${card} max-w-md`}>
      <h2 className={title}>Age Compliance</h2>
      <p className="mb-3 text-[12px] text-slate-500">
        {model.age.confirmed} of {model.age.total} requests in this range included the 18+ confirmation and the ID handover.
      </p>
      <ForecastGauge value={percent} />
    </section>
  );
}

function Loss({ model, back }: { model: DeskModel; back: string }) {
  const blocked = model.pending.filter((booking) => !booking.canConfirm);
  const missing = model.lowStock.filter((row) => row.stock < 1);
  return (
    <div className="grid gap-4">
      <section className={card}>
        <h2 className={title}>Loss Prevention</h2>
        <p className="text-[12px] text-slate-500">
          {model.declined.length} declined in this range. {missing.length} sizes are at zero. {blocked.length} pending requests cannot be confirmed.
        </p>
      </section>
      <section className={card}>
        <h2 className={title}>Unavailable sizes</h2>
        {missing.length === 0 ? (
          <p className="text-sm text-slate-500">Every mapped size has stock.</p>
        ) : (
          <ul className="grid gap-1 text-[12px]">
            {missing.map((row) => (
              <li key={row.variantId}>
                {row.name} · {formatSize(row.sizeMl)}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className={card}>
        <h2 className={title}>Declined requests</h2>
        <BookingTable bookings={model.declined} back={back} />
      </section>
    </div>
  );
}

function Data({ model }: { model: DeskModel }) {
  return (
    <section className={`${card} max-w-2xl`}>
      <h2 className={title}>Data Integration</h2>
      <p className="text-[13px] leading-6 text-slate-600">
        The shop, the locations, and this desk read and write one Supabase project. Run <span className="font-semibold">supabase/schema.sql</span> in the SQL editor. The project URL and publishable key stay in <span className="font-semibold">.env.local</span> on this machine.
      </p>
      <dl className="mt-4 grid gap-2 text-[12px]">
        <div className="flex justify-between gap-3 border-t border-slate-100 py-2">
          <dt>Database</dt>
          <dd className="font-semibold">{model.connected ? "Connected" : "Not connected"}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-slate-100 py-2">
          <dt>Catalog mapped</dt>
          <dd className="font-semibold">{model.mapped ? `${model.products.length} drinks` : "Not yet"}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-slate-100 py-2">
          <dt>Locations</dt>
          <dd className="font-semibold">{model.locations.length}</dd>
        </div>
      </dl>
      <form action={mapCatalogAction} className="mt-4">
        <button type="submit" className="rounded-lg bg-[#ea2027] px-4 py-2 text-sm font-semibold text-white">
          Map the TwinCO catalog
        </button>
      </form>
      <p className="mt-3 text-[12px] leading-5 text-slate-500">
        Mapping copies the current drinks, prices, opening stock, and Mombasa locations. A later map keeps uploaded pictures and edited stock, and refreshes the sample sales used by these charts.
      </p>
    </section>
  );
}

function CustomerRows({ rows }: { rows: { email: string; name: string; orders: number; totalKes: number; phone?: string }[] }) {
  if (rows.length === 0) return <p className="text-sm text-slate-500">No confirmed customers in this range.</p>;
  return (
    <table className="w-full text-left text-[12px]">
      <thead className="text-[11px] text-slate-400 uppercase">
        <tr>
          <th className="py-2 font-medium">Customer</th>
          <th className="py-2 font-medium">Bookings</th>
          <th className="py-2 font-medium">Sales</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.email} className="border-t border-slate-100">
            <td className="py-2">
              <span className="block font-medium">{row.name}</span>
              <span className="text-slate-500">{row.email}</span>
            </td>
            <td className="py-2">{row.orders}</td>
            <td className="py-2">{formatKes(row.totalKes)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const card = "rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]";
const title = "mb-3 text-[15px] font-semibold text-slate-900";
