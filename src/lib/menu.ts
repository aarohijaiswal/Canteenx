import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { query } from "./db";

export interface MenuFilters {
  q?: string;
  categoryId?: number;
  diet?: "veg" | "nonveg";
  maxPrice?: number;
  canteenId?: number;
}

export interface MenuItem {
  menu_item_id: number;
  item_name: string;
  description: string | null;
  price: number;
  is_veg: boolean;
  canteen_id: number;
  canteen_name: string;
  category_id: number;
  category_name: string;
  in_stock: number;
  available: boolean;
}

interface MenuRow extends RowDataPacket {
  menu_item_id: number;
  item_name: string;
  description: string | null;
  price: number;
  is_veg: number;
  is_available: number;
  canteen_id: number;
  canteen_name: string;
  category_id: number;
  category_name: string;
  in_stock: number;
}

/**
 * Menu with search + filters.
 *  - words of 3+ letters use the FULLTEXT index (prefix match: "chick" finds chicken)
 *  - shorter words fall back to LIKE
 * Every value goes through a ? placeholder, so user input never becomes SQL.
 */
export async function listMenu(f: MenuFilters): Promise<MenuItem[]> {
  const where: string[] = [];
  const params: Array<string | number> = [];
  let orderBy = "c.canteen_name, cat.category_name, m.item_name";
  const orderParams: Array<string | number> = [];

  const terms = (f.q ?? "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // strips full-text operators such as + - * " ( )
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  if (terms.length > 0) {
    if (terms.every((t) => t.length >= 3)) {
      const boolean = terms.map((t) => `+${t}*`).join(" ");
      where.push("MATCH(m.item_name, m.description) AGAINST (? IN BOOLEAN MODE)");
      params.push(boolean);
      orderBy = "MATCH(m.item_name, m.description) AGAINST (? IN BOOLEAN MODE) DESC, m.item_name";
      orderParams.push(boolean);
    } else {
      for (const t of terms) {
        where.push("(m.item_name LIKE ? OR m.description LIKE ?)");
        params.push(`%${t}%`, `%${t}%`);
      }
    }
  }
  if (f.categoryId) { where.push("m.category_id = ?"); params.push(f.categoryId); }
  if (f.canteenId) { where.push("m.canteen_id = ?"); params.push(f.canteenId); }
  if (f.diet === "veg") where.push("m.is_veg = TRUE");
  if (f.diet === "nonveg") where.push("m.is_veg = FALSE");
  if (f.maxPrice) { where.push("m.price <= ?"); params.push(f.maxPrice); }

  const rows = await query<MenuRow>(
    `SELECT m.menu_item_id, m.item_name, m.description, m.price, m.is_veg, m.is_available,
            m.canteen_id, c.canteen_name, m.category_id, cat.category_name,
            COALESCE(i.quantity_in_stock, 0) AS in_stock
     FROM MENU_ITEM m
     JOIN CANTEEN  c   ON c.canteen_id    = m.canteen_id
     JOIN CATEGORY cat ON cat.category_id = m.category_id
     LEFT JOIN INVENTORY i ON i.menu_item_id = m.menu_item_id
     ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY ${orderBy}
     LIMIT 100`,
    [...params, ...orderParams],
  );

  return rows.map((r) => ({
    menu_item_id: r.menu_item_id,
    item_name: r.item_name,
    description: r.description,
    price: Number(r.price),
    is_veg: Boolean(r.is_veg),
    canteen_id: r.canteen_id,
    canteen_name: r.canteen_name,
    category_id: r.category_id,
    category_name: r.category_name,
    in_stock: r.in_stock,
    available: Boolean(r.is_available) && r.in_stock > 0,
  }));
}

export async function listCategories() {
  return query<RowDataPacket & { category_id: number; category_name: string }>(
    "SELECT category_id, category_name FROM CATEGORY ORDER BY category_name",
  );
}

export async function listCanteens() {
  return query<RowDataPacket & { canteen_id: number; canteen_name: string }>(
    "SELECT canteen_id, canteen_name FROM CANTEEN ORDER BY canteen_name",
  );
}
