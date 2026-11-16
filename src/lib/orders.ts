import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { query } from "./db";

export const STATUS_FLOW = ["Pending", "Preparing", "Ready", "Completed"] as const;

export interface OrderSummary {
  order_id: number;
  order_date: Date;
  status: string;
  total_amount: number;
  canteen_name: string;
  payment_method: string | null;
  payment_status: string | null;
  item_count: number;
}

export async function listOrders(studentId: number, limit = 50): Promise<OrderSummary[]> {
  const n = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const rows = await query<RowDataPacket & OrderSummary>(
    `SELECT o.order_id, o.order_date, o.status, o.total_amount, c.canteen_name,
            p.payment_method, p.payment_status,
            (SELECT COALESCE(SUM(oi.quantity), 0) FROM ORDER_ITEM oi WHERE oi.order_id = o.order_id) AS item_count
     FROM ORDERS o
     JOIN CANTEEN c ON c.canteen_id = o.canteen_id
     LEFT JOIN PAYMENT p ON p.order_id = o.order_id
     WHERE o.student_id = ?
     ORDER BY o.order_date DESC, o.order_id DESC
     LIMIT ${n}`,
    [studentId],
  );
  return rows.map((r) => ({ ...r, total_amount: Number(r.total_amount), item_count: Number(r.item_count) }));
}

export interface OrderDetail extends OrderSummary {
  transaction_ref: string | null;
  lines: { menu_item_id: number; item_name: string; quantity: number; unit_price: number; sub_total: number }[];
  history: { old_status: string | null; new_status: string; changed_at: Date }[];
}

/** Returns null unless the order belongs to this student. */
export async function getOrderDetail(studentId: number, orderId: number): Promise<OrderDetail | null> {
  const [order] = await query<RowDataPacket & OrderSummary & { transaction_ref: string | null }>(
    `SELECT o.order_id, o.order_date, o.status, o.total_amount, c.canteen_name,
            p.payment_method, p.payment_status, p.transaction_ref, 0 AS item_count
     FROM ORDERS o
     JOIN CANTEEN c ON c.canteen_id = o.canteen_id
     LEFT JOIN PAYMENT p ON p.order_id = o.order_id
     WHERE o.order_id = ? AND o.student_id = ?`,
    [orderId, studentId],
  );
  if (!order) return null;

  const lines = await query<RowDataPacket & { menu_item_id: number; item_name: string; quantity: number; unit_price: number; sub_total: number }>(
    `SELECT oi.menu_item_id, m.item_name, oi.quantity, oi.unit_price, oi.sub_total
     FROM ORDER_ITEM oi JOIN MENU_ITEM m ON m.menu_item_id = oi.menu_item_id
     WHERE oi.order_id = ? ORDER BY m.item_name`,
    [orderId],
  );
  const history = await query<RowDataPacket & { old_status: string | null; new_status: string; changed_at: Date }>(
    "SELECT old_status, new_status, changed_at FROM ORDER_STATUS_HISTORY WHERE order_id = ? ORDER BY history_id",
    [orderId],
  );
  return {
    ...order,
    total_amount: Number(order.total_amount),
    item_count: lines.reduce((s, l) => s + l.quantity, 0),
    lines: lines.map((l) => ({
      menu_item_id: l.menu_item_id,
      item_name: l.item_name,
      quantity: l.quantity,
      unit_price: Number(l.unit_price),
      sub_total: Number(l.sub_total),
    })),
    history,
  };
}

/** Database rule violations raised by our triggers/procedures (SQLSTATE 45000) are safe to show. */
export function dbMessage(err: unknown): string | null {
  const e = err as { sqlState?: string; sqlMessage?: string };
  return e?.sqlState === "45000" && e.sqlMessage ? e.sqlMessage : null;
}
