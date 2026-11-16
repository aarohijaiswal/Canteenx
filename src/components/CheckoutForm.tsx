"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client-api";

const METHODS = [
  { value: "UPI", label: "UPI" },
  { value: "Card", label: "Card" },
  { value: "Wallet", label: "Wallet" },
  { value: "Cash", label: "Cash at counter" },
];

export default function CheckoutForm({ canteenId, disabled }: { canteenId: number; disabled: boolean }) {
  const router = useRouter();
  const [method, setMethod] = useState("UPI");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function place() {
    setBusy(true);
    setError(null);
    const r = await api<{ order_id: number }>("/api/orders", "POST", { canteen_id: canteenId, payment_method: method });
    if (!r.ok) {
      setBusy(false);
      return setError(r.data.error ?? "Could not place the order");
    }
    router.push(`/student/orders/${r.data.order_id}`);
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        Pay with
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-900"
        >
          {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </label>
      <button
        type="button"
        onClick={place}
        disabled={disabled || busy}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Placing order..." : "Place order"}
      </button>
      {error && <p role="alert" className="w-full text-sm text-red-600">{error}</p>}
    </div>
  );
}
