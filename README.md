# CanteenX - Smart College Canteen Management System

Next.js web app backed by **MySQL** (orders, payments, inventory, suppliers, staff, carts) and
**MongoDB** (feedback and recommendations). DBMS Experiential Learning - Level 3 project.

**Team:** Aarohi Jaiswal (PES1UG24CS009), Abhinav Bora (PES1UG24CS014)

## Team and contributions
Abhinav Bora (PES1UG24CS014) and Aarohi Jaiswal (PES1UG24CS009) - see [docs/CONTRIBUTIONS.md](docs/CONTRIBUTIONS.md)
for who owns which files, [docs/er-diagram](docs/er-diagram) for the ER diagram and [docs/screenshots](docs/screenshots)
for screenshots of the running application.

## Prerequisites
- Node.js 20.9 or newer (`node -v`) and npm
- MySQL 8.0.16 or newer (`SELECT VERSION();`) - CHECK constraints are enforced from this version
- MongoDB 6 or newer and `mongosh`

## Setup (macOS)

### 1. Install dependencies
```bash
cd canteenx-app
npm install
```

### 2. Create the MySQL database
Run these scripts **in this order**, as an administrator (`root`), from the `database/` folder.
In MySQL Workbench: open your local connection, choose *File > Open SQL Script*, pick the file, press the lightning
bolt, and wait until it finishes. Or from a terminal: `mysql -u root -p < database/<file>`.

1. `canteenx_ddl.sql` - **drops and recreates** the `CanteenX` database, then creates the tables, indexes and views
2. `canteenx_triggers_procedures.sql` - triggers, stored procedures and the stored function
3. `canteenx_sample_data.sql` - sample canteens, menu, students, staff and 72 orders (takes up to a minute)
4. `canteenx_app_user.sql` - **first edit the password** (two places, same value), then run it. This creates the
   restricted account the app connects with.

Run the scripts as `root` (not as another account) because the triggers and procedures record the account that
created them as their `DEFINER`.

### 3. Create the MongoDB collections and sample data
```bash
brew tap mongodb/brew && brew install mongodb-community mongosh
brew services start mongodb-community
mongosh "mongodb://localhost:27017" --file database/canteenx_mongodb_setup.js
mongosh "mongodb://localhost:27017" --file database/canteenx_mongodb_seed.js
```
The seed also builds the `item_rating_summary` collection, so ratings show on the menu straight away.

### 4. Configure environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local`: set `MYSQL_PASSWORD` to the password from step 2 and `AUTH_SECRET` to the output of
`openssl rand -base64 48`. `.env.local` is git-ignored; never commit real credentials.

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000. Check the databases at http://localhost:3000/api/health - it should show
`{"status":"ok","mysql":"up","mongodb":"up"}`.

Sample accounts (development only) all use the password `Password@123`:

| Account | Role | Canteen |
|---|---|---|
| `aditi.sharma@pes.edu`, `rohan.mehta@pes.edu`, ... (12 students) | Student | - |
| `kiran.rao@canteenx.in` | Staff | Main Canteen |
| `ravi.kumar@canteenx.in` | Admin | Main Canteen |
| `meena.iyer@canteenx.in` | Staff | North Canteen |
| `sunita.das@canteenx.in` | Admin | North Canteen |

### Troubleshooting
| Message | Fix |
|---|---|
| `/api/health` shows `"mysql":"down"` | MySQL is not running, or `MYSQL_PASSWORD` in `.env.local` does not match `canteenx_app_user.sql` |
| `/api/health` shows `"mongodb":"down"` | `brew services start mongodb-community` |
| `Invalid environment configuration` | a value is missing in `.env.local` (`AUTH_SECRET` needs 32+ characters) |
| `The user specified as a definer ... does not exist` | the SQL scripts were run as a different account; rerun steps 1-3 as `root` |
| `Error 1175 ... safe update mode` | Workbench safe updates; the sample data script already turns it off, so rerun that file as a whole |
| `Port 3000 is in use` | `npm run dev -- -p 3001` |

## Authentication and roles
One login form serves everyone; the account's table decides the role.

| Role | Table | Lands on | Can access |
|---|---|---|---|
| STUDENT | `STUDENT` | `/student` | student pages only |
| STAFF | `STAFF` | `/staff` | staff pages (own canteen) |
| ADMIN | `STAFF` (role = ADMIN) | `/staff` | staff pages + admin-only actions |

| Route | Purpose |
|---|---|
| `POST /api/auth/register` | student sign-up (creates the student and their cart in one transaction) |
| `POST /api/auth/login` | sign in (students, staff, admins) |
| `POST /api/auth/logout` | sign out |
| `GET /api/auth/me` | who is signed in |

How it is protected:
- Passwords are hashed with **bcrypt** (cost 10); plain text is never stored or logged.
- The session is a signed JWT in an **HttpOnly, SameSite=Lax** cookie (**Secure** in production), valid 8 hours.
- `src/proxy.ts` redirects early (signed-out users to `/login`, wrong role to their own area). Pages and API routes
  **check the role again** (`src/lib/auth.ts`), so the proxy is not the only defence.
- Login gives the same answer for "unknown email" and "wrong password", and limits repeated failures
  (5 per 15 minutes per IP and email, in memory).
- State-changing requests check the `Origin` header (CSRF defence) and all input is validated with zod
  before reaching the database, where constraints and triggers validate it again.

## Student features (step 8c)
| Page | What it does |
|---|---|
| `/student` | dashboard: orders in progress and recent orders |
| `/student/menu` | browse the menu; search (MySQL full-text, prefix match), filter by canteen, category, veg / non-veg and max price; stock status |
| `/student/cart` | change quantities, remove items; one checkout per canteen with payment method |
| `/student/orders` | order history |
| `/student/orders/[id]` | live tracking (Pending -> Preparing -> Ready -> Completed, refreshes every 10 s), items, payment, cancel while Pending |

| API | Purpose |
|---|---|
| `GET /api/menu` | search and filter the menu |
| `GET/POST/PATCH/DELETE /api/cart` | the student's cart |
| `GET/POST /api/orders` | order history / place an order (calls the stored procedure `sp_place_order`, one transaction) |
| `GET /api/orders/[id]` | order detail (only for the student who placed it) |
| `POST /api/orders/[id]/cancel` | cancel a Pending order (a trigger restores the stock) |

Notes: online payment methods (UPI, Card, Wallet) use a **simulated gateway** that always succeeds; **Cash** stays
`Pending` until staff confirm it at the counter. Stock levels, order totals, status history and low-stock alerts are
handled by database triggers, not by the application.

## Staff and admin features (step 8d)
Staff and admins always work inside **their own canteen**; the database procedure and every query check this.

| Page | Staff | Admin | What it does |
|---|---|---|---|
| `/staff` | yes | yes | dashboard: open orders, payments to confirm, low-stock items (admin also sees today's sales) |
| `/staff/orders` | yes | yes | live order queue (refreshes every 8 s): start preparing, mark ready, complete, cancel, confirm cash payment |
| `/staff/inventory` | yes | yes | stock levels, low-stock alerts, reorder levels, hide/show items, record supplier deliveries |
| `/staff/menu` | - | yes | add, edit, hide and delete menu items |
| `/staff/suppliers` | - | yes | add and edit suppliers, link them to the items they supply |
| `/staff/sales` | - | yes | revenue, orders, average order, revenue per day, popular items, payment methods, categories |

| API | Role | Purpose |
|---|---|---|
| `POST /api/staff/orders/[id]/status` | staff, admin | change order status (calls `sp_update_order_status`) |
| `POST /api/staff/orders/[id]/payment` | staff, admin | confirm a pending (cash) payment (calls `sp_confirm_payment`) |
| `GET /api/staff/inventory`, `PATCH /api/staff/inventory/[id]` | staff, admin | stock list; reorder level, availability |
| `POST /api/staff/inventory/[id]/restock` | staff, admin | record a delivery (a trigger adds the stock) |
| `GET/POST /api/staff/menu`, `PATCH/DELETE /api/staff/menu/[id]` | admin | menu management |
| `GET/POST /api/staff/suppliers`, `PATCH .../[id]`, `POST/DELETE .../[id]/items` | admin | supplier management |

Business rules enforced: an order cannot be completed until its payment is confirmed; status changes must follow
Pending -> Preparing -> Ready -> Completed (cancel only before Ready); an item with order or delivery history cannot
be deleted (hide it instead); a delivery is only accepted from a supplier linked to that item; `proxy.ts`
redirects ordinary staff away from the admin-only pages, and the pages and APIs check the role again.

## Feedback and recommendations (step 8e, MongoDB)
| Where | What |
|---|---|
| `/student/orders/[id]` (Completed order) | rate each item: 1-5 stars, comment, tags and optional detail scores (taste, portion, freshness, service); the canteen's reply is shown under the review |
| `/student/menu` | average stars and review count on every item |
| `/student` | "Recommended for you" (or "Popular on campus" for a new student) |
| `/staff/feedback` | rating summary, distribution, most-mentioned tags, best / worst items, filters (all, low ratings, needs a reply) and reply form; admins also get **Refresh recommendations** |

| API | Role | Purpose |
|---|---|---|
| `POST /api/feedback` | student | rate an item of a completed order |
| `POST /api/staff/feedback/[id]/reply` | staff, admin | answer a review (once) |
| `POST /api/staff/recommendations/refresh` | admin | copy order data from MySQL to MongoDB and rebuild the rating summaries |

How it works:
- **MongoDB cannot enforce foreign keys**, so before saving feedback the API asks MySQL: the order must belong to the
  student, be Completed and contain the item. A unique index (order, item) prevents a second rating, and the collection's
  JSON-schema validator rejects malformed documents.
- **Recommendations** use item-based collaborative filtering: what the student ordered (`student_item_stats`) x which items
  are ordered together (`item_similarity`), weighted by the average rating (`item_rating_summary`). Items already ordered
  are excluded, and only items that are available and in stock are shown. Results are cached for 15 minutes
  (`recommendations`, TTL index) and discarded when the student places or cancels an order.
- **Sync:** the student's own profile is refreshed on every request; the shared similarity data is re-copied from MySQL
  when it is older than 6 hours, or when an admin presses *Refresh recommendations*.
- **If MongoDB is down** the rest of the app keeps working: menu (without stars), ordering, payments, staff queue and
  inventory run on MySQL; the feedback and recommendation parts show a short notice or are hidden.

## Tests
**Setup once:** `pip install -r tests/requirements.txt` (a virtual environment is fine). The tests read the MySQL and
MongoDB settings from `.env.local`, so they need no other configuration.

**Run** (the app must be running on port 3100 in another terminal: `npm run dev -- -p 3100`). Reload the sample data
first for a clean state (the three SQL scripts, then the two MongoDB scripts), then:
```bash
python3 tests/student_flow.py     # 44 checks
python3 tests/staff_flow.py       # 75 checks
python3 tests/mongo_flow.py       # 44 checks; 53 with the MongoDB outage test below
```
The MongoDB outage test stops and restarts MongoDB, so it only runs if you tell it how (otherwise it prints SKIPPED):
```bash
# macOS, MongoDB started by hand
TEST_MONGOD_STOP_CMD="pkill -x mongod" \
TEST_MONGOD_START_CMD="nohup ~/mongodb/bin/mongod --dbpath ~/mongodb-data > ~/mongodb-data/mongod.log 2>&1 &" \
python3 tests/mongo_flow.py
```
(Homebrew service: `brew services stop mongodb-community` / `brew services start mongodb-community`. Windows service:
`net stop MongoDB` / `net start MongoDB` from an administrator terminal.)

All three scripts run against the running app and a freshly loaded sample database (see the docstring at the top of each):
- `tests/student_flow.py` - 44 checks: search, filters, cart rules, placing and cancelling orders, stock rollback, access control, CSRF.
- `tests/mongo_flow.py` - 53 checks: feedback validation and storage, rating summaries, staff replies, dashboard numbers
  compared with MongoDB, sync, recommendations, cache invalidation, and the app with MongoDB stopped (this script stops
  and restarts the local `mongod`; see its docstring).
- `tests/staff_flow.py` - 75 checks: role restrictions, order lifecycle and payment rule, who-changed-what history, restocking,
  low-stock alerts, menu and supplier management, other-canteen isolation, and sales figures compared with SQL.

## Project structure
```
database/            SQL + MongoDB scripts (schema, triggers, sample data, queries)
src/lib/env.ts       validated environment configuration (no hard-coded secrets)
src/lib/db.ts        MySQL connection pool, query helpers, transactions
src/lib/mongo.ts     MongoDB client
src/lib/token.ts     signed session token (shared by proxy, pages and API)
src/lib/session.ts   session cookie helpers
src/lib/auth.ts      role checks used by pages and API routes
src/proxy.ts         early redirects for signed-out users / wrong role
src/app/api/         route handlers (API layer between the UI and the databases)
src/lib/menu.ts, cart.ts, orders.ts   queries for the student pages
src/lib/staff.ts     queries and role checks for the staff / admin pages
src/lib/feedback.ts  MongoDB feedback, rating summaries and dashboard aggregations
src/lib/recommendations.ts  MySQL -> MongoDB sync and the recommendation engine
src/components/      UI building blocks (nav, cart controls, checkout, order timeline)
src/app/login, register, student/*, staff   pages
tests/               API / integration tests
```

## Security notes
- Credentials come only from environment variables; `.env.local` is not committed.
- The app connects to MySQL as `canteenx_app`, which can read/write data and call procedures but cannot alter the schema.
- All SQL uses placeholders (no string concatenation). Passwords are stored as bcrypt hashes.
