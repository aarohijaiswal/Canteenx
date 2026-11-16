"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/client-api";

const input = "rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-900";
const btn = "rounded-md bg-emerald-700 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";

export function ReorderLevelForm({ menuItemId, value }: { menuItemId: number; value: number }) {
  const router = useRouter();
  const [level, setLevel] = useState(String(value));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await api(`/api/staff/inventory/${menuItemId}`, "PATCH", { reorder_level: Number(level) });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Could not save");
    router.refresh();
  }
  return (
    <form onSubmit={save} className="flex items-center gap-1">
      <input type="number" min={0} max={1000} value={level} onChange={(e) => setLevel(e.target.value)} className={`${input} w-20`} aria-label="Reorder level" />
      {Number(level) !== value && <button type="submit" disabled={busy} className={btn}>Save</button>}
      {error && <span role="alert" className="text-xs text-red-600">{error}</span>}
    </form>
  );
}

export function RestockForm({ menuItemId, suppliers }: { menuItemId: number; suppliers: { supplier_id: number; supplier_name: string }[] }) {
  const router = useRouter();
  const [supplier, setSupplier] = useState(String(suppliers[0]?.supplier_id ?? ""));
  const [qty, setQty] = useState("20");
  const [cost, setCost] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  if (suppliers.length === 0) return <span className="text-xs text-neutral-500">No supplier linked (ask an admin)</span>;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await api<{ quantity_in_stock: number }>(`/api/staff/inventory/${menuItemId}/restock`, "POST", {
      supplier_id: Number(supplier),
      quantity: Number(qty),
      unit_cost: Number(cost),
    });
    setBusy(false);
    if (!r.ok) return setMsg({ text: r.data.error ?? "Could not record the delivery", error: true });
    setMsg({ text: `Stock is now ${r.data.quantity_in_stock}`, error: false });
    router.refresh();
  }

  return (
    <details className="text-sm">
      <summary className="cursor-pointer font-medium text-emerald-700">Restock</summary>
      <form onSubmit={submit} className="mt-2 flex flex-wrap items-end gap-2">
        <label className="flex flex-col text-xs font-medium">Supplier
          <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className={input}>
            {suppliers.map((s) => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-xs font-medium">Quantity
          <input type="number" min={1} max={5000} required value={qty} onChange={(e) => setQty(e.target.value)} className={`${input} w-20`} />
        </label>
        <label className="flex flex-col text-xs font-medium">Cost each (Rs.)
          <input type="number" min={0} step="0.01" required value={cost} onChange={(e) => setCost(e.target.value)} className={`${input} w-24`} />
        </label>
        <button type="submit" disabled={busy} className={btn}>{busy ? "Saving..." : "Record delivery"}</button>
      </form>
      {msg && <p role="status" className={`mt-1 text-xs ${msg.error ? "text-red-600" : "text-emerald-700"}`}>{msg.text}</p>}
    </details>
  );
}
