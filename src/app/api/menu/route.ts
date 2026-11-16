import { z } from "zod";
import { authorize } from "@/lib/auth";
import { attachRatings } from "@/lib/feedback";
import { listMenu } from "@/lib/menu";

const params = z.object({
  q: z.string().trim().max(60).optional(),
  category: z.coerce.number().int().positive().optional(),
  canteen: z.coerce.number().int().positive().optional(),
  diet: z.enum(["veg", "nonveg"]).optional(),
  maxPrice: z.coerce.number().positive().max(10000).optional(),
});

/** GET /api/menu?q=&category=&canteen=&diet=veg|nonveg&maxPrice= */
export async function GET(req: Request) {
  const { response } = await authorize(["STUDENT", "STAFF", "ADMIN"]);
  if (response) return response;

  const raw = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = params.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Invalid filters" }, { status: 400 });
  const p = parsed.data;

  const items = await listMenu({ q: p.q, categoryId: p.category, canteenId: p.canteen, diet: p.diet, maxPrice: p.maxPrice });
  return Response.json({ items: await attachRatings(items) });
}
