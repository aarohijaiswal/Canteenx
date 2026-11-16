"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client-api";

export default function AddToCartButton({ menuItemId, disabled }: { menuItemId: number; disabled: boolean }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  async function add() {
    setBusy(true);
    setMsg(null);
    const r = await api("/api/cart", "POST", { menu_item_id: menuItemId, quantity: qty });
    setBusy(false);
    if (!r.ok) return setMsg({ text: r.data.error ?? "Could not add", error: true });
    setMsg({ text: "Added to cart", error: false });
    setQty(1);
    router.refresh();
  }

  const step = "h-8 w-8 rounded-md border border-neutral-300 text-lg leading-none hover:bg-neutral-100 disabled:opacity-40 dark:border-neutral-600 dark:hover:bg-neutral-800";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <button type="button" className={step} disabled={disabled || qty <= 1} onClick={() => setQty(qty - 1)} aria-label="Decrease quantity">-</button>
        <span className="w-6 text-center text-sm font-semibold" aria-live="polite">{qty}</span>
        <button type="button" className={step} disabled={disabled || qty >= 10} onClick={() => setQty(qty + 1)} aria-label="Increase quantity">+</button>
        <button
          type="button"
          onClick={add}
          disabled={disabled || busy}
          className="ml-auto rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Adding..." : "Add"}
        </button>
      </div>
      {msg && <p role="status" className={`text-xs ${msg.error ? "text-red-600" : "text-emerald-700"}`}>{msg.text}</p>}
    </div>
  );
}
