import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { query } from "@/lib/db";
import { requireStaffPage } from "@/lib/staff";
import type { RowDataPacket } from "mysql2/promise";

export default async function StaffNav() {
  const user = await requireStaffPage();
  const admin = user.role === "ADMIN";
  const [c] = await query<RowDataPacket & { canteen_name: string }>("SELECT canteen_name FROM CANTEEN WHERE canteen_id = ?", [user.canteenId]);
  const link = "rounded-md px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800";
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-6 py-3 dark:border-neutral-700">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/staff" className="mr-3 text-lg font-bold text-emerald-700">CanteenX <span className="text-xs font-medium text-neutral-500">Staff</span></Link>
        <nav className="flex flex-wrap items-center gap-1">
          <Link href="/staff/orders" className={link}>Orders</Link>
          <Link href="/staff/inventory" className={link}>Inventory</Link>
          <Link href="/staff/feedback" className={link}>Feedback</Link>
          {admin && <Link href="/staff/menu" className={link}>Menu</Link>}
          {admin && <Link href="/staff/suppliers" className={link}>Suppliers</Link>}
          {admin && <Link href="/staff/sales" className={link}>Sales</Link>}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {user.name} <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium dark:bg-neutral-800">{admin ? "Admin" : "Staff"}</span>
          <span className="ml-2 text-xs text-neutral-500">{c?.canteen_name}</span>
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
