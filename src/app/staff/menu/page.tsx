import { Suspense } from "react";
import ActionButton from "@/components/ActionButton";
import MenuItemForm from "@/components/MenuItemForm";
import { formatMoney } from "@/lib/format";
import { listCategories } from "@/lib/menu";
import { listAdminMenu, requireStaffPage } from "@/lib/staff";

export default function MenuAdminPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading menu...</p>}>
      <MenuContent />
    </Suspense>
  );
}

async function MenuContent() {
  const user = await requireStaffPage(true); // ADMIN only
  const [items, categories] = await Promise.all([listAdminMenu(user.canteenId), listCategories()]);
  const cats = categories.map((c) => ({ category_id: c.category_id, category_name: c.category_name }));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <h1 className="text-2xl font-bold">Menu management</h1>

      <details className="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
        <summary className="cursor-pointer font-semibold text-emerald-700">Add a new item</summary>
        <div className="mt-3"><MenuItemForm categories={cats} /></div>
      </details>

      <ul className="mt-4 flex flex-col gap-3">
        {items.map((it) => (
          <li key={it.menu_item_id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {it.item_name} <span className="font-normal text-neutral-500">- {formatMoney(it.price)}</span>
                </p>
                <p className="text-xs text-neutral-500">
                  {it.category_name} - {it.is_veg ? "Veg" : "Non-veg"} - {it.quantity_in_stock} in stock -{" "}
                  {it.is_available ? "shown on the menu" : <span className="font-semibold text-red-600">hidden</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton url={`/api/staff/menu/${it.menu_item_id}`} method="PATCH" body={{ is_available: !it.is_available }} label={it.is_available ? "Hide" : "Show"} />
                <ActionButton
                  url={`/api/staff/menu/${it.menu_item_id}`}
                  method="DELETE"
                  label="Delete"
                  tone="danger"
                  confirmText={`Delete ${it.item_name}? This cannot be undone.`}
                />
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium text-emerald-700">Edit</summary>
              <div className="mt-3"><MenuItemForm categories={cats} item={it} /></div>
            </details>
          </li>
        ))}
      </ul>
    </main>
  );
}
