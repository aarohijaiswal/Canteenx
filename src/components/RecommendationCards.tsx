import AddToCartButton from "./AddToCartButton";
import { formatMoney } from "@/lib/format";
import type { RecommendationResult } from "@/lib/recommendations";

export default function RecommendationCards({ result }: { result: RecommendationResult }) {
  return (
    <section className="mt-8" aria-label="Recommendations">
      <h2 className="text-lg font-semibold">{result.kind === "personal" ? "Recommended for you" : "Popular on campus"}</h2>
      <p className="text-xs text-neutral-500">
        {result.kind === "personal" ? "Based on what you and other students order together, and how it is rated." : "Order something to get suggestions made just for you."}
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {result.items.map((it) => (
          <li key={it.menu_item_id} className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">
                <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${it.is_veg ? "bg-green-600" : "bg-red-600"}`} title={it.is_veg ? "Vegetarian" : "Non-vegetarian"} />
                {it.item_name}
              </p>
              <span className="font-semibold">{formatMoney(it.price)}</span>
            </div>
            <p className="text-xs text-neutral-500">
              {it.canteen_name}
              {it.because.length > 0 && <> - because you ordered {it.because.join(" and ")}</>}
            </p>
            <AddToCartButton menuItemId={it.menu_item_id} disabled={false} />
          </li>
        ))}
      </ul>
    </section>
  );
}
