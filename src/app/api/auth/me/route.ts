import { authorize } from "@/lib/auth";

/** GET /api/auth/me - who is signed in (any role). */
export async function GET() {
  const { user, response } = await authorize(["STUDENT", "STAFF", "ADMIN"]);
  if (response) return response;
  return Response.json({ user: { id: user.id, name: user.name, role: user.role, canteenId: user.canteenId } });
}
