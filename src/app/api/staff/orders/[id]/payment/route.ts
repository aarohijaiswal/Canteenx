import type { RowDataPacket } from "mysql2/promise";
import { isSameOrigin } from "@/lib/auth";
import { execute, query } from "@/lib/db";
import { conflict, notFound, parseId } from "@/lib/http";
import { authorizeStaff } from "@/lib/staff";

/** POST /api/staff/orders/:id/payment - confirm that a (cash) payment was received. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorizeStaff();
  if (response) return response;

  const id = parseId((await params).id);
  if (!id) return notFound("Order not found");

  const [row] = await query<RowDataPacket & { status: string; payment_status: string | null }>(
    `SELECT o.status, p.payment_status FROM ORDERS o
     LEFT JOIN PAYMENT p ON p.order_id = o.order_id
     WHERE o.order_id = ? AND o.canteen_id = ?`,
    [id, user.canteenId],
  );
  if (!row || row.payment_status === null) return notFound("Order not found");
  if (row.status === "Cancelled") return conflict("The order was cancelled");
  if (row.payment_status !== "Pending") return conflict(`Payment is already ${row.payment_status}`);

  await execute("CALL sp_confirm_payment(?, 'Successful', ?)", [id, `CASH-${id}-${Date.now()}`]);
  return Response.json({ ok: true });
}
