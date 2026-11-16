import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { authorize, isSameOrigin } from "@/lib/auth";
import { execute, getPool } from "@/lib/db";
import { dbMessage, listOrders } from "@/lib/orders";
import { invalidateRecommendations } from "@/lib/recommendations";

const placeSchema = z.object({
  canteen_id: z.number().int().positive(),
  payment_method: z.enum(["UPI", "Card", "Cash", "Wallet"]),
});

/** GET /api/orders - the student's order history. */
export async function GET() {
  const { user, response } = await authorize(["STUDENT"]);
  if (response) return response;
  return Response.json({ orders: await listOrders(user.id) });
}

/**
 * POST /api/orders {canteen_id, payment_method}
 * Places the order from the student's cart by calling the stored procedure
 * sp_place_order, which runs everything in ONE database transaction
 * (order, order lines, stock reduction, payment record, cart clean-up).
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorize(["STUDENT"]);
  if (response) return response;

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    /* handled below */
  }
  const parsed = placeSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Choose a canteen and a payment method" }, { status: 400 });
  const { canteen_id, payment_method } = parsed.data;

  let orderId: number;
  const conn = await getPool().getConnection();
  try {
    // the OUT parameter lives in a session variable, so both statements must share one connection
    await conn.query("SET @current_staff_id = NULL");
    await conn.query("CALL sp_place_order(?, ?, ?, @new_order_id)", [user.id, canteen_id, payment_method]);
    const [rows] = await conn.query<RowDataPacket[]>("SELECT @new_order_id AS id");
    orderId = Number(rows[0].id);
  } catch (err) {
    const message = dbMessage(err);
    if (message) return Response.json({ error: message }, { status: 409 }); // e.g. insufficient stock
    console.error("place order failed", err);
    return Response.json({ error: "Could not place the order" }, { status: 500 });
  } finally {
    conn.release();
  }

  // Online methods go through a simulated payment gateway that always succeeds.
  // Cash stays Pending until a staff member confirms it at the counter.
  let paymentStatus = "Pending";
  if (payment_method !== "Cash") {
    try {
      const ref = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      await execute("CALL sp_confirm_payment(?, 'Successful', ?)", [orderId, ref]);
      paymentStatus = "Successful";
    } catch (err) {
      console.error("payment confirmation failed", err);
    }
  }
  await invalidateRecommendations(user.id);
  return Response.json({ order_id: orderId, payment_status: paymentStatus }, { status: 201 });
}
