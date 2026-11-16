import Link from "next/link";
import { Suspense } from "react";
import RecommendationCards from "@/components/RecommendationCards";
import StatusBadge from "@/components/StatusBadge";
import { requireRolePage } from "@/lib/auth";
import { formatDateTime, formatMoney } from "@/lib/format";
import { listOrders } from "@/lib/orders";
import { getRecommendations } from "@/lib/recommendations";

export default function StudentHome() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading your page...</p>}>
      <StudentContent />
    </Suspense>
  );
}

async function StudentContent() {
  const user = await requireRolePage(["STUDENT"]);
  const orders = await listOrders(user.id, 50);
  const active = orders.filter((o) => ["Pending", "Preparing", "Ready"].includes(o.status));
  const recent = orders.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
        You have placed {orders.length} order{orders.length === 1 ? "" : "s"} so far.
      </p>
      <Link href="/student/menu" className="mt-4 inline-block rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
        Browse the menu
      </Link>

      <Suspense fallback={<p className="mt-8 text-sm text-neutral-500">Finding suggestions for you...</p>}>
        <Recommendations studentId={user.id} />
      </Suspense>

      {active.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">In progress</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {active.map((o) => (
              <li key={o.order_id}>
                <Link href={`/student/orders/${o.order_id}`} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">
                  <span className="text-sm">Order #{o.order_id} at {o.canteen_name}</span>
                  <StatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Link href="/student/orders" className="text-sm font-medium text-emerald-700 hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No orders yet. Your first order will show up here.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {recent.map((o) => (
              <li key={o.order_id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-700">
                <span>#{o.order_id} - {o.canteen_name}<span className="block text-xs text-neutral-500">{formatDateTime(o.order_date)}</span></span>
                <span className="flex items-center gap-3"><span className="font-semibold">{formatMoney(o.total_amount)}</span><StatusBadge status={o.status} /></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

async function Recommendations({ studentId }: { studentId: number }) {
  const result = await getRecommendations(studentId, 4); // null if MongoDB is unreachable -> section hidden
  return result ? <RecommendationCards result={result} /> : null;
}
