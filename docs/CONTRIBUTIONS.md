# Team contributions

| | Abhinav Bora (PES1UG24CS014) | Aarohi Jaiswal (PES1UG24CS009) |
|---|---|---|
| **Focus** | Customer journey, security and recommendations | Canteen operations, triggers and MongoDB |

Each member owns work in **both the database and the application**, and reviews the other's pull requests.
Ownership is by file, so `git log -- <path>` shows who worked on what.

## Shared
- Requirements and the first ER diagram / relational schema (Lab 4 draft), the final ER diagram review
- Pull-request review of each other's work, running the full test suite before each merge
- Documentation, demonstration and viva preparation (each member presents and can explain the other's parts too)

## Abhinav Bora
**Database** (`database/`)
- `canteenx_ddl.sql` - 16 tables, constraints, indexes, views, ALTER / DROP examples
- `canteenx_sample_data.sql` - sample canteens, menu, students, staff and 72 orders
- `canteenx_queries.sql` - key queries, joins, GROUP BY / HAVING, subqueries, full-text, DML
- `canteenx_app_user.sql` - least-privilege application account

**Application** (`src/`)
- Foundation: `lib/env.ts`, `lib/db.ts`, `lib/mongo.ts`, `lib/http.ts`, `lib/client-api.ts`, `lib/format.ts`, `app/api/health`
- Authentication and security: `lib/token.ts`, `session.ts`, `auth.ts`, `validation.ts`, `rate-limit.ts`, `proxy.ts`, `app/api/auth/*`, login and register pages
- Student journey: `lib/menu.ts`, `cart.ts`, `orders.ts`, `app/api/{menu,cart,orders}`, `app/student/*` pages and their components (menu search and filters, cart, checkout through `sp_place_order`, tracking, history, cancel)
- Recommendations: `lib/recommendations.ts`, `components/RecommendationCards.tsx`, `app/api/staff/recommendations/refresh`
- Student feedback: `app/api/feedback`, `components/FeedbackForm.tsx`, `components/StarRating.tsx`

**Tests:** `tests/student_flow.py`

**Documentation:** sections 1, 2, 3, 5, 7 and the conclusion

## Aarohi Jaiswal
**Database** (`database/`)
- `canteenx_triggers_procedures.sql` - 19 triggers, 4 stored procedures, 1 stored function
- `canteenx_step4_tests.sql` - database-level test script
- `canteenx_mongodb_setup.js`, `canteenx_mongodb_seed.js`, `canteenx_mongodb_queries.js` and `docs/mongodb_design.md` - MongoDB collections, validators, indexes, aggregations

**Application** (`src/`)
- Staff and admin side: `lib/staff.ts`, `app/api/staff/{orders,inventory,menu,suppliers}`, `app/staff/*` pages (order queue and status updates, cash payment confirmation, inventory and restocking, low-stock alerts, menu management, suppliers, sales dashboard) and their components
- Feedback storage and staff feedback dashboard: `lib/feedback.ts`, `app/api/staff/feedback`, `app/staff/feedback`, `components/ReplyForm.tsx`

**Tests:** `tests/staff_flow.py`, `tests/mongo_flow.py`

**Documentation:** sections 4, 6, 8, 9

## How to check
```bash
git shortlog -sn                  # commits per author
git log --author="Name" --stat    # what each person changed
git log --oneline -- database/    # history of one folder
```
