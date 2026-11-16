import { connection } from "next/server";
import { query } from "@/lib/db";
import { getMongoDb } from "@/lib/mongo";

/**
 * GET /api/health - checks that both databases are reachable.
 * Reports only up/down, never connection details or error text.
 */
export async function GET() {
  await connection(); // always run at request time, never prerendered

  const result = { mysql: "down", mongodb: "down" };

  try {
    await query("SELECT 1");
    result.mysql = "up";
  } catch {
    /* reported as down */
  }

  try {
    const db = await getMongoDb();
    await db.command({ ping: 1 });
    result.mongodb = "up";
  } catch {
    /* reported as down */
  }

  const ok = result.mysql === "up" && result.mongodb === "up";
  return Response.json({ status: ok ? "ok" : "degraded", ...result }, { status: ok ? 200 : 503 });
}
