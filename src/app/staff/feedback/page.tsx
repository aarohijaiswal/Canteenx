import Link from "next/link";
import { Suspense } from "react";
import ActionButton from "@/components/ActionButton";
import ReplyForm from "@/components/ReplyForm";
import StarRating from "@/components/StarRating";
import { canteenFeedbackStats, listCanteenFeedback, type FeedbackFilter } from "@/lib/feedback";
import { formatDateTime } from "@/lib/format";
import { requireStaffPage } from "@/lib/staff";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function FeedbackPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading feedback...</p>}>
      <FeedbackContent searchParams={searchParams} />
    </Suspense>
  );
}

const FILTERS: { key: FeedbackFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "low", label: "Low ratings (1-2)" },
  { key: "unanswered", label: "Needs a reply" },
];

async function FeedbackContent({ searchParams }: { searchParams: SP }) {
  const user = await requireStaffPage();
  const f = (await searchParams).filter;
  const raw = Array.isArray(f) ? f[0] : f;
  const filter: FeedbackFilter = FILTERS.some((x) => x.key === raw) ? (raw as FeedbackFilter) : "all";

  let data: Awaited<ReturnType<typeof load>> | null = null;
  try {
    data = await load(user.canteenId, filter);
  } catch (err) {
    console.error("feedback unavailable", err);
  }

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 p-6">
        <h1 className="text-2xl font-bold">Customer feedback</h1>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Feedback is temporarily unavailable. Orders, inventory and payments are not affected.
        </p>
      </main>
    );
  }
  const { stats, reviews } = data;
  const maxDist = Math.max(1, ...stats.distribution.map((d) => d.count));
  const tab = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${active ? "bg-emerald-700 text-white" : "border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"}`;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Customer feedback</h1>
        {user.role === "ADMIN" && (
          <ActionButton url="/api/staff/recommendations/refresh" label="Refresh recommendations" />
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <p className="text-sm text-neutral-500">Average rating</p>
          <p className="text-3xl font-bold">{stats.reviews ? stats.avg.toFixed(2) : "-"}</p>
          <p className="text-xs text-neutral-500">{stats.reviews} review{stats.reviews === 1 ? "" : "s"}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <p className="text-sm text-neutral-500">Need a reply</p>
          <p className="text-3xl font-bold">{stats.unanswered}</p>
          <p className="text-xs text-neutral-500">ratings of 3 or less without an answer</p>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <p className="text-sm text-neutral-500">Detail scores (when given)</p>
          <p className="mt-1 text-sm">
            {(["taste", "portion", "freshness", "service"] as const).map((a) => (
              <span key={a} className="mr-3 inline-block capitalize">{a}: <b>{stats.aspects[a] ?? "-"}</b></span>
            ))}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <h2 className="font-semibold">Ratings</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = stats.distribution.find((d) => d.stars === n)?.count ?? 0;
              return (
                <li key={n} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{n} {"\u2605"}</span>
                  <span className="h-2 flex-1 rounded bg-neutral-200 dark:bg-neutral-800"><span className="block h-2 rounded bg-amber-500" style={{ width: `${(c / maxDist) * 100}%` }} /></span>
                  <span className="w-6 text-right text-neutral-500">{c}</span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <h2 className="font-semibold">Most mentioned</h2>
          {stats.topTags.length === 0 ? <p className="mt-2 text-sm text-neutral-500">No tags yet.</p> : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {stats.topTags.map((t) => <li key={t.tag} className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800">{t.tag} ({t.count})</li>)}
            </ul>
          )}
        </section>
        <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <h2 className="font-semibold">Items by rating</h2>
          {stats.items.length === 0 ? <p className="mt-2 text-sm text-neutral-500">Needs 2+ reviews per item.</p> : (
            <ol className="mt-2 flex flex-col gap-1 text-sm">
              {[...stats.items.slice(0, 2), ...stats.items.slice(-2)].filter((v, i, a) => a.findIndex((x) => x.item_name === v.item_name) === i).map((i) => (
                <li key={i.item_name} className="flex justify-between"><span>{i.item_name}</span><StarRating value={i.avg} count={i.reviews} /></li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((x) => <Link key={x.key} href={`/staff/feedback?filter=${x.key}`} className={tab(x.key === filter)}>{x.label}</Link>)}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-8 text-center text-neutral-500">No feedback matches this filter.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{r.item_name} <span className="text-xs font-normal text-neutral-500">- order #{r.order_id}</span></p>
                <StarRating value={r.rating} />
              </div>
              {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
              {r.tags.length > 0 && <p className="mt-1 text-xs text-neutral-500">{r.tags.join(", ")}</p>}
              <p className="mt-1 text-xs text-neutral-500">{formatDateTime(r.created_at)}</p>
              {r.staff_reply ? (
                <p className="mt-2 border-l-2 border-emerald-600 pl-2 text-sm"><span className="font-semibold">Your reply:</span> {r.staff_reply.message}</p>
              ) : (
                <ReplyForm feedbackId={r.id} />
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

async function load(canteenId: number, filter: FeedbackFilter) {
  const [stats, reviews] = await Promise.all([canteenFeedbackStats(canteenId), listCanteenFeedback(canteenId, filter)]);
  return { stats, reviews };
}
