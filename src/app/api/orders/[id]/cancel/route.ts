import { z } from "zod";
import type { ResultSetHeader } from "mysql2/promise";
import { authorize, isSameOrigin } from "@/lib/auth";
import { withTransaction } from "@/lib/db";
import { dbMessage } from "@/lib/orders";
import { invalidateRecommendations } from "@/lib/recommendations";

/**
 * POST /api/orders/:id/cancel - a student can cancel their own order while it
 * is still Pending. The database trigger puts the stock back; the payment
 * becomes Refunded (if it had been paid) or Failed.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorize(["STUDENT"]);
  if (response) return response;

  const id = z.coerce.number().int().positive().safeParse((await params).id);
  if (!id.success) return Response.json({ error: "Order not found" }, { status: 404 });

  try {
    const cancelled = await withTransaction(async (conn) => {
      await conn.query("SET @current_staff_id = NULL");
      const [res] = await conn.execute<ResultSetHeader>(
        "UPDATE ORDERS SET status = 'Cancelled' WHERE order_id = ? AND student_id = ? AND status = 'Pending'",
        [id.data, user.id],
      );
      if (res.affectedRows === 0) return false;
      await conn.execute(
        `UPDATE PAYMENT
         SET payment_status = CASE payment_status WHEN 'Successful' THEN 'Refunded' ELSE 'Failed' END
         WHERE order_id = ?`,
        [id.data],
      );
      return true;
    });
    if (!cancelled) {
      return Response.json({ error: "Only your own Pending orders can be cancelled" }, { status: 409 });
    }
    await invalidateRecommendations(user.id);
    return Response.json({ ok: true });
  } catch (err) {
    const message = dbMessage(err);
    if (message) return Response.json({ error: message }, { status: 409 });
    console.error("cancel failed", err);
    return Response.json({ error: "Could not cancel the order" }, { status: 500 });
  }
}
