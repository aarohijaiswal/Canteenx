import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { isSameOrigin } from "@/lib/auth";
import { query, withTransaction } from "@/lib/db";
import { badRequest, conflict, notFound, parseId, readJson } from "@/lib/http";
import { dbMessage } from "@/lib/orders";
import { authorizeStaff } from "@/lib/staff";

const schema = z.object({ status: z.enum(["Preparing", "Ready", "Completed", "Cancelled"]) });

/**
 * POST /api/staff/orders/:id/status {status}
 * Calls sp_update_order_status, which checks the staff member belongs to the order's
 * canteen; the trigger enforces Pending -> Preparing -> Ready -> Completed and logs who did it.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorizeStaff();
  if (response) return response;

  const id = parseId((await params).id);
  const parsed = schema.safeParse(await readJson(req));
  if (!id) return notFound("Order not found");
  if (!parsed.success) return badRequest("Invalid status");
  const { status } = parsed.data;

  const [order] = await query<RowDataPacket & { status: string; payment_status: string | null }>(
    `SELECT o.status, p.payment_status FROM ORDERS o
     LEFT JOIN PAYMENT p ON p.order_id = o.order_id
     WHERE o.order_id = ? AND o.canteen_id = ?`,
    [id, user.canteenId],
  );
  if (!order) return notFound("Order not found"); // also hides other canteens' orders

  if (status === "Completed" && order.payment_status !== "Successful") {
    return conflict("Confirm the payment before completing the order");
  }

  try {
    await withTransaction(async (conn) => {
      await conn.execute("CALL sp_update_order_status(?, ?, ?)", [id, status, user.id]);
      if (status === "Cancelled") {
        await conn.execute(
          `UPDATE PAYMENT SET payment_status = CASE payment_status WHEN 'Successful' THEN 'Refunded' ELSE 'Failed' END
           WHERE order_id = ?`,
          [id],
        );
      }
    });
    return Response.json({ ok: true, status });
  } catch (err) {
    const message = dbMessage(err);
    if (message) return conflict(message);
    console.error("status update failed", err);
    return Response.json({ error: "Could not update the order" }, { status: 500 });
  }
}
