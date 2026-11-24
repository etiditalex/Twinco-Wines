import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { adminIsSignedIn, adminCredentialsSet } from "@/lib/admin-session";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Opening the desk…</p>}>
      <LoginGate />
    </Suspense>
  );
}

async function LoginGate() {
  if (await adminIsSignedIn()) redirect("/admin");
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-[#f4f6fb] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <Image src="/brand/twinco-header-logo.png" alt="TwinCO Wines" width={1283} height={541} className="h-12 w-auto" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Sales Performance Dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {adminCredentialsSet()
            ? "Sign in with your desk email and password. The superior admin can add other admins after signing in."
            : "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local, then restart the app."}
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
