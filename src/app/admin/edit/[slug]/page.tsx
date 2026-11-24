import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductEditForm } from "@/components/admin/product-edit-form";
import { DashboardShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/admin-session";
import { pendingRequestCount, shopEditorProduct } from "@/lib/desk";

export default function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Opening the drink…</p>}>
      <Edit params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Edit({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);
  const query = await searchParams;
  const product = await shopEditorProduct(slug);
  if (!product) notFound();
  const pendingCount = await pendingRequestCount();
  const from = safeListPath(readOne(query, "from"));
  const flash = readOne(query, "flash");
  const back = `/admin/edit/${encodeURIComponent(product.slug)}?from=${encodeURIComponent(from)}`;

  return (
    <DashboardShell active="add" query="" pendingCount={pendingCount} flash={flash}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
        <Link href={from} className="text-sm font-semibold text-[#ea2027]">
          Back to the drinks
        </Link>
      </div>
      <ProductEditForm product={product} back={back} />
    </DashboardShell>
  );
}

function decodeSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function readOne(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function safeListPath(value: string) {
  if (value.startsWith("/admin/add") && !value.startsWith("//")) return value;
  return "/admin/add";
}
