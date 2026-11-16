import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { isSameOrigin } from "@/lib/auth";
import { execute, query } from "@/lib/db";
import { badRequest, conflict, dbCode, notFound, parseId, readJson } from "@/lib/http";
import { dbMessage } from "@/lib/orders";
import { authorizeStaff } from "@/lib/staff";

const schema = z.object({
  supplier_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(5000),
  unit_cost: z.number().min(0).max(100000),
});

/**
 * POST /api/staff/inventory/:menuItemId/restock {supplier_id, quantity, unit_cost}
 * Records a delivery in SUPPLY_LOG. The database only accepts supplier/item pairs that exist in
 * SUPPLIES (composite foreign key), and a trigger adds the quantity to the stock.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorizeStaff();
  if (response) return response;

  const id = parseId((await params).id);
  const parsed = schema.safeParse(await readJson(req));
  if (!id) return notFound("Item not found");
  if (!parsed.success) return badRequest("Enter a supplier, a quantity of 1 to 5000 and a unit cost");
  const { supplier_id, quantity, unit_cost } = parsed.data;

  const own = await query<RowDataPacket>("SELECT 1 FROM MENU_ITEM WHERE menu_item_id = ? AND canteen_id = ?", [id, user.canteenId]);
  if (own.length === 0) return notFound("Item not found");

  try {
    await execute(
      "INSERT INTO SUPPLY_LOG (supplier_id, menu_item_id, staff_id, quantity, unit_cost) VALUES (?, ?, ?, ?, ?)",
      [supplier_id, id, user.id, quantity, unit_cost],
    );
  } catch (err) {
    if (dbCode(err) === "ER_NO_REFERENCED_ROW_2") return conflict("That supplier does not supply this item");
    const message = dbMessage(err);
    if (message) return conflict(message);
    console.error("restock failed", err);
    return Response.json({ error: "Could not record the delivery" }, { status: 500 });
  }
  const [stock] = await query<RowDataPacket & { quantity_in_stock: number }>(
    "SELECT quantity_in_stock FROM INVENTORY WHERE menu_item_id = ?",
    [id],
  );
  return Response.json({ ok: true, quantity_in_stock: stock?.quantity_in_stock }, { status: 201 });
}
