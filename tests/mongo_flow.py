"""
CanteenX - MongoDB feature tests: feedback, staff replies, rating summaries, recommendations, sync,
and what happens to the app when MongoDB is down.

Run against a LOCAL development setup with BOTH sample databases freshly loaded
(MySQL: database/*.sql ; MongoDB: canteenx_mongodb_setup.js + canteenx_mongodb_seed.js):
    npm run dev -- -p 3100        # in one terminal
    python3 tests/mongo_flow.py   # in another  (needs: pip install requests pymongo)
It changes data. The last block STOPS and RESTARTS MongoDB, but only if you set TEST_MONGOD_STOP_CMD and
TEST_MONGOD_START_CMD (e.g. macOS: STOP="pkill -x mongod", START="nohup ~/mongodb/bin/mongod --dbpath ~/mongodb-data > ~/mongodb-data/mongod.log 2>&1 &");
otherwise that block is skipped. Setup: pip install -r tests/requirements.txt ; MySQL access comes from .env.local.
"""
import requests, subprocess, re, sys, time
from pymongo import MongoClient
from _helpers import sql, ENV, BASE_URL as B, MONGO_URI, MONGO_DB
T = 90
STOP_CMD, START_CMD = ENV.get("TEST_MONGOD_STOP_CMD"), ENV.get("TEST_MONGOD_START_CMD")
results = []

def check(name, cond, extra=""):
    results.append(bool(cond))
    print(("PASS " if cond else "FAIL ") + name + (f"  [{extra}]" if extra else ""))


def login(email, pw="Password@123"):
    s = requests.Session()
    r = s.post(B + "/api/auth/login", json={"email": email, "password": pw}, timeout=T)
    assert r.ok, (email, r.text)
    return s

plain = lambda t: " ".join(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", t, flags=re.S)).split())
page = lambda s, path: s.get(B + path, timeout=T, allow_redirects=False)

mongo = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
mdb = mongo[MONGO_DB]

aditi, rohan = login("aditi.sharma@pes.edu"), login("rohan.mehta@pes.edu")
kiran, meena, ravi = login("kiran.rao@canteenx.in"), login("meena.iyer@canteenx.in"), login("ravi.kumar@canteenx.in")
items = {i["item_name"]: i for i in aditi.get(B + "/api/menu", timeout=T).json()["items"]}
thali, coffee = items["Veg Thali"]["menu_item_id"], items["Filter Coffee"]["menu_item_id"]
sql(f"UPDATE INVENTORY SET quantity_in_stock=100 WHERE menu_item_id IN ({thali},{coffee})")
sql("DELETE ci FROM CART_ITEM ci JOIN CART c USING(cart_id) WHERE c.student_id IN (1,2)")
S = lambda who, oid, st: who.post(B + f"/api/staff/orders/{oid}/status", json={"status": st}, timeout=T)

# ------------------------------------------------------------ ratings on the menu
check("menu items carry rating fields from MongoDB", all("avg_rating" in i and "rating_count" in i for i in items.values()))
seeded = mdb.item_rating_summary.find_one({"_id": thali}) or {}
check("menu rating equals the MongoDB summary", items["Veg Thali"]["avg_rating"] == seeded.get("avg_rating") and items["Veg Thali"]["rating_count"] == seeded.get("rating_count"), seeded.get("avg_rating"))

# ------------------------------------------------------------ giving feedback
aditi.post(B + "/api/cart", json={"menu_item_id": thali, "quantity": 1}, timeout=T)
aditi.post(B + "/api/cart", json={"menu_item_id": coffee, "quantity": 2}, timeout=T)
oid = aditi.post(B + "/api/orders", json={"canteen_id": 1, "payment_method": "UPI"}, timeout=T).json()["order_id"]
F = lambda who, **b: who.post(B + "/api/feedback", json=b, timeout=T)
good = dict(order_id=oid, menu_item_id=thali, rating=5, comment="<script>alert(1)</script> Great thali!", tags=["tasty", "fresh"], aspects={"taste": 5, "portion": 4})
check("cannot rate before the order is completed", F(aditi, **good).status_code == 409)
for st in ("Preparing", "Ready", "Completed"):
    S(kiran, oid, st)
check("student cannot rate an item that is not in the order", F(aditi, **{**good, "menu_item_id": items["Samosa"]["menu_item_id"]}).status_code == 404)
check("another student cannot rate this order", F(rohan, **good).status_code == 404)
check("rating 6 rejected", F(aditi, **{**good, "rating": 6}).status_code == 400)
check("rating 0 rejected", F(aditi, **{**good, "rating": 0}).status_code == 400)
check("unknown tag rejected", F(aditi, **{**good, "tags": ["bogus"]}).status_code == 400)
check("over-long comment rejected", F(aditi, **{**good, "comment": "x" * 501}).status_code == 400)
check("aspect score 9 rejected", F(aditi, **{**good, "aspects": {"taste": 9}}).status_code == 400)
check("signed-out feedback refused", requests.post(B + "/api/feedback", json=good, timeout=T).status_code == 401)
check("staff cannot post customer feedback", F(kiran, **good).status_code == 403)
before = mdb.item_rating_summary.find_one({"_id": thali})
r = F(aditi, **good)
check("valid feedback accepted", r.status_code == 201, r.text)
check("a second rating of the same item is refused", F(aditi, **good).status_code == 409)
r = F(aditi, order_id=oid, menu_item_id=coffee, rating=3)
check("a rating with no comment, tags or aspects is accepted", r.status_code == 201, r.text)
d2 = mdb.feedback.find_one({"order_id": oid, "menu_item_id": coffee})
check("omitted optional fields are not stored as null", d2 and "comment" not in d2 and d2["tags"] == [])
doc = mdb.feedback.find_one({"order_id": oid, "menu_item_id": thali})
check("document stored with MySQL facts (canteen, item name)", doc and doc["canteen_id"] == 1 and doc["item_name"] == "Veg Thali" and doc["student_id"] == 1, doc and doc.get("item_name"))
check("rating stored as a BSON int (schema validation)", mdb.feedback.count_documents({"_id": doc["_id"], "rating": {"$type": "int"}}) == 1)
agg = list(mdb.feedback.aggregate([{"$match": {"menu_item_id": thali}}, {"$group": {"_id": None, "a": {"$avg": "$rating"}, "n": {"$sum": 1}}}]))[0]
after = mdb.item_rating_summary.find_one({"_id": thali})
check("rating summary updated on write", after["rating_count"] == agg["n"] == (before["rating_count"] + 1) and abs(after["avg_rating"] - round(agg["a"], 2)) < 0.006, (before["rating_count"], after["rating_count"]))
check("menu shows the new average", next(i for i in aditi.get(B + "/api/menu", timeout=T).json()["items"] if i["menu_item_id"] == thali)["rating_count"] == after["rating_count"])
html = page(aditi, f"/student/orders/{oid}").text
check("comment is HTML-escaped on the page (no script injection)", "&lt;script&gt;alert(1)&lt;/script&gt;" in html and "<script>alert(1)" not in html)
check("rated items show their stars and no longer offer the form",
      "5.0 out of 5 stars" in html and "3.0 out of 5 stars" in html and "Rate Veg Thali" not in plain(html) and "Rate Filter Coffee" not in plain(html))

# ------------------------------------------------------------ staff: reply and dashboard
fid = str(doc["_id"])
R = lambda who, i, msg="Thank you!": who.post(B + f"/api/staff/feedback/{i}/reply", json={"message": msg}, timeout=T)
check("student cannot reply as staff", R(aditi, fid).status_code == 403)
check("other canteen's staff cannot reply (404)", R(meena, fid).status_code == 404)
check("bad id rejected", R(kiran, "not-an-id").status_code == 404)
check("empty reply rejected", R(kiran, fid, "").status_code == 400)
check("staff reply accepted", R(kiran, fid, "Glad you enjoyed it!").ok)
check("a second reply is refused", R(kiran, fid).status_code == 409)
check("reply stored with the staff member", mdb.feedback.find_one({"_id": doc["_id"]})["staff_reply"]["staff_id"] == 3)
check("student sees the canteen's reply", "Glad you enjoyed it!" in plain(page(aditi, f"/student/orders/{oid}").text))

fp = plain(page(kiran, "/staff/feedback").text)
exp = list(mdb.feedback.aggregate([{"$match": {"canteen_id": 1}}, {"$group": {"_id": None, "a": {"$avg": "$rating"}, "n": {"$sum": 1}}}]))[0]
m = re.search(r"Average rating\s+([\d.]+)\s+(\d+) reviews?", fp)
check("dashboard average and count match MongoDB", m and abs(float(m.group(1)) - round(exp["a"], 2)) < 0.006 and int(m.group(2)) == exp["n"], (m.groups() if m else None, round(exp["a"], 2), exp["n"]))
low = mdb.feedback.find_one({"canteen_id": 1, "rating": {"$lte": 2}}, sort=[("created_at", -1)])
high = mdb.feedback.find_one({"canteen_id": 1, "rating": {"$gte": 4}})
lp = plain(page(kiran, "/staff/feedback?filter=low").text).replace("order # ", "order #")
check("'low ratings' filter shows low reviews only", f"order #{low['order_id']}" in lp and f"order #{high['order_id']} " not in lp + " ", low and low["order_id"])
check("staff of the other canteen see only their own reviews", f"order #{oid} " not in plain(page(meena, "/staff/feedback").text).replace("order # ", "order #") + " ")
check("feedback page works for staff, admin has the refresh button", "Refresh recommendations" in plain(page(ravi, "/staff/feedback").text) and "Refresh recommendations" not in fp)

# ------------------------------------------------------------ sync + recommendations
check("staff cannot refresh recommendation data (403)", kiran.post(B + "/api/staff/recommendations/refresh", timeout=T).status_code == 403)
r = ravi.post(B + "/api/staff/recommendations/refresh", timeout=T)
j = r.json()
check("admin refresh copies MySQL data into MongoDB", r.ok and j["students"] >= 10 and j["items"] >= 15 and j["summaries"] >= 10, j)
mysql_students = int(sql("SELECT COUNT(DISTINCT o.student_id) FROM ORDERS o JOIN ORDER_ITEM oi USING(order_id) WHERE o.status<>'Cancelled'")[0][0])
check("profiles in MongoDB match MySQL", mdb.student_item_stats.count_documents({}) == mysql_students, mysql_students)
check("recommendation caches cleared by the refresh", mdb.recommendations.count_documents({}) == 0)

dash = plain(page(aditi, "/student").text)
check("dashboard shows 'Recommended for you'", "Recommended for you" in dash)
cache = mdb.recommendations.find_one({"student_id": 1})
ordered = {int(r[0]) for r in sql("SELECT DISTINCT oi.menu_item_id FROM ORDERS o JOIN ORDER_ITEM oi USING(order_id) WHERE o.student_id=1 AND o.status<>'Cancelled'")}
cand = [c["menu_item_id"] for c in cache["items"]]
check("recommendations are cached and exclude already-ordered items", len(cand) > 0 and not (set(cand) & ordered), cand[:4])
names = {int(a): b for a, b in sql("SELECT menu_item_id, item_name FROM MENU_ITEM")}
canteen_of = {int(a): int(b) for a, b in sql("SELECT menu_item_id, canteen_id FROM MENU_ITEM")}
shown = [c for c in cand if names[c] in dash]
check("recommended items appear on the page", len(shown) >= 1, [names[c] for c in shown])
top = shown[0]
hider = kiran if canteen_of[top] == 1 else meena
hider.patch(B + f"/api/staff/inventory/{top}", json={"is_available": False}, timeout=T)
check("an item that becomes unavailable disappears from the recommendations", names[top] not in plain(page(aditi, "/student").text), names[top])
hider.patch(B + f"/api/staff/inventory/{top}", json={"is_available": True}, timeout=T)

aditi.post(B + "/api/cart", json={"menu_item_id": coffee, "quantity": 1}, timeout=T)
aditi.post(B + "/api/orders", json={"canteen_id": 1, "payment_method": "UPI"}, timeout=T)
check("placing an order invalidates the student's cached recommendations", mdb.recommendations.count_documents({"student_id": 1}) == 0)

new = requests.Session()
new.post(B + "/api/auth/register", json={"first_name": "Newbie", "last_name": "Student", "email": "newbie.student@pes.edu", "password": "Secret123"}, timeout=T)
check("new student without orders gets 'Popular on campus'", "Popular on campus" in plain(page(new, "/student").text))

if STOP_CMD and START_CMD:
    # ------------------------------------------------------------ MongoDB down: the rest of the app keeps working
    subprocess.run(STOP_CMD, shell=True)
    time.sleep(3)
    fallback_ok = []
    t0 = time.time()
    fallback_ok.append(page(aditi, "/student/menu").status_code == 200 and "Veg Thali" in plain(page(aditi, "/student/menu").text))
    check("menu still works without MongoDB (just no stars)", fallback_ok[-1])
    dash = plain(page(aditi, "/student").text)
    check("dashboard still works, recommendations hidden", "Welcome" in dash and "Recommended for you" not in dash)
    aditi.post(B + "/api/cart", json={"menu_item_id": thali, "quantity": 1}, timeout=T)
    r = aditi.post(B + "/api/orders", json={"canteen_id": 1, "payment_method": "UPI"}, timeout=T)
    check("placing an order still works (MySQL transaction)", r.status_code == 201, r.text)
    oid2 = r.json().get("order_id")
    for st in ("Preparing", "Ready", "Completed"):
        S(kiran, oid2, st)
    check("order page shows 'feedback unavailable' instead of crashing", "Feedback is temporarily unavailable" in plain(page(aditi, f"/student/orders/{oid2}").text))
    r = F(aditi, order_id=oid2, menu_item_id=thali, rating=4)
    check("posting feedback returns 503, not a crash", r.status_code == 503, r.status_code)
    check("staff feedback page shows a friendly notice", "temporarily unavailable" in plain(page(kiran, "/staff/feedback").text))
    check("staff order queue is unaffected", page(kiran, "/staff/orders").status_code == 200)
    print(f"   (MongoDB-down checks took {time.time() - t0:.0f}s)")

    subprocess.run(START_CMD, shell=True, capture_output=True)
    time.sleep(4)
    ok = False
    for _ in range(10):
        if "Recommended for you" in plain(page(aditi, "/student").text) or "Popular on campus" in plain(page(aditi, "/student").text):
            ok = True
            break
        time.sleep(2)
    check("everything recovers when MongoDB is back", ok)
    check("feedback works again after recovery", F(aditi, order_id=oid2, menu_item_id=thali, rating=4).status_code == 201)

else:
    print("SKIPPED: MongoDB outage checks (set TEST_MONGOD_STOP_CMD and TEST_MONGOD_START_CMD to run them)")

print(f"\n{sum(results)}/{len(results)} checks passed")
sys.exit(0 if all(results) else 1)
