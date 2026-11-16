import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { isSameOrigin, authorize } from "@/lib/auth";
import { query } from "@/lib/db";
import { ASPECTS, insertFeedback, TAGS } from "@/lib/feedback";
import { badRequest, conflict, notFound, readJson } from "@/lib/http";

const score = z.number().int().min(1).max(5);
const schema = z.object({
  order_id: z.number().int().positive(),
  menu_item_id: z.number().int().positive(),
  rating: score,
  comment: z.string().trim().max(500).optional(),
  tags: z.array(z.enum(TAGS)).max(8).optional(),
  aspects: z.object(Object.fromEntries(ASPECTS.map((a) => [a, score.optional()]))).optional(),
});

/**
 * POST /api/feedback - rate one item of a completed order (stored in MongoDB).
 * MongoDB cannot enforce foreign keys, so MySQL is asked first: the order must belong to this
 * student, be Completed and contain the item. A unique index stops a second rating of the same item.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorize(["STUDENT"]);
  if (response) return response;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest("Choose 1 to 5 stars; the comment can be up to 500 characters");
  const d = parsed.data;

  const [row] = await query<RowDataPacket & { status: string; canteen_id: number; item_name: string }>(
    `SELECT o.status, o.canteen_id, m.item_name
     FROM ORDERS o
     JOIN ORDER_ITEM oi ON oi.order_id = o.order_id AND oi.menu_item_id = ?
     JOIN MENU_ITEM m ON m.menu_item_id = oi.menu_item_id
     WHERE o.order_id = ? AND o.student_id = ?`,
    [d.menu_item_id, d.order_id, user.id],
  );
  if (!row) return notFound("That item is not part of one of your orders");
  if (row.status !== "Completed") return conflict("You can rate an item once the order is completed");

  const aspects = Object.fromEntries(Object.entries(d.aspects ?? {}).filter(([, v]) => v !== undefined));
  try {
    await insertFeedback({
      order_id: d.order_id,
      menu_item_id: d.menu_item_id,
      student_id: user.id,
      canteen_id: row.canteen_id,
      item_name: row.item_name,
      rating: d.rating,
      comment: d.comment || undefined,
      tags: d.tags ?? [],
      aspects,
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 11000) return conflict("You have already rated this item");
    console.error("feedback failed", err);
    return Response.json({ error: "Feedback is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
