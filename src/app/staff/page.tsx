import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import type { RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { requireStaffPage, salesReport } from "@/lib/staff";

export default function StaffHome() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading...</p>}>
      <StaffContent />
    </Suspense>
  );
}

function Tile({ href, label, value, hint, warn }: { href: string; label: string; value: ReactNode; hint?: string; warn?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-xl border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 ${warn ? "border-amber-400 dark:border-amber-600" : "border-neutral-200 dark:border-neutral-700"}`}
    >
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </Link>
  );
}

async function StaffContent() {
  const user = await requireStaffPage();
  const [canteen] = await query<RowDataPacket & { canteen_name: string }>("SELECT canteen_name FROM CANTEEN WHERE canteen_id = ?", [user.canteenId]);
  const [orders] = await query<RowDataPacket & { open: number; unpaid: number }>(
    `SELECT SUM(o.status IN ('Pending','Preparing','Ready')) AS open,
            SUM(p.payment_status = 'Pending' AND o.status <> 'Cancelled') AS unpaid
     FROM ORDERS o LEFT JOIN PAYMENT p ON p.order_id = o.order_id WHERE o.canteen_id = ?`,
    [user.canteenId],
  );
  const [stock] = await query<RowDataPacket & { low: number; out_of_stock: number }>(
    `SELECT SUM(i.quantity_in_stock <= i.reorder_level) AS low, SUM(i.quantity_in_stock = 0) AS out_of_stock
     FROM INVENTORY i JOIN MENU_ITEM m ON m.menu_item_id = i.menu_item_id WHERE m.canteen_id = ?`,
    [user.canteenId],
  );
  const admin = user.role === "ADMIN";
  const today = admin ? await salesReport(user.canteenId, "today") : null;
  const low = Number(stock.low ?? 0);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <h1 className="text-2xl font-bold">{canteen?.canteen_name}</h1>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">Today at a glance.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile href="/staff/orders" label="Open orders" value={Number(orders.open ?? 0)} hint="Pending, preparing or ready" />
        <Tile href="/staff/orders" label="Payments to confirm" value={Number(orders.unpaid ?? 0)} hint="Mostly cash at the counter" warn={Number(orders.unpaid ?? 0) > 0} />
        <Tile href="/staff/inventory" label="Low-stock items" value={low} hint={`${Number(stock.out_of_stock ?? 0)} out of stock`} warn={low > 0} />
        {today && <Tile href="/staff/sales" label="Sales today" value={formatMoney(today.revenue)} hint={`${today.orders} completed order${today.orders === 1 ? "" : "s"}`} />}
      </div>
    </main>
  );
}
