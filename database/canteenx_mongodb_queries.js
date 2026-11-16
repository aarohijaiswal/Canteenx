// =====================================================================
// CanteenX - Step 6: MongoDB queries, aggregation pipelines and the
// recommendation engine.
// Run after setup + seed:
//   mongosh "mongodb://localhost:27017" --file canteenx_mongodb_queries.js
// =====================================================================
const cx = db.getSiblingDB("canteenx");
const show = (title, cursorOrArray) => {
  print("\n=== " + title + " ===");
  const rows = Array.isArray(cursorOrArray) ? cursorOrArray : cursorOrArray.toArray();
  rows.forEach(r => printjson(r));
  if (rows.length === 0) print("(no rows)");
};

// ---------------------------------------------------------------------
// PART A - Aggregation pipelines
// ---------------------------------------------------------------------

// A1. Average rating per item (best first)
show("A1 average rating per item", cx.feedback.aggregate([
  { $group: { _id: { id: "$menu_item_id", name: "$item_name" },
              avg_rating: { $avg: "$rating" }, reviews: { $sum: 1 },
              lowest: { $min: "$rating" }, highest: { $max: "$rating" } } },
  { $project: { _id: 0, menu_item_id: "$_id.id", item_name: "$_id.name",
                avg_rating: { $round: ["$avg_rating", 2] }, reviews: 1, lowest: 1, highest: 1 } },
  { $sort: { avg_rating: -1, reviews: -1 } },
  { $limit: 6 }
]));

// A2. Rating distribution (how many 1..5 star reviews)
show("A2 rating distribution", cx.feedback.aggregate([
  { $group: { _id: "$rating", count: { $sum: 1 } } },
  { $sort: { _id: -1 } },
  { $project: { _id: 0, stars: "$_id", count: 1 } }
]));

// A3. Monthly rating trend per canteen
show("A3 monthly trend per canteen", cx.feedback.aggregate([
  { $group: { _id: { canteen_id: "$canteen_id",
                     month: { $dateToString: { format: "%Y-%m", date: "$created_at" } } },
              avg_rating: { $avg: "$rating" }, reviews: { $sum: 1 } } },
  { $project: { _id: 0, canteen_id: "$_id.canteen_id", month: "$_id.month",
                avg_rating: { $round: ["$avg_rating", 2] }, reviews: 1 } },
  { $sort: { canteen_id: 1, month: 1 } }
]));

// A4. Top 3 tags for every item ($unwind on an array field)
show("A4 top tags per item", cx.feedback.aggregate([
  { $unwind: "$tags" },
  { $group: { _id: { item: "$item_name", tag: "$tags" }, n: { $sum: 1 } } },
  { $sort: { n: -1 } },
  { $group: { _id: "$_id.item", tags: { $push: { tag: "$_id.tag", n: "$n" } } } },
  { $project: { item: "$_id", _id: 0, top_tags: { $slice: ["$tags", 3] } } },
  { $sort: { item: 1 } },
  { $limit: 4 }
]));

// A5. Items needing attention: at least 2 reviews and average below 3.5
show("A5 items needing attention", cx.feedback.aggregate([
  { $group: { _id: "$item_name", avg_rating: { $avg: "$rating" }, reviews: { $sum: 1 } } },
  { $match: { reviews: { $gte: 2 }, avg_rating: { $lt: 3.5 } } },
  { $project: { _id: 0, item: "$_id", avg_rating: { $round: ["$avg_rating", 2] }, reviews: 1 } },
  { $sort: { avg_rating: 1 } }
]));

// A6. Average of the optional aspect ratings ($avg skips missing fields)
show("A6 aspect averages", cx.feedback.aggregate([
  { $group: { _id: null,
              taste: { $avg: "$aspects.taste" }, portion: { $avg: "$aspects.portion" },
              freshness: { $avg: "$aspects.freshness" }, service: { $avg: "$aspects.service" } } },
  { $project: { _id: 0,
                taste: { $round: ["$taste", 2] }, portion: { $round: ["$portion", 2] },
                freshness: { $round: ["$freshness", 2] }, service: { $round: ["$service", 2] } } }
]));

// A7. Materialise the per-item rating summary with $merge (re-runnable)
cx.feedback.aggregate([
  { $group: { _id: "$menu_item_id", item_name: { $first: "$item_name" },
              rating_count: { $sum: 1 }, avg_rating: { $avg: "$rating" },
              last_feedback_at: { $max: "$created_at" } } },
  { $addFields: { avg_rating: { $round: ["$avg_rating", 2] }, updated_at: "$$NOW" } },
  { $merge: { into: "item_rating_summary", on: "_id",
              whenMatched: "replace", whenNotMatched: "insert" } }
]);
show("A7 item_rating_summary (top 5 by rating)",
     cx.item_rating_summary.find().sort({ avg_rating: -1, rating_count: -1 }).limit(5));

// A8. $facet: several statistics for one canteen's dashboard in one round trip
show("A8 canteen 1 dashboard ($facet)", cx.feedback.aggregate([
  { $match: { canteen_id: 1 } },
  { $facet: {
      overall:      [ { $group: { _id: null, avg: { $avg: "$rating" }, reviews: { $sum: 1 } } },
                      { $project: { _id: 0, avg: { $round: ["$avg", 2] }, reviews: 1 } } ],
      distribution: [ { $group: { _id: "$rating", n: { $sum: 1 } } }, { $sort: { _id: -1 } } ],
      latest:       [ { $sort: { created_at: -1 } }, { $limit: 2 },
                      { $project: { _id: 0, item_name: 1, rating: 1, comment: 1 } } ]
  } }
]));

// ---------------------------------------------------------------------
// PART B - Search and staff-screen queries
// ---------------------------------------------------------------------

// B1. Full-text search in comments and tags, ranked by relevance
show("B1 text search 'cold stale'", cx.feedback.find(
  { $text: { $search: "cold stale" } },
  { _id: 0, item_name: 1, rating: 1, comment: 1, score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } }).limit(5));

// B2. Complaints (<= 2 stars) with no staff reply yet - uses the partial index
show("B2 unanswered complaints, canteen 1", cx.feedback.find(
  { canteen_id: 1, rating: { $lte: 2 }, staff_reply: { $exists: false } },
  { _id: 0, item_name: 1, rating: 1, comment: 1, created_at: 1 }
).sort({ created_at: -1 }).limit(5));

// B3. A student's own feedback history
show("B3 feedback by student 1", cx.feedback.find(
  { student_id: 1 }, { _id: 0, item_name: 1, rating: 1, comment: 1 }
).sort({ created_at: -1 }));

// B4. Staff replies to a complaint (update with an embedded document)
const target = cx.feedback.findOne({ rating: { $lte: 2 }, staff_reply: { $exists: false } });
if (target) {
  cx.feedback.updateOne({ _id: target._id }, { $set: { staff_reply: {
    staff_id: NumberInt(1), message: "Thanks for the feedback - we are fixing this.",
    replied_at: new Date() } } });
  show("B4 reply stored on one complaint",
       cx.feedback.find({ _id: target._id }, { _id: 0, item_name: 1, rating: 1, staff_reply: 1 }));
}

// ---------------------------------------------------------------------
// PART C - Recommendation engine
// Strategy: item-based collaborative filtering
//   1. take the items the student has ordered (student_item_stats)
//   2. look up what other orders contained together with them (item_similarity)
//   3. score each candidate = sum(times_ordered x together_count) x (avg_rating / 5)
//   4. drop items the student already ordered, return the top N
//   Cold start (new student): fall back to the best-rated items.
// The API filters the result against MySQL availability before showing it.
// ---------------------------------------------------------------------
function recommendFor(studentId, limit) {
  limit = limit || 5;
  const profile = cx.student_item_stats.findOne({ student_id: studentId });

  if (!profile) {
    return cx.item_rating_summary.find({ rating_count: { $gte: 3 } })
      .sort({ avg_rating: -1, rating_count: -1 }).limit(limit)
      .toArray().map(r => ({ menu_item_id: r._id, item_name: r.item_name,
                             score: r.avg_rating, because: ["top rated on campus"] }));
  }
  const ordered = profile.items.map(i => i.menu_item_id);

  return cx.student_item_stats.aggregate([
    { $match: { student_id: studentId } },
    { $unwind: "$items" },
    { $lookup: { from: "item_similarity", localField: "items.menu_item_id",
                 foreignField: "menu_item_id", as: "sim" } },
    { $unwind: "$sim" },
    { $unwind: "$sim.also_ordered" },
    { $match: { "sim.also_ordered.menu_item_id": { $nin: ordered } } },
    { $group: { _id: "$sim.also_ordered.menu_item_id",
                item_name: { $first: "$sim.also_ordered.item_name" },
                affinity: { $sum: { $multiply: ["$items.times_ordered", "$sim.also_ordered.together_count"] } },
                because: { $addToSet: "$items.item_name" } } },
    { $lookup: { from: "item_rating_summary", localField: "_id", foreignField: "_id", as: "r" } },
    { $addFields: { rating: { $ifNull: [{ $first: "$r.avg_rating" }, 3.5] } } },
    { $addFields: { score: { $round: [{ $multiply: ["$affinity", { $divide: ["$rating", 5] }] }, 2] } } },
    { $sort: { score: -1, item_name: 1 } },
    { $limit: limit },
    { $project: { _id: 0, menu_item_id: "$_id", item_name: 1, score: 1, rating: 1, because: 1 } }
  ]).toArray();
}

show("C1 recommendations for student 1", recommendFor(NumberInt(1)));
show("C2 recommendations for student 5", recommendFor(NumberInt(5), 3));
show("C3 cold start (unknown student 99)", recommendFor(NumberInt(99), 3));

// C4. Pre-compute recommendations for every student and cache them
//     (the 'recommendations' collection has a TTL index, so stale rows expire)
const ops = cx.student_item_stats.find({}, { student_id: 1 }).toArray().map(s => ({
  updateOne: {
    filter: { student_id: s.student_id },
    update: { $set: { student_id: s.student_id, generated_at: new Date(),
                      strategy: "item-cooccurrence x avg-rating",
                      items: recommendFor(s.student_id, 5) } },
    upsert: true
  }
}));
cx.recommendations.bulkWrite(ops);
print("\nC4 cached recommendations for " + cx.recommendations.countDocuments() + " students");
show("C4 cached document for student 3", cx.recommendations.find({ student_id: 3 }, { _id: 0 }));

// ---------------------------------------------------------------------
// PART D - Integrity and index checks
// ---------------------------------------------------------------------

// D1. Schema validation rejects bad documents
try {
  cx.feedback.insertOne({ order_id: NumberInt(1), menu_item_id: NumberInt(1), student_id: NumberInt(1),
                          canteen_id: NumberInt(1), rating: NumberInt(9), created_at: new Date() });
  print("\nD1 FAIL - invalid rating was accepted");
} catch (e) { print("\nD1 PASS - rating 9 rejected (error code " + e.code + ": document failed validation)"); }

// D2. The unique index stops a second feedback for the same order item
const existing = cx.feedback.findOne();
try {
  const dup = Object.assign({}, existing); delete dup._id;
  cx.feedback.insertOne(dup);
  print("D2 FAIL - duplicate feedback was accepted");
} catch (e) { print("D2 PASS - duplicate (order_id, menu_item_id) rejected (error code " + e.code + ": duplicate key)"); }

// D3. Index usage (IXSCAN means an index was used instead of scanning every document)
const planStages = p => { const out = []; while (p) { out.push(p.stage + (p.indexName ? "(" + p.indexName + ")" : "")); p = p.inputStage; } return out.join(" -> "); };
const ex1 = cx.feedback.find({ menu_item_id: 1 }).sort({ created_at: -1 }).explain("executionStats");
print("D3a item feedback query:    " + planStages(ex1.queryPlanner.winningPlan) +
      " | examined " + ex1.executionStats.totalDocsExamined + ", returned " + ex1.executionStats.nReturned);
const ex2 = cx.feedback.find({ canteen_id: 1, rating: { $lte: 2 } }).sort({ created_at: -1 }).explain("executionStats");
print("D3b complaints query:       " + planStages(ex2.queryPlanner.winningPlan) +
      " | examined " + ex2.executionStats.totalDocsExamined + ", returned " + ex2.executionStats.nReturned);
