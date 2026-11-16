import { isSameOrigin } from "@/lib/auth";
import { execute } from "@/lib/db";
import { badRequest, notFound, parseId, readJson } from "@/lib/http";
import { authorizeStaff } from "@/lib/staff";
import { supplierSchema } from "@/lib/validation";

/** PATCH /api/staff/suppliers/:id - ADMIN edits a supplier's details. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { response } = await authorizeStaff(true);
  if (response) return response;

  const id = parseId((await params).id);
  const parsed = supplierSchema.safeParse(await readJson(req));
  if (!id) return notFound("Supplier not found");
  if (!parsed.success) return badRequest("Enter a supplier name; the contact number must be 10 digits");
  const d = parsed.data;
  const r = await execute("UPDATE SUPPLIER SET supplier_name = ?, contact_no = ?, address = ? WHERE supplier_id = ?", [
    d.supplier_name,
    d.contact_no || null,
    d.address || null,
    id,
  ]);
  return r.affectedRows > 0 ? Response.json({ ok: true }) : notFound("Supplier not found");
}
