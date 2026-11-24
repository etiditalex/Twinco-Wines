import type { Metadata } from "next";

// The desk reads the session and the database on every request. Allow that instead of blocking the save redirect.
export const instant = false;

export const metadata: Metadata = {
  title: "Sales desk",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
