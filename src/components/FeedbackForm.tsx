"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/client-api";

const TAGS = ["tasty", "fresh", "value-for-money", "generous-portion", "quick-service", "cold", "oily", "small-portion", "slow", "stale"];
const ASPECTS = ["taste", "portion", "freshness", "service"];

/** Rate one item of a completed order. Stored in MongoDB through POST /api/feedback. */
export default function FeedbackForm({ orderId, menuItemId, itemName }: { orderId: number; menuItemId: number; itemName: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (t: string) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : cur.length < 8 ? [...cur, t] : cur));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) return setError("Choose a star rating first");
    const f = new FormData(e.currentTarget);
    const aspects: Record<string, number> = {};
    for (const a of ASPECTS) {
      const v = Number(f.get(a));
      if (v >= 1 && v <= 5) aspects[a] = v;
    }
    setBusy(true);
    setError(null);
    const r = await api("/api/feedback", "POST", {
      order_id: orderId,
      menu_item_id: menuItemId,
      rating,
      comment: String(f.get("comment") ?? "").trim() || undefined,
      tags,
      aspects,
    });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Could not save your feedback");
    router.refresh();
  }

  return (
    <details className="mt-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
      <summary className="cursor-pointer text-sm font-medium text-emerald-700">Rate {itemName}</summary>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
        <div role="radiogroup" aria-label="Star rating" className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              onClick={() => setRating(n)}
              className={`text-3xl leading-none ${n <= rating ? "text-amber-500" : "text-neutral-300 dark:text-neutral-600"}`}
            >
              {"\u2605"}
            </button>
          ))}
        </div>
        <textarea
          name="comment"
          maxLength={500}
          rows={2}
          placeholder="Tell us more (optional)"
          className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
        />
        <div className="flex flex-wrap gap-2" aria-label="Tags">
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tags.includes(t)}
              onClick={() => toggle(t)}
              className={`rounded-full border px-3 py-1 text-xs ${tags.includes(t) ? "border-emerald-700 bg-emerald-700 text-white" : "border-neutral-300 dark:border-neutral-600"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <details>
          <summary className="cursor-pointer text-xs text-neutral-500">Rate details (optional)</summary>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ASPECTS.map((a) => (
              <label key={a} className="flex flex-col gap-1 text-xs font-medium capitalize">
                {a}
                <select name={a} defaultValue="" className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-900">
                  <option value="">-</option>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            ))}
          </div>
        </details>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={busy} className="rounded-md bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            {busy ? "Saving..." : "Submit feedback"}
          </button>
          {error && <span role="alert" className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </details>
  );
}
