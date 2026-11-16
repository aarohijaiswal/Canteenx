import "server-only";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2/promise";
import { authorize, requireRolePage } from "./auth";
import { query } from "./db";
import { homePathFor, type SessionUser } from "./token";

/** A signed-in staff member or admin; both always belong to one canteen. */
export type StaffUser = SessionUser & { canteenId: number };

/** For pages. adminOnly pages send ordinary staff back to the staff home. */
export async function requireStaffPage(adminOnly = false): Promise<StaffUser> {
  const user = await requireRolePage(["STAFF", "ADMIN"]);
  if (user.canteenId == null) redirect("/login");
  if (adminOnly && user.role !== "ADMIN") redirect(homePathFor(user.role));
  return user as StaffUser;
}

/** For API routes: 401 / 403 response, or the staff user. */
export async function authorizeStaff(
  adminOnly = false,
): Promise<{ user: StaffUser; response?: undefined } | { user?: undefined; response: Response }> {
  const r = await authorize(adminOnly ? ["ADMIN"] : ["STAFF", "ADMIN"]);
  if (r.response) return { response: r.response };
  if (r.user.canteenId == null) return { response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  return { user: r.user as StaffUser };
}

// ---------------------------------------------------------------- orders
export interface StaffOrder {
  order_id: number;
  order_date: Date;
  status: string;
  total_amount: number;
  student_name: string;
  items: string;
  payment_method: string | null;
  payment_status: string | null;
}

export async function listStaffOrders(canteenId: number, view: "open" | "done"): Promise<StaffOrder[]> {
  const open = view === "open";
  const rows = await query<RowDataPacket & StaffOrder>(
    `SELECT o.order_id, o.order_date, o.status, o.total_amount,
            CONCAT(s.first_name, ' ', s.last_name) AS student_name,
            (SELECT GROUP_CONCAT(CONCAT(oi.quantity, ' x ', m.item_name) ORDER BY m.item_name SEPARATOR ', ')
               FROM ORDER_ITEM oi JOIN MENU_ITEM m ON m.menu_item_id = oi.menu_item_id
              WHERE oi.order_id = o.order_id) AS items,
            p.payment_method, p.payment_status
     FROM ORDERS o
     JOIN STUDENT s ON s.student_id = o.student_id
     LEFT JOIN PAYMENT p ON p.order_id = o.order_id
     WHERE o.canteen_id = ?
       AND ${open ? "o.status IN ('Pending','Preparing','Ready')" : "o.status IN ('Completed','Cancelled') AND o.order_date >= DATE_SUB(NOW(), INTERVAL 2 DAY)"}
     ORDER BY ${open ? "o.order_date ASC" : "o.order_date DESC"}
     LIMIT 60`,
    [canteenId],
  );
  return rows.map((r) => ({ ...r, total_amount: Number(r.total_amount), items: r.items ?? "" }));
}

// ---------------------------------------------------------------- inventory
export interface InventoryRow {
  menu_item_id: number;
  item_name: string;
  category_name: string;
  is_available: boolean;
  quantity_in_stock: number;
  reorder_level: number;
  last_updated: Date;
  suppliers: { supplier_id: number; supplier_name: string }[];
}

export async function listInventory(canteenId: number): Promise<InventoryRow[]> {
  const rows = await query<RowDataPacket & Omit<InventoryRow, "suppliers" | "is_available"> & { is_available: number }>(
    `SELECT m.menu_item_id, m.item_name, cat.category_name, m.is_available,
            i.quantity_in_stock, i.reorder_level, i.last_updated
     FROM MENU_ITEM m
     JOIN CATEGORY cat ON cat.category_id = m.category_id
     JOIN INVENTORY i  ON i.menu_item_id = m.menu_item_id
     WHERE m.canteen_id = ?
     ORDER BY (i.quantity_in_stock <= i.reorder_level) DESC, i.quantity_in_stock - i.reorder_level, m.item_name`,
    [canteenId],
  );
  const sup = await query<RowDataPacket & { menu_item_id: number; supplier_id: number; supplier_name: string }>(
    `SELECT su.menu_item_id, s.supplier_id, s.supplier_name
     FROM SUPPLIES su JOIN SUPPLIER s ON s.supplier_id = su.supplier_id
     JOIN MENU_ITEM m ON m.menu_item_id = su.menu_item_id
     WHERE m.canteen_id = ? ORDER BY s.supplier_name`,
    [canteenId],
  );
  return rows.map((r) => ({
    ...r,
    is_available: Boolean(r.is_available),
    suppliers: sup.filter((s) => s.menu_item_id === r.menu_item_id).map(({ supplier_id, supplier_name }) => ({ supplier_id, supplier_name })),
  }));
}

export async function listOpenAlerts(canteenId: number) {
  return query<RowDataPacket & { alert_id: number; alert_date: Date; message: string }>(
    `SELECT a.alert_id, a.alert_date, a.message
     FROM LOW_STOCK_ALERT a
     JOIN INVENTORY i ON i.inventory_id = a.inventory_id
     JOIN MENU_ITEM m ON m.menu_item_id = i.menu_item_id
     WHERE a.is_resolved = FALSE AND m.canteen_id = ?
     ORDER BY a.alert_date DESC`,
    [canteenId],
  );
}

export async function listRecentDeliveries(canteenId: number) {
  return query<RowDataPacket & { supply_date: Date; item_name: string; supplier_name: string; quantity: number; unit_cost: number }>(
    `SELECT sl.supply_date, m.item_name, s.supplier_name, sl.quantity, sl.unit_cost
     FROM SUPPLY_LOG sl
     JOIN MENU_ITEM m ON m.menu_item_id = sl.menu_item_id
     JOIN SUPPLIER s ON s.supplier_id = sl.supplier_id
     WHERE m.canteen_id = ? ORDER BY sl.supply_date DESC, sl.supply_id DESC LIMIT 8`,
    [canteenId],
  );
}

// ---------------------------------------------------------------- sales (admin)
export const RANGES = {
  today: { label: "Today", from: "CURDATE()" },
  "7d": { label: "Last 7 days", from: "DATE_SUB(CURDATE(), INTERVAL 6 DAY)" },
  "30d": { label: "Last 30 days", from: "DATE_SUB(CURDATE(), INTERVAL 29 DAY)" },
  month: { label: "This month", from: "DATE_FORMAT(CURDATE(), '%Y-%m-01')" },
} as const;
export type RangeKey = keyof typeof RANGES;

// "sales" = Completed orders that have a Successful payment (same rule as the v_daily_sales view)
const SALE = "o.status = 'Completed' AND p.payment_status = 'Successful'";

export async function salesReport(canteenId: number, range: RangeKey) {
  const from = RANGES[range].from; // fixed whitelist, never user input
  const base = `FROM ORDERS o JOIN PAYMENT p ON p.order_id = o.order_id
                WHERE o.canteen_id = ? AND ${SALE} AND o.order_date >= ${from}`;

  const [totals] = await query<RowDataPacket & { orders: number; revenue: number | null; avg: number | null }>(
    `SELECT COUNT(*) AS orders, SUM(o.total_amount) AS revenue, AVG(o.total_amount) AS avg ${base}`,
    [canteenId],
  );
  const daily = await query<RowDataPacket & { day: string; orders: number; revenue: number }>(
    `SELECT DATE_FORMAT(o.order_date, '%Y-%m-%d') AS day, COUNT(*) AS orders, SUM(o.total_amount) AS revenue
     ${base} GROUP BY DATE_FORMAT(o.order_date, '%Y-%m-%d') ORDER BY day`,
    [canteenId],
  );
  const top = await query<RowDataPacket & { item_name: string; units: number; revenue: number }>(
    `SELECT m.item_name, SUM(oi.quantity) AS units, SUM(oi.sub_total) AS revenue
     FROM ORDER_ITEM oi
     JOIN ORDERS o ON o.order_id = oi.order_id
     JOIN PAYMENT p ON p.order_id = o.order_id
     JOIN MENU_ITEM m ON m.menu_item_id = oi.menu_item_id
     WHERE o.canteen_id = ? AND ${SALE} AND o.order_date >= ${from}
     GROUP BY m.menu_item_id, m.item_name ORDER BY units DESC, revenue DESC LIMIT 5`,
    [canteenId],
  );
  const methods = await query<RowDataPacket & { payment_method: string; orders: number; revenue: number }>(
    `SELECT p.payment_method, COUNT(*) AS orders, SUM(o.total_amount) AS revenue
     ${base} GROUP BY p.payment_method ORDER BY revenue DESC`,
    [canteenId],
  );
  const categories = await query<RowDataPacket & { category_name: string; revenue: number }>(
    `SELECT cat.category_name, SUM(oi.sub_total) AS revenue
     FROM ORDER_ITEM oi
     JOIN ORDERS o ON o.order_id = oi.order_id
     JOIN PAYMENT p ON p.order_id = o.order_id
     JOIN MENU_ITEM m ON m.menu_item_id = oi.menu_item_id
     JOIN CATEGORY cat ON cat.category_id = m.category_id
     WHERE o.canteen_id = ? AND ${SALE} AND o.order_date >= ${from}
     GROUP BY cat.category_id, cat.category_name ORDER BY revenue DESC`,
    [canteenId],
  );
  const [start] = await query<RowDataPacket & { d: string }>(`SELECT DATE_FORMAT(${from}, '%Y-%m-%d') AS d`);
  const [today] = await query<RowDataPacket & { d: string }>("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS d");

  // fill days without sales with zero so the chart has no gaps
  const byDay = new Map(daily.map((r) => [r.day, { orders: Number(r.orders), revenue: Number(r.revenue) }]));
  const days: { day: string; orders: number; revenue: number }[] = [];
  const cur = new Date(`${start.d}T00:00:00Z`);
  const end = new Date(`${today.d}T00:00:00Z`);
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    days.push({ day: key, ...(byDay.get(key) ?? { orders: 0, revenue: 0 }) });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return {
    orders: Number(totals.orders),
    revenue: Number(totals.revenue ?? 0),
    avg: Number(totals.avg ?? 0),
    days,
    top: top.map((r) => ({ item_name: r.item_name, units: Number(r.units), revenue: Number(r.revenue) })),
    methods: methods.map((r) => ({ payment_method: r.payment_method, orders: Number(r.orders), revenue: Number(r.revenue) })),
    categories: categories.map((r) => ({ category_name: r.category_name, revenue: Number(r.revenue) })),
  };
}

// ---------------------------------------------------------------- admin: menu and suppliers
export interface AdminMenuItem {
  menu_item_id: number;
  item_name: string;
  description: string | null;
  price: number;
  is_veg: boolean;
  is_available: boolean;
  category_id: number;
  category_name: string;
  quantity_in_stock: number;
}

export async function listAdminMenu(canteenId: number): Promise<AdminMenuItem[]> {
  const rows = await query<RowDataPacket & Omit<AdminMenuItem, "is_veg" | "is_available"> & { is_veg: number; is_available: number }>(
    `SELECT m.menu_item_id, m.item_name, m.description, m.price, m.is_veg, m.is_available,
            m.category_id, cat.category_name, COALESCE(i.quantity_in_stock, 0) AS quantity_in_stock
     FROM MENU_ITEM m
     JOIN CATEGORY cat ON cat.category_id = m.category_id
     LEFT JOIN INVENTORY i ON i.menu_item_id = m.menu_item_id
     WHERE m.canteen_id = ? ORDER BY cat.category_name, m.item_name`,
    [canteenId],
  );
  return rows.map((r) => ({ ...r, price: Number(r.price), is_veg: Boolean(r.is_veg), is_available: Boolean(r.is_available) }));
}

export interface SupplierRow {
  supplier_id: number;
  supplier_name: string;
  contact_no: string | null;
  address: string | null;
  items: { menu_item_id: number; item_name: string }[];
}

export async function listSuppliers(canteenId: number): Promise<SupplierRow[]> {
  const sup = await query<RowDataPacket & Omit<SupplierRow, "items">>(
    "SELECT supplier_id, supplier_name, contact_no, address FROM SUPPLIER ORDER BY supplier_name",
  );
  const links = await query<RowDataPacket & { supplier_id: number; menu_item_id: number; item_name: string }>(
    `SELECT su.supplier_id, m.menu_item_id, m.item_name
     FROM SUPPLIES su JOIN MENU_ITEM m ON m.menu_item_id = su.menu_item_id
     WHERE m.canteen_id = ? ORDER BY m.item_name`,
    [canteenId],
  );
  return sup.map((s) => ({
    supplier_id: s.supplier_id,
    supplier_name: s.supplier_name,
    contact_no: s.contact_no,
    address: s.address,
    items: links.filter((l) => l.supplier_id === s.supplier_id).map((l) => ({ menu_item_id: l.menu_item_id, item_name: l.item_name })),
  }));
}
