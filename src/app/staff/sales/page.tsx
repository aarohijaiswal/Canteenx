import Link from "next/link";
import { Suspense } from "react";
import SalesChart from "@/components/SalesChart";
import { formatMoney } from "@/lib/format";
import { RANGES, requireStaffPage, salesReport, type RangeKey } from "@/lib/staff";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function SalesPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading sales...</p>}>
      <SalesContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SalesContent({ searchParams }: { searchParams: SP }) {
  const user = await requireStaffPage(true); // ADMIN only
  const raw = (await searchParams).range;
  const r = Array.isArray(raw) ? raw[0] : raw;
  const range: RangeKey = r && r in RANGES ? (r as RangeKey) : "7d";
  const report = await salesReport(user.canteenId, range);

  const tab = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${active ? "bg-emerald-700 text-white" : "border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"}`;
  const maxUnits = Math.max(1, ...report.top.map((t) => t.units));
  const methodTotal = Math.max(1, report.revenue);
  const catTotal = Math.max(1, report.categories.reduce((s, c) => s + c.revenue, 0));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Sales</h1>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(RANGES) as RangeKey[]).map((k) => (
            <Link key={k} href={`/staff/sales?range=${k}`} className={tab(k === range)}>{RANGES[k].label}</Link>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-neutral-500">Counts completed orders with a successful payment, for your canteen only.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"><p className="text-sm text-neutral-500">Revenue</p><p className="text-3xl font-bold">{formatMoney(report.revenue)}</p></div>
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"><p className="text-sm text-neutral-500">Orders</p><p className="text-3xl font-bold">{report.orders}</p></div>
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"><p className="text-sm text-neutral-500">Average order</p><p className="text-3xl font-bold">{formatMoney(report.avg)}</p></div>
      </div>

      <section className="mt-6 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
        <h2 className="mb-3 font-semibold">Revenue per day</h2>
        <SalesChart days={report.days} />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <h2 className="font-semibold">Popular items</h2>
          {report.top.length === 0 ? <p className="mt-2 text-sm text-neutral-500">No sales in this period.</p> : (
            <ol className="mt-2 flex flex-col gap-2">
              {report.top.map((t) => (
                <li key={t.item_name} className="text-sm">
                  <div className="flex justify-between"><span>{t.item_name}</span><span className="text-neutral-500">{t.units} sold</span></div>
                  <div className="mt-1 h-2 rounded bg-neutral-200 dark:bg-neutral-800"><div className="h-2 rounded bg-emerald-600" style={{ width: `${(t.units / maxUnits) * 100}%` }} /></div>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <h2 className="font-semibold">By payment method</h2>
          {report.methods.length === 0 ? <p className="mt-2 text-sm text-neutral-500">No sales in this period.</p> : (
            <ul className="mt-2 flex flex-col gap-2">
              {report.methods.map((m) => (
                <li key={m.payment_method} className="text-sm">
                  <div className="flex justify-between"><span>{m.payment_method} ({m.orders})</span><span className="text-neutral-500">{formatMoney(m.revenue)}</span></div>
                  <div className="mt-1 h-2 rounded bg-neutral-200 dark:bg-neutral-800"><div className="h-2 rounded bg-blue-600" style={{ width: `${(m.revenue / methodTotal) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <h2 className="font-semibold">By category</h2>
          {report.categories.length === 0 ? <p className="mt-2 text-sm text-neutral-500">No sales in this period.</p> : (
            <ul className="mt-2 flex flex-col gap-2">
              {report.categories.map((c) => (
                <li key={c.category_name} className="text-sm">
                  <div className="flex justify-between"><span>{c.category_name}</span><span className="text-neutral-500">{formatMoney(c.revenue)}</span></div>
                  <div className="mt-1 h-2 rounded bg-neutral-200 dark:bg-neutral-800"><div className="h-2 rounded bg-purple-600" style={{ width: `${(c.revenue / catTotal) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
