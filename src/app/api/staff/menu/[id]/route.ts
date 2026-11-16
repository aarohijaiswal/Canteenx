import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { isSameOrigin } from "@/lib/auth";
import { execute, query, withTransaction } from "@/lib/db";
import { badRequest, conflict, dbCode, notFound, parseId, readJson } from "@/lib/http";
import { authorizeStaff } from "@/lib/staff";

const patchSchema = z
  .object({
    item_name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(255).nullable(),
    price: z.number().positive().max(10000),
    category_id: z.number().int().positive(),
    is_veg: z.boolean(),
    is_available: z.boolean(),
  })
  .partial()
  .refine((o) => Object.keys(o).length > 0, "Nothing to update");

const COLUMNS = ["item_name", "description", "price", "category_id", "is_veg", "is_available"] as const;

/** PATCH /api/staff/menu/:id - ADMIN edits an item of their own canteen. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorizeStaff(true);
  if (response) return response;

  const id = parseId((await params).id);
  const parsed = patchSchema.safeParse(await readJson(req));
  if (!id) return notFound("Item not found");
  if (!parsed.success) return badRequest("Check the values you entered");

  const sets: string[] = [];
  const values: Array<string | number | null> = [];
  for (const col of COLUMNS) {
    const v = parsed.data[col];
    if (v === undefined) continue;
    sets.push(`${col} = ?`); // column names come from the fixed list above, never from the request
    values.push(typeof v === "boolean" ? (v ? 1 : 0) : v === "" ? null : v);
  }
  try {
    const r = await execute(`UPDATE MENU_ITEM SET ${sets.join(", ")} WHERE menu_item_id = ? AND canteen_id = ?`, [
      ...values,
      id,
      user.canteenId,
    ]);
    if (r.affectedRows === 0) {
      const exists = await query<RowDataPacket>("SELECT 1 FROM MENU_ITEM WHERE menu_item_id = ? AND canteen_id = ?", [id, user.canteenId]);
      if (exists.length === 0) return notFound("Item not found");
    }
    return Response.json({ ok: true });
  } catch (err) {
    if (dbCode(err) === "ER_DUP_ENTRY") return conflict("This canteen already has an item with that name");
    if (dbCode(err) === "ER_NO_REFERENCED_ROW_2") return badRequest("Unknown category");
    console.error("update menu item failed", err);
    return Response.json({ error: "Could not update the item" }, { status: 500 });
  }
}

/**
 * DELETE /api/staff/menu/:id - ADMIN removes an item that has never been ordered or delivered.
 * Items with history are kept (orders refer to them): mark them unavailable instead.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorizeStaff(true);
  if (response) return response;

  const id = parseId((await params).id);
  if (!id) return notFound("Item not found");

  const own = await query<RowDataPacket>("SELECT 1 FROM MENU_ITEM WHERE menu_item_id = ? AND canteen_id = ?", [id, user.canteenId]);
  if (own.length === 0) return notFound("Item not found");

  try {
    await withTransaction(async (conn) => {
      await conn.execute("DELETE FROM CART_ITEM WHERE menu_item_id = ?", [id]);
      await conn.execute("DELETE FROM SUPPLIES WHERE menu_item_id = ?", [id]);
      await conn.execute("DELETE FROM INVENTORY WHERE menu_item_id = ?", [id]); // alerts go with it (ON DELETE CASCADE)
      await conn.execute("DELETE FROM MENU_ITEM WHERE menu_item_id = ?", [id]);
    });
    return Response.json({ ok: true });
  } catch (err) {
    if (dbCode(err) === "ER_ROW_IS_REFERENCED_2") {
      return conflict("This item has order or delivery history. Mark it unavailable instead of deleting it.");
    }
    console.error("delete menu item failed", err);
    return Response.json({ error: "Could not delete the item" }, { status: 500 });
  }
}
