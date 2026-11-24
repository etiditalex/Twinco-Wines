import type { Metadata } from "next";
import { Suspense } from "react";
import { CartProvider } from "@/components/cart-provider";
import { SiteChrome } from "@/components/site-chrome";
import { commerce } from "@/content/commerce";
import "./globals.css";

const indexingOff = commerce.catalogMode !== "live";

export const metadata: Metadata = {
  title: {
    default: "TwinCO Wines | Wine delivery in Nyali, Mombasa",
    template: "%s | TwinCO Wines",
  },
  description:
    "Preview the TwinCO Wines shop for Nyali, Mombasa. Browse red, white, rosé, and sparkling wines. Live ordering is switched off.",
  robots: indexingOff ? { index: false, follow: false } : { index: true, follow: true },
  icons: { icon: "/brand/twinco-wines-logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-page text-ink">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <CartProvider>
          <Suspense fallback={<main id="main" className="flex-1" />}>
            <SiteChrome>{children}</SiteChrome>
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
