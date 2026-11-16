import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { isSameOrigin } from "@/lib/auth";
import { execute, query } from "@/lib/db";
import { badRequest, conflict, dbCode, notFound, parseId, readJson } from "@/lib/http";
import { authorizeStaff } from "@/lib/staff";

const bodySchema = z.object({ menu_item_id: z.number().int().positive() });

async function ownItem(menuItemId: number, canteenId: number) {
  const rows = await query<RowDataPacket>("SELECT 1 FROM MENU_ITEM WHERE menu_item_id = ? AND canteen_id = ?", [menuItemId, canteenId]);
  return rows.length > 0;
}

/** POST /api/staff/suppliers/:id/items {menu_item_id} - this supplier can supply this item. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorizeStaff(true);
  if (response) return response;

  const supplierId = parseId((await params).id);
  const parsed = bodySchema.safeParse(await readJson(req));
  if (!supplierId) return notFound("Supplier not found");
  if (!parsed.success) return badRequest("Choose an item");
  if (!(await ownItem(parsed.data.menu_item_id, user.canteenId))) return notFound("Item not found");

  try {
    await execute("INSERT INTO SUPPLIES (supplier_id, menu_item_id) VALUES (?, ?)", [supplierId, parsed.data.menu_item_id]);
    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (dbCode(err) === "ER_DUP_ENTRY") return conflict("Already linked");
    if (dbCode(err) === "ER_NO_REFERENCED_ROW_2") return notFound("Supplier not found");
    throw err;
  }
}

/** DELETE /api/staff/suppliers/:id/items?menu_item_id=N - stop linking (blocked if deliveries exist). */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorizeStaff(true);
  if (response) return response;

  const supplierId = parseId((await params).id);
  const itemId = parseId(new URL(req.url).searchParams.get("menu_item_id") ?? "");
  if (!supplierId || !itemId) return badRequest("menu_item_id is required");
  if (!(await ownItem(itemId, user.canteenId))) return notFound("Item not found");

  try {
    await execute("DELETE FROM SUPPLIES WHERE supplier_id = ? AND menu_item_id = ?", [supplierId, itemId]);
    return Response.json({ ok: true });
  } catch (err) {
    if (dbCode(err) === "ER_ROW_IS_REFERENCED_2") return conflict("Deliveries from this supplier exist for this item, so the link must stay");
    throw err;
  }
}
