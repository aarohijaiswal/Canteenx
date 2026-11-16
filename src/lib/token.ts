import { SignJWT, jwtVerify } from "jose";

/**
 * Session token (a signed JWT). This file has no server-only imports so the
 * same code can be used by route handlers, pages and proxy.ts.
 */
export type SessionUser = {
  id: number;
  kind: "student" | "staff";
  role: "STUDENT" | "STAFF" | "ADMIN";
  name: string;
  canteenId: number | null;
};

export const COOKIE_NAME = "canteenx_session";
export const SESSION_HOURS = 8;

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET is missing or too short");
  return new TextEncoder().encode(secret);
}

export async function signToken(user: SessionUser): Promise<string> {
  return new SignJWT({ kind: user.kind, role: user.role, name: user.name, canteenId: user.canteenId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
}

export async function verifyToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    if (!Number.isInteger(id)) return null;
    if (payload.kind !== "student" && payload.kind !== "staff") return null;
    if (payload.role !== "STUDENT" && payload.role !== "STAFF" && payload.role !== "ADMIN") return null;
    return {
      id,
      kind: payload.kind,
      role: payload.role,
      name: String(payload.name ?? ""),
      canteenId: typeof payload.canteenId === "number" ? payload.canteenId : null,
    };
  } catch {
    return null; // bad signature, expired, malformed
  }
}

export function homePathFor(role: SessionUser["role"]): string {
  return role === "STUDENT" ? "/student" : "/staff";
}
