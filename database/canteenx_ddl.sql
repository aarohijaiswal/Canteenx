-- =====================================================================
-- CanteenX - Smart College Canteen Management System
-- DDL script (MySQL 8.0.16+)  |  Step 3: tables, constraints, indexes, views
-- Triggers, stored procedures and sample data come in later steps.
-- =====================================================================

DROP DATABASE IF EXISTS CanteenX;
CREATE DATABASE CanteenX CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE CanteenX;

-- ---------------------------------------------------------------------
-- 1. CREATE TABLES (in dependency order, so no table is referenced
--    before it exists)
-- ---------------------------------------------------------------------

CREATE TABLE CANTEEN (
    canteen_id    INT PRIMARY KEY AUTO_INCREMENT,
    canteen_name  VARCHAR(100) NOT NULL,
    location      VARCHAR(150),
    contact_no    VARCHAR(15)
) ENGINE=InnoDB;

CREATE TABLE CATEGORY (
    category_id    INT PRIMARY KEY AUTO_INCREMENT,
    category_name  VARCHAR(100) NOT NULL UNIQUE,
    description    VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE SUPPLIER (
    supplier_id    INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name  VARCHAR(100) NOT NULL,
    contact_no     VARCHAR(15),
    address        VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE STUDENT (
    student_id     INT PRIMARY KEY AUTO_INCREMENT,
    first_name     VARCHAR(50)  NOT NULL,
    last_name      VARCHAR(50)  NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    phone          VARCHAR(15),
    password_hash  VARCHAR(255) NOT NULL,          -- bcrypt hash, never plain text
    role           VARCHAR(20)  NOT NULL DEFAULT 'STUDENT',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_student_role  CHECK (role = 'STUDENT'),
    CONSTRAINT chk_student_email CHECK (email LIKE '%_@_%._%')
) ENGINE=InnoDB;

CREATE TABLE STAFF (
    staff_id       INT PRIMARY KEY AUTO_INCREMENT,
    canteen_id     INT NOT NULL,
    name           VARCHAR(100) NOT NULL,
    role           VARCHAR(20)  NOT NULL DEFAULT 'STAFF',
    email          VARCHAR(100) NOT NULL UNIQUE,
    phone          VARCHAR(15),
    password_hash  VARCHAR(255) NOT NULL,          -- bcrypt hash, never plain text
    CONSTRAINT fk_staff_canteen FOREIGN KEY (canteen_id)
        REFERENCES CANTEEN(canteen_id),
    CONSTRAINT chk_staff_role  CHECK (role IN ('STAFF', 'ADMIN')),
    CONSTRAINT chk_staff_email CHECK (email LIKE '%_@_%._%')
) ENGINE=InnoDB;

CREATE TABLE MENU_ITEM (
    menu_item_id  INT PRIMARY KEY AUTO_INCREMENT,
    canteen_id    INT NOT NULL,
    category_id   INT NOT NULL,
    item_name     VARCHAR(100)  NOT NULL,
    description   VARCHAR(255),
    price         DECIMAL(10,2) NOT NULL,
    is_veg        BOOLEAN NOT NULL DEFAULT TRUE,
    is_available  BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_menu_canteen  FOREIGN KEY (canteen_id)
        REFERENCES CANTEEN(canteen_id),
    CONSTRAINT fk_menu_category FOREIGN KEY (category_id)
        REFERENCES CATEGORY(category_id),
    CONSTRAINT uq_menu_canteen_item UNIQUE (canteen_id, item_name),
    CONSTRAINT chk_menu_price CHECK (price > 0)
) ENGINE=InnoDB;

CREATE TABLE CART (
    cart_id     INT PRIMARY KEY AUTO_INCREMENT,
    student_id  INT NOT NULL UNIQUE,                -- one active cart per student
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_student FOREIGN KEY (student_id)
        REFERENCES STUDENT(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE CART_ITEM (
    cart_id       INT NOT NULL,
    menu_item_id  INT NOT NULL,
    quantity      INT NOT NULL DEFAULT 1,
    PRIMARY KEY (cart_id, menu_item_id),
    CONSTRAINT fk_cartitem_cart FOREIGN KEY (cart_id)
        REFERENCES CART(cart_id) ON DELETE CASCADE,
    CONSTRAINT fk_cartitem_menu FOREIGN KEY (menu_item_id)
        REFERENCES MENU_ITEM(menu_item_id),
    CONSTRAINT chk_cartitem_qty CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE TABLE ORDERS (
    order_id      INT PRIMARY KEY AUTO_INCREMENT,
    student_id    INT NOT NULL,
    canteen_id    INT NOT NULL,
    order_date    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status        VARCHAR(20) NOT NULL DEFAULT 'Pending',
    total_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_order_student FOREIGN KEY (student_id)
        REFERENCES STUDENT(student_id),
    CONSTRAINT fk_order_canteen FOREIGN KEY (canteen_id)
        REFERENCES CANTEEN(canteen_id),
    CONSTRAINT chk_order_status CHECK
        (status IN ('Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled')),
    CONSTRAINT chk_order_amount CHECK (total_amount >= 0)
) ENGINE=InnoDB;

CREATE TABLE ORDER_ITEM (
    order_item_id  INT PRIMARY KEY AUTO_INCREMENT,
    order_id       INT NOT NULL,
    menu_item_id   INT NOT NULL,
    quantity       INT NOT NULL,
    unit_price     DECIMAL(10,2) NOT NULL,          -- price snapshot at order time
    sub_total      DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id)
        REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_orderitem_menu  FOREIGN KEY (menu_item_id)
        REFERENCES MENU_ITEM(menu_item_id),
    CONSTRAINT uq_orderitem_line UNIQUE (order_id, menu_item_id),
    CONSTRAINT chk_orderitem_qty   CHECK (quantity > 0),
    CONSTRAINT chk_orderitem_price CHECK (unit_price >= 0)
) ENGINE=InnoDB;

CREATE TABLE PAYMENT (
    payment_id       INT PRIMARY KEY AUTO_INCREMENT,
    order_id         INT NOT NULL UNIQUE,            -- one payment per order
    payment_date     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount           DECIMAL(10,2) NOT NULL,
    payment_method   VARCHAR(30) NOT NULL,
    payment_status   VARCHAR(20) NOT NULL DEFAULT 'Pending',
    transaction_ref  VARCHAR(100) UNIQUE,
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id)
        REFERENCES ORDERS(order_id),
    CONSTRAINT chk_payment_amount CHECK (amount >= 0),
    CONSTRAINT chk_payment_method CHECK
        (payment_method IN ('UPI', 'Card', 'Cash', 'Wallet')),
    CONSTRAINT chk_payment_status CHECK
        (payment_status IN ('Pending', 'Successful', 'Failed', 'Refunded'))
) ENGINE=InnoDB;

CREATE TABLE INVENTORY (
    inventory_id       INT PRIMARY KEY AUTO_INCREMENT,
    menu_item_id       INT NOT NULL UNIQUE,          -- one stock record per item
    staff_id           INT NULL,                     -- staff who last managed it
    quantity_in_stock  INT NOT NULL DEFAULT 0,
    reorder_level      INT NOT NULL DEFAULT 10,
    last_updated       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                       ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_menu  FOREIGN KEY (menu_item_id)
        REFERENCES MENU_ITEM(menu_item_id),
    CONSTRAINT fk_inventory_staff FOREIGN KEY (staff_id)
        REFERENCES STAFF(staff_id) ON DELETE SET NULL,
    CONSTRAINT chk_inventory_qty     CHECK (quantity_in_stock >= 0),
    CONSTRAINT chk_inventory_reorder CHECK (reorder_level >= 0)
) ENGINE=InnoDB;

CREATE TABLE LOW_STOCK_ALERT (
    alert_id      INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id  INT NOT NULL,
    alert_date    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message       VARCHAR(255),
    is_resolved   BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_alert_inventory FOREIGN KEY (inventory_id)
        REFERENCES INVENTORY(inventory_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE SUPPLIES (
    supplier_id   INT NOT NULL,
    menu_item_id  INT NOT NULL,
    PRIMARY KEY (supplier_id, menu_item_id),
    CONSTRAINT fk_supplies_supplier FOREIGN KEY (supplier_id)
        REFERENCES SUPPLIER(supplier_id),
    CONSTRAINT fk_supplies_menu FOREIGN KEY (menu_item_id)
        REFERENCES MENU_ITEM(menu_item_id)
) ENGINE=InnoDB;

CREATE TABLE SUPPLY_LOG (
    supply_id     INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id   INT NOT NULL,
    menu_item_id  INT NOT NULL,
    staff_id      INT NULL,                          -- staff who received delivery
    quantity      INT NOT NULL,
    unit_cost     DECIMAL(10,2) NOT NULL,
    supply_date   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- a delivery is only valid for a supplier/item pair that exists in SUPPLIES
    CONSTRAINT fk_supplylog_supplies FOREIGN KEY (supplier_id, menu_item_id)
        REFERENCES SUPPLIES(supplier_id, menu_item_id),
    CONSTRAINT fk_supplylog_staff FOREIGN KEY (staff_id)
        REFERENCES STAFF(staff_id) ON DELETE SET NULL,
    CONSTRAINT chk_supplylog_qty  CHECK (quantity > 0),
    CONSTRAINT chk_supplylog_cost CHECK (unit_cost >= 0)
) ENGINE=InnoDB;

CREATE TABLE ORDER_STATUS_HISTORY (
    history_id   INT PRIMARY KEY AUTO_INCREMENT,
    order_id     INT NOT NULL,
    old_status   VARCHAR(20) NULL,
    new_status   VARCHAR(20) NOT NULL,
    changed_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by   INT NULL,                           -- staff, NULL if system-driven
    CONSTRAINT fk_history_order FOREIGN KEY (order_id)
        REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_history_staff FOREIGN KEY (changed_by)
        REFERENCES STAFF(staff_id) ON DELETE SET NULL,
    CONSTRAINT chk_history_new CHECK
        (new_status IN ('Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'))
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. INDEXES
--    (MySQL already indexes every foreign key column, so only indexes
--     that serve real queries are added here.)
-- ---------------------------------------------------------------------

-- order history per student, newest first
CREATE INDEX idx_orders_student_date ON ORDERS (student_id, order_date);
-- daily/monthly sales reports and staff order queues
CREATE INDEX idx_orders_canteen_status_date ON ORDERS (canteen_id, status, order_date);
-- popular-items and per-item analytics
CREATE INDEX idx_orderitem_menu ON ORDER_ITEM (menu_item_id, quantity);
-- payment reconciliation
CREATE INDEX idx_payment_status_date ON PAYMENT (payment_status, payment_date);
-- supplier delivery reports
CREATE INDEX idx_supplylog_date ON SUPPLY_LOG (supply_date);
-- status timeline of an order
CREATE INDEX idx_history_order_time ON ORDER_STATUS_HISTORY (order_id, changed_at);
-- unresolved alerts
CREATE INDEX idx_alert_resolved ON LOW_STOCK_ALERT (is_resolved, alert_date);
-- filter menu by availability / diet type
CREATE INDEX idx_menu_filter ON MENU_ITEM (is_available, is_veg, price);
-- full-text menu search
CREATE FULLTEXT INDEX ft_menu_search ON MENU_ITEM (item_name, description);

-- ---------------------------------------------------------------------
-- 3. ALTER TABLE (additional constraints added after creation)
-- ---------------------------------------------------------------------

ALTER TABLE STUDENT
    ADD CONSTRAINT chk_student_phone
    CHECK (phone IS NULL OR phone REGEXP '^[0-9]{10}$');

ALTER TABLE STAFF
    ADD CONSTRAINT chk_staff_phone
    CHECK (phone IS NULL OR phone REGEXP '^[0-9]{10}$');

ALTER TABLE PAYMENT
    ADD CONSTRAINT chk_payment_success_ref
    CHECK (payment_status <> 'Successful' OR transaction_ref IS NOT NULL);

-- ---------------------------------------------------------------------
-- 4. VIEWS
-- ---------------------------------------------------------------------

-- Menu shown to students: only items that are available and in stock
CREATE VIEW v_available_menu AS
SELECT m.menu_item_id, c.canteen_name, cat.category_name, m.item_name,
       m.description, m.price, m.is_veg, i.quantity_in_stock
FROM MENU_ITEM m
JOIN CANTEEN  c   ON c.canteen_id   = m.canteen_id
JOIN CATEGORY cat ON cat.category_id = m.category_id
JOIN INVENTORY i  ON i.menu_item_id = m.menu_item_id
WHERE m.is_available = TRUE AND i.quantity_in_stock > 0;

-- Items at or below their reorder level (low-stock alerts)
CREATE VIEW v_low_stock AS
SELECT i.inventory_id, m.menu_item_id, m.item_name, c.canteen_name,
       i.quantity_in_stock, i.reorder_level,
       (i.reorder_level - i.quantity_in_stock) AS shortfall
FROM INVENTORY i
JOIN MENU_ITEM m ON m.menu_item_id = i.menu_item_id
JOIN CANTEEN   c ON c.canteen_id   = m.canteen_id
WHERE i.quantity_in_stock <= i.reorder_level;

-- Most frequently ordered items (excluding cancelled orders)
CREATE VIEW v_popular_items AS
SELECT m.menu_item_id, m.item_name,
       SUM(oi.quantity)            AS total_quantity_sold,
       COUNT(DISTINCT oi.order_id) AS times_ordered
FROM ORDER_ITEM oi
JOIN ORDERS    o ON o.order_id     = oi.order_id
JOIN MENU_ITEM m ON m.menu_item_id = oi.menu_item_id
WHERE o.status <> 'Cancelled'
GROUP BY m.menu_item_id, m.item_name;

-- Daily sales: completed orders with a successful payment
CREATE VIEW v_daily_sales AS
SELECT DATE(o.order_date)  AS sales_date,
       o.canteen_id,
       COUNT(*)            AS orders_count,
       SUM(o.total_amount) AS total_sales
FROM ORDERS o
JOIN PAYMENT p ON p.order_id = o.order_id
WHERE o.status = 'Completed' AND p.payment_status = 'Successful'
GROUP BY DATE(o.order_date), o.canteen_id;

-- Student order history with payment info
CREATE VIEW v_order_summary AS
SELECT o.order_id, o.student_id, o.canteen_id, o.order_date, o.status,
       o.total_amount, p.payment_method, p.payment_status
FROM ORDERS o
LEFT JOIN PAYMENT p ON p.order_id = o.order_id;

-- ---------------------------------------------------------------------
-- 5. DROP (demonstration only: create a scratch table/view, then drop it)
-- ---------------------------------------------------------------------

CREATE TABLE temp_demo (id INT PRIMARY KEY);
CREATE VIEW  v_temp_demo AS SELECT id FROM temp_demo;
DROP VIEW  v_temp_demo;
DROP TABLE temp_demo;

-- Verification
SHOW TABLES;
