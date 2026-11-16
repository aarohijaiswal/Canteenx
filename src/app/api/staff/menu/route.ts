import { z } from "zod";
import type { ResultSetHeader } from "mysql2/promise";
import { isSameOrigin } from "@/lib/auth";
import { withTransaction } from "@/lib/db";
import { badRequest, conflict, dbCode, readJson } from "@/lib/http";
import { authorizeStaff, listAdminMenu } from "@/lib/staff";

const menuFields = {
  item_name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(255).nullable().optional(),
  price: z.number().positive().max(10000),
  category_id: z.number().int().positive(),
  is_veg: z.boolean(),
};

const createSchema = z.object({
  ...menuFields,
  initial_stock: z.number().int().min(0).max(100000),
  reorder_level: z.number().int().min(0).max(1000),
});

/** GET /api/staff/menu - every item of the admin's canteen, including unavailable ones. */
export async function GET() {
  const { user, response } = await authorizeStaff(true);
  if (response) return response;
  return Response.json({ items: await listAdminMenu(user.canteenId) });
}

/** POST /api/staff/menu - ADMIN adds a menu item and its inventory record in one transaction. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorizeStaff(true);
  if (response) return response;

  const parsed = createSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest("Check the name, price, category and stock values");
  const d = parsed.data;

  try {
    const id = await withTransaction(async (conn) => {
      const [res] = await conn.execute<ResultSetHeader>(
        `INSERT INTO MENU_ITEM (canteen_id, category_id, item_name, description, price, is_veg)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.canteenId, d.category_id, d.item_name, d.description || null, d.price, d.is_veg ? 1 : 0],
      );
      await conn.execute(
        "INSERT INTO INVENTORY (menu_item_id, staff_id, quantity_in_stock, reorder_level) VALUES (?, ?, ?, ?)",
        [res.insertId, user.id, d.initial_stock, d.reorder_level],
      );
      return res.insertId;
    });
    return Response.json({ ok: true, menu_item_id: id }, { status: 201 });
  } catch (err) {
    if (dbCode(err) === "ER_DUP_ENTRY") return conflict("This canteen already has an item with that name");
    if (dbCode(err) === "ER_NO_REFERENCED_ROW_2") return badRequest("Unknown category");
    console.error("create menu item failed", err);
    return Response.json({ error: "Could not add the item" }, { status: 500 });
  }
}
