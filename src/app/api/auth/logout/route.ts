import { isSameOrigin } from "@/lib/auth";
import { destroySession } from "@/lib/session";

/** POST /api/auth/logout */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  await destroySession();
  return Response.json({ ok: true });
}
