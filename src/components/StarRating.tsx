export default function StarRating({ value, count }: { value: number; count?: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1 text-sm" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span className="text-amber-500" aria-hidden>{"\u2605".repeat(full)}<span className="text-neutral-300 dark:text-neutral-600">{"\u2605".repeat(5 - full)}</span></span>
      <span className="text-xs text-neutral-500">{value.toFixed(1)}{count != null && ` (${count})`}</span>
    </span>
  );
}
