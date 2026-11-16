import { compare, hashSync } from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";
import { isSameOrigin } from "@/lib/auth";
import { checkLimit, clearFailures, recordFailure } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import { homePathFor, type SessionUser } from "@/lib/token";
import { loginSchema } from "@/lib/validation";

// compared against when the email is unknown, so "no such user" and
// "wrong password" take the same time and give the same answer
const DUMMY_HASH = hashSync("not-a-real-password", 10);

interface StudentRow extends RowDataPacket { id: number; first_name: string; last_name: string; password_hash: string }
interface StaffRow extends RowDataPacket { id: number; name: string; role: "STAFF" | "ADMIN"; canteen_id: number; password_hash: string }

/** POST /api/auth/login - one form for students, staff and admins. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Enter a valid email and password" }, { status: 400 });
  const { email, password } = parsed.data;

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const limiterKey = `${ip}:${email}`;
  const limit = checkLimit(limiterKey);
  if (!limit.allowed) {
    return Response.json(
      { error: "Too many failed attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let user: SessionUser | null = null;
  let passwordHash = DUMMY_HASH;

  const students = await query<StudentRow>(
    "SELECT student_id AS id, first_name, last_name, password_hash FROM STUDENT WHERE email = ?",
    [email],
  );
  if (students.length > 0) {
    const s = students[0];
    passwordHash = s.password_hash;
    user = { id: s.id, kind: "student", role: "STUDENT", name: `${s.first_name} ${s.last_name}`, canteenId: null };
  } else {
    const staff = await query<StaffRow>(
      "SELECT staff_id AS id, name, role, canteen_id, password_hash FROM STAFF WHERE email = ?",
      [email],
    );
    if (staff.length > 0) {
      const s = staff[0];
      passwordHash = s.password_hash;
      user = { id: s.id, kind: "staff", role: s.role, name: s.name, canteenId: s.canteen_id };
    }
  }

  const passwordOk = await compare(password, passwordHash);
  if (!user || !passwordOk) {
    recordFailure(limiterKey);
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  clearFailures(limiterKey);
  await createSession(user);
  return Response.json({ user: { name: user.name, role: user.role }, redirect: homePathFor(user.role) });
}
