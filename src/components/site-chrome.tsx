"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { AgeGate } from "@/components/age-gate";
import { Footer } from "@/components/footer";
import { Header, HeaderFallback } from "@/components/header";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return children;
  return (
    <>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <AgeGate />
    </>
  );
}
