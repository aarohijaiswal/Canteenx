import { z } from "zod";
import { isSameOrigin } from "@/lib/auth";
import { execute } from "@/lib/db";
import { badRequest, notFound, parseId, readJson } from "@/lib/http";
import { authorizeStaff } from "@/lib/staff";

const schema = z
  .object({
    reorder_level: z.number().int().min(0).max(1000),
    is_available: z.boolean(),
  })
  .partial()
  .refine((o) => Object.keys(o).length > 0, "Nothing to update");

/** PATCH /api/staff/inventory/:menuItemId {reorder_level?, is_available?} */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorizeStaff();
  if (response) return response;

  const id = parseId((await params).id);
  const parsed = schema.safeParse(await readJson(req));
  if (!id) return notFound("Item not found");
  if (!parsed.success) return badRequest("Invalid values");
  const { reorder_level, is_available } = parsed.data;

  let found = false;
  if (reorder_level !== undefined) {
    // the update trigger raises or resolves low-stock alerts for the new level
    const r = await execute(
      `UPDATE INVENTORY i JOIN MENU_ITEM m ON m.menu_item_id = i.menu_item_id
       SET i.reorder_level = ?, i.staff_id = ?
       WHERE m.menu_item_id = ? AND m.canteen_id = ?`,
      [reorder_level, user.id, id, user.canteenId],
    );
    found = found || r.affectedRows > 0;
  }
  if (is_available !== undefined) {
    const r = await execute("UPDATE MENU_ITEM SET is_available = ? WHERE menu_item_id = ? AND canteen_id = ?", [
      is_available ? 1 : 0,
      id,
      user.canteenId,
    ]);
    found = found || r.affectedRows > 0;
  }
  return found ? Response.json({ ok: true }) : notFound("Item not found");
}
