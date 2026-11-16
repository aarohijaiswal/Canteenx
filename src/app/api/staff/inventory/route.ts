import { listInventory, authorizeStaff } from "@/lib/staff";

/** GET /api/staff/inventory - stock levels of the staff member's own canteen. */
export async function GET() {
  const { user, response } = await authorizeStaff();
  if (response) return response;
  return Response.json({ items: await listInventory(user.canteenId) });
}
