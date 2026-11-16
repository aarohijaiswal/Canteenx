import Link from "next/link";
import { Suspense } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import StarRating from "@/components/StarRating";
import { requireRolePage } from "@/lib/auth";
import { attachRatings } from "@/lib/feedback";
import { formatMoney } from "@/lib/format";
import { listCanteens, listCategories, listMenu, type MenuItem } from "@/lib/menu";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function MenuPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading the menu...</p>}>
      <MenuContent searchParams={searchParams} />
    </Suspense>
  );
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const num = (v: string) => (/^\d+(\.\d+)?$/.test(v) ? Number(v) : undefined);

async function MenuContent({ searchParams }: { searchParams: SP }) {
  await requireRolePage(["STUDENT"]);
  const sp = await searchParams;
  const q = first(sp.q).slice(0, 60);
  const canteen = first(sp.canteen);
  const category = first(sp.category);
  const diet = first(sp.diet);
  const maxPrice = first(sp.maxPrice);

  const [menuItems, categories, canteens] = await Promise.all([
    listMenu({
      q,
      canteenId: num(canteen),
      categoryId: num(category),
      diet: diet === "veg" || diet === "nonveg" ? diet : undefined,
      maxPrice: num(maxPrice),
    }),
    listCategories(),
    listCanteens(),
  ]);
  const items = await attachRatings(menuItems);

  const filtered = Boolean(q || canteen || category || diet || maxPrice);
  const field = "rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-900";

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6">
      <h1 className="text-2xl font-bold">Menu</h1>

      <form method="get" className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
        <label className="flex flex-col gap-1 text-xs font-medium">
          Search
          <input name="q" defaultValue={q} placeholder="e.g. paneer, biryani" className={`${field} w-48`} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          Canteen
          <select name="canteen" defaultValue={canteen} className={field}>
            <option value="">All</option>
            {canteens.map((c) => <option key={c.canteen_id} value={c.canteen_id}>{c.canteen_name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          Category
          <select name="category" defaultValue={category} className={field}>
            <option value="">All</option>
            {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          Diet
          <select name="diet" defaultValue={diet} className={field}>
            <option value="">Any</option>
            <option value="veg">Vegetarian</option>
            <option value="nonveg">Non-vegetarian</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          Max price (Rs.)
          <input name="maxPrice" type="number" min="1" defaultValue={maxPrice} className={`${field} w-24`} />
        </label>
        <button type="submit" className="rounded-md bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800">Apply</button>
        {filtered && <Link href="/student/menu" className="py-2 text-sm text-neutral-600 hover:underline dark:text-neutral-400">Clear</Link>}
      </form>

      <p className="mt-4 text-sm text-neutral-500">{items.length} item{items.length === 1 ? "" : "s"}</p>
      {items.length === 0 ? (
        <p className="mt-6 text-center text-neutral-500">Nothing matches those filters.</p>
      ) : (
        <ul className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => <MenuCard key={it.menu_item_id} item={it} />)}
        </ul>
      )}
    </main>
  );
}

function MenuCard({ item }: { item: MenuItem & { avg_rating: number | null; rating_count: number } }) {
  const low = item.available && item.in_stock <= 5;
  return (
    <li className={`flex flex-col gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700 ${item.available ? "" : "opacity-60"}`}>
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold">
          <span
            className={`mr-2 inline-block h-3 w-3 rounded-sm border-2 align-middle ${item.is_veg ? "border-green-600" : "border-red-600"}`}
            title={item.is_veg ? "Vegetarian" : "Non-vegetarian"}
          >
            <span className={`block h-full w-full rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`} />
          </span>
          {item.item_name}
        </h2>
        <span className="font-semibold">{formatMoney(item.price)}</span>
      </div>
      <p className="flex-1 text-sm text-neutral-600 dark:text-neutral-400">{item.description}</p>
      {item.avg_rating != null && <StarRating value={item.avg_rating} count={item.rating_count} />}
      <p className="text-xs text-neutral-500">
        {item.category_name} - {item.canteen_name}
        {!item.available && <span className="ml-2 font-semibold text-red-600">Out of stock</span>}
        {low && <span className="ml-2 font-semibold text-amber-600">Only {item.in_stock} left</span>}
      </p>
      <AddToCartButton menuItemId={item.menu_item_id} disabled={!item.available} />
    </li>
  );
}
