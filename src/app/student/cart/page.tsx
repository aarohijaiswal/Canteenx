import Link from "next/link";
import { Suspense } from "react";
import CartLineControls from "@/components/CartLineControls";
import CheckoutForm from "@/components/CheckoutForm";
import { requireRolePage } from "@/lib/auth";
import { getCartLines, type CartLine } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

export default function CartPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading your cart...</p>}>
      <CartContent />
    </Suspense>
  );
}

async function CartContent() {
  const user = await requireRolePage(["STUDENT"]);
  const lines = await getCartLines(user.id);

  // an order is placed with one canteen at a time, so the cart is grouped by canteen
  const groups = new Map<number, { name: string; lines: CartLine[] }>();
  for (const l of lines) {
    if (!groups.has(l.canteen_id)) groups.set(l.canteen_id, { name: l.canteen_name, lines: [] });
    groups.get(l.canteen_id)!.lines.push(l);
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      <h1 className="text-2xl font-bold">Your cart</h1>
      {lines.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-neutral-500">Your cart is empty.</p>
          <Link href="/student/menu" className="mt-3 inline-block rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Browse the menu</Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-6">
          {groups.size > 1 && (
            <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              Your cart has items from {groups.size} canteens. Each canteen is a separate order.
            </p>
          )}
          {[...groups.entries()].map(([canteenId, g]) => {
            const total = g.lines.reduce((s, l) => s + l.price * l.quantity, 0);
            const problem = g.lines.some((l) => !l.available);
            return (
              <section key={canteenId} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                <h2 className="font-semibold">{g.name}</h2>
                <ul className="mt-2 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {g.lines.map((l) => (
                    <li key={l.menu_item_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-medium">{l.item_name}</p>
                        <p className="text-sm text-neutral-500">{formatMoney(l.price)} each</p>
                        {!l.available && (
                          <p className="text-xs font-semibold text-red-600">
                            {l.in_stock === 0 ? "No longer available" : `Only ${l.in_stock} left - reduce the quantity`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <CartLineControls menuItemId={l.menu_item_id} quantity={l.quantity} />
                        <span className="w-20 text-right font-semibold">{formatMoney(l.price * l.quantity)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-700">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatMoney(total)}</span>
                </div>
                <CheckoutForm canteenId={canteenId} disabled={problem} />
                {problem && <p className="mt-2 text-xs text-red-600">Fix the items marked above to place this order.</p>}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
