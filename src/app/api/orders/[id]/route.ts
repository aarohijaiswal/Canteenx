import { z } from "zod";
import { authorize } from "@/lib/auth";
import { getOrderDetail } from "@/lib/orders";

/** GET /api/orders/:id - order detail, only for the student who placed it. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await authorize(["STUDENT"]);
  if (response) return response;

  const id = z.coerce.number().int().positive().safeParse((await params).id);
  if (!id.success) return Response.json({ error: "Order not found" }, { status: 404 });

  const order = await getOrderDetail(user.id, id.data);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  return Response.json({ order });
}
