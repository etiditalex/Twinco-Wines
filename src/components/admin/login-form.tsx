"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initial: LoginState = { error: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="mt-5 grid gap-3">
      {state.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[#9f1239]">
          {state.error}
        </p>
      ) : null}
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          className="h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-[#ea2027]"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-[#ea2027]"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-lg bg-[#ea2027] text-sm font-semibold text-white disabled:opacity-70"
      >
        {pending ? "Checking…" : "Open the desk"}
      </button>
    </form>
  );
}
