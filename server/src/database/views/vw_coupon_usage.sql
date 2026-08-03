-- =====================================================
-- vw_coupon_usage.sql
-- Redemption summary per coupon
-- =====================================================

USE ecommerce_db;

CREATE OR REPLACE VIEW vw_coupon_usage AS
SELECT
    c.coupon_id,
    c.code,
    c.discount_type,
    c.discount_value,
    c.usage_limit,
    COUNT(cu.usage_id) AS times_used,
    SUM(cu.discount_applied) AS total_discount_given
FROM coupons c
LEFT JOIN coupon_usage cu ON cu.coupon_id = c.coupon_id
GROUP BY c.coupon_id;
