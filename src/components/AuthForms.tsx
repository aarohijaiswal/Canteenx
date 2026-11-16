"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

const input =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-neutral-600 dark:bg-neutral-900";
const button =
  "w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";

type Result = { error?: string; fieldErrors?: Record<string, string>; redirect?: string };

async function post(url: string, data: Record<string, string>): Promise<Result> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = (await res.json().catch(() => ({}))) as Result;
  return res.ok ? json : { error: json.error ?? "Something went wrong", fieldErrors: json.fieldErrors };
}

export function LoginForm({ demoHint }: { demoHint: boolean }) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const r = await post("/api/auth/login", { email: String(f.get("email")), password: String(f.get("password")) });
    if (r.error || !r.redirect) {
      setError(r.error ?? "Could not sign in");
      setBusy(false);
      return;
    }
    // only follow ?next= when it stays inside the user's own area
    const target = next && next.startsWith(r.redirect) && !next.startsWith("//") ? next : r.redirect;
    router.push(target);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input name="email" type="email" required autoComplete="username" className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Password
        <input name="password" type="password" required autoComplete="current-password" className={input} />
      </label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className={button}>{busy ? "Signing in..." : "Sign in"}</button>
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        New student? <Link href="/register" className="font-semibold text-emerald-700 hover:underline">Create an account</Link>
      </p>
      {demoHint && (
        <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Development demo accounts (password <code>Password@123</code>): aditi.sharma@pes.edu (student),
          ravi.kumar@canteenx.in (admin).
        </p>
      )}
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    const f = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    for (const k of ["first_name", "last_name", "email", "phone", "password"]) data[k] = String(f.get(k) ?? "");
    const r = await post("/api/auth/register", data);
    if (r.error || !r.redirect) {
      setError(r.error ?? "Could not register");
      setFields(r.fieldErrors ?? {});
      setBusy(false);
      return;
    }
    router.push(r.redirect);
    router.refresh();
  }

  const field = (name: string, label: string, type = "text", extra = {}) => (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <input name={name} type={type} className={input} aria-invalid={Boolean(fields[name])} {...extra} />
      {fields[name] && <span className="text-xs font-normal text-red-600">{fields[name]}</span>}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        {field("first_name", "First name", "text", { autoComplete: "given-name" })}
        {field("last_name", "Last name", "text", { autoComplete: "family-name" })}
      </div>
      {field("email", "College email", "email", { autoComplete: "email" })}
      {field("phone", "Phone (optional)", "tel", { autoComplete: "tel", inputMode: "numeric", placeholder: "10 digits" })}
      {field("password", "Password", "password", { autoComplete: "new-password", placeholder: "8+ characters, a letter and a number" })}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className={button}>{busy ? "Creating account..." : "Create account"}</button>
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        Already registered? <Link href="/login" className="font-semibold text-emerald-700 hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
