import "server-only";
import { cookies } from "next/headers";
import { COOKIE_NAME, SESSION_HOURS, signToken, verifyToken, type SessionUser } from "./token";

/** Stores the signed token in an HttpOnly cookie (not readable by JavaScript). */
export async function createSession(user: SessionUser): Promise<void> {
  const token = await signToken(user);
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function readSession(): Promise<SessionUser | null> {
  return verifyToken((await cookies()).get(COOKIE_NAME)?.value);
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
