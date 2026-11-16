import { hash } from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { query, withTransaction } from "@/lib/db";
import { isSameOrigin } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { registerSchema } from "@/lib/validation";
import { homePathFor } from "@/lib/token";

/** POST /api/auth/register - students create their own account. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return Response.json({ error: "Please fix the highlighted fields", fieldErrors }, { status: 400 });
  }
  const { first_name, last_name, email, phone, password } = parsed.data;

  // staff and students share one login form, so an email can only belong to one of them
  const staffWithEmail = await query<RowDataPacket>("SELECT 1 FROM STAFF WHERE email = ?", [email]);
  if (staffWithEmail.length > 0) {
    return Response.json({ error: "That email is already registered" }, { status: 409 });
  }

  const passwordHash = await hash(password, 10);

  try {
    // a student and their (single) cart are created together or not at all
    const studentId = await withTransaction(async (conn) => {
      const [res] = await conn.execute<ResultSetHeader>(
        "INSERT INTO STUDENT (first_name, last_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)",
        [first_name, last_name, email, phone ?? null, passwordHash],
      );
      await conn.execute("INSERT INTO CART (student_id) VALUES (?)", [res.insertId]);
      return res.insertId;
    });

    const name = `${first_name} ${last_name}`;
    await createSession({ id: studentId, kind: "student", role: "STUDENT", name, canteenId: null });
    return Response.json({ user: { name, role: "STUDENT" }, redirect: homePathFor("STUDENT") }, { status: 201 });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "ER_DUP_ENTRY") {
      return Response.json({ error: "That email is already registered" }, { status: 409 });
    }
    if (code === "ER_CONSTRAINT_FAILED" || code === "ER_CHECK_CONSTRAINT_VIOLATED") {
      return Response.json({ error: "Some details were rejected by the database rules" }, { status: 400 });
    }
    console.error("register failed", err);
    return Response.json({ error: "Could not create the account" }, { status: 500 });
  }
}
