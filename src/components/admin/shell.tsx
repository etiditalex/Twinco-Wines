import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { adminRoleLabel } from "@/lib/admin-accounts";
import { currentAdmin } from "@/lib/admin-session";

const nav = [
  { href: "/admin", id: "sales", label: "Sales Performance", icon: "chart" },
  { href: "/admin/orders", id: "orders", label: "Orders", icon: "cart" },
  { href: "/admin/admins", id: "admins", label: "Admins", icon: "id" },
  { href: "/admin/products", id: "products", label: "Product Performance", icon: "tag" },
  { href: "/admin/add", id: "add", label: "Add a drink", icon: "plus" },
  { href: "/admin/stores", id: "stores", label: "Store Performance", icon: "store" },
  { href: "/admin/retail", id: "retail", label: "Retail Alcohol Sales", icon: "glass" },
  { href: "/admin/spirits", id: "spirits", label: "Spirits Distribution", icon: "bottle" },
  { href: "/admin/inventory", id: "inventory", label: "Inventory & Shrinkage", icon: "box" },
  { href: "/admin/procurement", id: "procurement", label: "Procurement Performance", icon: "cart" },
  { href: "/admin/promotions", id: "promotions", label: "Promotional Performance", icon: "star" },
  { href: "/admin/customers", id: "customers", label: "Customer Insights", icon: "people" },
  { href: "/admin/loyalty", id: "loyalty", label: "Loyalty Program", icon: "heart" },
  { href: "/admin/payments", id: "payments", label: "Payment Channel", icon: "card" },
  { href: "/admin/age", id: "age", label: "Age Compliance", icon: "id" },
  { href: "/admin/loss", id: "loss", label: "Loss Prevention", icon: "shield" },
  { href: "/admin/data", id: "data", label: "Data Integration", icon: "db" },
] as const;

export async function DashboardShell({
  active,
  query,
  pendingCount,
  flash,
  children,
}: {
  active: string;
  query: string;
  pendingCount: number;
  flash: string;
  children: React.ReactNode;
}) {
  const admin = await currentAdmin();
  const items = nav.filter((item) => item.id !== "admins" || admin?.role === "super_admin");
  const confirmation = flash === "Saved" || flash === "Admin created" || flash === "Access updated";
  return (
    <div className="flex min-h-screen bg-[#f4f6fb] text-[13px] text-[#111827]">
      <aside className="sticky top-0 flex h-screen w-[232px] shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center border-b border-slate-200 px-4">
          <Image src="/brand/twinco-header-logo.png" alt="TwinCO Wines" width={1283} height={541} className="h-9 w-auto" />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Desk">
          <ul className="grid gap-1">
            {items.map((item) => {
              const current = item.id === active;
              const href = query ? `${item.href}?${query}` : item.href;
              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    aria-current={current ? "page" : undefined}
                    title={item.label}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                      current ? "bg-[#ea2027] font-semibold text-white" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <NavIcon name={item.icon} />
                    <span className="truncate">{item.label}</span>
                    {item.id === "orders" && pendingCount > 0 ? (
                      <span
                        className={`ml-auto rounded-full px-1.5 text-[10px] font-bold ${current ? "bg-white text-[#ea2027]" : "bg-[#ea2027] text-white"}`}
                        aria-label={`${pendingCount} new ${pendingCount === 1 ? "order" : "orders"}`}
                      >
                        {pendingCount}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-slate-200 px-4 py-3">
          <p className="truncate text-[12px] font-semibold text-slate-800">{admin?.name}</p>
          <p className="truncate text-[11px] text-slate-400">{admin ? adminRoleLabel(admin.role) : ""}</p>
        </div>
        <form action={logoutAction} className="border-t border-slate-200 p-3">
          <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-slate-500 hover:bg-slate-50">
            Sign out
          </button>
        </form>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-5">
          <PinIcon />
          <h1 className="truncate text-[18px] font-bold tracking-tight">TwinCO Wines Sales Performance Dashboard</h1>
        </header>
        <main id="main" className="flex-1 overflow-auto p-4">
          {pendingCount > 0 && active !== "orders" ? (
            <Link
              href="/admin/orders"
              className="mb-3 block rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950"
            >
              {pendingCount === 1 ? "1 new order is waiting." : `${pendingCount} new orders are waiting.`} Open Orders.
            </Link>
          ) : null}
          {confirmation ? (
            <p
              className="fixed top-5 right-5 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950 shadow-lg"
              role="status"
            >
              {flash}
            </p>
          ) : flash ? (
            <p className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700" role="status">
              {flash}
            </p>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  const common = "h-4 w-4 shrink-0";
  if (name === "chart") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M1 13h14v1H1zM2 8h2v4H2zm4-3h2v7H6zm4-3h2v10h-2z" />
      </svg>
    );
  }
  if (name === "plus") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M7 2h2v5h5v2H9v5H7V9H2V7h5V2z" />
      </svg>
    );
  }
  if (name === "tag") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M2 2h6l6 6-6 6-6-6V2zm3 3.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z" />
      </svg>
    );
  }
  if (name === "store") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M2 6 3 2h10l1 4v1a2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0V6zm1 3h1v5H3zm3 0h4v5H6z" />
      </svg>
    );
  }
  if (name === "glass") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M3 1h10l-1 6a4 4 0 0 1-8 0L3 1zm5 11v2h3v1H5v-1h3v-2a5 5 0 0 1-3.5-2h7A5 5 0 0 1 8 12z" />
      </svg>
    );
  }
  if (name === "bottle") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M6 1h4v2l1 1v2l2 2v7H3V8l2-2V4l1-1V1z" />
      </svg>
    );
  }
  if (name === "box") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M1 4 8 1l7 3v8l-7 3-7-3V4zm7 1.2L3.2 4 8 2.2 12.8 4 8 5.2zM2.5 5.4 7.5 7v6.2l-5-2.1V5.4zm11 0V11l-5 2.1V7l5-1.6z" />
      </svg>
    );
  }
  if (name === "cart") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M0 1h2l1 2h11l-2 6H4L2 2H0zm5 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
      </svg>
    );
  }
  if (name === "star") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="m8 1 2 4.2 4.6.4-3.5 3 1 4.5L8 11.2 3.9 13.1l1-4.5L1.4 5.6 6 5.2 8 1z" />
      </svg>
    );
  }
  if (name === "people") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M6 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM1 13c0-2 2-3.5 5-3.5S11 11 11 13v1H1v-1zm8.5-6.2a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM11 9.6c1.8.3 4 1.4 4 3.4v1h-3.2c-.2-.6-.6-1.2-1.2-1.7.2-.5.3-1 .4-1.6-.1-.4-.3-.7-.6-1.1z" />
      </svg>
    );
  }
  if (name === "heart") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 14s-5.5-3.4-5.5-7A3 3 0 0 1 8 5a3 3 0 0 1 5.5 2c0 3.6-5.5 7-5.5 7z" />
      </svg>
    );
  }
  if (name === "card") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M1 3h14v10H1V3zm1 3h12V4H2v2zm0 2v4h12V8H2z" />
      </svg>
    );
  }
  if (name === "id") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M1 3h14v10H1V3zm2 2v2h3V5H3zm0 3.2V11h3V8.2H3zM8 6h5v1H8V6zm0 2h5v1H8V8z" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1 2 3v5c0 3.2 2.4 5.4 6 6 3.6-.6 6-2.8 6-6V3L8 1z" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M2 2h5v5H2V2zm7 0h5v5H9V2zM2 9h5v5H2V9zm7 0h5v5H9V9z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-4 w-4 text-slate-700" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M6 1h4l.5 4.2 2.2.8L9.2 9.2 8.5 15h-1L6.8 9.2 3.3 6l2.2-.8L6 1z" />
    </svg>
  );
}
