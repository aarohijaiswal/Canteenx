-- =====================================================================
-- CanteenX - Step 4 test script
-- Run on a fresh database: canteenx_ddl.sql, then
-- canteenx_triggers_procedures.sql, then this file.
-- It inserts a tiny seed set (the full sample data comes in Step 5).
-- Every "expect error" test prints PASS when the database rejects it.
-- =====================================================================
USE CanteenX;

DROP PROCEDURE IF EXISTS t_expect_error;
DELIMITER $$
CREATE PROCEDURE t_expect_error(IN p_label VARCHAR(80), IN p_sql TEXT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 @err = MESSAGE_TEXT;
        SELECT p_label AS test, 'PASS (rejected)' AS result, @err AS reason;
    END;
    SET @stmt = p_sql;
    PREPARE s FROM @stmt;
    EXECUTE s;
    DEALLOCATE PREPARE s;
    SELECT p_label AS test, 'FAIL (was accepted)' AS result, NULL AS reason;
END$$
DELIMITER ;

-- ---------- seed ----------
INSERT INTO CANTEEN (canteen_name, location) VALUES ('Main Canteen', 'Block A'), ('North Canteen', 'Block D');
INSERT INTO CATEGORY (category_name) VALUES ('Snacks'), ('Meals');
INSERT INTO STAFF (canteen_id, name, role, email, password_hash) VALUES
  (1, 'Ravi',  'ADMIN', 'ravi@canteenx.in',  'hash'),
  (2, 'Meena', 'STAFF', 'meena@canteenx.in', 'hash');
INSERT INTO STUDENT (first_name, last_name, email, phone, password_hash) VALUES
  ('Asha', 'K', 'asha@pes.edu', '9876543210', 'hash'),
  ('Dev',  'M', 'dev@pes.edu',  '9123456780', 'hash');
INSERT INTO MENU_ITEM (canteen_id, category_id, item_name, price) VALUES
  (1, 1, 'Samosa', 15.00), (1, 2, 'Veg Thali', 80.00), (2, 1, 'Tea', 10.00);
INSERT INTO INVENTORY (menu_item_id, staff_id, quantity_in_stock, reorder_level) VALUES
  (1, 1, 12, 10), (2, 1, 5, 3), (3, 2, 20, 5);
INSERT INTO SUPPLIER (supplier_name, contact_no) VALUES ('Fresh Foods Co', '9000000001');
INSERT INTO SUPPLIES VALUES (1, 1);
INSERT INTO CART (student_id) VALUES (1), (2);
INSERT INTO CART_ITEM VALUES (1, 1, 3), (1, 2, 2);          -- Asha: 3 Samosa + 2 Thali = 205

-- ---------- T1: place order (transaction + triggers) ----------
CALL sp_place_order(1, 1, 'UPI', @oid);
SELECT 'T1 order'      AS test, order_id, status, total_amount FROM ORDERS WHERE order_id = @oid;
SELECT 'T1 lines'      AS test, menu_item_id, quantity, unit_price, sub_total FROM ORDER_ITEM WHERE order_id = @oid;
SELECT 'T1 stock'      AS test, menu_item_id, quantity_in_stock FROM INVENTORY ORDER BY menu_item_id;   -- 9, 3, 20
SELECT 'T1 payment'    AS test, amount, payment_status FROM PAYMENT WHERE order_id = @oid;              -- 205, Pending
SELECT 'T1 cart empty' AS test, COUNT(*) AS rows_left FROM CART_ITEM WHERE cart_id = 1;                 -- 0

-- ---------- T2: low-stock alerts created automatically ----------
SELECT 'T2 alerts' AS test, inventory_id, message, is_resolved FROM LOW_STOCK_ALERT;                    -- items 1 and 2

-- ---------- T3: insufficient stock rolls the whole order back ----------
INSERT INTO CART_ITEM VALUES (2, 2, 4);                                  -- only 3 Thali left
CALL t_expect_error('T3 insufficient stock', 'CALL sp_place_order(2, 1, ''UPI'', @x)');
SELECT 'T3 rollback' AS test, (SELECT COUNT(*) FROM ORDERS) AS orders_count,                            -- still 1
       (SELECT quantity_in_stock FROM INVENTORY WHERE menu_item_id = 2) AS thali_stock;                 -- still 3

-- ---------- T4: stock reaches zero -> item becomes unavailable ----------
UPDATE CART_ITEM SET quantity = 3 WHERE cart_id = 2 AND menu_item_id = 2;
CALL sp_place_order(2, 1, 'Cash', @oid2);
SELECT 'T4 thali' AS test, i.quantity_in_stock, m.is_available
FROM INVENTORY i JOIN MENU_ITEM m USING (menu_item_id) WHERE m.menu_item_id = 2;                        -- 0, 0

-- ---------- T5: unavailable item cannot be ordered ----------
INSERT INTO CART_ITEM VALUES (1, 2, 1);
CALL t_expect_error('T5 unavailable item', 'CALL sp_place_order(1, 1, ''UPI'', @x)');
DELETE FROM CART_ITEM WHERE cart_id = 1;

-- ---------- T6: status lifecycle, authorisation, history ----------
CALL t_expect_error('T6a skip a status', 'CALL sp_update_order_status(1, ''Completed'', 1)');
CALL t_expect_error('T6b wrong canteen staff', 'CALL sp_update_order_status(1, ''Preparing'', 2)');
CALL sp_update_order_status(1, 'Preparing', 1);
CALL sp_update_order_status(1, 'Ready', 1);
CALL sp_update_order_status(1, 'Completed', 1);
SELECT 'T6 history' AS test, old_status, new_status, changed_by FROM ORDER_STATUS_HISTORY WHERE order_id = 1 ORDER BY history_id;
CALL t_expect_error('T6c reopen completed order', 'CALL sp_update_order_status(1, ''Pending'', 1)');

-- ---------- T7: cancelling restores stock and availability ----------
CALL sp_update_order_status(@oid2, 'Cancelled', 1);
SELECT 'T7 thali' AS test, i.quantity_in_stock, m.is_available
FROM INVENTORY i JOIN MENU_ITEM m USING (menu_item_id) WHERE m.menu_item_id = 2;                        -- 3, 1

-- ---------- T8: supplier delivery restocks and resolves the alert ----------
INSERT INTO SUPPLY_LOG (supplier_id, menu_item_id, staff_id, quantity, unit_cost) VALUES (1, 1, 1, 50, 8.00);
SELECT 'T8 samosa stock' AS test, quantity_in_stock FROM INVENTORY WHERE menu_item_id = 1;              -- 59
SELECT 'T8 alert resolved' AS test, inventory_id, is_resolved FROM LOW_STOCK_ALERT ORDER BY alert_id;   -- item 1 resolved
CALL t_expect_error('T8b delivery for unlisted supplier/item', 'INSERT INTO SUPPLY_LOG (supplier_id, menu_item_id, quantity, unit_cost) VALUES (1, 2, 5, 1.00)');

-- ---------- T9: payment validation ----------
INSERT INTO ORDERS (student_id, canteen_id) VALUES (2, 1);
SET @oid3 = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@oid3, 1, 2, 15.00);
CALL t_expect_error('T9a wrong payment amount', CONCAT('INSERT INTO PAYMENT (order_id, amount, payment_method) VALUES (', @oid3, ', 99, ''UPI'')'));
INSERT INTO PAYMENT (order_id, amount, payment_method) VALUES (@oid3, 30.00, 'UPI');
CALL t_expect_error('T9b success without txn ref', CONCAT('CALL sp_confirm_payment(', @oid3, ', ''Successful'', NULL)'));
CALL sp_confirm_payment(1, 'Successful', 'TXN-0001');

-- ---------- T10: order-line rules ----------
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@oid3, 2, 1, 80.00);
UPDATE ORDER_ITEM SET quantity = 4 WHERE order_id = @oid3 AND menu_item_id = 1;
SELECT 'T10 total after edits' AS test, total_amount FROM ORDERS WHERE order_id = @oid3;                -- 4*15 + 80 = 140
CALL t_expect_error('T10a item from another canteen', CONCAT('INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (', @oid3, ', 3, 1, 10.00)'));
CALL t_expect_error('T10b edit a completed order', 'UPDATE ORDER_ITEM SET quantity = 9 WHERE order_id = 1 AND menu_item_id = 1');

-- ---------- T11: key queries / report / function ----------
CALL sp_sales_report(CURDATE(), CURDATE(), NULL);                                                       -- 1 order, 205
SELECT 'T11 popular' AS test, item_name, total_quantity_sold, times_ordered FROM v_popular_items ORDER BY total_quantity_sold DESC;
SELECT 'T11 low stock' AS test, item_name, quantity_in_stock, reorder_level FROM v_low_stock;
SELECT 'T11 favourite of student 1' AS test, fn_student_favorite_item(1) AS item;                       -- Samosa
