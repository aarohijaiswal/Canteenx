import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { requireRolePage } from "@/lib/auth";
import { cartCount } from "@/lib/cart";

export default async function StudentNav() {
  const user = await requireRolePage(["STUDENT"]);
  const count = await cartCount(user.id);
  const link = "rounded-md px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800";
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-6 py-3 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <Link href="/student" className="mr-3 text-lg font-bold text-emerald-700">CanteenX</Link>
        <nav className="flex items-center gap-1">
          <Link href="/student/menu" className={link}>Menu</Link>
          <Link href="/student/cart" className={link}>
            Cart
            {count > 0 && (
              <span className="ml-1.5 rounded-full bg-emerald-700 px-1.5 py-0.5 text-xs font-semibold text-white">{count}</span>
            )}
          </Link>
          <Link href="/student/orders" className={link}>My orders</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">{user.name}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
