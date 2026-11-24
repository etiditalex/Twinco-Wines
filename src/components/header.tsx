"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { drinkAisles } from "@/content/aisles";
import { useCart } from "@/components/cart-provider";

const links = [{ href: "/", label: "Home" }, ...drinkAisles.map((aisle) => ({ href: aisle.href, label: aisle.label }))];

export function Header() {
  const pathname = usePathname();
  const params = useSearchParams();
  const { count } = useCart();
  const query = pathname.startsWith("/shop") ? (params.get("q") ?? "") : "";
  const [draft, setDraft] = useState<{ query: string; value: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const term = draft?.query === query ? draft.value : query;

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      <div className="flex w-full flex-row justify-end bg-gray-900 px-2 py-px text-xs text-white sm:text-sm">
        <div className="space-x-6 py-px">
          <span>Nyali Centre, Mombasa</span>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <section className="mx-auto flex max-w-7xl flex-col gap-2 p-2">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="shrink-0">
            <Image
              src="/brand/twinco-header-logo.png"
              alt="TwinCO Wines"
              width={1283}
              height={541}
              priority
              className="h-14 w-auto object-contain"
            />
          </Link>
          <div className="hidden w-full flex-grow md:block">
            <SearchForm term={term} query={query} onChange={setDraft} />
          </div>
          <div className="flex items-center gap-5">
            <Link href="/locations" className="hidden font-medium whitespace-nowrap md:inline-block">
              Locations
            </Link>
            <Link href="/contact" className="hidden font-medium whitespace-nowrap md:inline-block">
              Contact
            </Link>
            <Link href="/cart" className="flex" aria-label={count === 1 ? "Cart, 1 item" : `Cart, ${count} items`}>
              <span className="relative flex flex-row text-ink">
                <BagIcon />
                <span className="inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-logo text-xs leading-none font-bold text-white">
                  {count}
                </span>
              </span>
            </Link>
            <Link href="/shop" aria-label="Saved wines" className="text-ink">
              <HeartIcon />
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 py-2 md:hidden">
          <button
            type="button"
            className="rounded-sm border border-[#f1f5f9] bg-white p-2"
            aria-expanded={menuOpen}
            aria-controls="mobile-categories"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
              <path d="M1 2.5h14v1.2H1zm0 5h14v1.2H1zm0 5h14v1.2H1z" />
            </svg>
          </button>
          <div className="w-full flex-grow">
            <SearchForm term={term} query={query} onChange={setDraft} />
          </div>
        </div>
      </section>
      <div className="w-full bg-gray-900 text-white">
        <ul className="mx-auto hidden max-w-7xl justify-center gap-6 p-2 md:flex">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname === link.href;
            return (
              <li key={link.label}>
                <Link href={link.href} aria-current={active ? "page" : undefined}>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {menuOpen ? (
        <nav id="mobile-categories" className="bg-slate-200/75 p-3 text-slate-900 md:hidden">
          <ul className="flex flex-col gap-6 p-3">
            {links.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-base font-semibold" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function SearchForm({
  term,
  query,
  onChange,
}: {
  term: string;
  query: string;
  onChange: (draft: { query: string; value: string }) => void;
}) {
  return (
    <form action="/shop" method="get">
      <div className="relative isolate z-50 mx-auto w-full sm:w-1/2">
        <label className="flex flex-row">
          <span className="sr-only">Search wines, producers, or style</span>
          <input
            name="q"
            value={term}
            onChange={(event) => onChange({ query, value: event.target.value })}
            placeholder="Search for drinks"
            autoComplete="off"
            className="relative z-30 w-full rounded-lg border-2 border-[#f1f5f9] bg-white p-2 text-ink outline-none placeholder:text-[#94a3b8]"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 z-40 -translate-y-1/2 text-sm">
            <SearchIcon />
          </span>
        </label>
      </div>
    </form>
  );
}

export function HeaderFallback() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-2 text-2xl font-bold">TwinCO</div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-5 w-5" viewBox="0 0 16 16" aria-hidden="true">
      <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
    </svg>
  );
}
