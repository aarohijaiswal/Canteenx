import { Suspense } from "react";
import ActionButton from "@/components/ActionButton";
import { ReorderLevelForm, RestockForm } from "@/components/InventoryControls";
import { formatDateTime, formatMoney } from "@/lib/format";
import { listInventory, listOpenAlerts, listRecentDeliveries, requireStaffPage } from "@/lib/staff";

export default function InventoryPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading inventory...</p>}>
      <InventoryContent />
    </Suspense>
  );
}

async function InventoryContent() {
  const user = await requireStaffPage();
  const [items, alerts, deliveries] = await Promise.all([
    listInventory(user.canteenId),
    listOpenAlerts(user.canteenId),
    listRecentDeliveries(user.canteenId),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6">
      <h1 className="text-2xl font-bold">Inventory</h1>

      {alerts.length > 0 && (
        <section className="mt-4 rounded-xl border border-amber-400 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950" aria-label="Low-stock alerts">
          <h2 className="font-semibold text-amber-900 dark:text-amber-200">Low-stock alerts ({alerts.length})</h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-amber-900 dark:text-amber-200">
            {alerts.map((a) => (
              <li key={a.alert_id}>{a.message} <span className="text-xs opacity-70">- {formatDateTime(a.alert_date)}</span></li>
            ))}
          </ul>
          <p className="mt-2 text-xs opacity-80">Alerts clear automatically once the item is restocked above its reorder level.</p>
        </section>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 dark:bg-neutral-900">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">In stock</th>
              <th className="px-3 py-2">Reorder level</th>
              <th className="px-3 py-2">On menu</th>
              <th className="px-3 py-2">Restock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {items.map((it) => {
              const low = it.quantity_in_stock <= it.reorder_level;
              return (
                <tr key={it.menu_item_id} className={low ? "bg-amber-50/60 dark:bg-amber-950/30" : ""}>
                  <td className="px-3 py-2 align-top">
                    <p className="font-medium">{it.item_name}</p>
                    <p className="text-xs text-neutral-500">{it.category_name}</p>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className={`font-semibold ${it.quantity_in_stock === 0 ? "text-red-600" : low ? "text-amber-700" : ""}`}>{it.quantity_in_stock}</span>
                    {it.quantity_in_stock === 0 ? <span className="ml-2 text-xs text-red-600">Out of stock</span> : low ? <span className="ml-2 text-xs text-amber-700">Low</span> : null}
                  </td>
                  <td className="px-3 py-2 align-top"><ReorderLevelForm menuItemId={it.menu_item_id} value={it.reorder_level} /></td>
                  <td className="px-3 py-2 align-top">
                    <ActionButton
                      url={`/api/staff/inventory/${it.menu_item_id}`}
                      method="PATCH"
                      body={{ is_available: !it.is_available }}
                      label={it.is_available ? "Shown - hide" : "Hidden - show"}
                    />
                  </td>
                  <td className="px-3 py-2 align-top"><RestockForm menuItemId={it.menu_item_id} suppliers={it.suppliers} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Recent deliveries</h2>
        {deliveries.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No deliveries recorded yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-neutral-200 rounded-xl border border-neutral-200 text-sm dark:divide-neutral-700 dark:border-neutral-700">
            {deliveries.map((d, i) => (
              <li key={i} className="flex flex-wrap justify-between gap-2 px-3 py-2">
                <span>{d.quantity} x {d.item_name} <span className="text-neutral-500">from {d.supplier_name}</span></span>
                <span className="text-neutral-500">{formatMoney(Number(d.unit_cost))} each - {formatDateTime(d.supply_date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
