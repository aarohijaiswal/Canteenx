"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client-api";

const tones = {
  primary: "bg-emerald-700 text-white hover:bg-emerald-800 border-transparent",
  neutral: "border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800",
  danger: "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950",
} as const;

/** A button that calls one API route, then refreshes the page data. */
export default function ActionButton({
  url,
  method = "POST",
  body,
  label,
  confirmText,
  tone = "neutral",
}: {
  url: string;
  method?: "POST" | "PATCH" | "DELETE";
  body?: unknown;
  label: string;
  confirmText?: string;
  tone?: keyof typeof tones;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    const r = await api(url, method, body);
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Something went wrong");
    router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className={`rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${tones[tone]}`}
      >
        {busy ? "Please wait..." : label}
      </button>
      {error && <span role="alert" className="max-w-xs text-xs text-red-600">{error}</span>}
    </span>
  );
}
