import "server-only";
import { redirect } from "next/navigation";
import { readSession } from "./session";
import { homePathFor, type SessionUser } from "./token";

type Role = SessionUser["role"];

/**
 * Data-access-layer checks. The proxy only does a quick redirect; these
 * functions are the real enforcement, because they run next to the data.
 */

/** For pages: redirect to /login or to the user's own area if not allowed. */
export async function requireRolePage(allowed: Role[]): Promise<SessionUser> {
  const user = await readSession();
  if (!user) redirect("/login");
  if (!allowed.includes(user.role)) redirect(homePathFor(user.role));
  return user;
}

/** For API routes: returns the user, or a ready-made 401 / 403 response. */
export async function authorize(
  allowed: Role[],
): Promise<{ user: SessionUser; response?: undefined } | { user?: undefined; response: Response }> {
  const user = await readSession();
  if (!user) return { response: Response.json({ error: "Not signed in" }, { status: 401 }) };
  if (!allowed.includes(user.role)) return { response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

/** CSRF defence for state-changing requests (on top of SameSite=Lax cookies). */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients send no Origin; browsers always do on POST
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
