import Link from "next/link";
import Image from "next/image";
import { drinkAisles } from "@/content/aisles";
import { policies } from "@/content/policies";

const support = [
  { href: "/delivery", label: "Delivery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export function Footer() {
  const midpoint = Math.ceil(drinkAisles.length / 2);
  const firstAisles = drinkAisles.slice(0, midpoint);
  const secondAisles = drinkAisles.slice(midpoint);

  return (
    <footer className="mt-auto bg-slate-900 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 p-2 lg:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-gray-700">
            <Image
              src="/brand/mark.png"
              alt="TwinCO Wines"
              width={310}
              height={541}
              className="h-24 w-24 object-contain p-2"
            />
          </div>
          <div className="mt-2 text-xl">TwinCO Wines</div>
          <p className="mt-3 text-xs font-light tracking-wide">Wine shop at Nyali Centre, Mombasa</p>
          <p className="mt-3 max-w-xs text-xs leading-5 text-slate-300">
            Preview storefront. Prices and delivery fees are examples. Live ordering is off.
          </p>
        </div>
        <div className="flex-[1.4]">
          <div className="text-base text-slate-100">Liquor categories</div>
          <div className="mt-3 flex flex-row">
            <FooterLinks items={firstAisles.map((aisle) => ({ href: aisle.href, label: aisle.label }))} />
            <FooterLinks items={secondAisles.map((aisle) => ({ href: aisle.href, label: aisle.label }))} />
          </div>
        </div>
        <div className="mt-4 flex-1 sm:mt-0">
          <div className="text-base text-slate-100">Quick links</div>
          <div className="mt-3 flex flex-row">
            <FooterLinks items={support} />
            <FooterLinks items={policies.map((policy) => ({ href: `/policies/${policy.slug}`, label: policy.title }))} />
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm leading-6 text-white/80">
          Alcohol is for adults aged 18 and over. Kenyan law prohibits selling or supplying an
          alcoholic drink to anyone under 18. Drink responsibly. Prices, stock, and delivery fees
          on this preview are examples and are not an offer to sell.
        </p>
      </div>
    </footer>
  );
}

function FooterLinks({ items }: { items: { href: string; label: string }[] }) {
  return (
    <div className="flex-1">
      {items.map((item) => (
        <div key={item.href} className="text-xs leading-6">
          <Link href={item.href} className="text-white">
            {item.label}
          </Link>
        </div>
      ))}
    </div>
  );
}
