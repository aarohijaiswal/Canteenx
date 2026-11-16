-- =====================================================================
-- CanteenX - Step 4: Triggers, stored procedures, stored function
-- Run AFTER canteenx_ddl.sql   (MySQL 8.0.16+)
-- =====================================================================
USE CanteenX;

DROP TRIGGER IF EXISTS trg_orders_bu_status_flow;
DROP TRIGGER IF EXISTS trg_orders_ai_history;
DROP TRIGGER IF EXISTS trg_orders_au_history;
DROP TRIGGER IF EXISTS trg_orders_au_cancel_restock;
DROP TRIGGER IF EXISTS trg_orderitem_bi_validate;
DROP TRIGGER IF EXISTS trg_orderitem_ai_stock;
DROP TRIGGER IF EXISTS trg_orderitem_ai_total;
DROP TRIGGER IF EXISTS trg_orderitem_bu_validate;
DROP TRIGGER IF EXISTS trg_orderitem_au_stock;
DROP TRIGGER IF EXISTS trg_orderitem_au_total;
DROP TRIGGER IF EXISTS trg_orderitem_bd_validate;
DROP TRIGGER IF EXISTS trg_orderitem_ad_stock;
DROP TRIGGER IF EXISTS trg_orderitem_ad_total;
DROP TRIGGER IF EXISTS trg_inventory_ai_lowstock;
DROP TRIGGER IF EXISTS trg_inventory_au_lowstock;
DROP TRIGGER IF EXISTS trg_inventory_au_availability;
DROP TRIGGER IF EXISTS trg_supplylog_ai_restock;
DROP TRIGGER IF EXISTS trg_payment_bi_validate;
DROP TRIGGER IF EXISTS trg_payment_bu_validate;
DROP PROCEDURE IF EXISTS sp_place_order;
DROP PROCEDURE IF EXISTS sp_update_order_status;
DROP PROCEDURE IF EXISTS sp_confirm_payment;
DROP PROCEDURE IF EXISTS sp_sales_report;
DROP FUNCTION  IF EXISTS fn_student_favorite_item;

DELIMITER $$

-- =====================================================================
-- A. ORDERS triggers
-- =====================================================================

-- A1. Enforce the order lifecycle:
--     Pending -> Preparing -> Ready -> Completed ; Cancelled only before Ready
CREATE TRIGGER trg_orders_bu_status_flow
BEFORE UPDATE ON ORDERS FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN
        IF NOT (
               (OLD.status = 'Pending'   AND NEW.status IN ('Preparing', 'Cancelled'))
            OR (OLD.status = 'Preparing' AND NEW.status IN ('Ready', 'Cancelled'))
            OR (OLD.status = 'Ready'     AND NEW.status = 'Completed')
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Invalid order status transition';
        END IF;
    END IF;
END$$

-- A2. Order status history: record the initial status of a new order
CREATE TRIGGER trg_orders_ai_history
AFTER INSERT ON ORDERS FOR EACH ROW
BEGIN
    INSERT INTO ORDER_STATUS_HISTORY (order_id, old_status, new_status, changed_by)
    VALUES (NEW.order_id, NULL, NEW.status, @current_staff_id);
END$$

-- A3. Order status history: record every later status change
--     (the application sets @current_staff_id before updating status)
CREATE TRIGGER trg_orders_au_history
AFTER UPDATE ON ORDERS FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO ORDER_STATUS_HISTORY (order_id, old_status, new_status, changed_by)
        VALUES (NEW.order_id, OLD.status, NEW.status, @current_staff_id);
    END IF;
END$$

-- A4. Cancelling an order puts the reserved stock back
CREATE TRIGGER trg_orders_au_cancel_restock
AFTER UPDATE ON ORDERS FOR EACH ROW
FOLLOWS trg_orders_au_history
BEGIN
    IF NEW.status = 'Cancelled' AND OLD.status <> 'Cancelled' THEN
        UPDATE INVENTORY i
        JOIN ORDER_ITEM oi ON oi.menu_item_id = i.menu_item_id
        SET i.quantity_in_stock = i.quantity_in_stock + oi.quantity
        WHERE oi.order_id = NEW.order_id;
    END IF;
END$$

-- =====================================================================
-- B. ORDER_ITEM triggers
-- =====================================================================

-- B1. Validate a new order line
CREATE TRIGGER trg_orderitem_bi_validate
BEFORE INSERT ON ORDER_ITEM FOR EACH ROW
BEGIN
    DECLARE v_status        VARCHAR(20);
    DECLARE v_order_canteen INT;
    DECLARE v_item_canteen  INT;
    DECLARE v_available     BOOLEAN;

    SELECT status, canteen_id INTO v_status, v_order_canteen
    FROM ORDERS WHERE order_id = NEW.order_id;

    SELECT canteen_id, is_available INTO v_item_canteen, v_available
    FROM MENU_ITEM WHERE menu_item_id = NEW.menu_item_id;

    IF v_status <> 'Pending' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Items can only be added to a Pending order';
    END IF;
    IF v_item_canteen <> v_order_canteen THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Menu item does not belong to the canteen of this order';
    END IF;
    IF v_available = FALSE THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Menu item is not available';
    END IF;
END$$

-- B2. Inventory update: reduce stock when an item is ordered.
--     The conditional UPDATE is atomic, so two students can never
--     both take the last portion.
CREATE TRIGGER trg_orderitem_ai_stock
AFTER INSERT ON ORDER_ITEM FOR EACH ROW
BEGIN
    UPDATE INVENTORY
    SET quantity_in_stock = quantity_in_stock - NEW.quantity
    WHERE menu_item_id = NEW.menu_item_id
      AND quantity_in_stock >= NEW.quantity;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient stock for the requested quantity';
    END IF;
END$$

-- B3. Order total: recalculate after an order line is inserted
CREATE TRIGGER trg_orderitem_ai_total
AFTER INSERT ON ORDER_ITEM FOR EACH ROW
FOLLOWS trg_orderitem_ai_stock
BEGIN
    UPDATE ORDERS
    SET total_amount = (SELECT COALESCE(SUM(sub_total), 0)
                        FROM ORDER_ITEM WHERE order_id = NEW.order_id)
    WHERE order_id = NEW.order_id;
END$$

-- B4. Order lines are only editable while the order is Pending,
--     and cannot be moved to another order or item
CREATE TRIGGER trg_orderitem_bu_validate
BEFORE UPDATE ON ORDER_ITEM FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    SELECT status INTO v_status FROM ORDERS WHERE order_id = OLD.order_id;

    IF v_status <> 'Pending' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Order items can only be changed on a Pending order';
    END IF;
    IF NEW.order_id <> OLD.order_id OR NEW.menu_item_id <> OLD.menu_item_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'An order line cannot be moved to another order or item';
    END IF;
END$$

-- B5. Quantity change: adjust stock by the difference
CREATE TRIGGER trg_orderitem_au_stock
AFTER UPDATE ON ORDER_ITEM FOR EACH ROW
BEGIN
    IF NEW.quantity > OLD.quantity THEN
        UPDATE INVENTORY
        SET quantity_in_stock = quantity_in_stock - (NEW.quantity - OLD.quantity)
        WHERE menu_item_id = NEW.menu_item_id
          AND quantity_in_stock >= (NEW.quantity - OLD.quantity);
        IF ROW_COUNT() = 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Insufficient stock for the requested quantity';
        END IF;
    ELSEIF NEW.quantity < OLD.quantity THEN
        UPDATE INVENTORY
        SET quantity_in_stock = quantity_in_stock + (OLD.quantity - NEW.quantity)
        WHERE menu_item_id = NEW.menu_item_id;
    END IF;
END$$

-- B6. Order total: recalculate after a quantity / price change
CREATE TRIGGER trg_orderitem_au_total
AFTER UPDATE ON ORDER_ITEM FOR EACH ROW
FOLLOWS trg_orderitem_au_stock
BEGIN
    UPDATE ORDERS
    SET total_amount = (SELECT COALESCE(SUM(sub_total), 0)
                        FROM ORDER_ITEM WHERE order_id = NEW.order_id)
    WHERE order_id = NEW.order_id;
END$$

-- B7. Lines can only be removed from a Pending order
CREATE TRIGGER trg_orderitem_bd_validate
BEFORE DELETE ON ORDER_ITEM FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    SELECT status INTO v_status FROM ORDERS WHERE order_id = OLD.order_id;
    IF v_status <> 'Pending' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Order items can only be removed from a Pending order';
    END IF;
END$$

-- B8. Removed line: put stock back
CREATE TRIGGER trg_orderitem_ad_stock
AFTER DELETE ON ORDER_ITEM FOR EACH ROW
BEGIN
    UPDATE INVENTORY
    SET quantity_in_stock = quantity_in_stock + OLD.quantity
    WHERE menu_item_id = OLD.menu_item_id;
END$$

-- B9. Removed line: recalculate order total
CREATE TRIGGER trg_orderitem_ad_total
AFTER DELETE ON ORDER_ITEM FOR EACH ROW
FOLLOWS trg_orderitem_ad_stock
BEGIN
    UPDATE ORDERS
    SET total_amount = (SELECT COALESCE(SUM(sub_total), 0)
                        FROM ORDER_ITEM WHERE order_id = OLD.order_id)
    WHERE order_id = OLD.order_id;
END$$

-- =====================================================================
-- C. INVENTORY triggers
-- =====================================================================

-- C1. Low-stock alert for a newly created inventory record
CREATE TRIGGER trg_inventory_ai_lowstock
AFTER INSERT ON INVENTORY FOR EACH ROW
BEGIN
    DECLARE v_name VARCHAR(100);
    IF NEW.quantity_in_stock <= NEW.reorder_level THEN
        SELECT item_name INTO v_name FROM MENU_ITEM WHERE menu_item_id = NEW.menu_item_id;
        INSERT INTO LOW_STOCK_ALERT (inventory_id, message)
        VALUES (NEW.inventory_id,
                CONCAT('Low stock: ', v_name, ' (', NEW.quantity_in_stock,
                       ' left, reorder level ', NEW.reorder_level, ')'));
    END IF;
END$$

-- C2. Low-stock trigger: raise one alert when stock falls to the reorder
--     level, and resolve open alerts once it is restocked above it
CREATE TRIGGER trg_inventory_au_lowstock
AFTER UPDATE ON INVENTORY FOR EACH ROW
BEGIN
    DECLARE v_name VARCHAR(100);

    IF NEW.quantity_in_stock <= NEW.reorder_level THEN
        IF NOT EXISTS (SELECT 1 FROM LOW_STOCK_ALERT
                       WHERE inventory_id = NEW.inventory_id AND is_resolved = FALSE) THEN
            SELECT item_name INTO v_name FROM MENU_ITEM WHERE menu_item_id = NEW.menu_item_id;
            INSERT INTO LOW_STOCK_ALERT (inventory_id, message)
            VALUES (NEW.inventory_id,
                    CONCAT('Low stock: ', v_name, ' (', NEW.quantity_in_stock,
                           ' left, reorder level ', NEW.reorder_level, ')'));
        END IF;
    ELSE
        UPDATE LOW_STOCK_ALERT
        SET is_resolved = TRUE
        WHERE inventory_id = NEW.inventory_id AND is_resolved = FALSE;
    END IF;
END$$

-- C3. Food availability: stock hits zero -> item becomes unavailable;
--     restocked from zero -> item becomes available again
CREATE TRIGGER trg_inventory_au_availability
AFTER UPDATE ON INVENTORY FOR EACH ROW
FOLLOWS trg_inventory_au_lowstock
BEGIN
    IF OLD.quantity_in_stock > 0 AND NEW.quantity_in_stock = 0 THEN
        UPDATE MENU_ITEM SET is_available = FALSE WHERE menu_item_id = NEW.menu_item_id;
    ELSEIF OLD.quantity_in_stock = 0 AND NEW.quantity_in_stock > 0 THEN
        UPDATE MENU_ITEM SET is_available = TRUE WHERE menu_item_id = NEW.menu_item_id;
    END IF;
END$$

-- =====================================================================
-- D. SUPPLY_LOG trigger
-- =====================================================================

-- D1. A recorded delivery adds to inventory
CREATE TRIGGER trg_supplylog_ai_restock
AFTER INSERT ON SUPPLY_LOG FOR EACH ROW
BEGIN
    UPDATE INVENTORY
    SET quantity_in_stock = quantity_in_stock + NEW.quantity,
        staff_id = COALESCE(NEW.staff_id, staff_id)
    WHERE menu_item_id = NEW.menu_item_id;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No inventory record exists for this menu item';
    END IF;
END$$

-- =====================================================================
-- E. PAYMENT triggers
-- =====================================================================

-- E1. A payment must match the order total and cannot be made for a
--     cancelled order
CREATE TRIGGER trg_payment_bi_validate
BEFORE INSERT ON PAYMENT FOR EACH ROW
BEGIN
    DECLARE v_total  DECIMAL(10,2);
    DECLARE v_status VARCHAR(20);

    SELECT total_amount, status INTO v_total, v_status
    FROM ORDERS WHERE order_id = NEW.order_id;

    IF v_status = 'Cancelled' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot record a payment for a cancelled order';
    END IF;
    IF NEW.amount <> v_total THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Payment amount does not match the order total';
    END IF;
END$$

-- E2. The paid amount and order can never be edited afterwards
CREATE TRIGGER trg_payment_bu_validate
BEFORE UPDATE ON PAYMENT FOR EACH ROW
BEGIN
    IF NEW.amount <> OLD.amount OR NEW.order_id <> OLD.order_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Payment amount and order cannot be changed';
    END IF;
END$$

-- =====================================================================
-- F. STORED PROCEDURES
-- =====================================================================

-- F1. Place an order from the student's cart in ONE transaction:
--     create order -> copy cart lines (triggers reduce stock and compute
--     the total) -> create the pending payment -> empty that part of the
--     cart.  Any failure rolls everything back.
--     The cart lines are first staged in a temporary table because the
--     inventory triggers update MENU_ITEM, and MySQL forbids a trigger
--     from updating a table that the triggering statement is reading.
CREATE PROCEDURE sp_place_order(
    IN  p_student_id      INT,
    IN  p_canteen_id      INT,
    IN  p_payment_method  VARCHAR(30),
    OUT p_order_id        INT
)
BEGIN
    DECLARE v_cart_id INT;
    DECLARE v_items   INT DEFAULT 0;
    DECLARE v_total   DECIMAL(10,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        DROP TEMPORARY TABLE IF EXISTS tmp_order_lines;
        SET p_order_id = NULL;
        RESIGNAL;
    END;

    DROP TEMPORARY TABLE IF EXISTS tmp_order_lines;
    CREATE TEMPORARY TABLE tmp_order_lines (
        menu_item_id INT NOT NULL,
        quantity     INT NOT NULL,
        unit_price   DECIMAL(10,2) NOT NULL
    );

    START TRANSACTION;

    SELECT cart_id INTO v_cart_id FROM CART WHERE student_id = p_student_id;

    INSERT INTO tmp_order_lines (menu_item_id, quantity, unit_price)
    SELECT ci.menu_item_id, ci.quantity, m.price
    FROM CART_ITEM ci
    JOIN MENU_ITEM m ON m.menu_item_id = ci.menu_item_id
    WHERE ci.cart_id = v_cart_id AND m.canteen_id = p_canteen_id;

    SELECT COUNT(*) INTO v_items FROM tmp_order_lines;

    IF v_cart_id IS NULL OR v_items = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cart has no items for this canteen';
    END IF;

    INSERT INTO ORDERS (student_id, canteen_id) VALUES (p_student_id, p_canteen_id);
    SET p_order_id = LAST_INSERT_ID();

    INSERT INTO ORDER_ITEM (order_id, menu_item_id, quantity, unit_price)
    SELECT p_order_id, menu_item_id, quantity, unit_price
    FROM tmp_order_lines;

    SELECT total_amount INTO v_total FROM ORDERS WHERE order_id = p_order_id;

    INSERT INTO PAYMENT (order_id, amount, payment_method)
    VALUES (p_order_id, v_total, p_payment_method);

    DELETE ci FROM CART_ITEM ci
    JOIN tmp_order_lines t ON t.menu_item_id = ci.menu_item_id
    WHERE ci.cart_id = v_cart_id;

    COMMIT;
    DROP TEMPORARY TABLE IF EXISTS tmp_order_lines;
END$$

-- F2. Staff changes an order's status. Staff may only act on orders of
--     their own canteen; the history trigger records who did it.
CREATE PROCEDURE sp_update_order_status(
    IN p_order_id   INT,
    IN p_new_status VARCHAR(20),
    IN p_staff_id   INT
)
BEGIN
    DECLARE v_order_canteen INT;
    DECLARE v_staff_canteen INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET @current_staff_id = NULL;
        RESIGNAL;
    END;

    SELECT canteen_id INTO v_order_canteen FROM ORDERS WHERE order_id = p_order_id;
    SELECT canteen_id INTO v_staff_canteen FROM STAFF  WHERE staff_id = p_staff_id;

    IF v_order_canteen IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not found';
    END IF;
    IF v_staff_canteen IS NULL OR v_staff_canteen <> v_order_canteen THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Staff member is not authorised for this canteen';
    END IF;

    SET @current_staff_id = p_staff_id;
    UPDATE ORDERS SET status = p_new_status WHERE order_id = p_order_id;
    SET @current_staff_id = NULL;
END$$

-- F3. Record the outcome of a payment (online gateway result or cash received)
CREATE PROCEDURE sp_confirm_payment(
    IN p_order_id  INT,
    IN p_status    VARCHAR(20),
    IN p_txn_ref   VARCHAR(100)
)
BEGIN
    UPDATE PAYMENT
    SET payment_status  = p_status,
        transaction_ref = p_txn_ref,
        payment_date    = CURRENT_TIMESTAMP
    WHERE order_id = p_order_id;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment record not found';
    END IF;
END$$

-- F4. Sales report for any date range (one day, one month, ...).
--     p_canteen_id = NULL means all canteens.
CREATE PROCEDURE sp_sales_report(
    IN p_from       DATE,
    IN p_to         DATE,
    IN p_canteen_id INT
)
BEGIN
    SELECT sales_date, canteen_id, orders_count, total_sales
    FROM v_daily_sales
    WHERE sales_date BETWEEN p_from AND p_to
      AND (p_canteen_id IS NULL OR canteen_id = p_canteen_id)
    ORDER BY sales_date, canteen_id;

    SELECT COALESCE(SUM(orders_count), 0) AS total_orders,
           COALESCE(SUM(total_sales), 0)  AS grand_total
    FROM v_daily_sales
    WHERE sales_date BETWEEN p_from AND p_to
      AND (p_canteen_id IS NULL OR canteen_id = p_canteen_id);
END$$

-- =====================================================================
-- G. STORED FUNCTION
-- =====================================================================

-- G1. A student's most frequently ordered item (used for recommendations)
CREATE FUNCTION fn_student_favorite_item(p_student_id INT)
RETURNS VARCHAR(100)
READS SQL DATA
BEGIN
    DECLARE v_item VARCHAR(100);

    SELECT m.item_name INTO v_item
    FROM ORDERS o
    JOIN ORDER_ITEM oi ON oi.order_id = o.order_id
    JOIN MENU_ITEM  m  ON m.menu_item_id = oi.menu_item_id
    WHERE o.student_id = p_student_id AND o.status <> 'Cancelled'
    GROUP BY m.menu_item_id, m.item_name
    ORDER BY SUM(oi.quantity) DESC, m.item_name
    LIMIT 1;

    RETURN v_item;
END$$

DELIMITER ;
