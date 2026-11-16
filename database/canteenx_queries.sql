-- =====================================================================
-- CanteenX - Step 5: Important queries
-- Run after canteenx_sample_data.sql.  "Sales" always means orders that
-- are Completed AND have a Successful payment.
-- =====================================================================
USE CanteenX;

-- =====================================================================
-- PART A - the four key queries from the problem statement
-- =====================================================================

-- Q1. Most frequently ordered food items (top 5)
SELECT m.item_name,
       SUM(oi.quantity)            AS total_quantity,
       COUNT(DISTINCT oi.order_id) AS times_ordered
FROM ORDER_ITEM oi
JOIN ORDERS    o ON o.order_id     = oi.order_id
JOIN MENU_ITEM m ON m.menu_item_id = oi.menu_item_id
WHERE o.status <> 'Cancelled'
GROUP BY m.menu_item_id, m.item_name
ORDER BY total_quantity DESC, times_ordered DESC
LIMIT 5;

-- Q2a. Total sales for a specified day (here: yesterday)
SET @day = DATE_SUB(CURDATE(), INTERVAL 1 DAY);

SELECT @day AS sales_day,
       COUNT(*)                      AS orders_count,
       COALESCE(SUM(o.total_amount), 0) AS total_sales
FROM ORDERS o
JOIN PAYMENT p ON p.order_id = o.order_id
WHERE o.order_date >= @day
  AND o.order_date <  DATE_ADD(@day, INTERVAL 1 DAY)
  AND o.status = 'Completed'
  AND p.payment_status = 'Successful';

-- Q2b. Total sales for a specified month (here: the current month)
SET @month_start = DATE_FORMAT(CURDATE(), '%Y-%m-01');

SELECT DATE_FORMAT(@month_start, '%M %Y') AS sales_month,
       COUNT(*)                         AS orders_count,
       COALESCE(SUM(o.total_amount), 0) AS total_sales
FROM ORDERS o
JOIN PAYMENT p ON p.order_id = o.order_id
WHERE o.order_date >= @month_start
  AND o.order_date <  DATE_ADD(@month_start, INTERVAL 1 MONTH)
  AND o.status = 'Completed'
  AND p.payment_status = 'Successful';

-- Q2c. The same through the stored procedure (any range, any canteen)
CALL sp_sales_report(@month_start, LAST_DAY(@month_start), NULL);

-- Q3. A student's most frequently ordered items (student 1)
SET @student_id = 1;

SELECT m.item_name,
       SUM(oi.quantity)            AS total_quantity,
       COUNT(DISTINCT oi.order_id) AS times_ordered
FROM ORDERS o
JOIN ORDER_ITEM oi ON oi.order_id     = o.order_id
JOIN MENU_ITEM  m  ON m.menu_item_id  = oi.menu_item_id
WHERE o.student_id = @student_id
  AND o.status <> 'Cancelled'
GROUP BY m.menu_item_id, m.item_name
ORDER BY total_quantity DESC, times_ordered DESC
LIMIT 5;

SELECT fn_student_favorite_item(@student_id) AS favourite_item;

-- Q4. Food items whose stock has fallen to or below the reorder threshold
SELECT m.item_name, c.canteen_name,
       i.quantity_in_stock, i.reorder_level,
       (i.reorder_level - i.quantity_in_stock) AS shortfall
FROM INVENTORY i
JOIN MENU_ITEM m ON m.menu_item_id = i.menu_item_id
JOIN CANTEEN   c ON c.canteen_id   = m.canteen_id
WHERE i.quantity_in_stock <= i.reorder_level
ORDER BY shortfall DESC;

-- same result straight from the view, plus the open alerts raised by the trigger
SELECT * FROM v_low_stock ORDER BY shortfall DESC;
SELECT a.alert_id, a.alert_date, a.message
FROM LOW_STOCK_ALERT a WHERE a.is_resolved = FALSE ORDER BY a.alert_date;

-- =====================================================================
-- PART B - JOIN, GROUP BY, HAVING, ORDER BY, aggregates
-- =====================================================================

-- B1. Full order detail (JOIN across 6 tables)
SELECT o.order_id, o.order_date, CONCAT(s.first_name, ' ', s.last_name) AS student,
       c.canteen_name, m.item_name, oi.quantity, oi.unit_price, oi.sub_total,
       o.status, p.payment_method, p.payment_status
FROM ORDERS o
JOIN STUDENT    s  ON s.student_id    = o.student_id
JOIN CANTEEN    c  ON c.canteen_id    = o.canteen_id
JOIN ORDER_ITEM oi ON oi.order_id     = o.order_id
JOIN MENU_ITEM  m  ON m.menu_item_id  = oi.menu_item_id
LEFT JOIN PAYMENT p ON p.order_id     = o.order_id
WHERE o.order_id = 10;

-- B2. HAVING: loyal students (3+ completed orders and more than Rs.300 spent)
SELECT CONCAT(s.first_name, ' ', s.last_name) AS student,
       COUNT(*)            AS orders_placed,
       SUM(o.total_amount) AS total_spent,
       ROUND(AVG(o.total_amount), 2) AS avg_order_value
FROM STUDENT s
JOIN ORDERS o ON o.student_id = s.student_id
WHERE o.status = 'Completed'
GROUP BY s.student_id, s.first_name, s.last_name
HAVING COUNT(*) >= 3 AND SUM(o.total_amount) > 300
ORDER BY total_spent DESC;

-- B3. Sales per canteen and payment method, with a grand total (ROLLUP)
SELECT COALESCE(c.canteen_name, 'ALL CANTEENS')    AS canteen,
       COALESCE(p.payment_method, 'ALL METHODS')   AS method,
       COUNT(*)            AS orders_count,
       SUM(o.total_amount) AS total_sales
FROM ORDERS o
JOIN PAYMENT p ON p.order_id  = o.order_id
JOIN CANTEEN  c ON c.canteen_id = o.canteen_id
WHERE o.status = 'Completed' AND p.payment_status = 'Successful'
GROUP BY c.canteen_name, p.payment_method WITH ROLLUP;

-- B4. Order value statistics per canteen (MIN / MAX / AVG / SUM)
SELECT c.canteen_name,
       COUNT(*)                      AS orders,
       MIN(o.total_amount)           AS smallest_order,
       MAX(o.total_amount)           AS largest_order,
       ROUND(AVG(o.total_amount), 2) AS average_order,
       SUM(o.total_amount)           AS revenue
FROM ORDERS o
JOIN CANTEEN c ON c.canteen_id = o.canteen_id
WHERE o.status = 'Completed'
GROUP BY c.canteen_id, c.canteen_name;

-- B5. Rush hours: orders per hour of the day
SELECT HOUR(order_date) AS hour_of_day, COUNT(*) AS orders_count
FROM ORDERS
WHERE status <> 'Cancelled'
GROUP BY HOUR(order_date)
ORDER BY orders_count DESC
LIMIT 5;

-- B6. Revenue by category (veg vs non-veg split)
SELECT cat.category_name,
       CASE WHEN m.is_veg THEN 'Veg' ELSE 'Non-veg' END AS diet,
       SUM(oi.sub_total) AS revenue
FROM ORDER_ITEM oi
JOIN ORDERS    o   ON o.order_id     = oi.order_id
JOIN MENU_ITEM m   ON m.menu_item_id = oi.menu_item_id
JOIN CATEGORY  cat ON cat.category_id = m.category_id
WHERE o.status = 'Completed'
GROUP BY cat.category_name, m.is_veg
ORDER BY revenue DESC;

-- B7. Supplier spend (total delivery cost per supplier)
SELECT sp.supplier_name,
       COUNT(*)                          AS deliveries,
       SUM(sl.quantity)                  AS units_supplied,
       ROUND(SUM(sl.quantity * sl.unit_cost), 2) AS total_cost
FROM SUPPLY_LOG sl
JOIN SUPPLIER sp ON sp.supplier_id = sl.supplier_id
GROUP BY sp.supplier_id, sp.supplier_name
ORDER BY total_cost DESC;

-- =====================================================================
-- PART C - Subqueries
-- =====================================================================

-- C1. Menu items that have never been ordered (NOT EXISTS)
--     (returns no rows with the sample data because every item has been
--      ordered; add a new menu item and it will appear here)
SELECT m.item_name
FROM MENU_ITEM m
WHERE NOT EXISTS (SELECT 1 FROM ORDER_ITEM oi WHERE oi.menu_item_id = m.menu_item_id);

-- C2. Items priced above the average price (scalar subquery)
SELECT item_name, price
FROM MENU_ITEM
WHERE price > (SELECT AVG(price) FROM MENU_ITEM)
ORDER BY price DESC;

-- C3. Students who spent more than the average student (subquery in HAVING)
SELECT s.student_id, CONCAT(s.first_name, ' ', s.last_name) AS student,
       SUM(o.total_amount) AS total_spent
FROM STUDENT s
JOIN ORDERS o ON o.student_id = s.student_id
WHERE o.status = 'Completed'
GROUP BY s.student_id, s.first_name, s.last_name
HAVING SUM(o.total_amount) > (
    SELECT AVG(student_total) FROM (
        SELECT SUM(total_amount) AS student_total
        FROM ORDERS WHERE status = 'Completed' GROUP BY student_id
    ) t
)
ORDER BY total_spent DESC;

-- C4. Each student's most recent order (correlated subquery)
SELECT o.student_id, o.order_id, o.order_date, o.total_amount, o.status
FROM ORDERS o
WHERE o.order_date = (SELECT MAX(o2.order_date) FROM ORDERS o2
                      WHERE o2.student_id = o.student_id)
ORDER BY o.student_id;

-- C5. Items that were bought together with 'Veg Thali' in the same order
--     (nested subqueries)
SELECT m.item_name, SUM(oi.quantity) AS units_with_thali
FROM ORDER_ITEM oi
JOIN MENU_ITEM m ON m.menu_item_id = oi.menu_item_id
WHERE oi.menu_item_id <> (SELECT menu_item_id FROM MENU_ITEM WHERE item_name = 'Veg Thali')
  AND oi.order_id IN (
        SELECT order_id FROM ORDER_ITEM
        WHERE menu_item_id = (SELECT menu_item_id FROM MENU_ITEM WHERE item_name = 'Veg Thali'))
GROUP BY m.menu_item_id, m.item_name
ORDER BY units_with_thali DESC;

-- =====================================================================
-- PART D - Search, filtering and tracking (used by the web app)
-- =====================================================================

-- D1. Full-text menu search (relevance scores differ between MySQL and
--     MariaDB on such a small table; the matching rows are the same)
SELECT menu_item_id, item_name, price, is_veg,
       MATCH(item_name, description) AGAINST ('paneer chicken' IN NATURAL LANGUAGE MODE) AS relevance
FROM MENU_ITEM
WHERE MATCH(item_name, description) AGAINST ('paneer chicken' IN NATURAL LANGUAGE MODE)
  AND is_available = TRUE
ORDER BY relevance DESC;

-- D2. Filter: vegetarian items under Rs.60 that are in stock
SELECT * FROM v_available_menu
WHERE is_veg = TRUE AND price < 60
ORDER BY price;

-- D3. Order tracking timeline for one order
SELECT h.changed_at, h.old_status, h.new_status, st.name AS changed_by
FROM ORDER_STATUS_HISTORY h
LEFT JOIN STAFF st ON st.staff_id = h.changed_by
WHERE h.order_id = 10
ORDER BY h.history_id;

-- D4. Live order queue for a canteen's staff (not yet completed)
SELECT o.order_id, o.order_date, o.status, o.total_amount,
       CONCAT(s.first_name, ' ', s.last_name) AS student,
       p.payment_status
FROM ORDERS o
JOIN STUDENT s ON s.student_id = o.student_id
LEFT JOIN PAYMENT p ON p.order_id = o.order_id
WHERE o.canteen_id = 1 AND o.status IN ('Pending', 'Preparing', 'Ready')
ORDER BY o.order_date;

-- D5. A student's order history
SELECT * FROM v_order_summary WHERE student_id = 1 ORDER BY order_date DESC LIMIT 10;

-- =====================================================================
-- PART E - Data for the recommendation engine (feeds MongoDB, Step 6)
-- =====================================================================

-- E1. "Students who ordered X also ordered Y" (item co-occurrence)
SELECT a.menu_item_id AS item, ma.item_name,
       b.menu_item_id AS also_ordered, mb.item_name AS also_ordered_name,
       COUNT(DISTINCT a.order_id) AS together_count
FROM ORDER_ITEM a
JOIN ORDER_ITEM b  ON b.order_id = a.order_id AND b.menu_item_id <> a.menu_item_id
JOIN MENU_ITEM ma  ON ma.menu_item_id = a.menu_item_id
JOIN MENU_ITEM mb  ON mb.menu_item_id = b.menu_item_id
GROUP BY a.menu_item_id, ma.item_name, b.menu_item_id, mb.item_name
HAVING COUNT(DISTINCT a.order_id) >= 2
ORDER BY together_count DESC
LIMIT 10;

-- =====================================================================
-- PART F - DML demonstration (INSERT / UPDATE / DELETE). Safe to re-run:
-- everything is undone at the end.
-- =====================================================================

START TRANSACTION;

INSERT INTO STUDENT (first_name, last_name, email, phone, password_hash)
VALUES ('Demo', 'User', 'demo.user@pes.edu', '9000011111', 'demo-hash');
SET @demo = LAST_INSERT_ID();

UPDATE STUDENT SET phone = '9000022222' WHERE student_id = @demo;
UPDATE MENU_ITEM SET price = price * 1.10 WHERE category_id = 3;     -- 10% rise on beverages
SELECT item_name, price FROM MENU_ITEM WHERE category_id = 3;

DELETE FROM STUDENT WHERE student_id = @demo;

ROLLBACK;     -- price change and demo user are undone
SELECT item_name, price FROM MENU_ITEM WHERE category_id = 3;
