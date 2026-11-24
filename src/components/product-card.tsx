import Link from "next/link";
import Image from "next/image";
import type { CatalogProduct } from "@/content/catalog";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/card-actions";
import { formatKes, formatSize } from "@/lib/format";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const prices = product.variants.map((variant) => variant.priceKes);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const multiple = product.variants.length > 1;
  const inStock = product.variants.find((variant) => variant.stock > 0);

  return (
    <article className="flex h-full w-full flex-col rounded-sm bg-white shadow-sm">
      <div className="flex w-full shrink-0 items-center justify-center">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            unoptimized={product.image.endsWith(".svg") || product.image.startsWith("http")}
            className="h-[220px] w-full rounded-t-sm bg-white object-contain"
            sizes="(min-width: 1280px) 240px, (min-width: 640px) 33vw, 50vw"
          />
        </Link>
      </div>
      <div className="mt-auto flex w-full shrink-0 flex-col gap-2 px-2 py-2">
        <div className="flex flex-wrap gap-x-2 text-sm text-[#94a3b8]">
          {product.variants.map((variant) => (
            <div key={variant.id}>
              {formatSize(variant.sizeMl)}
              {variant.stock < 1 ? " · unavailable" : ""}
            </div>
          ))}
        </div>
        <div className="text-sm font-semibold leading-5">
          <Link href={`/product/${product.slug}`} title={product.name} className="hover:text-logo">
            {product.name}
          </Link>
        </div>
        <div className="text-sm">
          {minPrice === maxPrice ? formatKes(minPrice) : `${formatKes(minPrice)} - ${formatKes(maxPrice)}`}
        </div>
        <div className="mt-2 flex justify-between px-1">
          {multiple ? (
            <Link href={`/product/${product.slug}#size`} aria-label={`Choose a size for ${product.name}`} className="text-ink hover:text-logo">
              <CartPlusIcon />
            </Link>
          ) : inStock ? (
            <AddToCartButton
              slug={product.slug}
              variantId={inStock.id}
              appearance="icon"
              label={`Add ${product.name} to cart`}
            />
          ) : (
            <button type="button" disabled aria-label={`${product.name} is unavailable`} className="cursor-not-allowed text-muted">
              <CartPlusIcon />
            </button>
          )}
          <FavoriteButton name={product.name} />
          <Link href="/contact" aria-label={`Contact the shop about ${product.name}`} className="text-ink hover:text-logo">
            <WhatsappIcon />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CartPlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="aspect-square w-5" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="aspect-square w-5" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );
}
