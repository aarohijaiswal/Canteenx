import "server-only";
import type { Document } from "mongodb";
import type { RowDataPacket } from "mysql2/promise";
import { query } from "./db";
import { getMongoDb } from "./mongo";

/**
 * Recommendations = item-based collaborative filtering over MongoDB data:
 *   student_item_stats (what a student ordered)  x  item_similarity (what is ordered together)
 *   weighted by item_rating_summary (average rating).
 * MySQL is the source of truth; syncRecommendationData() copies the order data over.
 */
const SIMILARITY_MAX_AGE_MS = 6 * 3600 * 1000;
const CACHE_MAX_AGE_MS = 15 * 60 * 1000;

export interface Recommendation {
  menu_item_id: number;
  item_name: string;
  price: number;
  is_veg: boolean;
  canteen_name: string;
  because: string[];
}
export interface RecommendationResult {
  kind: "personal" | "popular";
  items: Recommendation[];
}

// ------------------------------------------------------------ sync from MySQL
interface StatRow extends RowDataPacket {
  student_id: number; menu_item_id: number; item_name: string;
  times_ordered: number; total_qty: number; last_ordered: Date;
}

const STATS_SQL = `
  SELECT o.student_id, oi.menu_item_id, m.item_name,
         COUNT(DISTINCT o.order_id) AS times_ordered, SUM(oi.quantity) AS total_qty, MAX(o.order_date) AS last_ordered
  FROM ORDERS o
  JOIN ORDER_ITEM oi ON oi.order_id = o.order_id
  JOIN MENU_ITEM m ON m.menu_item_id = oi.menu_item_id
  WHERE o.status <> 'Cancelled' %WHERE%
  GROUP BY o.student_id, oi.menu_item_id, m.item_name
  ORDER BY o.student_id, total_qty DESC, m.item_name`;

function statsDoc(studentId: number, rows: StatRow[]) {
  return {
    student_id: studentId,
    items: rows.map((r) => ({
      menu_item_id: r.menu_item_id, item_name: r.item_name,
      times_ordered: Number(r.times_ordered), total_qty: Number(r.total_qty), last_ordered: new Date(r.last_ordered),
    })),
    updated_at: new Date(),
  };
}

/** Refreshes one student's profile (cheap; done on every recommendation request). */
async function refreshStudentStats(studentId: number): Promise<number> {
  const rows = await query<StatRow>(STATS_SQL.replace("%WHERE%", "AND o.student_id = ?"), [studentId]);
  const db = await getMongoDb();
  if (rows.length === 0) {
    await db.collection("student_item_stats").deleteOne({ student_id: studentId });
    return 0;
  }
  await db.collection("student_item_stats").replaceOne({ student_id: studentId }, statsDoc(studentId, rows), { upsert: true });
  return rows.length;
}

let syncing: Promise<SyncResult> | null = null;
export interface SyncResult { students: number; items: number; summaries: number }

/** Copies order data from MySQL into MongoDB and rebuilds the rating summaries. One run at a time. */
export function syncRecommendationData(): Promise<SyncResult> {
  if (!syncing) {
    syncing = doSync().finally(() => { syncing = null; });
  }
  return syncing;
}

async function doSync(): Promise<SyncResult> {
  const db = await getMongoDb();

  // 1. per-student ordering profiles
  const rows = await query<StatRow>(STATS_SQL.replace("%WHERE%", ""));
  const byStudent = new Map<number, StatRow[]>();
  for (const r of rows) byStudent.set(r.student_id, [...(byStudent.get(r.student_id) ?? []), r]);
  const studentIds = [...byStudent.keys()];
  await db.collection("student_item_stats").deleteMany({ student_id: { $nin: studentIds } });
  if (studentIds.length > 0) {
    await db.collection("student_item_stats").bulkWrite(
      studentIds.map((id) => ({ replaceOne: { filter: { student_id: id }, replacement: statsDoc(id, byStudent.get(id)!), upsert: true } })),
    );
  }

  // 2. "ordered together" counts, top 6 per item
  const pairs = await query<RowDataPacket & { a: number; b: number; item_name: string; together: number; a_name: string }>(
    `SELECT a.menu_item_id AS a, ma.item_name AS a_name, b.menu_item_id AS b, mb.item_name AS item_name,
            COUNT(DISTINCT a.order_id) AS together
     FROM ORDER_ITEM a
     JOIN ORDER_ITEM b ON b.order_id = a.order_id AND b.menu_item_id <> a.menu_item_id
     JOIN ORDERS o ON o.order_id = a.order_id AND o.status <> 'Cancelled'
     JOIN MENU_ITEM ma ON ma.menu_item_id = a.menu_item_id
     JOIN MENU_ITEM mb ON mb.menu_item_id = b.menu_item_id
     GROUP BY a.menu_item_id, ma.item_name, b.menu_item_id, mb.item_name`,
  );
  const sim = new Map<number, { name: string; list: { menu_item_id: number; item_name: string; together_count: number }[] }>();
  for (const p of pairs) {
    const e = sim.get(p.a) ?? { name: p.a_name, list: [] };
    e.list.push({ menu_item_id: p.b, item_name: p.item_name, together_count: Number(p.together) });
    sim.set(p.a, e);
  }
  const simIds = [...sim.keys()];
  await db.collection("item_similarity").deleteMany({ menu_item_id: { $nin: simIds } });
  if (simIds.length > 0) {
    await db.collection("item_similarity").bulkWrite(
      simIds.map((id) => {
        const e = sim.get(id)!;
        const top = e.list.sort((x, y) => y.together_count - x.together_count || x.item_name.localeCompare(y.item_name)).slice(0, 6);
        return { replaceOne: { filter: { menu_item_id: id }, replacement: { menu_item_id: id, item_name: e.name, also_ordered: top, updated_at: new Date() }, upsert: true } };
      }),
    );
  }

  // 3. rating summaries from the feedback collection
  await db.collection("feedback").aggregate([
    { $group: { _id: "$menu_item_id", item_name: { $first: "$item_name" }, rating_count: { $sum: 1 },
                avg_rating: { $avg: "$rating" }, last_feedback_at: { $max: "$created_at" } } },
    { $addFields: { avg_rating: { $round: ["$avg_rating", 2] }, updated_at: "$$NOW" } },
    { $merge: { into: "item_rating_summary", on: "_id", whenMatched: "replace", whenNotMatched: "insert" } },
  ]).toArray();

  await db.collection("recommendations").deleteMany({}); // caches are rebuilt on demand
  return { students: studentIds.length, items: simIds.length, summaries: await db.collection("item_rating_summary").countDocuments() };
}

async function ensureSimilarityFresh(): Promise<void> {
  const db = await getMongoDb();
  const newest = await db.collection("item_similarity").find({}, { projection: { updated_at: 1 } }).sort({ updated_at: -1 }).limit(1).toArray();
  const at = newest[0]?.updated_at as Date | undefined;
  if (!at || Date.now() - at.getTime() > SIMILARITY_MAX_AGE_MS) await syncRecommendationData();
}

/** Called when a student's orders change, so the next visit recomputes. */
export async function invalidateRecommendations(studentId: number): Promise<void> {
  try {
    const db = await getMongoDb();
    await db.collection("recommendations").deleteOne({ student_id: studentId });
  } catch {
    /* MongoDB being down must never block an order */
  }
}

// ------------------------------------------------------------ recommend
interface Candidate { menu_item_id: number; score: number; because: string[] }

async function candidatesFor(studentId: number, limit: number): Promise<Candidate[]> {
  const db = await getMongoDb();

  const cached = await db.collection("recommendations").findOne({ student_id: studentId });
  if (cached && Date.now() - (cached.generated_at as Date).getTime() < CACHE_MAX_AGE_MS) return cached.items as Candidate[];

  if ((await refreshStudentStats(studentId)) === 0) return [];
  await ensureSimilarityFresh();

  const profile = await db.collection("student_item_stats").findOne({ student_id: studentId });
  const ordered: number[] = (profile?.items ?? []).map((i: Document) => i.menu_item_id);

  const rows = await db.collection("student_item_stats").aggregate([
    { $match: { student_id: studentId } },
    { $unwind: "$items" },
    { $lookup: { from: "item_similarity", localField: "items.menu_item_id", foreignField: "menu_item_id", as: "sim" } },
    { $unwind: "$sim" },
    { $unwind: "$sim.also_ordered" },
    { $match: { "sim.also_ordered.menu_item_id": { $nin: ordered } } },
    { $group: { _id: "$sim.also_ordered.menu_item_id",
                affinity: { $sum: { $multiply: ["$items.times_ordered", "$sim.also_ordered.together_count"] } },
                because: { $addToSet: "$items.item_name" } } },
    { $lookup: { from: "item_rating_summary", localField: "_id", foreignField: "_id", as: "r" } },
    { $addFields: { rating: { $ifNull: [{ $first: "$r.avg_rating" }, 3.5] } } },
    { $addFields: { score: { $round: [{ $multiply: ["$affinity", { $divide: ["$rating", 5] }] }, 2] } } },
    { $sort: { score: -1, _id: 1 } },
    { $limit: limit },
    { $project: { _id: 0, menu_item_id: "$_id", score: 1, because: 1 } },
  ]).toArray();
  const items = rows as unknown as Candidate[];

  await db.collection("recommendations").replaceOne(
    { student_id: studentId },
    { student_id: studentId, generated_at: new Date(), strategy: "item-cooccurrence x avg-rating", items },
    { upsert: true },
  );
  return items;
}

interface ItemRow extends RowDataPacket {
  menu_item_id: number; item_name: string; price: number; is_veg: number; canteen_name: string;
}

/** Only items that can be ordered right now (available and in stock) are shown. */
async function orderableItems(ids: number[]): Promise<Map<number, Recommendation>> {
  if (ids.length === 0) return new Map();
  const rows = await query<ItemRow>(
    `SELECT m.menu_item_id, m.item_name, m.price, m.is_veg, c.canteen_name
     FROM MENU_ITEM m JOIN CANTEEN c ON c.canteen_id = m.canteen_id
     JOIN INVENTORY i ON i.menu_item_id = m.menu_item_id
     WHERE m.is_available = TRUE AND i.quantity_in_stock > 0 AND m.menu_item_id IN (${ids.map(() => "?").join(",")})`,
    ids,
  );
  return new Map(rows.map((r) => [r.menu_item_id, {
    menu_item_id: r.menu_item_id, item_name: r.item_name, price: Number(r.price),
    is_veg: Boolean(r.is_veg), canteen_name: r.canteen_name, because: [],
  }]));
}

export async function getRecommendations(studentId: number, limit = 4): Promise<RecommendationResult | null> {
  try {
    const cands = await candidatesFor(studentId, limit + 6); // spare ones in case some are sold out
    if (cands.length > 0) {
      const info = await orderableItems(cands.map((c) => c.menu_item_id));
      const items = cands
        .filter((c) => info.has(c.menu_item_id))
        .slice(0, limit)
        .map((c) => ({ ...info.get(c.menu_item_id)!, because: c.because.slice(0, 2) }));
      if (items.length > 0) return { kind: "personal", items };
    }

    // cold start (new student, or nothing similar yet): best-rated items, then most ordered
    const db = await getMongoDb();
    const top = await db.collection<{ _id: number }>("item_rating_summary").find({ rating_count: { $gte: 3 } })
      .sort({ avg_rating: -1, rating_count: -1 }).limit(limit + 6).toArray();
    const info = await orderableItems(top.map((t) => t._id));
    let items = top.filter((t) => info.has(t._id)).slice(0, limit).map((t) => info.get(t._id)!);
    if (items.length === 0) {
      const pop = await query<RowDataPacket & { menu_item_id: number }>(
        `SELECT oi.menu_item_id FROM ORDER_ITEM oi JOIN ORDERS o ON o.order_id = oi.order_id AND o.status <> 'Cancelled'
         GROUP BY oi.menu_item_id ORDER BY SUM(oi.quantity) DESC LIMIT ${limit + 6}`,
      );
      const info2 = await orderableItems(pop.map((p) => p.menu_item_id));
      items = pop.filter((p) => info2.has(p.menu_item_id)).slice(0, limit).map((p) => info2.get(p.menu_item_id)!);
    }
    return items.length > 0 ? { kind: "popular", items } : null;
  } catch (err) {
    console.error("recommendations unavailable", err);
    return null; // the dashboard simply hides the section
  }
}
