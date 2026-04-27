-- 04_business_logic.sql
-- SQL业务逻辑：购买商品（插入订单 + 修改商品状态）

CREATE OR REPLACE FUNCTION purchase_item(
  p_order_id TEXT,
  p_item_id TEXT,
  p_buyer_id TEXT,
  p_order_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_status SMALLINT;
  v_seller_id TEXT;
BEGIN
  -- 锁定商品行，防止并发购买
  SELECT status, seller_id INTO v_status, v_seller_id
  FROM item
  WHERE item_id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '商品不存在: %', p_item_id;
  END IF;

  IF v_status = 1 THEN
    RAISE EXCEPTION '商品已售出，不能重复购买: %', p_item_id;
  END IF;

  IF p_buyer_id = v_seller_id THEN
    RAISE EXCEPTION '购买失败：不允许自卖自买（item_id=%）', p_item_id;
  END IF;

  -- 按题目要求：先写 orders，再改 item.status
  INSERT INTO orders(order_id, item_id, buyer_id, order_date)
  VALUES (p_order_id, p_item_id, p_buyer_id, p_order_date);

  UPDATE item
  SET status = 1
  WHERE item_id = p_item_id;
END;
$$;
