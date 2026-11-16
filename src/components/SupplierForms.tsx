"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/client-api";

const input = "w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-900";
const btn = "rounded-md bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";

export function SupplierForm({ supplier }: { supplier?: { supplier_id: number; supplier_name: string; contact_no: string | null; address: string | null } }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const body = { supplier_name: String(f.get("supplier_name")), contact_no: String(f.get("contact_no") ?? ""), address: String(f.get("address") ?? "") };
    setBusy(true);
    setError(null);
    setOk(false);
    const r = supplier ? await api(`/api/staff/suppliers/${supplier.supplier_id}`, "PATCH", body) : await api("/api/staff/suppliers", "POST", body);
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Could not save");
    setOk(true);
    if (!supplier) form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
      <label className="flex flex-col gap-1 text-xs font-medium">Name
        <input name="supplier_name" required minLength={2} maxLength={100} defaultValue={supplier?.supplier_name} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium">Contact (10 digits)
        <input name="contact_no" inputMode="numeric" pattern="\d{10}" defaultValue={supplier?.contact_no ?? ""} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium">Address
        <input name="address" maxLength={255} defaultValue={supplier?.address ?? ""} className={input} />
      </label>
      <div className="flex items-center gap-3 sm:col-span-3">
        <button type="submit" disabled={busy} className={btn}>{busy ? "Saving..." : supplier ? "Save changes" : "Add supplier"}</button>
        {ok && <span role="status" className="text-sm text-emerald-700">Saved</span>}
        {error && <span role="alert" className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}

export function LinkItemForm({ supplierId, options }: { supplierId: number; options: { menu_item_id: number; item_name: string }[] }) {
  const router = useRouter();
  const [item, setItem] = useState(String(options[0]?.menu_item_id ?? ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (options.length === 0) return null;

  async function link() {
    setBusy(true);
    setError(null);
    const r = await api(`/api/staff/suppliers/${supplierId}/items`, "POST", { menu_item_id: Number(item) });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Could not link");
    router.refresh();
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={item} onChange={(e) => setItem(e.target.value)} className={`${input} w-48`} aria-label="Item to link">
        {options.map((o) => <option key={o.menu_item_id} value={o.menu_item_id}>{o.item_name}</option>)}
      </select>
      <button type="button" onClick={link} disabled={busy} className={btn}>Link item</button>
      {error && <span role="alert" className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
