import Link from "next/link";
import { Suspense } from "react";
import StatusBadge from "@/components/StatusBadge";
import { requireRolePage } from "@/lib/auth";
import { formatDateTime, formatMoney } from "@/lib/format";
import { listOrders } from "@/lib/orders";

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading your orders...</p>}>
      <OrdersContent />
    </Suspense>
  );
}

async function OrdersContent() {
  const user = await requireRolePage(["STUDENT"]);
  const orders = await listOrders(user.id);
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      <h1 className="text-2xl font-bold">My orders</h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-center text-neutral-500">You have not placed any orders yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.order_id}>
              <Link href={`/student/orders/${o.order_id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">
                <span>
                  <span className="font-semibold">Order #{o.order_id}</span> - {o.canteen_name}
                  <span className="block text-xs text-neutral-500">{formatDateTime(o.order_date)} - {o.item_count} item{o.item_count === 1 ? "" : "s"}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold">{formatMoney(o.total_amount)}</span>
                  <StatusBadge status={o.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
