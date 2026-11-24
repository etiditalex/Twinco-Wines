import { ShopEditor } from "@/components/admin/shop-editor";
import { shopEditorList } from "@/lib/desk";

export async function ShopCatalog({ query = "", aisle = "", page = "" }: { query?: string; aisle?: string; page?: string }) {
  const products = await shopEditorList();
  return <ShopEditor products={products} initialQuery={query} initialAisle={aisle} initialPage={page} />;
}
