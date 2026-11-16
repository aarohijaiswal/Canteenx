import "server-only";
import { ObjectId, type Document, type Filter } from "mongodb";
import { getMongoDb } from "./mongo";

/**
 * Feedback lives in MongoDB (flexible: optional aspects, tags, staff reply).
 * MySQL stays the source of truth for orders; the API checks the order against
 * MySQL before anything is written here, because MongoDB cannot enforce foreign keys.
 */
export const TAGS = [
  "tasty", "fresh", "value-for-money", "generous-portion", "quick-service",
  "cold", "oily", "small-portion", "slow", "stale",
] as const;
export const ASPECTS = ["taste", "portion", "freshness", "service"] as const;

export interface Feedback {
  id: string;
  order_id: number;
  menu_item_id: number;
  student_id: number;
  canteen_id: number;
  item_name: string;
  rating: number;
  comment?: string;
  tags: string[];
  aspects: Partial<Record<(typeof ASPECTS)[number], number>>;
  helpful_votes: number;
  staff_reply?: { staff_id: number; message: string; replied_at: Date };
  created_at: Date;
}

function toFeedback(d: Document): Feedback {
  return {
    id: String(d._id),
    order_id: d.order_id,
    menu_item_id: d.menu_item_id,
    student_id: d.student_id,
    canteen_id: d.canteen_id,
    item_name: d.item_name ?? "",
    rating: d.rating,
    comment: d.comment,
    tags: d.tags ?? [],
    aspects: d.aspects ?? {},
    helpful_votes: d.helpful_votes ?? 0,
    staff_reply: d.staff_reply,
    created_at: d.created_at,
  };
}

export async function insertFeedback(doc: Omit<Feedback, "id" | "helpful_votes" | "created_at" | "staff_reply">): Promise<void> {
  const db = await getMongoDb();
  // optional fields are left out entirely when empty
  const toStore: Document = { ...doc, helpful_votes: 0, created_at: new Date() };
  if (!doc.comment) delete toStore.comment;
  await db.collection("feedback").insertOne(toStore);
  await refreshItemSummary(doc.menu_item_id);
}

/** This student's feedback for one order, keyed by menu item. */
export async function feedbackForOrder(studentId: number, orderId: number): Promise<Map<number, Feedback>> {
  const db = await getMongoDb();
  const docs = await db.collection("feedback").find({ student_id: studentId, order_id: orderId }).toArray();
  return new Map(docs.map((d) => [d.menu_item_id as number, toFeedback(d)]));
}

/** Recomputes one item's rating summary (the materialised view used by menu and recommendations). */
export async function refreshItemSummary(menuItemId: number): Promise<void> {
  const db = await getMongoDb();
  await db.collection("feedback").aggregate([
    { $match: { menu_item_id: menuItemId } },
    { $group: { _id: "$menu_item_id", item_name: { $first: "$item_name" }, rating_count: { $sum: 1 },
                avg_rating: { $avg: "$rating" }, last_feedback_at: { $max: "$created_at" } } },
    { $addFields: { avg_rating: { $round: ["$avg_rating", 2] }, updated_at: "$$NOW" } },
    { $merge: { into: "item_rating_summary", on: "_id", whenMatched: "replace", whenNotMatched: "insert" } },
  ]).toArray();
}

export async function ratingSummaries(ids: number[]): Promise<Map<number, { avg: number; count: number }>> {
  if (ids.length === 0) return new Map();
  const db = await getMongoDb();
  const docs = await db
    .collection<{ _id: number; avg_rating: number; rating_count: number }>("item_rating_summary")
    .find({ _id: { $in: ids } })
    .toArray();
  return new Map(docs.map((d) => [d._id, { avg: d.avg_rating, count: d.rating_count }]));
}

// ------------------------------------------------------------ staff side
export type FeedbackFilter = "all" | "low" | "unanswered";

export async function listCanteenFeedback(canteenId: number, filter: FeedbackFilter, limit = 40): Promise<Feedback[]> {
  const db = await getMongoDb();
  const q: Filter<Document> = { canteen_id: canteenId };
  if (filter === "low") q.rating = { $lte: 2 };
  if (filter === "unanswered") { q.rating = { $lte: 3 }; q.staff_reply = { $exists: false }; }
  const docs = await db.collection("feedback").find(q).sort({ created_at: -1 }).limit(limit).toArray();
  return docs.map(toFeedback);
}

export interface FeedbackStats {
  reviews: number;
  avg: number;
  distribution: { stars: number; count: number }[];
  topTags: { tag: string; count: number }[];
  aspects: { taste: number | null; portion: number | null; freshness: number | null; service: number | null };
  items: { item_name: string; avg: number; reviews: number }[];
  unanswered: number;
}

/** One $facet aggregation answers every number on the staff feedback dashboard. */
export async function canteenFeedbackStats(canteenId: number): Promise<FeedbackStats> {
  const db = await getMongoDb();
  const [r] = await db.collection("feedback").aggregate([
    { $match: { canteen_id: canteenId } },
    { $facet: {
        overall: [{ $group: { _id: null, avg: { $avg: "$rating" }, reviews: { $sum: 1 } } }],
        distribution: [{ $group: { _id: "$rating", count: { $sum: 1 } } }, { $sort: { _id: -1 } }],
        topTags: [{ $unwind: "$tags" }, { $group: { _id: "$tags", count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }, { $limit: 6 }],
        aspects: [{ $group: { _id: null, taste: { $avg: "$aspects.taste" }, portion: { $avg: "$aspects.portion" },
                              freshness: { $avg: "$aspects.freshness" }, service: { $avg: "$aspects.service" } } }],
        items: [{ $group: { _id: "$item_name", avg: { $avg: "$rating" }, reviews: { $sum: 1 } } },
                { $match: { reviews: { $gte: 2 } } }, { $sort: { avg: -1, reviews: -1 } }],
        unanswered: [{ $match: { rating: { $lte: 3 }, staff_reply: { $exists: false } } }, { $count: "n" }],
    } },
  ]).toArray();
  const round = (n: number | null | undefined) => (n == null ? null : Math.round(n * 100) / 100);
  const a = r?.aspects?.[0] ?? {};
  return {
    reviews: r?.overall?.[0]?.reviews ?? 0,
    avg: round(r?.overall?.[0]?.avg) ?? 0,
    distribution: (r?.distribution ?? []).map((d: Document) => ({ stars: d._id, count: d.count })),
    topTags: (r?.topTags ?? []).map((t: Document) => ({ tag: t._id, count: t.count })),
    aspects: { taste: round(a.taste), portion: round(a.portion), freshness: round(a.freshness), service: round(a.service) },
    items: (r?.items ?? []).map((i: Document) => ({ item_name: i._id, avg: round(i.avg) ?? 0, reviews: i.reviews })),
    unanswered: r?.unanswered?.[0]?.n ?? 0,
  };
}

/** Adds the staff reply to one feedback document of this canteen. Returns false if not found / already answered. */
export async function replyToFeedback(feedbackId: string, canteenId: number, staffId: number, message: string): Promise<"ok" | "missing" | "answered"> {
  if (!ObjectId.isValid(feedbackId)) return "missing";
  const db = await getMongoDb();
  const res = await db.collection("feedback").updateOne(
    { _id: new ObjectId(feedbackId), canteen_id: canteenId, staff_reply: { $exists: false } },
    { $set: { staff_reply: { staff_id: staffId, message, replied_at: new Date() } } },
  );
  if (res.modifiedCount === 1) return "ok";
  const exists = await db.collection("feedback").countDocuments({ _id: new ObjectId(feedbackId), canteen_id: canteenId });
  return exists ? "answered" : "missing";
}

/** Adds avg_rating / rating_count to menu items. If MongoDB is unreachable the menu still works, just without stars. */
export async function attachRatings<T extends { menu_item_id: number }>(
  items: T[],
): Promise<(T & { avg_rating: number | null; rating_count: number })[]> {
  let map = new Map<number, { avg: number; count: number }>();
  try {
    map = await ratingSummaries(items.map((i) => i.menu_item_id));
  } catch (err) {
    console.error("ratings unavailable", err);
  }
  return items.map((i) => ({ ...i, avg_rating: map.get(i.menu_item_id)?.avg ?? null, rating_count: map.get(i.menu_item_id)?.count ?? 0 }));
}
