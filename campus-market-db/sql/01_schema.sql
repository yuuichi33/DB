-- 01_schema.sql
-- 校园二手交易平台：基础表结构 + 约束 + 一致性触发器

CREATE TABLE IF NOT EXISTS "user" (
  user_id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 为历史数据补默认密码哈希（默认密码：Campus123!）
UPDATE "user"
SET password_hash = 'sha256$init$c05a9b3ad2dd9f02454251ced1ab93ce0aa62b053c38112df69d7041222527df'
WHERE password_hash IS NULL OR password_hash = '';

ALTER TABLE "user"
ALTER COLUMN password_hash SET NOT NULL;

CREATE TABLE IF NOT EXISTS item (
  item_id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  status SMALLINT NOT NULL CHECK (status IN (0, 1)),
  seller_id TEXT NOT NULL REFERENCES "user" (user_id)
);

CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL UNIQUE REFERENCES item (item_id),
  buyer_id TEXT NOT NULL REFERENCES "user" (user_id),
  order_date DATE NOT NULL
);

CREATE OR REPLACE FUNCTION enforce_ordered_item_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- 若订单存在，则对应商品必须为已售出(status=1)
  IF EXISTS (
    SELECT 1
    FROM orders o
    JOIN item i ON i.item_id = o.item_id
    WHERE i.status <> 1
  ) THEN
    RAISE EXCEPTION '一致性校验失败：出现在 orders 的商品必须 status=1';
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_require_sold_status ON orders;
CREATE CONSTRAINT TRIGGER trg_orders_require_sold_status
AFTER INSERT OR UPDATE ON orders
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION enforce_ordered_item_status();

CREATE OR REPLACE FUNCTION forbid_unsold_item_with_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- 状态单向流转：已售出不能回退为未售出
  IF OLD.status = 1 AND NEW.status = 0 THEN
    RAISE EXCEPTION '一致性校验失败：商品状态只能从 0 变为 1，不能从 1 回退到 0';
  END IF;

  -- 如果商品已有订单，不允许改回未售出
  IF NEW.status = 0 AND EXISTS (
    SELECT 1 FROM orders o WHERE o.item_id = NEW.item_id
  ) THEN
    RAISE EXCEPTION '一致性校验失败：status=0 的商品不能出现在 orders';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_item_unsold_guard ON item;
CREATE TRIGGER trg_item_unsold_guard
BEFORE UPDATE OF status ON item
FOR EACH ROW
EXECUTE FUNCTION forbid_unsold_item_with_order();
