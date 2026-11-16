-- =====================================================================
-- CanteenX - Step 5: Sample data
-- Run AFTER canteenx_ddl.sql and canteenx_triggers_procedures.sql
-- on a fresh database (do not run canteenx_step4_tests.sql first).
--
-- * Orders are inserted through the normal tables, so the triggers fire
--   exactly as they would in the app (stock, totals, status history).
-- * Dates are relative to CURDATE(), so "today / this month" reports
--   always have data.
-- * DEV ONLY: every sample student and staff account uses the password
--   Password@123 (stored as a bcrypt hash, never in plain text).
-- =====================================================================
USE CanteenX;

-- MySQL Workbench enables 'safe updates' by default, which rejects UPDATEs that have no key in
-- the WHERE clause (one statement below needs that). Turn it off for this session only.
SET SQL_SAFE_UPDATES = 0;

INSERT INTO CANTEEN (canteen_name, location, contact_no) VALUES
  ('Main Canteen', 'Academic Block A, Ground Floor', '8001000001'),
  ('North Canteen', 'Block D, Near Library', '8001000002');

INSERT INTO CATEGORY (category_name, description) VALUES
  ('Snacks', 'Quick bites and fried items'),
  ('Meals', 'Full meals and rice dishes'),
  ('Beverages', 'Hot and cold drinks'),
  ('Desserts', 'Sweets and baked treats'),
  ('Breakfast', 'South Indian breakfast items');

INSERT INTO STAFF (canteen_id, name, role, email, phone, password_hash) VALUES
  (1, 'Ravi Kumar', 'ADMIN', 'ravi.kumar@canteenx.in', '8002000001', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  (2, 'Meena Iyer', 'STAFF', 'meena.iyer@canteenx.in', '8002000002', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  (1, 'Kiran Rao', 'STAFF', 'kiran.rao@canteenx.in', '8002000003', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  (2, 'Sunita Das', 'ADMIN', 'sunita.das@canteenx.in', '8002000004', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2');

INSERT INTO STUDENT (first_name, last_name, email, phone, password_hash) VALUES
  ('Aditi', 'Sharma', 'aditi.sharma@pes.edu', '9800550000', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  ('Rohan', 'Mehta', 'rohan.mehta@pes.edu', '9801550001', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  ('Priya', 'Nair', 'priya.nair@pes.edu', '9802550002', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  ('Arjun', 'Reddy', 'arjun.reddy@pes.edu', '9803550003', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  ('Sneha', 'Patil', 'sneha.patil@pes.edu', '9804550004', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  ('Karthik', 'Iyer', 'karthik.iyer@pes.edu', '9805550005', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  ('Ananya', 'Gupta', 'ananya.gupta@pes.edu', '9806550006', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  ('Vikram', 'Singh', 'vikram.singh@pes.edu', '9807550007', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  ('Isha', 'Verma', 'isha.verma@pes.edu', '9808550008', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  ('Nikhil', 'Joshi', 'nikhil.joshi@pes.edu', '9809550009', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  ('Divya', 'Menon', 'divya.menon@pes.edu', '9810550010', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2'),
  ('Rahul', 'Bose', 'rahul.bose@pes.edu', '9811550011', '$2b$10$gPrZztrE9Xp0uomQMBuF6ukUievlXz5KIfuS83VLRDsymINxsMjh2');

INSERT INTO SUPPLIER (supplier_name, contact_no, address) VALUES
  ('Fresh Foods Co', '9000000001', 'Plot 12, Peenya Industrial Area, Bengaluru'),
  ('Daily Dairy Pvt Ltd', '9000000002', '14 Dairy Road, Yelahanka, Bengaluru'),
  ('Spice Route Traders', '9000000003', '7 Spice Market, KR Market, Bengaluru'),
  ('Campus Bakers', '9000000004', '22 Bakery Lane, Banashankari, Bengaluru');

INSERT INTO MENU_ITEM (canteen_id, category_id, item_name, description, price, is_veg) VALUES
  (1, 1, 'Samosa', 'Crispy fried pastry stuffed with spiced potato and peas', 15.00, 1),
  (1, 1, 'Veg Puff', 'Flaky baked puff with spiced vegetable filling', 20.00, 1),
  (1, 1, 'Chicken Puff', 'Flaky baked puff with spicy chicken filling', 30.00, 0),
  (1, 5, 'Masala Dosa', 'Crisp rice crepe with potato masala and chutneys', 50.00, 1),
  (1, 5, 'Idli Sambar', 'Steamed rice cakes served with sambar and chutney', 35.00, 1),
  (1, 2, 'Veg Thali', 'Rice, chapati, dal, two curries, curd and pickle', 80.00, 1),
  (1, 2, 'Chicken Biryani', 'Fragrant basmati rice cooked with spiced chicken', 120.00, 0),
  (1, 2, 'Paneer Wrap', 'Grilled paneer tikka with onions and mint chutney in a wrap', 70.00, 1),
  (1, 2, 'Veg Fried Rice', 'Wok tossed rice with mixed vegetables and soy', 75.00, 1),
  (1, 3, 'Filter Coffee', 'Traditional South Indian filter coffee', 20.00, 1),
  (1, 3, 'Masala Chai', 'Hot milk tea brewed with ginger and cardamom', 12.00, 1),
  (1, 4, 'Gulab Jamun', 'Soft milk dumplings soaked in sugar syrup', 25.00, 1),
  (2, 2, 'Veg Burger', 'Crispy vegetable patty burger with lettuce and mayo', 60.00, 1),
  (2, 2, 'Chicken Burger', 'Grilled chicken patty burger with cheese and lettuce', 90.00, 0),
  (2, 1, 'French Fries', 'Golden salted potato fries', 50.00, 1),
  (2, 3, 'Cold Coffee', 'Chilled coffee blended with milk and ice cream', 55.00, 1),
  (2, 3, 'Lime Soda', 'Fresh lime with soda, sweet or salted', 30.00, 1),
  (2, 4, 'Chocolate Brownie', 'Warm fudgy chocolate brownie', 45.00, 1),
  (2, 1, 'Egg Roll', 'Egg and onion filled paratha roll', 45.00, 0),
  (2, 1, 'Maggi', 'Masala noodles cooked with vegetables', 40.00, 1);

INSERT INTO INVENTORY (menu_item_id, staff_id, quantity_in_stock, reorder_level) VALUES
  (1, 1, 400, 20),
  (2, 1, 400, 15),
  (3, 1, 400, 15),
  (4, 1, 400, 15),
  (5, 1, 400, 15),
  (6, 1, 400, 10),
  (7, 1, 400, 10),
  (8, 1, 400, 10),
  (9, 1, 400, 10),
  (10, 1, 400, 20),
  (11, 1, 400, 25),
  (12, 1, 400, 15),
  (13, 2, 400, 10),
  (14, 2, 400, 10),
  (15, 2, 400, 15),
  (16, 2, 400, 12),
  (17, 2, 400, 15),
  (18, 2, 400, 10),
  (19, 2, 400, 12),
  (20, 2, 400, 12);

INSERT INTO SUPPLIES (supplier_id, menu_item_id) VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4),
  (1, 5),
  (1, 6),
  (1, 7),
  (1, 8),
  (1, 9),
  (1, 13),
  (1, 14),
  (1, 15),
  (1, 19),
  (1, 20),
  (2, 10),
  (2, 11),
  (2, 16),
  (2, 17),
  (3, 6),
  (3, 7),
  (3, 8),
  (3, 9),
  (3, 14),
  (3, 19),
  (4, 2),
  (4, 3),
  (4, 12),
  (4, 18);

-- historical deliveries (the supply-log trigger adds them to inventory)
INSERT INTO SUPPLY_LOG (supplier_id, menu_item_id, staff_id, quantity, unit_cost, supply_date) VALUES
  (1, 13, 2, 50, 35.79, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 30 DAY), '07:30:00')),
  (1, 6, 1, 80, 39.48, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 7 DAY), '07:30:00')),
  (3, 14, 2, 50, 48.21, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 14 DAY), '07:30:00')),
  (1, 9, 1, 80, 34.91, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 40 DAY), '07:30:00')),
  (1, 8, 1, 100, 32.52, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 17 DAY), '07:30:00')),
  (4, 12, 1, 50, 13.57, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 9 DAY), '07:30:00')),
  (2, 10, 1, 120, 11.33, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 36 DAY), '07:30:00')),
  (3, 7, 1, 120, 60.51, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 34 DAY), '07:30:00')),
  (4, 18, 2, 80, 24.97, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 20 DAY), '07:30:00')),
  (4, 2, 1, 50, 10.72, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 20 DAY), '07:30:00')),
  (1, 20, 2, 120, 23.25, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 38 DAY), '07:30:00')),
  (4, 3, 1, 100, 16.24, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 33 DAY), '07:30:00')),
  (2, 11, 1, 50, 6.32, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 9 DAY), '07:30:00')),
  (3, 9, 1, 100, 35.46, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 15 DAY), '07:30:00')),
  (1, 1, 1, 120, 6.84, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 36 DAY), '07:30:00')),
  (1, 7, 1, 100, 60.12, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 9 DAY), '07:30:00')),
  (2, 16, 2, 120, 29.53, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 27 DAY), '07:30:00')),
  (3, 19, 2, 50, 25.92, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 34 DAY), '07:30:00'));

-- =====================  ORDERS (72)  =====================

-- order 1: day-44, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (1, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 44 DAY), '13:09:35'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 3, 2, 30.00), (@o, 10, 1, 20.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100001', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 2: day-44, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (9, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 44 DAY), '08:16:13'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 20, 1, 40.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Card' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100002', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 3: day-43, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (5, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 43 DAY), '14:52:58'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 8, 2, 70.00), (@o, 10, 1, 20.00), (@o, 12, 2, 25.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100003', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 4: day-42, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (8, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 42 DAY), '15:39:46'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 15, 1, 50.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Card' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100004', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 5: day-42, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (11, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 42 DAY), '11:12:17'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 9, 1, 75.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Cash' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'CASH100005', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 6: day-41, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (9, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 41 DAY), '12:28:32'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 4, 2, 50.00), (@o, 8, 2, 70.00), (@o, 10, 2, 20.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Wallet' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100006', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 7: day-41, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (9, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 41 DAY), '14:07:25'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 20, 2, 40.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100007', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 8: day-40, Cancelled
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 40 DAY), '12:56:08'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 3, 2, 30.00), (@o, 6, 1, 80.00), (@o, 11, 3, 12.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Wallet' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Failed' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Cancelled' WHERE order_id = @o;

-- order 9: day-40, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (3, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 40 DAY), '13:20:05'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 19, 3, 45.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100009', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 10: day-37, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (9, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 37 DAY), '16:04:07'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 6, 1, 80.00), (@o, 10, 1, 20.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100010', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 11: day-37, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (1, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 37 DAY), '10:34:58'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 14, 2, 90.00), (@o, 17, 2, 30.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100011', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 12: day-35, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (2, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 35 DAY), '12:01:40'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 7, 1, 120.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Cash' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'CASH100012', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 13: day-35, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (10, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 35 DAY), '16:26:59'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 13, 1, 60.00), (@o, 17, 2, 30.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100013', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 14: day-34, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (2, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 34 DAY), '12:40:19'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 20, 2, 40.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Cash' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'CASH100014', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 15: day-34, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (8, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 34 DAY), '12:02:00'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 12, 1, 25.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Cash' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'CASH100015', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 16: day-33, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (9, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 33 DAY), '14:32:19'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 7, 3, 120.00), (@o, 8, 1, 70.00), (@o, 11, 1, 12.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100016', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 17: day-33, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 33 DAY), '12:27:10'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 13, 1, 60.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100017', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 18: day-32, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (9, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 32 DAY), '15:11:10'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 17, 1, 30.00), (@o, 20, 2, 40.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100018', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 19: day-32, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (6, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 32 DAY), '12:13:22'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 16, 1, 55.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100019', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 20: day-32, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (2, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 32 DAY), '16:49:00'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 1, 1, 15.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100020', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 21: day-31, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (3, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 31 DAY), '17:33:54'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 4, 1, 50.00), (@o, 5, 3, 35.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Wallet' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100021', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 22: day-31, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (6, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 31 DAY), '16:40:27'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 15, 3, 50.00), (@o, 16, 3, 55.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Cash' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'CASH100022', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 23: day-31, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (9, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 31 DAY), '08:02:08'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 16, 3, 55.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100023', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 24: day-30, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 30 DAY), '12:00:29'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 13, 1, 60.00), (@o, 16, 3, 55.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Wallet' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100024', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 25: day-26, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (11, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 26 DAY), '12:15:46'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 5, 1, 35.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100025', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 26: day-26, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (8, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 26 DAY), '17:40:41'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 20, 1, 40.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100026', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 27: day-26, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (6, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 26 DAY), '15:03:31'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 3, 1, 30.00), (@o, 10, 3, 20.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100027', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 28: day-26, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (11, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 26 DAY), '16:12:19'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 8, 1, 70.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Wallet' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100028', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 29: day-24, Cancelled
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (5, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 24 DAY), '09:37:05'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 4, 1, 50.00), (@o, 5, 3, 35.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Card' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Refunded', transaction_ref = 'TXN100029' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Cancelled' WHERE order_id = @o;

-- order 30: day-23, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (11, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 23 DAY), '15:57:56'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 6, 2, 80.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100030', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 31: day-23, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (1, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 23 DAY), '13:24:20'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 15, 1, 50.00), (@o, 17, 1, 30.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100031', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 32: day-23, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 23 DAY), '13:04:25'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 1, 2, 15.00), (@o, 5, 2, 35.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100032', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 33: day-23, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (5, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 23 DAY), '12:27:32'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 14, 1, 90.00), (@o, 15, 1, 50.00), (@o, 17, 1, 30.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Cash' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'CASH100033', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 34: day-20, Cancelled
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (1, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 20 DAY), '14:28:39'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 14, 1, 90.00), (@o, 16, 3, 55.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Wallet' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Refunded', transaction_ref = 'TXN100034' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Cancelled' WHERE order_id = @o;

-- order 35: day-18, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (9, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 18 DAY), '12:25:41'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 3, 1, 30.00), (@o, 5, 1, 35.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100035', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 36: day-17, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (2, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 17 DAY), '13:48:28'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 1, 2, 15.00), (@o, 4, 1, 50.00), (@o, 8, 2, 70.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100036', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 37: day-17, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (3, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 17 DAY), '14:24:26'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 4, 3, 50.00), (@o, 5, 2, 35.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100037', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 38: day-15, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (6, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 15 DAY), '16:33:40'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 16, 1, 55.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100038', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 39: day-15, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 15 DAY), '10:02:27'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 3, 3, 30.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Cash' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'CASH100039', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 40: day-15, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (10, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 15 DAY), '11:09:09'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 4, 2, 50.00), (@o, 9, 3, 75.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100040', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 41: day-15, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (2, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 15 DAY), '17:58:02'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 1, 3, 15.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Cash' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'CASH100041', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 42: day-14, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (11, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 14 DAY), '09:19:33'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 2, 2, 20.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100042', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 43: day-14, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (4, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 14 DAY), '11:30:33'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 17, 1, 30.00), (@o, 18, 2, 45.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100043', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 44: day-14, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (12, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 14 DAY), '12:14:42'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 18, 2, 45.00), (@o, 19, 1, 45.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100044', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 45: day-13, Cancelled
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (12, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 13 DAY), '08:51:18'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 7, 3, 120.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Cash' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Refunded', transaction_ref = 'CASH100045' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Cancelled' WHERE order_id = @o;

-- order 46: day-13, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (4, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 13 DAY), '12:48:56'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 8, 1, 70.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100046', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 47: day-13, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (10, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 13 DAY), '08:13:01'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 1, 2, 15.00), (@o, 3, 1, 30.00), (@o, 9, 2, 75.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100047', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 48: day-13, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (3, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 13 DAY), '09:59:10'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 12, 1, 25.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100048', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 49: day-13, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (1, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 13 DAY), '08:05:17'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 3, 1, 30.00), (@o, 6, 1, 80.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100049', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 50: day-12, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (9, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 12 DAY), '08:45:30'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 19, 1, 45.00), (@o, 20, 1, 40.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Card' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100050', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 51: day-12, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (4, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 12 DAY), '14:02:24'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 1, 1, 15.00), (@o, 7, 2, 120.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100051', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 52: day-12, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (5, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 12 DAY), '17:02:16'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 5, 3, 35.00), (@o, 10, 3, 20.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Card' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100052', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 53: day-11, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (5, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 11 DAY), '11:06:30'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 2, 3, 20.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Wallet' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100053', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 54: day-11, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (5, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 11 DAY), '08:51:59'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 20, 3, 40.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100054', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 55: day-11, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (10, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 11 DAY), '10:15:26'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 2, 1, 20.00), (@o, 4, 3, 50.00), (@o, 6, 1, 80.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100055', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 56: day-10, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (3, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 10 DAY), '09:26:31'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 14, 3, 90.00), (@o, 17, 2, 30.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100056', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 57: day-9, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 9 DAY), '12:18:17'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 11, 2, 12.00), (@o, 12, 1, 25.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100057', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 58: day-8, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (4, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 8 DAY), '12:56:58'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 1, 2, 15.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100058', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 59: day-8, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 8 DAY), '09:00:30'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 2, 1, 20.00), (@o, 5, 2, 35.00), (@o, 8, 1, 70.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100059', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 60: day-7, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (4, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 7 DAY), '13:32:55'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 1, 1, 15.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100060', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 61: day-7, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (11, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 7 DAY), '08:23:21'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 17, 1, 30.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100061', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 62: day-7, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (1, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 7 DAY), '17:19:04'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 1, 1, 15.00), (@o, 6, 1, 80.00), (@o, 7, 2, 120.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Card' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100062', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 63: day-6, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '10:25:44'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 5, 1, 35.00), (@o, 9, 2, 75.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Wallet' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100063', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 64: day-6, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '13:41:12'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 16, 2, 55.00), (@o, 19, 3, 45.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100064', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 65: day-4, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '10:08:00'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 16, 1, 55.00), (@o, 18, 2, 45.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 4;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100065', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 66: day-4, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (2, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '10:22:18'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 9, 1, 75.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Card' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100066', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 67: day-2, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (2, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '08:58:30'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 5, 1, 35.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100067', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 68: day-1, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (2, 2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:36:13'));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 16, 1, 55.00), (@o, 19, 2, 45.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Wallet' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 2;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100068', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;

-- order 69: day-0, Pending
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 1, DATE_SUB(NOW(), INTERVAL 9 MINUTE));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 5, 3, 35.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Cash' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;

-- order 70: day-0, Preparing
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (7, 1, DATE_SUB(NOW(), INTERVAL 54 MINUTE));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 5, 3, 35.00), (@o, 7, 1, 120.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100070', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;

-- order 71: day-0, Ready
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (3, 1, DATE_SUB(NOW(), INTERVAL 63 MINUTE));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 8, 1, 70.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'Cash' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 3;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'CASH100071', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;

-- order 72: day-0, Completed
INSERT INTO ORDERS (student_id, canteen_id, order_date) VALUES (2, 1, DATE_SUB(NOW(), INTERVAL 89 MINUTE));
SET @o = LAST_INSERT_ID();
INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price) VALUES (@o, 5, 1, 35.00);
INSERT INTO PAYMENT (order_id, amount, payment_method) SELECT order_id, total_amount, 'UPI' FROM ORDERS WHERE order_id = @o;
SET @current_staff_id = 1;
UPDATE PAYMENT SET payment_status = 'Successful', transaction_ref = 'TXN100072', payment_date = (SELECT DATE_ADD(order_date, INTERVAL 1 MINUTE) FROM ORDERS WHERE order_id = @o) WHERE order_id = @o;
UPDATE ORDERS SET status = 'Preparing' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Ready' WHERE order_id = @o;
UPDATE ORDERS SET status = 'Completed' WHERE order_id = @o;
SET @current_staff_id = NULL;

-- give the status-history rows realistic timestamps (6 minutes apart,
-- starting at the order time) instead of the load time
CREATE TEMPORARY TABLE tmp_hist AS
SELECT history_id,
       ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY history_id) - 1 AS seq
FROM ORDER_STATUS_HISTORY;

UPDATE ORDER_STATUS_HISTORY h
JOIN tmp_hist t ON t.history_id = h.history_id
JOIN ORDERS o   ON o.order_id   = h.order_id
SET h.changed_at = DATE_ADD(o.order_date, INTERVAL t.seq * 6 MINUTE);

DROP TEMPORARY TABLE tmp_hist;

-- final stock levels: a few items deliberately low / out of stock so the
-- low-stock alerts, views and availability trigger have something to show
UPDATE INVENTORY SET quantity_in_stock = 85 WHERE menu_item_id = 1;
UPDATE INVENTORY SET quantity_in_stock = 8 WHERE menu_item_id = 2;
UPDATE INVENTORY SET quantity_in_stock = 60 WHERE menu_item_id = 3;
UPDATE INVENTORY SET quantity_in_stock = 70 WHERE menu_item_id = 4;
UPDATE INVENTORY SET quantity_in_stock = 55 WHERE menu_item_id = 5;
UPDATE INVENTORY SET quantity_in_stock = 40 WHERE menu_item_id = 6;
UPDATE INVENTORY SET quantity_in_stock = 4 WHERE menu_item_id = 7;
UPDATE INVENTORY SET quantity_in_stock = 35 WHERE menu_item_id = 8;
UPDATE INVENTORY SET quantity_in_stock = 45 WHERE menu_item_id = 9;
UPDATE INVENTORY SET quantity_in_stock = 90 WHERE menu_item_id = 10;
UPDATE INVENTORY SET quantity_in_stock = 120 WHERE menu_item_id = 11;
UPDATE INVENTORY SET quantity_in_stock = 30 WHERE menu_item_id = 12;
UPDATE INVENTORY SET quantity_in_stock = 38 WHERE menu_item_id = 13;
UPDATE INVENTORY SET quantity_in_stock = 22 WHERE menu_item_id = 14;
UPDATE INVENTORY SET quantity_in_stock = 6 WHERE menu_item_id = 15;
UPDATE INVENTORY SET quantity_in_stock = 0 WHERE menu_item_id = 16;
UPDATE INVENTORY SET quantity_in_stock = 50 WHERE menu_item_id = 17;
UPDATE INVENTORY SET quantity_in_stock = 25 WHERE menu_item_id = 18;
UPDATE INVENTORY SET quantity_in_stock = 28 WHERE menu_item_id = 19;
UPDATE INVENTORY SET quantity_in_stock = 40 WHERE menu_item_id = 20;

INSERT INTO CART (student_id) SELECT student_id FROM STUDENT;
INSERT INTO CART_ITEM (cart_id, menu_item_id, quantity) VALUES (1, 6, 1), (1, 10, 2), (4, 13, 2), (4, 15, 1), (7, 4, 1);

-- quick check
SELECT 'orders' AS what, COUNT(*) AS n FROM ORDERS UNION ALL
SELECT 'order_items', COUNT(*) FROM ORDER_ITEM UNION ALL
SELECT 'payments', COUNT(*) FROM PAYMENT UNION ALL
SELECT 'status_history', COUNT(*) FROM ORDER_STATUS_HISTORY UNION ALL
SELECT 'open_low_stock_alerts', COUNT(*) FROM LOW_STOCK_ALERT WHERE is_resolved = FALSE;
