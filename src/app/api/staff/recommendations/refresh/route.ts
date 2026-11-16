import { isSameOrigin } from "@/lib/auth";
import { syncRecommendationData } from "@/lib/recommendations";
import { authorizeStaff } from "@/lib/staff";

/**
 * POST /api/staff/recommendations/refresh - ADMIN re-copies order data from MySQL into MongoDB and
 * rebuilds the rating summaries. (It also runs automatically when the data is more than 6 hours old.)
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { response } = await authorizeStaff(true);
  if (response) return response;
  try {
    return Response.json({ ok: true, ...(await syncRecommendationData()) });
  } catch (err) {
    console.error("sync failed", err);
    return Response.json({ error: "Could not refresh the recommendation data" }, { status: 503 });
  }
}
