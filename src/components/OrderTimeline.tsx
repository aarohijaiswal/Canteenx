import { formatDateTime } from "@/lib/format";
import { STATUS_FLOW } from "@/lib/orders";

export default function OrderTimeline({
  status,
  history,
}: {
  status: string;
  history: { new_status: string; changed_at: Date }[];
}) {
  if (status === "Cancelled") {
    const when = history.find((h) => h.new_status === "Cancelled")?.changed_at;
    return (
      <p className="rounded-md bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-200">
        This order was cancelled{when ? ` on ${formatDateTime(when)}` : ""}.
      </p>
    );
  }
  const reached = STATUS_FLOW.indexOf(status as (typeof STATUS_FLOW)[number]);
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0">
      {STATUS_FLOW.map((step, i) => {
        const done = i <= reached;
        const when = history.find((h) => h.new_status === step)?.changed_at;
        return (
          <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:gap-1 sm:text-center">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                done ? "bg-emerald-700 text-white" : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800"
              }`}
              aria-hidden
            >
              {done ? "\u2713" : i + 1}
            </span>
            <span>
              <span className={`block text-sm font-semibold ${done ? "" : "text-neutral-500"}`}>{step}</span>
              <span className="block text-xs text-neutral-500">{when ? formatDateTime(when) : "\u00a0"}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
