-- 03_views.sql
-- 视图：已售商品视图、未售商品视图

CREATE OR REPLACE VIEW sold_item_view AS
SELECT i.item_id, i.item_name, o.buyer_id
FROM item i
JOIN orders o ON o.item_id = i.item_id;

CREATE OR REPLACE VIEW unsold_item_view AS
SELECT i.item_id, i.item_name, i.category, i.price, i.seller_id
FROM item i
WHERE i.status = 0;
