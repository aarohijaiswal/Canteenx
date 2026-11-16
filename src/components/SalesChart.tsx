import { formatMoney } from "@/lib/format";

/** Revenue per day as simple bars (pure HTML/CSS, no chart library). */
export default function SalesChart({ days }: { days: { day: string; orders: number; revenue: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.revenue));
  const every = days.length > 16 ? 3 : 1;
  return (
    <figure>
      <div className="flex h-40 items-end gap-1" role="img" aria-label="Revenue per day">
        {days.map((d) => (
          <div key={d.day} className="group flex h-full flex-1 flex-col justify-end" title={`${d.day}: ${formatMoney(d.revenue)} from ${d.orders} order${d.orders === 1 ? "" : "s"}`}>
            <div
              className={`w-full rounded-t ${d.revenue > 0 ? "bg-emerald-600 group-hover:bg-emerald-700" : "bg-neutral-200 dark:bg-neutral-800"}`}
              style={{ height: d.revenue > 0 ? `${Math.max(4, (d.revenue / max) * 100)}%` : "2px" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 text-[10px] text-neutral-500">
        {days.map((d, i) => (
          <span key={d.day} className="flex-1 text-center">{i % every === 0 ? d.day.slice(8) : ""}</span>
        ))}
      </div>
      <figcaption className="mt-1 text-xs text-neutral-500">Day of month on the bottom; hover a bar for the amount. Peak day: {formatMoney(max === 1 ? 0 : max)}.</figcaption>
    </figure>
  );
}
