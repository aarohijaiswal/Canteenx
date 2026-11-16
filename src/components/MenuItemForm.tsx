"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/client-api";

const input = "w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-900";
const btn = "rounded-md bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";

interface Item {
  menu_item_id: number;
  item_name: string;
  description: string | null;
  price: number;
  category_id: number;
  is_veg: boolean;
}

/** Create (no `item`) or edit (with `item`) a menu item. ADMIN only. */
export default function MenuItemForm({ categories, item }: { categories: { category_id: number; category_name: string }[]; item?: Item }) {
  const router = useRouter();
  const editing = Boolean(item);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const body: Record<string, unknown> = {
      item_name: String(f.get("item_name")),
      description: String(f.get("description") ?? "") || null,
      price: Number(f.get("price")),
      category_id: Number(f.get("category_id")),
      is_veg: f.get("is_veg") === "on",
    };
    if (!editing) {
      body.initial_stock = Number(f.get("initial_stock"));
      body.reorder_level = Number(f.get("reorder_level"));
    }
    setBusy(true);
    setError(null);
    setOk(false);
    const r = editing ? await api(`/api/staff/menu/${item!.menu_item_id}`, "PATCH", body) : await api("/api/staff/menu", "POST", body);
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Could not save");
    setOk(true);
    if (!editing) form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-xs font-medium">Name
        <input name="item_name" required minLength={2} maxLength={100} defaultValue={item?.item_name} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium">Category
        <select name="category_id" defaultValue={item?.category_id} className={input}>
          {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium sm:col-span-2">Description
        <input name="description" maxLength={255} defaultValue={item?.description ?? ""} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium">Price (Rs.)
        <input name="price" type="number" min="0.01" step="0.01" required defaultValue={item?.price} className={input} />
      </label>
      <label className="flex items-center gap-2 pt-5 text-sm font-medium">
        <input name="is_veg" type="checkbox" defaultChecked={item?.is_veg ?? true} /> Vegetarian
      </label>
      {!editing && (
        <>
          <label className="flex flex-col gap-1 text-xs font-medium">Opening stock
            <input name="initial_stock" type="number" min={0} required defaultValue={20} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium">Reorder level
            <input name="reorder_level" type="number" min={0} required defaultValue={10} className={input} />
          </label>
        </>
      )}
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={busy} className={btn}>{busy ? "Saving..." : editing ? "Save changes" : "Add item"}</button>
        {ok && <span role="status" className="text-sm text-emerald-700">Saved</span>}
        {error && <span role="alert" className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
