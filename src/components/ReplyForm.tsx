"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/client-api";

export default function ReplyForm({ feedbackId }: { feedbackId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = String(new FormData(e.currentTarget).get("message") ?? "");
    setBusy(true);
    setError(null);
    const r = await api(`/api/staff/feedback/${feedbackId}/reply`, "POST", { message });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Could not send the reply");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-wrap items-start gap-2">
      <input
        name="message"
        required
        minLength={2}
        maxLength={500}
        placeholder="Write a reply..."
        className="min-w-60 flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-900"
      />
      <button type="submit" disabled={busy} className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
        {busy ? "Sending..." : "Reply"}
      </button>
      {error && <span role="alert" className="w-full text-xs text-red-600">{error}</span>}
    </form>
  );
}
