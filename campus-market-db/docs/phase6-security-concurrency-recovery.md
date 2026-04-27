# 阶段6：安全性、并发与恢复说明

## （八）安全性

### 1. 如何防止普通用户删除数据

数据库层使用最小权限策略：

1. `app_readonly` 仅授予 `SELECT`。
2. `app_writer` 才允许 `INSERT/UPDATE/DELETE`。
3. `purchase_item(...)` 函数执行权限仅授予 `app_writer`。

已实现脚本：`sql/05_security_roles.sql`。

### 2. 如何限制用户只能查询数据

系统同时在应用层与数据库层双重控制：

1. 游客未登录时，只允许调用查询接口（商品查看、查询展示）。
2. 发布商品、改价、删除、购买接口均要求有效登录会话。
3. 即使绕过应用层，数据库只读角色仍无法执行写操作。

### 身份与访问约束（已实现）

1. 登录强制：系统区分游客与注册用户，写操作必须登录。
2. 操作准入：写操作使用会话中的 user_id，不信任前端传入 buyer_id/seller_id。
3. 角色检查：购买时禁止 `buyer_id = seller_id`（不允许自卖自买）。

### 安全性快速验证（PostgreSQL）

```sql
SET ROLE readonly_user;

SELECT * FROM item LIMIT 1; -- 应成功
DELETE FROM item WHERE item_id = 'i001'; -- 应失败（permission denied）
UPDATE item SET price = 99 WHERE item_id = 'i001'; -- 应失败
INSERT INTO orders(order_id, item_id, buyer_id, order_date)
VALUES ('oxxx', 'i001', 'u002', CURRENT_DATE); -- 应失败

RESET ROLE;
```

## 交易一致性与修改约束（业务规则）

### 1. 交易一致性约束（已实现）

1. 库存原子性：`item.status` 仅允许单向流转 `0 -> 1`，禁止 `1 -> 0`。
2. 状态锁定：进入 `orders` 的商品必须为已售出，触发器与事务强制一致。
3. 唯一成交：`orders.item_id` 唯一，物理层避免一物多卖。

### 2. 修改与权限约束（已实现）

1. 卖家所有权校验：
	 - 改价仅允许当前登录用户且为商品卖家。
	 - 实际 SQL 等价于：

```sql
UPDATE item
SET price = ?
WHERE item_id = ?
	AND seller_id = [当前登录用户ID]
	AND status = 0;
```

2. 已售商品不可撤销：状态为 1 的商品禁止改价与删除。
3. 删除约束：仅状态为 0 且未关联订单的商品允许物理删除。

## （九）并发与恢复

### 1. 两个用户同时购买同一商品会出现什么问题

若无并发控制，两个请求可能同时读取到“未售出”，产生重复下单风险。

### 2. 如何解决（加锁/事务）

`sql/04_business_logic.sql` 中通过三层机制保证一致性：

1. 行级锁：`SELECT ... FOR UPDATE` 锁定目标商品。
2. 事务原子性：同一事务内完成“插入订单 + 更新商品状态”。
3. 唯一约束：`orders.item_id` 唯一，防止同一商品多订单。

并发购买同一商品的预期结果：一个成功，一个失败。

### 并发快速验证

```sql
-- 会话 A
BEGIN;
SELECT purchase_item('o9001', 'i003', 'u002', CURRENT_DATE);
COMMIT;

-- 会话 B（与会话A并发执行同一商品）
BEGIN;
SELECT purchase_item('o9002', 'i003', 'u003', CURRENT_DATE);
COMMIT;
```

### 3. 如果系统崩溃，如何恢复订单数据

恢复流程采用 PostgreSQL 标准策略：

1. 周期性全量备份。
2. 持续 WAL 归档。
3. 故障后恢复到最近备份，再回放 WAL 至目标时间点（PITR）。

### 恢复后对账 SQL

```sql
-- 订单中的商品必须是已售状态
SELECT o.order_id, o.item_id, i.status
FROM orders o
JOIN item i ON i.item_id = o.item_id
WHERE i.status <> 1;

-- 未售商品不能出现在订单中
SELECT i.item_id
FROM item i
JOIN orders o ON o.item_id = i.item_id
WHERE i.status = 0;
```

若以上查询均返回空结果，则恢复后订单数据一致性正常。
