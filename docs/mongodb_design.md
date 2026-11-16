# CanteenX – MongoDB Design (NoSQL component)

## 1. Why MongoDB for this data

| Data | Stored in | Why |
|---|---|---|
| Orders, payments, inventory, suppliers, staff, carts | **MySQL** | Strongly structured, relational, needs ACID transactions (order + payment + stock must succeed or fail together), foreign keys and constraints |
| **Feedback and ratings** | **MongoDB** | Semi-structured and text-heavy. Some reviews have extra aspect ratings, tags or a staff reply and others do not. Embedded sub-documents avoid NULL-filled columns and JOINs. Aggregation pipelines (averages, trends, tag counts) are a natural fit |
| **Recommendation data** | **MongoDB** | Derived, denormalised, read-heavy documents (per-student profiles, item-to-item similarity lists, cached results). They are rebuilt from MySQL at any time, so they do not need relational integrity |

MongoDB does **not** replace MySQL for anything transactional. Feedback and recommendations are the only data that live only in MongoDB.

## 2. Collections

### 2.1 `feedback`
One document per rated item in a completed order.

```json
{
  "_id": "ObjectId",
  "order_id": 11, "menu_item_id": 6, "student_id": 1, "canteen_id": 2,
  "item_name": "Veg Thali",
  "rating": 5,
  "comment": "Fresh and tasty, will order again.",
  "tags": ["tasty", "fresh"],
  "aspects": { "taste": 5, "portion": 4 },
  "helpful_votes": 3,
  "staff_reply": { "staff_id": 2, "message": "Thank you!", "replied_at": "ISODate" },
  "created_at": "ISODate"
}
```

- **Required:** `order_id`, `menu_item_id`, `student_id`, `canteen_id`, `rating`, `created_at`.
- **Optional (the flexible part):** `comment`, `tags`, `aspects`, `helpful_votes`, `staff_reply`.
- `item_name` is copied from MySQL so the feedback screen needs no extra lookup (denormalisation).

**Validation (`$jsonSchema`, strict):** `rating` is an integer 1–5, `comment` is at most 500 characters, `tags` has at most 8 unique strings, each aspect is 1–5, and a `staff_reply` needs `staff_id`, `message` and `replied_at`.

### 2.2 `student_item_stats`
A student's ordering profile, synced from MySQL (cancelled orders excluded).
`{ student_id, items: [{ menu_item_id, item_name, times_ordered, total_qty, last_ordered }], updated_at }`

### 2.3 `item_similarity`
For each item, the items most often ordered together with it (top 6).
`{ menu_item_id, item_name, also_ordered: [{ menu_item_id, item_name, together_count }], updated_at }`

### 2.4 `item_rating_summary`
A materialised summary built from `feedback` with an aggregation `$merge`.
`{ _id: menu_item_id, item_name, rating_count, avg_rating, last_feedback_at, updated_at }`

### 2.5 `recommendations`
A cache of each student's recommended items.
`{ student_id, generated_at, strategy, items: [{ menu_item_id, item_name, score, rating, because: [...] }] }`

## 3. Indexes

| Collection | Index | Purpose |
|---|---|---|
| feedback | unique `(order_id, menu_item_id)` | One feedback per item per order |
| feedback | `(menu_item_id, created_at -1)` | Newest feedback for an item page |
| feedback | `(student_id, created_at -1)` | A student's own feedback |
| feedback | `(canteen_id, rating, created_at -1)` | Staff dashboard filters |
| feedback | **partial** `(canteen_id, created_at -1)` where `rating <= 2` | Small, fast index for the "complaints needing attention" screen |
| feedback | **text** on `comment` (weight 3) and `tags` (weight 1) | Search the feedback text |
| student_item_stats | unique `student_id` | Direct profile lookup |
| item_similarity | unique `menu_item_id` | Direct similarity lookup and `$lookup` joins |
| item_rating_summary | `(avg_rating -1, rating_count -1)` | Top-rated list and cold-start recommendations |
| recommendations | unique `student_id` | One cache entry per student |
| recommendations | **TTL** on `generated_at` (7 days) | Stale caches delete themselves |

Index use was checked with `explain("executionStats")`: the item feedback query and the complaints query both use an index scan (`IXSCAN`) and examine only the documents they return.

## 4. Aggregation pipelines (NoSQL advanced feature)

Average rating per item, rating distribution, monthly trend per canteen, top tags per item (`$unwind`), items needing attention (`$match` after `$group`), aspect averages, a `$merge` into `item_rating_summary`, and a `$facet` canteen dashboard.

## 5. Recommendation strategy (retrieval)

Method: **item-based collaborative filtering** combined with ratings. No embeddings or vector search are used in this design.

1. Read the student's profile from `student_item_stats`.
2. For each item they ordered, `$lookup` the items ordered with it in `item_similarity`.
3. Remove items the student has already ordered.
4. Score each candidate: `sum(times_ordered × together_count) × (avg_rating / 5)`.
5. Sort by score and return the top N, with a `because` list that explains each suggestion.
6. **Cold start** (new student): return the best-rated items from `item_rating_summary`.

The API checks the result against MySQL (`is_available`, stock) before showing it. Results are cached in `recommendations`.

## 6. Keeping MongoDB and MySQL consistent

- **No cross-database foreign keys.** Before saving feedback, the API checks in MySQL that the order exists, belongs to that student, is `Completed`, and contains that menu item. The unique index prevents duplicates.
- `student_item_stats` and `item_similarity` are refreshed from MySQL by a sync job (built in the Next.js step), then recommendations are recomputed.
- MySQL is always the source of truth. Anything in MongoDB other than feedback can be rebuilt.

## 7. Possible extension (optional)
Embedding the feedback comments and running vector similarity search (for example "find reviews similar to this complaint") could be added later with a vector store or a MongoDB vector index.
