-- =====================================================================
-- CanteenX - least-privilege MySQL account for the web application
-- Run once as an administrator (root), AFTER the schema exists.
--
-- 1. Replace REPLACE_WITH_A_STRONG_PASSWORD below (both places, same value).
--    Use letters and digits; avoid quote characters.
-- 2. Put the same password in .env.local as MYSQL_PASSWORD.
--
-- The app account can read/write data and call procedures, but it can
-- NOT create, alter or drop tables, so a compromised app cannot wreck
-- the schema. It is created for 'localhost' and '127.0.0.1' because
-- MySQL treats those as two different hosts.
-- =====================================================================
CREATE USER IF NOT EXISTS 'canteenx_app'@'localhost'
    IDENTIFIED BY 'REPLACE_WITH_A_STRONG_PASSWORD';
CREATE USER IF NOT EXISTS 'canteenx_app'@'127.0.0.1'
    IDENTIFIED BY 'REPLACE_WITH_A_STRONG_PASSWORD';

GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE, CREATE TEMPORARY TABLES
    ON CanteenX.* TO 'canteenx_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE, CREATE TEMPORARY TABLES
    ON CanteenX.* TO 'canteenx_app'@'127.0.0.1';

FLUSH PRIVILEGES;
