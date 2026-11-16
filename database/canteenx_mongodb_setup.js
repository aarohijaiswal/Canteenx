// =====================================================================
// CanteenX - Step 6: MongoDB setup (collections, validation, indexes)
// Run:  mongosh "mongodb://localhost:27017" --file canteenx_mongodb_setup.js
// Safe to re-run: it drops and recreates the CanteenX collections.
// =====================================================================
const cx = db.getSiblingDB("canteenx");

["feedback", "student_item_stats", "item_similarity",
 "item_rating_summary", "recommendations"].forEach(c => cx.getCollection(c).drop());

// ---------------------------------------------------------------------
// 1. feedback  - one document per rated item in a completed order.
//    Flexible by design: optional aspect ratings, tags and a staff reply
//    are embedded, so no JOINs or NULL-filled columns are needed.
//    The ids point to MySQL rows (MongoDB cannot enforce cross-database
//    foreign keys, so the API checks them before inserting).
// ---------------------------------------------------------------------
cx.createCollection("feedback", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["order_id", "menu_item_id", "student_id", "canteen_id",
                 "rating", "created_at"],
      additionalProperties: true,
      properties: {
        order_id:     { bsonType: "int", minimum: 1 },
        menu_item_id: { bsonType: "int", minimum: 1 },
        student_id:   { bsonType: "int", minimum: 1 },
        canteen_id:   { bsonType: "int", minimum: 1 },
        item_name:    { bsonType: "string" },
        rating:       { bsonType: "int", minimum: 1, maximum: 5 },
        comment:      { bsonType: "string", maxLength: 500 },
        tags:         { bsonType: "array", maxItems: 8, uniqueItems: true,
                        items: { bsonType: "string" } },
        aspects: {
          bsonType: "object",
          properties: {
            taste:     { bsonType: "int", minimum: 1, maximum: 5 },
            portion:   { bsonType: "int", minimum: 1, maximum: 5 },
            freshness: { bsonType: "int", minimum: 1, maximum: 5 },
            service:   { bsonType: "int", minimum: 1, maximum: 5 }
          }
        },
        helpful_votes: { bsonType: "int", minimum: 0 },
        staff_reply: {
          bsonType: "object",
          required: ["staff_id", "message", "replied_at"],
          properties: {
            staff_id:   { bsonType: "int" },
            message:    { bsonType: "string", maxLength: 500 },
            replied_at: { bsonType: "date" }
          }
        },
        created_at: { bsonType: "date" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// one feedback per item per order
cx.feedback.createIndex({ order_id: 1, menu_item_id: 1 }, { unique: true, name: "uq_order_item" });
// item page: newest feedback for an item
cx.feedback.createIndex({ menu_item_id: 1, created_at: -1 }, { name: "ix_item_recent" });
// "my feedback" for a student
cx.feedback.createIndex({ student_id: 1, created_at: -1 }, { name: "ix_student_recent" });
// staff dashboard: feedback per canteen filtered by rating
cx.feedback.createIndex({ canteen_id: 1, rating: 1, created_at: -1 }, { name: "ix_canteen_rating" });
// partial index: only poor ratings (<=2) are indexed - small and fast for the
// "complaints needing attention" screen
cx.feedback.createIndex({ canteen_id: 1, created_at: -1 },
  { name: "ix_low_ratings", partialFilterExpression: { rating: { $lte: 2 } } });
// full-text search over comments and tags
cx.feedback.createIndex({ comment: "text", tags: "text" },
  { name: "ft_comment_tags", weights: { comment: 3, tags: 1 } });

// ---------------------------------------------------------------------
// 2. student_item_stats - per-student ordering profile, synced from MySQL
//    (input to the recommendation pipeline)
// ---------------------------------------------------------------------
cx.createCollection("student_item_stats", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["student_id", "items", "updated_at"],
      properties: {
        student_id: { bsonType: "int", minimum: 1 },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["menu_item_id", "item_name", "times_ordered", "total_qty"],
            properties: {
              menu_item_id:  { bsonType: "int" },
              item_name:     { bsonType: "string" },
              times_ordered: { bsonType: "int", minimum: 1 },
              total_qty:     { bsonType: "int", minimum: 1 },
              last_ordered:  { bsonType: "date" }
            }
          }
        },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
cx.student_item_stats.createIndex({ student_id: 1 }, { unique: true, name: "uq_student" });

// ---------------------------------------------------------------------
// 3. item_similarity - "ordered together" counts per item, synced from
//    MySQL (see Q "E1" in canteenx_queries.sql)
// ---------------------------------------------------------------------
cx.createCollection("item_similarity", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["menu_item_id", "also_ordered"],
      properties: {
        menu_item_id: { bsonType: "int" },
        item_name:    { bsonType: "string" },
        also_ordered: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["menu_item_id", "item_name", "together_count"],
            properties: {
              menu_item_id:   { bsonType: "int" },
              item_name:      { bsonType: "string" },
              together_count: { bsonType: "int", minimum: 1 }
            }
          }
        },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
cx.item_similarity.createIndex({ menu_item_id: 1 }, { unique: true, name: "uq_item" });

// ---------------------------------------------------------------------
// 4. item_rating_summary - materialised view built from feedback with an
//    aggregation $merge (see canteenx_mongodb_queries.js, pipeline A7)
// ---------------------------------------------------------------------
cx.createCollection("item_rating_summary");
cx.item_rating_summary.createIndex({ avg_rating: -1, rating_count: -1 }, { name: "ix_top_rated" });

// ---------------------------------------------------------------------
// 5. recommendations - per-student recommendation cache. It is fully
//    re-computable, so a TTL index expires it after 7 days.
// ---------------------------------------------------------------------
cx.createCollection("recommendations");
cx.recommendations.createIndex({ student_id: 1 }, { unique: true, name: "uq_student" });
cx.recommendations.createIndex({ generated_at: 1 },
  { name: "ttl_generated", expireAfterSeconds: 7 * 24 * 3600 });

print("CanteenX MongoDB setup complete. Collections:");
printjson(cx.getCollectionNames());
