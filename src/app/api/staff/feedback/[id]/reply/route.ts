import { z } from "zod";
import { isSameOrigin } from "@/lib/auth";
import { replyToFeedback } from "@/lib/feedback";
import { badRequest, conflict, notFound, readJson } from "@/lib/http";
import { authorizeStaff } from "@/lib/staff";

const schema = z.object({ message: z.string().trim().min(2).max(500) });

/** POST /api/staff/feedback/:id/reply - answer a review of this canteen (once). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { user, response } = await authorizeStaff();
  if (response) return response;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest("Write a reply of 2 to 500 characters");

  try {
    const result = await replyToFeedback((await params).id, user.canteenId, user.id, parsed.data.message);
    if (result === "missing") return notFound("Feedback not found");
    if (result === "answered") return conflict("This feedback already has a reply");
    return Response.json({ ok: true });
  } catch (err) {
    console.error("reply failed", err);
    return Response.json({ error: "Feedback is temporarily unavailable" }, { status: 503 });
  }
}
