import type { ResultSetHeader } from "mysql2/promise";
import { isSameOrigin } from "@/lib/auth";
import { execute } from "@/lib/db";
import { badRequest, readJson } from "@/lib/http";
import { supplierSchema } from "@/lib/validation";
import { authorizeStaff, listSuppliers } from "@/lib/staff";

/** GET /api/staff/suppliers */
export async function GET() {
  const { user, response } = await authorizeStaff(true);
  if (response) return response;
  return Response.json({ suppliers: await listSuppliers(user.canteenId) });
}

/** POST /api/staff/suppliers - ADMIN adds a supplier. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { response } = await authorizeStaff(true);
  if (response) return response;

  const parsed = supplierSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest("Enter a supplier name; the contact number must be 10 digits");
  const d = parsed.data;
  const res: ResultSetHeader = await execute("INSERT INTO SUPPLIER (supplier_name, contact_no, address) VALUES (?, ?, ?)", [
    d.supplier_name,
    d.contact_no || null,
    d.address || null,
  ]);
  return Response.json({ ok: true, supplier_id: res.insertId }, { status: 201 });
}
