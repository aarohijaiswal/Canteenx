// =====================================================================
// CanteenX - Step 6: MongoDB seed data
// Generated from the MySQL sample data, so every order_id / student_id /
// menu_item_id / canteen_id matches a real MySQL row.
// Run after canteenx_mongodb_setup.js:
//   mongosh "mongodb://localhost:27017" --file canteenx_mongodb_seed.js
// In the app, student_item_stats and item_similarity are refreshed from
// MySQL by a sync job (Step 8); feedback is written by the API.
// =====================================================================
const cx = db.getSiblingDB("canteenx");

const toDate = (o, ...fields) => {
  fields.forEach(f => { if (o[f]) o[f] = new Date(o[f]); });
  return o;
};
const toInt = (o, ...fields) => {
  fields.forEach(f => { if (o[f] !== undefined) o[f] = NumberInt(o[f]); });
  return o;
};

// ---- feedback (66 documents) ----
const feedback = [
 {
  "order_id": 1,
  "menu_item_id": 3,
  "student_id": 1,
  "canteen_id": 1,
  "item_name": "Chicken Puff",
  "rating": 2,
  "comment": "Too oily and a bit bland.",
  "tags": [
   "small-portion",
   "cold",
   "oily"
  ],
  "helpful_votes": 8,
  "created_at": "2026-09-12T05:32:35Z",
  "aspects": {
   "portion": 2,
   "taste": 2,
   "service": 1
  }
 },
 {
  "order_id": 1,
  "menu_item_id": 10,
  "student_id": 1,
  "canteen_id": 1,
  "item_name": "Filter Coffee",
  "rating": 3,
  "comment": "Could have been hotter.",
  "tags": [
   "okay-value"
  ],
  "helpful_votes": 7,
  "created_at": "2026-09-12T13:19:35Z"
 },
 {
  "order_id": 3,
  "menu_item_id": 8,
  "student_id": 5,
  "canteen_id": 1,
  "item_name": "Paneer Wrap",
  "rating": 5,
  "comment": "Absolutely loved it!",
  "tags": [
   "fresh"
  ],
  "helpful_votes": 0,
  "created_at": "2026-09-12T17:23:58Z"
 },
 {
  "order_id": 3,
  "menu_item_id": 10,
  "student_id": 5,
  "canteen_id": 1,
  "item_name": "Filter Coffee",
  "rating": 4,
  "comment": "Good taste and quick service.",
  "tags": [
   "tasty",
   "quick-service",
   "fresh"
  ],
  "helpful_votes": 0,
  "created_at": "2026-09-13T11:32:58Z"
 },
 {
  "order_id": 3,
  "menu_item_id": 12,
  "student_id": 5,
  "canteen_id": 1,
  "item_name": "Gulab Jamun",
  "rating": 3,
  "comment": "Could have been hotter.",
  "tags": [
   "okay-value",
   "average"
  ],
  "helpful_votes": 8,
  "created_at": "2026-09-12T18:12:58Z",
  "aspects": {
   "taste": 4
  }
 },
 {
  "order_id": 4,
  "menu_item_id": 15,
  "student_id": 8,
  "canteen_id": 2,
  "item_name": "French Fries",
  "rating": 5,
  "comment": "Perfect portion and great taste.",
  "tags": [
   "tasty"
  ],
  "helpful_votes": 0,
  "created_at": "2026-09-14T02:04:46Z",
  "aspects": {
   "service": 5
  }
 },
 {
  "order_id": 6,
  "menu_item_id": 4,
  "student_id": 9,
  "canteen_id": 1,
  "item_name": "Masala Dosa",
  "rating": 5,
  "comment": "Best item on the menu.",
  "tags": [
   "tasty",
   "fresh"
  ],
  "helpful_votes": 5,
  "created_at": "2026-09-15T12:00:32Z",
  "aspects": {
   "taste": 5,
   "service": 4
  }
 },
 {
  "order_id": 6,
  "menu_item_id": 8,
  "student_id": 9,
  "canteen_id": 1,
  "item_name": "Paneer Wrap",
  "rating": 4,
  "comment": "Quite good, slightly pricey.",
  "tags": [
   "fresh"
  ],
  "helpful_votes": 8,
  "created_at": "2026-09-15T04:50:32Z",
  "aspects": {
   "portion": 5,
   "freshness": 5,
   "taste": 3
  }
 },
 {
  "order_id": 6,
  "menu_item_id": 10,
  "student_id": 9,
  "canteen_id": 1,
  "item_name": "Filter Coffee",
  "rating": 4,
  "comment": "Quite good, slightly pricey.",
  "tags": [
   "tasty"
  ],
  "helpful_votes": 2,
  "created_at": "2026-09-15T09:11:32Z",
  "aspects": {
   "taste": 4,
   "service": 5,
   "freshness": 4
  }
 },
 {
  "order_id": 7,
  "menu_item_id": 20,
  "student_id": 9,
  "canteen_id": 2,
  "item_name": "Maggi",
  "rating": 4,
  "comment": "Quite good, slightly pricey.",
  "tags": [
   "quick-service",
   "tasty"
  ],
  "helpful_votes": 1,
  "created_at": "2026-09-15T11:26:25Z",
  "aspects": {
   "portion": 4,
   "taste": 5,
   "service": 4
  }
 },
 {
  "order_id": 10,
  "menu_item_id": 6,
  "student_id": 9,
  "canteen_id": 1,
  "item_name": "Veg Thali",
  "rating": 3,
  "comment": "Could have been hotter.",
  "tags": [
   "okay-value"
  ],
  "helpful_votes": 3,
  "created_at": "2026-09-18T22:48:07Z"
 },
 {
  "order_id": 10,
  "menu_item_id": 10,
  "student_id": 9,
  "canteen_id": 1,
  "item_name": "Filter Coffee",
  "rating": 3,
  "comment": "Average, nothing special.",
  "tags": [
   "okay-value"
  ],
  "helpful_votes": 7,
  "created_at": "2026-09-18T23:02:07Z"
 },
 {
  "order_id": 11,
  "menu_item_id": 14,
  "student_id": 1,
  "canteen_id": 2,
  "item_name": "Chicken Burger",
  "rating": 4,
  "comment": "Good taste and quick service.",
  "tags": [
   "fresh",
   "quick-service",
   "tasty"
  ],
  "helpful_votes": 6,
  "created_at": "2026-09-18T19:46:58Z"
 },
 {
  "order_id": 11,
  "menu_item_id": 17,
  "student_id": 1,
  "canteen_id": 2,
  "item_name": "Lime Soda",
  "rating": 4,
  "comment": "Nice, would recommend.",
  "tags": [
   "fresh"
  ],
  "helpful_votes": 1,
  "created_at": "2026-09-18T21:04:58Z",
  "aspects": {
   "taste": 4,
   "portion": 4
  }
 },
 {
  "order_id": 13,
  "menu_item_id": 13,
  "student_id": 10,
  "canteen_id": 2,
  "item_name": "Veg Burger",
  "rating": 3,
  "comment": "Average, nothing special.",
  "tags": [
   "okay-value",
   "average"
  ],
  "helpful_votes": 1,
  "created_at": "2026-09-20T18:31:59Z",
  "aspects": {
   "freshness": 3,
   "service": 2
  }
 },
 {
  "order_id": 14,
  "menu_item_id": 20,
  "student_id": 2,
  "canteen_id": 2,
  "item_name": "Maggi",
  "rating": 4,
  "comment": "Nice, would recommend.",
  "tags": [
   "tasty",
   "fresh"
  ],
  "helpful_votes": 1,
  "created_at": "2026-09-22T01:22:19Z",
  "aspects": {
   "freshness": 3,
   "portion": 3,
   "taste": 5
  }
 },
 {
  "order_id": 15,
  "menu_item_id": 12,
  "student_id": 8,
  "canteen_id": 1,
  "item_name": "Gulab Jamun",
  "rating": 4,
  "comment": "Good taste and quick service.",
  "tags": [
   "quick-service",
   "tasty"
  ],
  "helpful_votes": 7,
  "created_at": "2026-09-22T12:33:00Z"
 },
 {
  "order_id": 16,
  "menu_item_id": 8,
  "student_id": 9,
  "canteen_id": 1,
  "item_name": "Paneer Wrap",
  "rating": 2,
  "comment": "Too oily and a bit bland.",
  "tags": [
   "cold",
   "oily",
   "small-portion"
  ],
  "helpful_votes": 0,
  "created_at": "2026-09-22T16:03:19Z",
  "staff_reply": {
   "staff_id": 1,
   "message": "Sorry about that - we have passed this on to the kitchen team.",
   "replied_at": "2026-09-22T20:03:19Z"
  }
 },
 {
  "order_id": 19,
  "menu_item_id": 16,
  "student_id": 6,
  "canteen_id": 2,
  "item_name": "Cold Coffee",
  "rating": 3,
  "comment": "Okay for the price.",
  "tags": [
   "average"
  ],
  "helpful_votes": 4,
  "created_at": "2026-09-24T03:45:22Z"
 },
 {
  "order_id": 20,
  "menu_item_id": 1,
  "student_id": 2,
  "canteen_id": 1,
  "item_name": "Samosa",
  "rating": 3,
  "comment": "Could have been hotter.",
  "tags": [
   "okay-value"
  ],
  "helpful_votes": 7,
  "created_at": "2026-09-24T01:10:00Z",
  "aspects": {
   "freshness": 3
  }
 },
 {
  "order_id": 21,
  "menu_item_id": 4,
  "student_id": 3,
  "canteen_id": 1,
  "item_name": "Masala Dosa",
  "rating": 4,
  "comment": "Nice, would recommend.",
  "tags": [
   "quick-service",
   "tasty"
  ],
  "helpful_votes": 5,
  "created_at": "2026-09-25T05:44:54Z",
  "aspects": {
   "portion": 5,
   "freshness": 4
  }
 },
 {
  "order_id": 22,
  "menu_item_id": 15,
  "student_id": 6,
  "canteen_id": 2,
  "item_name": "French Fries",
  "rating": 2,
  "comment": "Too oily and a bit bland.",
  "tags": [
   "cold"
  ],
  "helpful_votes": 2,
  "created_at": "2026-09-25T13:04:27Z",
  "aspects": {
   "taste": 2
  }
 },
 {
  "order_id": 23,
  "menu_item_id": 16,
  "student_id": 9,
  "canteen_id": 2,
  "item_name": "Cold Coffee",
  "rating": 2,
  "comment": "Too oily and a bit bland.",
  "tags": [
   "small-portion",
   "oily",
   "cold"
  ],
  "helpful_votes": 7,
  "created_at": "2026-09-24T22:39:08Z",
  "aspects": {
   "freshness": 1
  },
  "staff_reply": {
   "staff_id": 4,
   "message": "Sorry about that - we have passed this on to the kitchen team.",
   "replied_at": "2026-09-25T18:39:08Z"
  }
 },
 {
  "order_id": 24,
  "menu_item_id": 13,
  "student_id": 7,
  "canteen_id": 2,
  "item_name": "Veg Burger",
  "rating": 4,
  "comment": "Nice, would recommend.",
  "tags": [
   "fresh"
  ],
  "helpful_votes": 2,
  "created_at": "2026-09-26T10:39:29Z",
  "aspects": {
   "taste": 4
  }
 },
 {
  "order_id": 24,
  "menu_item_id": 16,
  "student_id": 7,
  "canteen_id": 2,
  "item_name": "Cold Coffee",
  "rating": 4,
  "comment": "Good taste and quick service.",
  "tags": [
   "tasty",
   "quick-service"
  ],
  "helpful_votes": 1,
  "created_at": "2026-09-26T09:58:29Z"
 },
 {
  "order_id": 25,
  "menu_item_id": 5,
  "student_id": 11,
  "canteen_id": 1,
  "item_name": "Idli Sambar",
  "rating": 5,
  "comment": "Best item on the menu.",
  "tags": [
   "tasty"
  ],
  "helpful_votes": 7,
  "created_at": "2026-09-30T04:58:46Z",
  "aspects": {
   "portion": 5
  }
 },
 {
  "order_id": 26,
  "menu_item_id": 20,
  "student_id": 8,
  "canteen_id": 2,
  "item_name": "Maggi",
  "rating": 3,
  "comment": "Could have been hotter.",
  "tags": [
   "okay-value"
  ],
  "helpful_votes": 3,
  "created_at": "2026-09-30T11:55:41Z",
  "aspects": {
   "service": 4,
   "taste": 3,
   "portion": 2
  }
 },
 {
  "order_id": 27,
  "menu_item_id": 3,
  "student_id": 6,
  "canteen_id": 1,
  "item_name": "Chicken Puff",
  "rating": 5,
  "comment": "Best item on the menu.",
  "tags": [
   "value-for-money",
   "generous-portion"
  ],
  "helpful_votes": 3,
  "created_at": "2026-09-30T10:57:31Z",
  "aspects": {
   "taste": 5,
   "service": 4,
   "freshness": 5
  }
 },
 {
  "order_id": 27,
  "menu_item_id": 10,
  "student_id": 6,
  "canteen_id": 1,
  "item_name": "Filter Coffee",
  "rating": 4,
  "comment": "Quite good, slightly pricey.",
  "tags": [
   "tasty",
   "fresh",
   "quick-service"
  ],
  "helpful_votes": 5,
  "created_at": "2026-09-29T16:05:31Z",
  "aspects": {
   "service": 4,
   "taste": 3
  }
 },
 {
  "order_id": 28,
  "menu_item_id": 8,
  "student_id": 11,
  "canteen_id": 1,
  "item_name": "Paneer Wrap",
  "rating": 3,
  "comment": "Average, nothing special.",
  "tags": [
   "average",
   "okay-value"
  ],
  "helpful_votes": 2,
  "created_at": "2026-09-29T17:53:19Z"
 },
 {
  "order_id": 31,
  "menu_item_id": 15,
  "student_id": 1,
  "canteen_id": 2,
  "item_name": "French Fries",
  "rating": 2,
  "comment": "Small portion for the price.",
  "tags": [
   "cold",
   "small-portion",
   "oily"
  ],
  "helpful_votes": 8,
  "created_at": "2026-10-03T06:42:20Z",
  "aspects": {
   "portion": 2,
   "freshness": 3,
   "service": 2
  }
 },
 {
  "order_id": 31,
  "menu_item_id": 17,
  "student_id": 1,
  "canteen_id": 2,
  "item_name": "Lime Soda",
  "rating": 3,
  "comment": "Could have been hotter.",
  "tags": [
   "okay-value",
   "average"
  ],
  "helpful_votes": 6,
  "created_at": "2026-10-02T18:43:20Z",
  "aspects": {
   "taste": 2,
   "freshness": 2,
   "portion": 4
  }
 },
 {
  "order_id": 32,
  "menu_item_id": 1,
  "student_id": 7,
  "canteen_id": 1,
  "item_name": "Samosa",
  "rating": 5,
  "comment": "Fresh and tasty, will order again.",
  "tags": [
   "generous-portion"
  ],
  "helpful_votes": 6,
  "created_at": "2026-10-02T16:44:25Z"
 },
 {
  "order_id": 33,
  "menu_item_id": 14,
  "student_id": 5,
  "canteen_id": 2,
  "item_name": "Chicken Burger",
  "rating": 4,
  "comment": "Quite good, slightly pricey.",
  "tags": [
   "tasty",
   "quick-service"
  ],
  "helpful_votes": 6,
  "created_at": "2026-10-02T21:21:32Z"
 },
 {
  "order_id": 35,
  "menu_item_id": 3,
  "student_id": 9,
  "canteen_id": 1,
  "item_name": "Chicken Puff",
  "rating": 5,
  "comment": "Best item on the menu.",
  "tags": [
   "tasty"
  ],
  "helpful_votes": 0,
  "created_at": "2026-10-07T13:55:41Z",
  "aspects": {
   "taste": 5
  }
 },
 {
  "order_id": 35,
  "menu_item_id": 5,
  "student_id": 9,
  "canteen_id": 1,
  "item_name": "Idli Sambar",
  "rating": 5,
  "comment": "Fresh and tasty, will order again.",
  "tags": [
   "generous-portion",
   "tasty",
   "fresh"
  ],
  "helpful_votes": 1,
  "created_at": "2026-10-08T01:02:41Z"
 },
 {
  "order_id": 37,
  "menu_item_id": 5,
  "student_id": 3,
  "canteen_id": 1,
  "item_name": "Idli Sambar",
  "rating": 4,
  "comment": "Good taste and quick service.",
  "tags": [
   "tasty",
   "fresh",
   "quick-service"
  ],
  "helpful_votes": 8,
  "created_at": "2026-10-09T11:55:26Z"
 },
 {
  "order_id": 39,
  "menu_item_id": 3,
  "student_id": 7,
  "canteen_id": 1,
  "item_name": "Chicken Puff",
  "rating": 3,
  "comment": "Okay for the price.",
  "tags": [
   "okay-value"
  ],
  "helpful_votes": 5,
  "created_at": "2026-10-11T07:57:27Z"
 },
 {
  "order_id": 40,
  "menu_item_id": 4,
  "student_id": 10,
  "canteen_id": 1,
  "item_name": "Masala Dosa",
  "rating": 5,
  "comment": "Fresh and tasty, will order again.",
  "tags": [
   "fresh"
  ],
  "helpful_votes": 1,
  "created_at": "2026-10-10T14:57:09Z",
  "aspects": {
   "service": 5
  }
 },
 {
  "order_id": 40,
  "menu_item_id": 9,
  "student_id": 10,
  "canteen_id": 1,
  "item_name": "Veg Fried Rice",
  "rating": 3,
  "comment": "Average, nothing special.",
  "tags": [
   "okay-value"
  ],
  "helpful_votes": 0,
  "created_at": "2026-10-11T11:42:09Z",
  "aspects": {
   "freshness": 3,
   "portion": 3,
   "taste": 2
  }
 },
 {
  "order_id": 41,
  "menu_item_id": 1,
  "student_id": 2,
  "canteen_id": 1,
  "item_name": "Samosa",
  "rating": 5,
  "comment": "Perfect portion and great taste.",
  "tags": [
   "fresh"
  ],
  "helpful_votes": 2,
  "created_at": "2026-10-11T15:24:02Z",
  "aspects": {
   "portion": 5
  }
 },
 {
  "order_id": 43,
  "menu_item_id": 17,
  "student_id": 4,
  "canteen_id": 2,
  "item_name": "Lime Soda",
  "rating": 4,
  "comment": "Good taste and quick service.",
  "tags": [
   "quick-service",
   "tasty",
   "fresh"
  ],
  "helpful_votes": 5,
  "created_at": "2026-10-11T14:06:33Z",
  "aspects": {
   "freshness": 4,
   "portion": 4
  }
 },
 {
  "order_id": 43,
  "menu_item_id": 18,
  "student_id": 4,
  "canteen_id": 2,
  "item_name": "Chocolate Brownie",
  "rating": 3,
  "comment": "Okay for the price.",
  "tags": [
   "okay-value",
   "average"
  ],
  "helpful_votes": 6,
  "created_at": "2026-10-11T18:11:33Z"
 },
 {
  "order_id": 44,
  "menu_item_id": 19,
  "student_id": 12,
  "canteen_id": 2,
  "item_name": "Egg Roll",
  "rating": 2,
  "comment": "Too oily and a bit bland.",
  "tags": [
   "small-portion"
  ],
  "helpful_votes": 6,
  "created_at": "2026-10-11T13:15:42Z",
  "aspects": {
   "freshness": 2
  },
  "staff_reply": {
   "staff_id": 4,
   "message": "Sorry about that - we have passed this on to the kitchen team.",
   "replied_at": "2026-10-11T18:15:42Z"
  }
 },
 {
  "order_id": 47,
  "menu_item_id": 9,
  "student_id": 10,
  "canteen_id": 1,
  "item_name": "Veg Fried Rice",
  "rating": 5,
  "comment": "Best item on the menu.",
  "tags": [
   "fresh",
   "generous-portion"
  ],
  "helpful_votes": 3,
  "created_at": "2026-10-13T08:25:01Z"
 },
 {
  "order_id": 48,
  "menu_item_id": 12,
  "student_id": 3,
  "canteen_id": 1,
  "item_name": "Gulab Jamun",
  "rating": 3,
  "comment": "Okay for the price.",
  "tags": [
   "average",
   "okay-value"
  ],
  "helpful_votes": 5,
  "created_at": "2026-10-12T22:08:10Z"
 },
 {
  "order_id": 49,
  "menu_item_id": 6,
  "student_id": 1,
  "canteen_id": 1,
  "item_name": "Veg Thali",
  "rating": 4,
  "comment": "Quite good, slightly pricey.",
  "tags": [
   "fresh"
  ],
  "helpful_votes": 6,
  "created_at": "2026-10-12T18:47:17Z",
  "aspects": {
   "taste": 4,
   "portion": 3,
   "freshness": 5
  }
 },
 {
  "order_id": 50,
  "menu_item_id": 20,
  "student_id": 9,
  "canteen_id": 2,
  "item_name": "Maggi",
  "rating": 5,
  "comment": "Absolutely loved it!",
  "tags": [
   "fresh",
   "generous-portion",
   "value-for-money"
  ],
  "helpful_votes": 6,
  "created_at": "2026-10-14T06:15:30Z",
  "aspects": {
   "service": 4
  }
 },
 {
  "order_id": 51,
  "menu_item_id": 1,
  "student_id": 4,
  "canteen_id": 1,
  "item_name": "Samosa",
  "rating": 4,
  "comment": "Nice, would recommend.",
  "tags": [
   "quick-service",
   "tasty",
   "fresh"
  ],
  "helpful_votes": 1,
  "created_at": "2026-10-14T09:18:24Z",
  "aspects": {
   "taste": 5,
   "portion": 5,
   "service": 4
  }
 },
 {
  "order_id": 52,
  "menu_item_id": 5,
  "student_id": 5,
  "canteen_id": 1,
  "item_name": "Idli Sambar",
  "rating": 5,
  "comment": "Absolutely loved it!",
  "tags": [
   "generous-portion",
   "fresh"
  ],
  "helpful_votes": 4,
  "created_at": "2026-10-14T13:53:16Z",
  "aspects": {
   "freshness": 5,
   "portion": 5,
   "service": 5
  }
 },
 {
  "order_id": 54,
  "menu_item_id": 20,
  "student_id": 5,
  "canteen_id": 2,
  "item_name": "Maggi",
  "rating": 4,
  "comment": "Good taste and quick service.",
  "tags": [
   "fresh",
   "quick-service"
  ],
  "helpful_votes": 0,
  "created_at": "2026-10-15T06:57:59Z"
 },
 {
  "order_id": 55,
  "menu_item_id": 4,
  "student_id": 10,
  "canteen_id": 1,
  "item_name": "Masala Dosa",
  "rating": 3,
  "comment": "Average, nothing special.",
  "tags": [
   "okay-value"
  ],
  "helpful_votes": 7,
  "created_at": "2026-10-14T21:38:26Z",
  "aspects": {
   "taste": 2
  }
 },
 {
  "order_id": 56,
  "menu_item_id": 17,
  "student_id": 3,
  "canteen_id": 2,
  "item_name": "Lime Soda",
  "rating": 5,
  "comment": "Absolutely loved it!",
  "tags": [
   "generous-portion"
  ],
  "helpful_votes": 7,
  "created_at": "2026-10-16T06:32:31Z",
  "aspects": {
   "freshness": 5
  }
 },
 {
  "order_id": 57,
  "menu_item_id": 11,
  "student_id": 7,
  "canteen_id": 1,
  "item_name": "Masala Chai",
  "rating": 4,
  "comment": "Good taste and quick service.",
  "tags": [
   "quick-service",
   "fresh",
   "tasty"
  ],
  "helpful_votes": 6,
  "created_at": "2026-10-17T03:54:17Z",
  "aspects": {
   "portion": 4,
   "service": 5,
   "taste": 3
  }
 },
 {
  "order_id": 57,
  "menu_item_id": 12,
  "student_id": 7,
  "canteen_id": 1,
  "item_name": "Gulab Jamun",
  "rating": 4,
  "comment": "Quite good, slightly pricey.",
  "tags": [
   "fresh",
   "tasty"
  ],
  "helpful_votes": 4,
  "created_at": "2026-10-17T01:03:17Z"
 },
 {
  "order_id": 58,
  "menu_item_id": 1,
  "student_id": 4,
  "canteen_id": 1,
  "item_name": "Samosa",
  "rating": 5,
  "comment": "Fresh and tasty, will order again.",
  "tags": [
   "tasty",
   "value-for-money",
   "generous-portion"
  ],
  "helpful_votes": 0,
  "created_at": "2026-10-17T21:55:58Z",
  "aspects": {
   "taste": 4,
   "freshness": 4
  }
 },
 {
  "order_id": 59,
  "menu_item_id": 2,
  "student_id": 7,
  "canteen_id": 1,
  "item_name": "Veg Puff",
  "rating": 2,
  "comment": "It was cold when served.",
  "tags": [
   "cold",
   "oily",
   "small-portion"
  ],
  "helpful_votes": 7,
  "created_at": "2026-10-18T08:35:30Z",
  "aspects": {
   "freshness": 2,
   "portion": 1
  }
 },
 {
  "order_id": 59,
  "menu_item_id": 8,
  "student_id": 7,
  "canteen_id": 1,
  "item_name": "Paneer Wrap",
  "rating": 5,
  "comment": "Fresh and tasty, will order again.",
  "tags": [
   "generous-portion",
   "value-for-money"
  ],
  "helpful_votes": 4,
  "created_at": "2026-10-18T06:47:30Z",
  "aspects": {
   "freshness": 5
  }
 },
 {
  "order_id": 62,
  "menu_item_id": 1,
  "student_id": 1,
  "canteen_id": 1,
  "item_name": "Samosa",
  "rating": 3,
  "comment": "Okay for the price.",
  "tags": [
   "average",
   "okay-value"
  ],
  "helpful_votes": 5,
  "created_at": "2026-10-19T00:05:04Z",
  "aspects": {
   "service": 4
  }
 },
 {
  "order_id": 62,
  "menu_item_id": 7,
  "student_id": 1,
  "canteen_id": 1,
  "item_name": "Chicken Biryani",
  "rating": 4,
  "comment": "Good taste and quick service.",
  "tags": [
   "tasty",
   "fresh"
  ],
  "helpful_votes": 4,
  "created_at": "2026-10-18T18:08:04Z",
  "aspects": {
   "freshness": 4,
   "portion": 4,
   "taste": 4
  }
 },
 {
  "order_id": 63,
  "menu_item_id": 5,
  "student_id": 7,
  "canteen_id": 1,
  "item_name": "Idli Sambar",
  "rating": 5,
  "comment": "Best item on the menu.",
  "tags": [
   "value-for-money",
   "fresh"
  ],
  "helpful_votes": 5,
  "created_at": "2026-10-20T06:20:44Z",
  "aspects": {
   "portion": 5,
   "taste": 4,
   "service": 5
  }
 },
 {
  "order_id": 64,
  "menu_item_id": 16,
  "student_id": 7,
  "canteen_id": 2,
  "item_name": "Cold Coffee",
  "rating": 4,
  "comment": "Nice, would recommend.",
  "tags": [
   "quick-service",
   "fresh",
   "tasty"
  ],
  "helpful_votes": 2,
  "created_at": "2026-10-19T20:50:12Z",
  "aspects": {
   "freshness": 4,
   "taste": 3
  }
 },
 {
  "order_id": 64,
  "menu_item_id": 19,
  "student_id": 7,
  "canteen_id": 2,
  "item_name": "Egg Roll",
  "rating": 2,
  "comment": "Too oily and a bit bland.",
  "tags": [
   "small-portion"
  ],
  "helpful_votes": 8,
  "created_at": "2026-10-20T12:24:12Z",
  "aspects": {
   "taste": 2,
   "portion": 1,
   "service": 2
  },
  "staff_reply": {
   "staff_id": 2,
   "message": "Sorry about that - we have passed this on to the kitchen team.",
   "replied_at": "2026-10-20T14:24:12Z"
  }
 },
 {
  "order_id": 65,
  "menu_item_id": 18,
  "student_id": 7,
  "canteen_id": 2,
  "item_name": "Chocolate Brownie",
  "rating": 3,
  "comment": "Okay for the price.",
  "tags": [
   "average"
  ],
  "helpful_votes": 7,
  "created_at": "2026-10-22T08:47:00Z"
 },
 {
  "order_id": 66,
  "menu_item_id": 9,
  "student_id": 2,
  "canteen_id": 1,
  "item_name": "Veg Fried Rice",
  "rating": 4,
  "comment": "Quite good, slightly pricey.",
  "tags": [
   "tasty",
   "quick-service",
   "fresh"
  ],
  "helpful_votes": 8,
  "created_at": "2026-10-21T22:23:18Z"
 },
 {
  "order_id": 67,
  "menu_item_id": 5,
  "student_id": 2,
  "canteen_id": 1,
  "item_name": "Idli Sambar",
  "rating": 4,
  "comment": "Good taste and quick service.",
  "tags": [
   "fresh",
   "quick-service"
  ],
  "helpful_votes": 0,
  "created_at": "2026-10-24T06:33:30Z"
 }
];
feedback.forEach(d => {
  toInt(d, "order_id", "menu_item_id", "student_id", "canteen_id", "rating", "helpful_votes");
  if (d.aspects) Object.keys(d.aspects).forEach(k => d.aspects[k] = NumberInt(d.aspects[k]));
  if (d.staff_reply) { d.staff_reply.staff_id = NumberInt(d.staff_reply.staff_id); toDate(d.staff_reply, "replied_at"); }
  toDate(d, "created_at");
});
cx.feedback.insertMany(feedback);

// ---- student_item_stats (12 documents) ----
const stats = [
 {
  "student_id": 1,
  "items": [
   {
    "menu_item_id": 3,
    "item_name": "Chicken Puff",
    "times_ordered": 2,
    "total_qty": 3,
    "last_ordered": "2026-10-12T08:05:17Z"
   },
   {
    "menu_item_id": 6,
    "item_name": "Veg Thali",
    "times_ordered": 3,
    "total_qty": 3,
    "last_ordered": "2026-10-25T11:47:36Z"
   },
   {
    "menu_item_id": 10,
    "item_name": "Filter Coffee",
    "times_ordered": 2,
    "total_qty": 3,
    "last_ordered": "2026-10-25T11:47:36Z"
   },
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "times_ordered": 2,
    "total_qty": 3,
    "last_ordered": "2026-10-02T13:24:20Z"
   },
   {
    "menu_item_id": 7,
    "item_name": "Chicken Biryani",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-18T17:19:04Z"
   },
   {
    "menu_item_id": 14,
    "item_name": "Chicken Burger",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-09-18T10:34:58Z"
   },
   {
    "menu_item_id": 1,
    "item_name": "Samosa",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-18T17:19:04Z"
   },
   {
    "menu_item_id": 15,
    "item_name": "French Fries",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-02T13:24:20Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "student_id": 2,
  "items": [
   {
    "menu_item_id": 1,
    "item_name": "Samosa",
    "times_ordered": 3,
    "total_qty": 6,
    "last_ordered": "2026-10-10T17:58:02Z"
   },
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "times_ordered": 2,
    "total_qty": 2,
    "last_ordered": "2026-10-25T10:17:59Z"
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-08T13:48:28Z"
   },
   {
    "menu_item_id": 19,
    "item_name": "Egg Roll",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-24T10:36:13Z"
   },
   {
    "menu_item_id": 20,
    "item_name": "Maggi",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-09-21T12:40:19Z"
   },
   {
    "menu_item_id": 4,
    "item_name": "Masala Dosa",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-08T13:48:28Z"
   },
   {
    "menu_item_id": 7,
    "item_name": "Chicken Biryani",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-20T12:01:40Z"
   },
   {
    "menu_item_id": 9,
    "item_name": "Veg Fried Rice",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-21T10:22:18Z"
   },
   {
    "menu_item_id": 16,
    "item_name": "Cold Coffee",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-24T10:36:13Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "student_id": 3,
  "items": [
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "times_ordered": 2,
    "total_qty": 5,
    "last_ordered": "2026-10-08T14:24:26Z"
   },
   {
    "menu_item_id": 4,
    "item_name": "Masala Dosa",
    "times_ordered": 2,
    "total_qty": 4,
    "last_ordered": "2026-10-08T14:24:26Z"
   },
   {
    "menu_item_id": 14,
    "item_name": "Chicken Burger",
    "times_ordered": 1,
    "total_qty": 3,
    "last_ordered": "2026-10-15T09:26:31Z"
   },
   {
    "menu_item_id": 19,
    "item_name": "Egg Roll",
    "times_ordered": 1,
    "total_qty": 3,
    "last_ordered": "2026-09-15T13:20:05Z"
   },
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-15T09:26:31Z"
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-25T10:43:59Z"
   },
   {
    "menu_item_id": 12,
    "item_name": "Gulab Jamun",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-12T09:59:10Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "student_id": 4,
  "items": [
   {
    "menu_item_id": 1,
    "item_name": "Samosa",
    "times_ordered": 3,
    "total_qty": 4,
    "last_ordered": "2026-10-18T13:32:55Z"
   },
   {
    "menu_item_id": 7,
    "item_name": "Chicken Biryani",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-13T14:02:24Z"
   },
   {
    "menu_item_id": 18,
    "item_name": "Chocolate Brownie",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-11T11:30:33Z"
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-12T12:48:56Z"
   },
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-11T11:30:33Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "student_id": 5,
  "items": [
   {
    "menu_item_id": 10,
    "item_name": "Filter Coffee",
    "times_ordered": 2,
    "total_qty": 4,
    "last_ordered": "2026-10-13T17:02:16Z"
   },
   {
    "menu_item_id": 2,
    "item_name": "Veg Puff",
    "times_ordered": 1,
    "total_qty": 3,
    "last_ordered": "2026-10-14T11:06:30Z"
   },
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "times_ordered": 1,
    "total_qty": 3,
    "last_ordered": "2026-10-13T17:02:16Z"
   },
   {
    "menu_item_id": 20,
    "item_name": "Maggi",
    "times_ordered": 1,
    "total_qty": 3,
    "last_ordered": "2026-10-14T08:51:59Z"
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-09-12T14:52:58Z"
   },
   {
    "menu_item_id": 12,
    "item_name": "Gulab Jamun",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-09-12T14:52:58Z"
   },
   {
    "menu_item_id": 14,
    "item_name": "Chicken Burger",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-02T12:27:32Z"
   },
   {
    "menu_item_id": 15,
    "item_name": "French Fries",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-02T12:27:32Z"
   },
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-02T12:27:32Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "student_id": 6,
  "items": [
   {
    "menu_item_id": 16,
    "item_name": "Cold Coffee",
    "times_ordered": 3,
    "total_qty": 5,
    "last_ordered": "2026-10-10T16:33:40Z"
   },
   {
    "menu_item_id": 10,
    "item_name": "Filter Coffee",
    "times_ordered": 1,
    "total_qty": 3,
    "last_ordered": "2026-09-29T15:03:31Z"
   },
   {
    "menu_item_id": 15,
    "item_name": "French Fries",
    "times_ordered": 1,
    "total_qty": 3,
    "last_ordered": "2026-09-24T16:40:27Z"
   },
   {
    "menu_item_id": 3,
    "item_name": "Chicken Puff",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-29T15:03:31Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "student_id": 7,
  "items": [
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "times_ordered": 5,
    "total_qty": 11,
    "last_ordered": "2026-10-25T11:37:59Z"
   },
   {
    "menu_item_id": 16,
    "item_name": "Cold Coffee",
    "times_ordered": 3,
    "total_qty": 6,
    "last_ordered": "2026-10-21T10:08:00Z"
   },
   {
    "menu_item_id": 3,
    "item_name": "Chicken Puff",
    "times_ordered": 1,
    "total_qty": 3,
    "last_ordered": "2026-10-10T10:02:27Z"
   },
   {
    "menu_item_id": 19,
    "item_name": "Egg Roll",
    "times_ordered": 1,
    "total_qty": 3,
    "last_ordered": "2026-10-19T13:41:12Z"
   },
   {
    "menu_item_id": 1,
    "item_name": "Samosa",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-02T13:04:25Z"
   },
   {
    "menu_item_id": 9,
    "item_name": "Veg Fried Rice",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-19T10:25:44Z"
   },
   {
    "menu_item_id": 11,
    "item_name": "Masala Chai",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-16T12:18:17Z"
   },
   {
    "menu_item_id": 13,
    "item_name": "Veg Burger",
    "times_ordered": 2,
    "total_qty": 2,
    "last_ordered": "2026-09-25T12:00:29Z"
   },
   {
    "menu_item_id": 18,
    "item_name": "Chocolate Brownie",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-21T10:08:00Z"
   },
   {
    "menu_item_id": 2,
    "item_name": "Veg Puff",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-17T09:00:30Z"
   },
   {
    "menu_item_id": 7,
    "item_name": "Chicken Biryani",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-25T10:52:59Z"
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-17T09:00:30Z"
   },
   {
    "menu_item_id": 12,
    "item_name": "Gulab Jamun",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-16T12:18:17Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "student_id": 8,
  "items": [
   {
    "menu_item_id": 12,
    "item_name": "Gulab Jamun",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-21T12:02:00Z"
   },
   {
    "menu_item_id": 15,
    "item_name": "French Fries",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-13T15:39:46Z"
   },
   {
    "menu_item_id": 20,
    "item_name": "Maggi",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-29T17:40:41Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "student_id": 9,
  "items": [
   {
    "menu_item_id": 20,
    "item_name": "Maggi",
    "times_ordered": 4,
    "total_qty": 6,
    "last_ordered": "2026-10-13T08:45:30Z"
   },
   {
    "menu_item_id": 7,
    "item_name": "Chicken Biryani",
    "times_ordered": 1,
    "total_qty": 3,
    "last_ordered": "2026-09-22T14:32:19Z"
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "times_ordered": 2,
    "total_qty": 3,
    "last_ordered": "2026-09-22T14:32:19Z"
   },
   {
    "menu_item_id": 10,
    "item_name": "Filter Coffee",
    "times_ordered": 2,
    "total_qty": 3,
    "last_ordered": "2026-09-18T16:04:07Z"
   },
   {
    "menu_item_id": 16,
    "item_name": "Cold Coffee",
    "times_ordered": 1,
    "total_qty": 3,
    "last_ordered": "2026-09-24T08:02:08Z"
   },
   {
    "menu_item_id": 4,
    "item_name": "Masala Dosa",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-09-14T12:28:32Z"
   },
   {
    "menu_item_id": 3,
    "item_name": "Chicken Puff",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-07T12:25:41Z"
   },
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-07T12:25:41Z"
   },
   {
    "menu_item_id": 6,
    "item_name": "Veg Thali",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-18T16:04:07Z"
   },
   {
    "menu_item_id": 11,
    "item_name": "Masala Chai",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-22T14:32:19Z"
   },
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-23T15:11:10Z"
   },
   {
    "menu_item_id": 19,
    "item_name": "Egg Roll",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-13T08:45:30Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "student_id": 10,
  "items": [
   {
    "menu_item_id": 4,
    "item_name": "Masala Dosa",
    "times_ordered": 2,
    "total_qty": 5,
    "last_ordered": "2026-10-14T10:15:26Z"
   },
   {
    "menu_item_id": 9,
    "item_name": "Veg Fried Rice",
    "times_ordered": 2,
    "total_qty": 5,
    "last_ordered": "2026-10-12T08:13:01Z"
   },
   {
    "menu_item_id": 1,
    "item_name": "Samosa",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-12T08:13:01Z"
   },
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-09-20T16:26:59Z"
   },
   {
    "menu_item_id": 2,
    "item_name": "Veg Puff",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-14T10:15:26Z"
   },
   {
    "menu_item_id": 3,
    "item_name": "Chicken Puff",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-12T08:13:01Z"
   },
   {
    "menu_item_id": 6,
    "item_name": "Veg Thali",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-14T10:15:26Z"
   },
   {
    "menu_item_id": 13,
    "item_name": "Veg Burger",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-20T16:26:59Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "student_id": 11,
  "items": [
   {
    "menu_item_id": 2,
    "item_name": "Veg Puff",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-11T09:19:33Z"
   },
   {
    "menu_item_id": 6,
    "item_name": "Veg Thali",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-02T15:57:56Z"
   },
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-29T12:15:46Z"
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-29T16:12:19Z"
   },
   {
    "menu_item_id": 9,
    "item_name": "Veg Fried Rice",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-09-13T11:12:17Z"
   },
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-18T08:23:21Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "student_id": 12,
  "items": [
   {
    "menu_item_id": 18,
    "item_name": "Chocolate Brownie",
    "times_ordered": 1,
    "total_qty": 2,
    "last_ordered": "2026-10-11T12:14:42Z"
   },
   {
    "menu_item_id": 19,
    "item_name": "Egg Roll",
    "times_ordered": 1,
    "total_qty": 1,
    "last_ordered": "2026-10-11T12:14:42Z"
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 }
];
stats.forEach(d => {
  toInt(d, "student_id");
  d.items.forEach(i => { toInt(i, "menu_item_id", "times_ordered", "total_qty"); toDate(i, "last_ordered"); });
  toDate(d, "updated_at");
});
cx.student_item_stats.insertMany(stats);

// ---- item_similarity (20 documents) ----
const similarity = [
 {
  "menu_item_id": 1,
  "item_name": "Samosa",
  "also_ordered": [
   {
    "menu_item_id": 7,
    "item_name": "Chicken Biryani",
    "together_count": 2
   },
   {
    "menu_item_id": 3,
    "item_name": "Chicken Puff",
    "together_count": 1
   },
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "together_count": 1
   },
   {
    "menu_item_id": 4,
    "item_name": "Masala Dosa",
    "together_count": 1
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "together_count": 1
   },
   {
    "menu_item_id": 9,
    "item_name": "Veg Fried Rice",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 2,
  "item_name": "Veg Puff",
  "also_ordered": [
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "together_count": 1
   },
   {
    "menu_item_id": 4,
    "item_name": "Masala Dosa",
    "together_count": 1
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "together_count": 1
   },
   {
    "menu_item_id": 6,
    "item_name": "Veg Thali",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 3,
  "item_name": "Chicken Puff",
  "also_ordered": [
   {
    "menu_item_id": 10,
    "item_name": "Filter Coffee",
    "together_count": 2
   },
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "together_count": 1
   },
   {
    "menu_item_id": 1,
    "item_name": "Samosa",
    "together_count": 1
   },
   {
    "menu_item_id": 9,
    "item_name": "Veg Fried Rice",
    "together_count": 1
   },
   {
    "menu_item_id": 6,
    "item_name": "Veg Thali",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 4,
  "item_name": "Masala Dosa",
  "also_ordered": [
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "together_count": 2
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "together_count": 2
   },
   {
    "menu_item_id": 10,
    "item_name": "Filter Coffee",
    "together_count": 1
   },
   {
    "menu_item_id": 1,
    "item_name": "Samosa",
    "together_count": 1
   },
   {
    "menu_item_id": 9,
    "item_name": "Veg Fried Rice",
    "together_count": 1
   },
   {
    "menu_item_id": 2,
    "item_name": "Veg Puff",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 5,
  "item_name": "Idli Sambar",
  "also_ordered": [
   {
    "menu_item_id": 4,
    "item_name": "Masala Dosa",
    "together_count": 2
   },
   {
    "menu_item_id": 7,
    "item_name": "Chicken Biryani",
    "together_count": 1
   },
   {
    "menu_item_id": 3,
    "item_name": "Chicken Puff",
    "together_count": 1
   },
   {
    "menu_item_id": 10,
    "item_name": "Filter Coffee",
    "together_count": 1
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "together_count": 1
   },
   {
    "menu_item_id": 1,
    "item_name": "Samosa",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 6,
  "item_name": "Veg Thali",
  "also_ordered": [
   {
    "menu_item_id": 10,
    "item_name": "Filter Coffee",
    "together_count": 2
   },
   {
    "menu_item_id": 7,
    "item_name": "Chicken Biryani",
    "together_count": 1
   },
   {
    "menu_item_id": 3,
    "item_name": "Chicken Puff",
    "together_count": 1
   },
   {
    "menu_item_id": 4,
    "item_name": "Masala Dosa",
    "together_count": 1
   },
   {
    "menu_item_id": 1,
    "item_name": "Samosa",
    "together_count": 1
   },
   {
    "menu_item_id": 2,
    "item_name": "Veg Puff",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 7,
  "item_name": "Chicken Biryani",
  "also_ordered": [
   {
    "menu_item_id": 1,
    "item_name": "Samosa",
    "together_count": 2
   },
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "together_count": 1
   },
   {
    "menu_item_id": 11,
    "item_name": "Masala Chai",
    "together_count": 1
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "together_count": 1
   },
   {
    "menu_item_id": 6,
    "item_name": "Veg Thali",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 8,
  "item_name": "Paneer Wrap",
  "also_ordered": [
   {
    "menu_item_id": 10,
    "item_name": "Filter Coffee",
    "together_count": 2
   },
   {
    "menu_item_id": 4,
    "item_name": "Masala Dosa",
    "together_count": 2
   },
   {
    "menu_item_id": 7,
    "item_name": "Chicken Biryani",
    "together_count": 1
   },
   {
    "menu_item_id": 12,
    "item_name": "Gulab Jamun",
    "together_count": 1
   },
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "together_count": 1
   },
   {
    "menu_item_id": 11,
    "item_name": "Masala Chai",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 9,
  "item_name": "Veg Fried Rice",
  "also_ordered": [
   {
    "menu_item_id": 3,
    "item_name": "Chicken Puff",
    "together_count": 1
   },
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "together_count": 1
   },
   {
    "menu_item_id": 4,
    "item_name": "Masala Dosa",
    "together_count": 1
   },
   {
    "menu_item_id": 1,
    "item_name": "Samosa",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 10,
  "item_name": "Filter Coffee",
  "also_ordered": [
   {
    "menu_item_id": 3,
    "item_name": "Chicken Puff",
    "together_count": 2
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "together_count": 2
   },
   {
    "menu_item_id": 6,
    "item_name": "Veg Thali",
    "together_count": 2
   },
   {
    "menu_item_id": 12,
    "item_name": "Gulab Jamun",
    "together_count": 1
   },
   {
    "menu_item_id": 5,
    "item_name": "Idli Sambar",
    "together_count": 1
   },
   {
    "menu_item_id": 4,
    "item_name": "Masala Dosa",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 11,
  "item_name": "Masala Chai",
  "also_ordered": [
   {
    "menu_item_id": 7,
    "item_name": "Chicken Biryani",
    "together_count": 1
   },
   {
    "menu_item_id": 12,
    "item_name": "Gulab Jamun",
    "together_count": 1
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 12,
  "item_name": "Gulab Jamun",
  "also_ordered": [
   {
    "menu_item_id": 10,
    "item_name": "Filter Coffee",
    "together_count": 1
   },
   {
    "menu_item_id": 11,
    "item_name": "Masala Chai",
    "together_count": 1
   },
   {
    "menu_item_id": 8,
    "item_name": "Paneer Wrap",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 13,
  "item_name": "Veg Burger",
  "also_ordered": [
   {
    "menu_item_id": 16,
    "item_name": "Cold Coffee",
    "together_count": 1
   },
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 14,
  "item_name": "Chicken Burger",
  "also_ordered": [
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "together_count": 3
   },
   {
    "menu_item_id": 15,
    "item_name": "French Fries",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 15,
  "item_name": "French Fries",
  "also_ordered": [
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "together_count": 2
   },
   {
    "menu_item_id": 14,
    "item_name": "Chicken Burger",
    "together_count": 1
   },
   {
    "menu_item_id": 16,
    "item_name": "Cold Coffee",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 16,
  "item_name": "Cold Coffee",
  "also_ordered": [
   {
    "menu_item_id": 19,
    "item_name": "Egg Roll",
    "together_count": 2
   },
   {
    "menu_item_id": 18,
    "item_name": "Chocolate Brownie",
    "together_count": 1
   },
   {
    "menu_item_id": 15,
    "item_name": "French Fries",
    "together_count": 1
   },
   {
    "menu_item_id": 13,
    "item_name": "Veg Burger",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 17,
  "item_name": "Lime Soda",
  "also_ordered": [
   {
    "menu_item_id": 14,
    "item_name": "Chicken Burger",
    "together_count": 3
   },
   {
    "menu_item_id": 15,
    "item_name": "French Fries",
    "together_count": 2
   },
   {
    "menu_item_id": 18,
    "item_name": "Chocolate Brownie",
    "together_count": 1
   },
   {
    "menu_item_id": 20,
    "item_name": "Maggi",
    "together_count": 1
   },
   {
    "menu_item_id": 13,
    "item_name": "Veg Burger",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 18,
  "item_name": "Chocolate Brownie",
  "also_ordered": [
   {
    "menu_item_id": 16,
    "item_name": "Cold Coffee",
    "together_count": 1
   },
   {
    "menu_item_id": 19,
    "item_name": "Egg Roll",
    "together_count": 1
   },
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 19,
  "item_name": "Egg Roll",
  "also_ordered": [
   {
    "menu_item_id": 16,
    "item_name": "Cold Coffee",
    "together_count": 2
   },
   {
    "menu_item_id": 18,
    "item_name": "Chocolate Brownie",
    "together_count": 1
   },
   {
    "menu_item_id": 20,
    "item_name": "Maggi",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 },
 {
  "menu_item_id": 20,
  "item_name": "Maggi",
  "also_ordered": [
   {
    "menu_item_id": 19,
    "item_name": "Egg Roll",
    "together_count": 1
   },
   {
    "menu_item_id": 17,
    "item_name": "Lime Soda",
    "together_count": 1
   }
  ],
  "updated_at": "2026-10-25T11:47:52Z"
 }
];
similarity.forEach(d => {
  toInt(d, "menu_item_id");
  d.also_ordered.forEach(i => toInt(i, "menu_item_id", "together_count"));
  toDate(d, "updated_at");
});
cx.item_similarity.insertMany(similarity);

print("Seeded: feedback=" + cx.feedback.countDocuments() +
      ", student_item_stats=" + cx.student_item_stats.countDocuments() +
      ", item_similarity=" + cx.item_similarity.countDocuments());

// ---- item_rating_summary: built from feedback with an aggregation $merge ----
cx.feedback.aggregate([
  { $group: { _id: "$menu_item_id", item_name: { $first: "$item_name" }, rating_count: { $sum: 1 },
              avg_rating: { $avg: "$rating" }, last_feedback_at: { $max: "$created_at" } } },
  { $addFields: { avg_rating: { $round: ["$avg_rating", 2] }, updated_at: "$$NOW" } },
  { $merge: { into: "item_rating_summary", on: "_id", whenMatched: "replace", whenNotMatched: "insert" } }
]);
print("item_rating_summary=" + cx.item_rating_summary.countDocuments());
