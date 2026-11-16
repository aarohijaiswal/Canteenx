import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { authorize, isSameOrigin } from "@/lib/auth";
import { execute, query } from "@/lib/db";
import { getCartLines, getOrCreateCartId, MAX_QTY_PER_ITEM } from "@/lib/cart";

const qty = z.number().int().min(1).max(MAX_QTY_PER_ITEM);
const addSchema = z.object({ menu_item_id: z.number().int().positive(), quantity: qty });

async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** GET /api/cart - the signed-in student's cart. */
export async function GET() {
  const { user, response } = await authorize(["STUDENT"]);
  if (response) return response;
  const lines = await getCartLines(user.id);
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  return Response.json({ lines, total });
}

/** POST /api/cart {menu_item_id, quantity} - add to cart (adds to the existing quantity). */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorize(["STUDENT"]);
  if (response) return response;

  const parsed = addSchema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: `Quantity must be 1 to ${MAX_QTY_PER_ITEM}` }, { status: 400 });
  const { menu_item_id, quantity } = parsed.data;

  const [item] = await query<RowDataPacket & { is_available: number; in_stock: number }>(
    `SELECT m.is_available, COALESCE(i.quantity_in_stock, 0) AS in_stock
     FROM MENU_ITEM m LEFT JOIN INVENTORY i ON i.menu_item_id = m.menu_item_id
     WHERE m.menu_item_id = ?`,
    [menu_item_id],
  );
  if (!item) return Response.json({ error: "Item not found" }, { status: 404 });
  if (!item.is_available || item.in_stock < 1) return Response.json({ error: "This item is not available right now" }, { status: 409 });

  const cartId = await getOrCreateCartId(user.id);
  await execute(
    `INSERT INTO CART_ITEM (cart_id, menu_item_id, quantity) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + VALUES(quantity), ?)`,
    [cartId, menu_item_id, quantity, MAX_QTY_PER_ITEM],
  );
  return Response.json({ ok: true }, { status: 201 });
}

/** PATCH /api/cart {menu_item_id, quantity} - set an exact quantity. */
export async function PATCH(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorize(["STUDENT"]);
  if (response) return response;

  const parsed = addSchema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: `Quantity must be 1 to ${MAX_QTY_PER_ITEM}` }, { status: 400 });
  const { menu_item_id, quantity } = parsed.data;

  const [stock] = await query<RowDataPacket & { in_stock: number }>(
    "SELECT COALESCE(quantity_in_stock, 0) AS in_stock FROM INVENTORY WHERE menu_item_id = ?",
    [menu_item_id],
  );
  if (stock && quantity > stock.in_stock) {
    return Response.json({ error: `Only ${stock.in_stock} left in stock` }, { status: 409 });
  }
  const res = await execute(
    `UPDATE CART_ITEM ci JOIN CART cr ON cr.cart_id = ci.cart_id
     SET ci.quantity = ? WHERE cr.student_id = ? AND ci.menu_item_id = ?`,
    [quantity, user.id, menu_item_id],
  );
  if (res.affectedRows === 0 && !(await getCartLines(user.id)).some((l) => l.menu_item_id === menu_item_id)) {
    return Response.json({ error: "Item is not in your cart" }, { status: 404 });
  }
  return Response.json({ ok: true });
}

/** DELETE /api/cart?menu_item_id=N - remove one item. */
export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorize(["STUDENT"]);
  if (response) return response;

  const id = z.coerce.number().int().positive().safeParse(new URL(req.url).searchParams.get("menu_item_id"));
  if (!id.success) return Response.json({ error: "menu_item_id is required" }, { status: 400 });

  await execute(
    `DELETE ci FROM CART_ITEM ci JOIN CART cr ON cr.cart_id = ci.cart_id
     WHERE cr.student_id = ? AND ci.menu_item_id = ?`,
    [user.id, id.data],
  );
  return Response.json({ ok: true });
}
