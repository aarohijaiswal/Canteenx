const styles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  Preparing: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  Ready: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  Completed: "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
  Cancelled: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
  Successful: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  Failed: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
  Refunded: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? styles.Completed}`}>
      {status}
    </span>
  );
}
