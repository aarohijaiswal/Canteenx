import { Suspense } from "react";
import ActionButton from "@/components/ActionButton";
import { LinkItemForm, SupplierForm } from "@/components/SupplierForms";
import { listSuppliers, listAdminMenu, requireStaffPage } from "@/lib/staff";

export default function SuppliersPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading suppliers...</p>}>
      <SuppliersContent />
    </Suspense>
  );
}

async function SuppliersContent() {
  const user = await requireStaffPage(true); // ADMIN only
  const [suppliers, menu] = await Promise.all([listSuppliers(user.canteenId), listAdminMenu(user.canteenId)]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <h1 className="text-2xl font-bold">Suppliers</h1>
      <p className="mt-1 text-sm text-neutral-500">Link a supplier to the items of this canteen it can deliver. Staff can then record deliveries on the Inventory page.</p>

      <details className="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
        <summary className="cursor-pointer font-semibold text-emerald-700">Add a supplier</summary>
        <div className="mt-3"><SupplierForm /></div>
      </details>

      <ul className="mt-4 flex flex-col gap-3">
        {suppliers.map((s) => {
          const linked = new Set(s.items.map((i) => i.menu_item_id));
          const options = menu.filter((m) => !linked.has(m.menu_item_id)).map((m) => ({ menu_item_id: m.menu_item_id, item_name: m.item_name }));
          return (
            <li key={s.supplier_id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <p className="font-semibold">{s.supplier_name}</p>
              <p className="text-xs text-neutral-500">{s.contact_no ?? "no phone"} - {s.address ?? "no address"}</p>
              <div className="mt-3">
                <p className="text-xs font-medium uppercase text-neutral-500">Supplies</p>
                {s.items.length === 0 ? (
                  <p className="text-sm text-neutral-500">Nothing linked for this canteen yet.</p>
                ) : (
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {s.items.map((i) => (
                      <li key={i.menu_item_id} className="flex items-center gap-1 rounded-full bg-neutral-100 py-0.5 pl-3 pr-1 text-sm dark:bg-neutral-800">
                        {i.item_name}
                        <ActionButton url={`/api/staff/suppliers/${s.supplier_id}/items?menu_item_id=${i.menu_item_id}`} method="DELETE" label="x" tone="neutral" />
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2"><LinkItemForm supplierId={s.supplier_id} options={options} /></div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-emerald-700">Edit details</summary>
                <div className="mt-3"><SupplierForm supplier={s} /></div>
              </details>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
