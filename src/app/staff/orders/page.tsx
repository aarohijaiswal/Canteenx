import Link from "next/link";
import { Suspense } from "react";
import AutoRefresh from "@/components/AutoRefresh";
import OrderActions from "@/components/OrderActions";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime, formatMoney } from "@/lib/format";
import { listStaffOrders, requireStaffPage } from "@/lib/staff";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function StaffOrdersPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading orders...</p>}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}

async function OrdersContent({ searchParams }: { searchParams: SP }) {
  const user = await requireStaffPage();
  const v = (await searchParams).view;
  const view = (Array.isArray(v) ? v[0] : v) === "done" ? "done" : "open";
  const orders = await listStaffOrders(user.canteenId, view);

  const tab = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${active ? "bg-emerald-700 text-white" : "border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"}`;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      {view === "open" && <AutoRefresh seconds={8} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <Link href="/staff/orders" className={tab(view === "open")}>Open</Link>
          <Link href="/staff/orders?view=done" className={tab(view === "done")}>Finished (last 2 days)</Link>
        </div>
      </div>
      {view === "open" && <p className="mt-1 text-xs text-neutral-500">Oldest first. This list refreshes by itself.</p>}

      {orders.length === 0 ? (
        <p className="mt-10 text-center text-neutral-500">{view === "open" ? "No open orders right now." : "No finished orders in the last 2 days."}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.order_id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  #{o.order_id} <span className="font-normal text-neutral-600 dark:text-neutral-400">- {o.student_name}</span>
                </p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={o.status} />
                  {o.payment_status && <StatusBadge status={o.payment_status} />}
                </div>
              </div>
              <p className="mt-1 text-sm">{o.items}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {formatDateTime(o.order_date)} - {formatMoney(o.total_amount)} - {o.payment_method}
              </p>
              {view === "open" && (
                <div className="mt-3">
                  <OrderActions orderId={o.order_id} status={o.status} paymentStatus={o.payment_status} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
