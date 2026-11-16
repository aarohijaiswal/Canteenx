import "server-only";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { execute, query } from "./db";

export const MAX_QTY_PER_ITEM = 10;

export interface CartLine {
  menu_item_id: number;
  item_name: string;
  price: number;
  quantity: number;
  canteen_id: number;
  canteen_name: string;
  in_stock: number;
  available: boolean;
}

interface CartRow extends RowDataPacket {
  menu_item_id: number;
  item_name: string;
  price: number;
  quantity: number;
  canteen_id: number;
  canteen_name: string;
  is_available: number;
  in_stock: number;
}

export async function getCartLines(studentId: number): Promise<CartLine[]> {
  const rows = await query<CartRow>(
    `SELECT ci.menu_item_id, m.item_name, m.price, ci.quantity, m.canteen_id, c.canteen_name,
            m.is_available, COALESCE(i.quantity_in_stock, 0) AS in_stock
     FROM CART cr
     JOIN CART_ITEM ci ON ci.cart_id = cr.cart_id
     JOIN MENU_ITEM m  ON m.menu_item_id = ci.menu_item_id
     JOIN CANTEEN   c  ON c.canteen_id = m.canteen_id
     LEFT JOIN INVENTORY i ON i.menu_item_id = m.menu_item_id
     WHERE cr.student_id = ?
     ORDER BY c.canteen_name, m.item_name`,
    [studentId],
  );
  return rows.map((r) => ({
    menu_item_id: r.menu_item_id,
    item_name: r.item_name,
    price: Number(r.price),
    quantity: r.quantity,
    canteen_id: r.canteen_id,
    canteen_name: r.canteen_name,
    in_stock: r.in_stock,
    available: Boolean(r.is_available) && r.in_stock >= r.quantity,
  }));
}

export async function cartCount(studentId: number): Promise<number> {
  const [row] = await query<RowDataPacket & { n: number | null }>(
    `SELECT COALESCE(SUM(ci.quantity), 0) AS n
     FROM CART cr JOIN CART_ITEM ci ON ci.cart_id = cr.cart_id WHERE cr.student_id = ?`,
    [studentId],
  );
  return Number(row?.n ?? 0);
}

/** Every student has one cart (created at registration); create it if it is somehow missing. */
export async function getOrCreateCartId(studentId: number): Promise<number> {
  const rows = await query<RowDataPacket & { cart_id: number }>("SELECT cart_id FROM CART WHERE student_id = ?", [studentId]);
  if (rows.length > 0) return rows[0].cart_id;
  const res: ResultSetHeader = await execute("INSERT INTO CART (student_id) VALUES (?)", [studentId]);
  return res.insertId;
}
