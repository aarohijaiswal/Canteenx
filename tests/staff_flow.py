"""
CanteenX - staff / admin integration tests (order queue, payments, inventory, menu, suppliers, sales).

Run against a LOCAL development database freshly loaded with the sample data:
    npm run dev -- -p 3100        # in one terminal
    python3 tests/staff_flow.py   # in another  (needs: pip install -r tests/requirements.txt; MySQL access comes from .env.local)
It changes data. Reload database/canteenx_sample_data.sql afterwards for a clean state.
Sample accounts: kiran.rao (staff, Main), ravi.kumar (admin, Main), meena.iyer (staff, North),
sunita.das (admin, North), aditi.sharma / rohan.mehta (students) - all with Password@123.
"""
import requests, re, sys
from _helpers import sql, BASE_URL as B

T = 90
results = []

def check(name, cond, extra=""):
    results.append(bool(cond))
    print(("PASS " if cond else "FAIL ") + name + (f"  [{extra}]" if extra else ""))


def login(email):
    s = requests.Session()
    r = s.post(B + "/api/auth/login", json={"email": email, "password": "Password@123"}, timeout=T)
    assert r.ok, (email, r.text)
    return s

plain = lambda t: " ".join(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", t, flags=re.S)).split())
page = lambda s, path: s.get(B + path, timeout=T, allow_redirects=False)

aditi, rohan = login("aditi.sharma@pes.edu"), login("rohan.mehta@pes.edu")
kiran, ravi = login("kiran.rao@canteenx.in"), login("ravi.kumar@canteenx.in")
meena, sunita = login("meena.iyer@canteenx.in"), login("sunita.das@canteenx.in")
anon = requests.Session()

items = {i["item_name"]: i for i in aditi.get(B + "/api/menu", timeout=T).json()["items"]}
thali, samosa, burger = items["Veg Thali"]["menu_item_id"], items["Samosa"]["menu_item_id"], items["Veg Burger"]["menu_item_id"]
stock = lambda mid: int(sql(f"SELECT quantity_in_stock FROM INVENTORY WHERE menu_item_id={mid}")[0][0])
sql(f"UPDATE INVENTORY SET quantity_in_stock=100 WHERE menu_item_id IN ({thali},{samosa})")
sql("DELETE ci FROM CART_ITEM ci JOIN CART c USING(cart_id) WHERE c.student_id IN (1,2)")

# ------------------------------------------------------------ access control
check("signed-out staff API -> 401", anon.get(B + "/api/staff/inventory", timeout=T).status_code == 401)
check("student cannot use staff API -> 403", aditi.get(B + "/api/staff/inventory", timeout=T).status_code == 403)
check("staff cannot read admin menu API -> 403", kiran.get(B + "/api/staff/menu", timeout=T).status_code == 403)
check("staff cannot add menu items -> 403", kiran.post(B + "/api/staff/menu", json={}, timeout=T).status_code == 403)
check("staff cannot list suppliers -> 403", kiran.get(B + "/api/staff/suppliers", timeout=T).status_code == 403)
for p in ("/staff/menu", "/staff/suppliers", "/staff/sales"):
    r = page(kiran, p)
    check(f"staff opening {p} is redirected to /staff", r.status_code in (307, 308) and r.headers.get("location", "").endswith("/staff"), r.status_code)
r = page(aditi, "/staff/orders")
check("student opening /staff/orders is redirected", r.status_code in (307, 308) and r.headers.get("location", "").endswith("/student"))
check("cross-site staff POST refused", kiran.post(B + "/api/staff/orders/1/status", json={"status": "Preparing"}, headers={"Origin": "http://evil.example"}, timeout=T).status_code == 403)

# ------------------------------------------------------------ order queue, payment rule, lifecycle
aditi.post(B + "/api/cart", json={"menu_item_id": thali, "quantity": 1}, timeout=T)
oid = aditi.post(B + "/api/orders", json={"canteen_id": 1, "payment_method": "Cash"}, timeout=T).json()["order_id"]
q = plain(page(kiran, "/staff/orders").text).replace("# ", "#")
check("new order shows in the staff queue", f"#{oid}" in q and "Aditi Sharma" in q)
other = plain(page(meena, "/staff/orders").text)
check("other canteen's staff does not see it", f"#{oid} " not in other.replace("# ", "#") + " ")
S = lambda who, oid_, st: who.post(B + f"/api/staff/orders/{oid_}/status", json={"status": st}, timeout=T)
check("cannot complete an unpaid cash order", S(kiran, oid, "Completed").status_code == 409)
check("other canteen's staff cannot touch the order (404)", S(meena, oid, "Preparing").status_code == 404
      and meena.post(B + f"/api/staff/orders/{oid}/payment", timeout=T).status_code == 404)
check("confirm cash payment", kiran.post(B + f"/api/staff/orders/{oid}/payment", timeout=T).ok)
check("payment cannot be confirmed twice", kiran.post(B + f"/api/staff/orders/{oid}/payment", timeout=T).status_code == 409)
r = S(kiran, oid, "Ready")
check("cannot skip Preparing", r.status_code == 409 and "transition" in r.json()["error"].lower(), r.text)
check("Pending -> Preparing", S(kiran, oid, "Preparing").ok)
check("student sees Preparing", aditi.get(B + f"/api/orders/{oid}", timeout=T).json()["order"]["status"] == "Preparing")
check("Preparing -> Ready", S(kiran, oid, "Ready").ok)
check("Ready -> Completed", S(kiran, oid, "Completed").ok)
check("completed order cannot be cancelled", S(kiran, oid, "Cancelled").status_code == 409)
who = sql(f"SELECT old_status, new_status, changed_by FROM ORDER_STATUS_HISTORY WHERE order_id={oid} ORDER BY history_id")
check("history records which staff member made each change",
      [w[1] for w in who] == ["Pending", "Preparing", "Ready", "Completed"] and [w[2] for w in who[1:]] == ["3", "3", "3"], who)

# staff cancel restores stock and refunds
aditi.post(B + "/api/cart", json={"menu_item_id": samosa, "quantity": 4}, timeout=T)
s0 = stock(samosa)
oid2 = aditi.post(B + "/api/orders", json={"canteen_id": 1, "payment_method": "UPI"}, timeout=T).json()["order_id"]
check("stock reduced by order", stock(samosa) == s0 - 4)
check("staff cancels a Pending order", S(kiran, oid2, "Cancelled").ok)
check("stock restored", stock(samosa) == s0)
st = sql(f"SELECT payment_status FROM PAYMENT WHERE order_id={oid2}")[0][0]
check("paid order becomes Refunded", st == "Refunded", st)
check("finished list shows both orders", all(f"#{n}" in plain(page(kiran, "/staff/orders?view=done").text).replace("# ", "#") for n in (oid, oid2)))

# ------------------------------------------------------------ inventory
inv = kiran.get(B + "/api/staff/inventory", timeout=T).json()["items"]
check("inventory lists only own canteen (12 items)", len(inv) == 12, len(inv))
thali_inv = next(i for i in inv if i["menu_item_id"] == thali)
sup_ok = thali_inv["suppliers"][0]["supplier_id"]
R = lambda who, mid, **b: who.post(B + f"/api/staff/inventory/{mid}/restock", json=b, timeout=T)
before = stock(thali)
r = R(kiran, thali, supplier_id=sup_ok, quantity=25, unit_cost=40)
check("restock via a linked supplier", r.status_code == 201 and stock(thali) == before + 25 and r.json()["quantity_in_stock"] == before + 25, r.text)
row = sql("SELECT staff_id FROM SUPPLY_LOG ORDER BY supply_id DESC LIMIT 1")[0][0]
check("delivery logged with the staff member", row == "3")
r = R(kiran, thali, supplier_id=4, quantity=5, unit_cost=1)
check("supplier that does not supply the item is rejected", r.status_code == 409, r.text)
check("quantity 0 rejected", R(kiran, thali, supplier_id=sup_ok, quantity=0, unit_cost=1).status_code == 400)
check("negative cost rejected", R(kiran, thali, supplier_id=sup_ok, quantity=5, unit_cost=-1).status_code == 400)
check("other canteen's staff cannot restock this item", R(meena, thali, supplier_id=sup_ok, quantity=5, unit_cost=1).status_code == 404)
P = lambda who, mid, **b: who.patch(B + f"/api/staff/inventory/{mid}", json=b, timeout=T)
check("raising the reorder level raises a low-stock alert", P(kiran, thali, reorder_level=500).ok
      and sql(f"SELECT COUNT(*) FROM LOW_STOCK_ALERT a JOIN INVENTORY i USING(inventory_id) WHERE i.menu_item_id={thali} AND a.is_resolved=0")[0][0] == "1")
check("alert shows on the inventory page", "Low stock: Veg Thali" in plain(page(kiran, "/staff/inventory").text))
check("lowering the level resolves the alert", P(kiran, thali, reorder_level=10).ok
      and sql(f"SELECT COUNT(*) FROM LOW_STOCK_ALERT a JOIN INVENTORY i USING(inventory_id) WHERE i.menu_item_id={thali} AND a.is_resolved=0")[0][0] == "0")
check("invalid reorder level rejected", P(kiran, thali, reorder_level=-3).status_code == 400)
check("other canteen cannot change this item (404)", P(meena, thali, reorder_level=5).status_code == 404)
check("staff can hide an item", P(kiran, samosa, is_available=False).ok)
menu = {i["item_name"]: i for i in aditi.get(B + "/api/menu", timeout=T).json()["items"]}
check("hidden item is unavailable for students", menu["Samosa"]["available"] is False)
check("student cannot add the hidden item to the cart", aditi.post(B + "/api/cart", json={"menu_item_id": samosa, "quantity": 1}, timeout=T).status_code == 409)
P(kiran, samosa, is_available=True)

# ------------------------------------------------------------ admin: menu management
cats = {c[1]: int(c[0]) for c in sql("SELECT category_id, category_name FROM CATEGORY")}
new = dict(item_name="Test Wrap", description="Test item", price=55, category_id=cats["Snacks"], is_veg=True, initial_stock=5, reorder_level=8)
r = ravi.post(B + "/api/staff/menu", json=new, timeout=T)
nid = r.json().get("menu_item_id")
check("admin adds a menu item with stock", r.status_code == 201 and stock(nid) == 5, r.text)
check("low opening stock raised an alert immediately", sql(f"SELECT COUNT(*) FROM LOW_STOCK_ALERT a JOIN INVENTORY i USING(inventory_id) WHERE i.menu_item_id={nid}")[0][0] == "1")
check("new item appears on the student menu", "Test Wrap" in [i["item_name"] for i in aditi.get(B + "/api/menu", timeout=T).json()["items"]])
check("duplicate name in the same canteen rejected", ravi.post(B + "/api/staff/menu", json=new, timeout=T).status_code == 409)
check("invalid price rejected", ravi.post(B + "/api/staff/menu", json={**new, "item_name": "Bad Price", "price": -5}, timeout=T).status_code == 400)
check("unknown category rejected", ravi.post(B + "/api/staff/menu", json={**new, "item_name": "No Cat", "category_id": 999}, timeout=T).status_code == 400)
check("admin edits the price", ravi.patch(B + f"/api/staff/menu/{nid}", json={"price": 60}, timeout=T).ok
      and float(sql(f"SELECT price FROM MENU_ITEM WHERE menu_item_id={nid}")[0][0]) == 60)
check("empty edit rejected", ravi.patch(B + f"/api/staff/menu/{nid}", json={}, timeout=T).status_code == 400)
check("admin of another canteen cannot edit it (404)", sunita.patch(B + f"/api/staff/menu/{nid}", json={"price": 1}, timeout=T).status_code == 404)
check("admin of another canteen cannot delete it (404)", sunita.delete(B + f"/api/staff/menu/{nid}", timeout=T).status_code == 404)
check("item with order history cannot be deleted", ravi.delete(B + f"/api/staff/menu/{thali}", timeout=T).status_code == 409)
check("unused item can be deleted", ravi.delete(B + f"/api/staff/menu/{nid}", timeout=T).ok
      and sql(f"SELECT COUNT(*) FROM MENU_ITEM WHERE menu_item_id={nid}")[0][0] == "0"
      and sql(f"SELECT COUNT(*) FROM INVENTORY WHERE menu_item_id={nid}")[0][0] == "0")

# ------------------------------------------------------------ admin: suppliers
r = ravi.post(B + "/api/staff/suppliers", json={"supplier_name": "Test Traders", "contact_no": "9998887776", "address": "1 Test Road"}, timeout=T)
sid = r.json().get("supplier_id")
check("admin adds a supplier", r.status_code == 201, r.text)
check("bad phone number rejected", ravi.post(B + "/api/staff/suppliers", json={"supplier_name": "X Co", "contact_no": "123"}, timeout=T).status_code == 400)
check("admin edits a supplier", ravi.patch(B + f"/api/staff/suppliers/{sid}", json={"supplier_name": "Test Traders Ltd", "contact_no": "9998887776"}, timeout=T).ok)
check("link supplier to an item", ravi.post(B + f"/api/staff/suppliers/{sid}/items", json={"menu_item_id": samosa}, timeout=T).status_code == 201)
check("linking twice rejected", ravi.post(B + f"/api/staff/suppliers/{sid}/items", json={"menu_item_id": samosa}, timeout=T).status_code == 409)
check("cannot link an item of another canteen", ravi.post(B + f"/api/staff/suppliers/{sid}/items", json={"menu_item_id": burger}, timeout=T).status_code == 404)
check("staff can now restock with the new link", R(kiran, samosa, supplier_id=sid, quantity=10, unit_cost=5).status_code == 201)
check("link with deliveries cannot be removed", ravi.delete(B + f"/api/staff/suppliers/{sid}/items", params={"menu_item_id": samosa}, timeout=T).status_code == 409)
check("link without deliveries can be removed", ravi.post(B + f"/api/staff/suppliers/{sid}/items", json={"menu_item_id": thali}, timeout=T).status_code == 201
      and ravi.delete(B + f"/api/staff/suppliers/{sid}/items", params={"menu_item_id": thali}, timeout=T).ok)

# ------------------------------------------------------------ pages and sales numbers
for who, name, path, needle in [
    (kiran, "staff", "/staff", "Open orders"), (kiran, "staff", "/staff/orders", "Orders"), (kiran, "staff", "/staff/inventory", "Recent deliveries"),
    (ravi, "admin", "/staff/menu", "Menu management"), (ravi, "admin", "/staff/suppliers", "Test Traders Ltd"),
    (ravi, "admin", "/staff/sales", "Revenue per day"), (ravi, "admin", "/staff", "Sales today"),
]:
    check(f"{name} page {path} renders", page(who, path).status_code == 200 and needle in plain(page(who, path).text), needle)
for rng, days in (("7d", 6), ("30d", 29), ("today", 0)):
    expected = sql(f"""SELECT COALESCE(SUM(o.total_amount),0), COUNT(*) FROM ORDERS o JOIN PAYMENT p USING(order_id)
                      WHERE o.canteen_id=1 AND o.status='Completed' AND p.payment_status='Successful'
                      AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL {days} DAY)""")[0]
    t = plain(page(ravi, f"/staff/sales?range={rng}").text)
    m = re.search(r"Revenue\s+₹\s?([\d,]+(?:\.\d+)?)\s+Orders\s+(\d+)", t)
    got = (float(m.group(1).replace(",", "")), int(m.group(2))) if m else None
    check(f"sales page ({rng}) matches the database", got == (float(expected[0]), int(expected[1])), f"page={got} sql={expected}")
t = plain(page(sunita, "/staff/sales").text)
check("other canteen's admin sees only their own sales", "North Canteen" in plain(page(sunita, "/staff").text) and re.search(r"Orders\s+(\d+)", t) is not None)

print(f"\n{sum(results)}/{len(results)} checks passed")
sys.exit(0 if all(results) else 1)
