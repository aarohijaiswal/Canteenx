import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AutoRefresh from "@/components/AutoRefresh";
import CancelOrderButton from "@/components/CancelOrderButton";
import FeedbackForm from "@/components/FeedbackForm";
import StarRating from "@/components/StarRating";
import OrderTimeline from "@/components/OrderTimeline";
import StatusBadge from "@/components/StatusBadge";
import { requireRolePage } from "@/lib/auth";
import { formatDateTime, formatMoney } from "@/lib/format";
import { feedbackForOrder, type Feedback } from "@/lib/feedback";
import { getOrderDetail } from "@/lib/orders";

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading your order...</p>}>
      <OrderContent params={params} />
    </Suspense>
  );
}

async function OrderContent({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRolePage(["STUDENT"]);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  const order = await getOrderDetail(user.id, id); // null when the order belongs to someone else
  if (!order) notFound();

  const active = ["Pending", "Preparing", "Ready"].includes(order.status);

  // feedback is stored in MongoDB; if it is unreachable the rest of the page still works
  let feedback = new Map<number, Feedback>();
  let feedbackDown = false;
  if (order.status === "Completed") {
    try {
      feedback = await feedbackForOrder(user.id, order.order_id);
    } catch {
      feedbackDown = true;
    }
  }
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      {active && <AutoRefresh seconds={10} />}
      <Link href="/student/orders" className="text-sm text-emerald-700 hover:underline">&larr; All orders</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.order_id}</h1>
          <p className="text-sm text-neutral-500">{order.canteen_name} - {formatDateTime(order.order_date)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <section className="mt-6 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
        <OrderTimeline status={order.status} history={order.history} />
        {order.status === "Ready" && <p className="mt-4 text-sm font-semibold text-emerald-700">Your order is ready - please collect it from the counter.</p>}
        {active && <p className="mt-3 text-xs text-neutral-500">This page updates automatically.</p>}
      </section>

      <section className="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-2 divide-y divide-neutral-200 text-sm dark:divide-neutral-700">
          {order.lines.map((l) => (
            <li key={l.item_name} className="flex justify-between py-2">
              <span>{l.quantity} x {l.item_name} <span className="text-neutral-500">({formatMoney(l.unit_price)})</span></span>
              <span className="font-medium">{formatMoney(l.sub_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-neutral-200 pt-3 dark:border-neutral-700">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold">{formatMoney(order.total_amount)}</span>
        </div>
      </section>

      <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-700">
        <div>
          <p className="font-semibold">Payment</p>
          <p className="text-neutral-600 dark:text-neutral-400">
            {order.payment_method ?? "-"}
            {order.payment_method === "Cash" && order.payment_status === "Pending" && " - pay at the counter"}
            {order.transaction_ref && <span className="block text-xs text-neutral-500">Ref: {order.transaction_ref}</span>}
          </p>
        </div>
        {order.payment_status && <StatusBadge status={order.payment_status} />}
      </section>

      {order.status === "Completed" && (
        <section className="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <h2 className="font-semibold">How was it?</h2>
          {feedbackDown ? (
            <p className="mt-2 text-sm text-neutral-500">Feedback is temporarily unavailable.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-3">
              {order.lines.map((l) => {
                const fb = feedback.get(l.menu_item_id);
                return (
                  <li key={l.menu_item_id}>
                    <p className="text-sm font-medium">{l.item_name}</p>
                    {fb ? (
                      <div className="mt-1 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
                        <StarRating value={fb.rating} />
                        {fb.comment && <p className="mt-1">{fb.comment}</p>}
                        {fb.tags.length > 0 && <p className="mt-1 text-xs text-neutral-500">{fb.tags.join(", ")}</p>}
                        {fb.staff_reply && (
                          <p className="mt-2 border-l-2 border-emerald-600 pl-2 text-xs text-neutral-700 dark:text-neutral-300">
                            <span className="font-semibold">Reply from the canteen:</span> {fb.staff_reply.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <FeedbackForm orderId={order.order_id} menuItemId={l.menu_item_id} itemName={l.item_name} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {order.status === "Pending" && <div className="mt-4"><CancelOrderButton orderId={order.order_id} /></div>}
    </main>
  );
}
