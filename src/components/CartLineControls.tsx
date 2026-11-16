"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client-api";

export default function CartLineControls({ menuItemId, quantity }: { menuItemId: number; quantity: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setQty(next: number) {
    setBusy(true);
    setError(null);
    const r = next < 1
      ? await api(`/api/cart?menu_item_id=${menuItemId}`, "DELETE")
      : await api("/api/cart", "PATCH", { menu_item_id: menuItemId, quantity: next });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Could not update");
    router.refresh();
  }

  const step = "h-8 w-8 rounded-md border border-neutral-300 text-lg leading-none hover:bg-neutral-100 disabled:opacity-40 dark:border-neutral-600 dark:hover:bg-neutral-800";
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button type="button" className={step} disabled={busy} onClick={() => setQty(quantity - 1)} aria-label="Decrease quantity">-</button>
        <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
        <button type="button" className={step} disabled={busy || quantity >= 10} onClick={() => setQty(quantity + 1)} aria-label="Increase quantity">+</button>
        <button type="button" disabled={busy} onClick={() => setQty(0)} className="ml-2 text-sm text-red-600 hover:underline disabled:opacity-40">Remove</button>
      </div>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
