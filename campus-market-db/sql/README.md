# SQL脚本执行顺序

按以下顺序执行：

1. 01_schema.sql
2. 02_seed.sql
3. 03_views.sql
4. 04_business_logic.sql
5. 05_security_roles.sql

## 验证点

- `orders.item_id` 唯一，保证每个商品只能交易一次。
- `item.status` 仅允许 0/1。
- `item.status` 只能从 0 变为 1，不能从 1 回退到 0。
- 出现在 `orders` 的商品必须为已售出（status=1）。
- `status=0` 的商品不能出现在 `orders`。
- `purchase_item` 不允许 `buyer_id = seller_id`（禁止自卖自买）。

## 快速验证 SQL

```sql
SELECT * FROM "user";
SELECT * FROM item;
SELECT * FROM orders;
SELECT * FROM sold_item_view;
SELECT * FROM unsold_item_view;
```

购买示例：

```sql
SELECT purchase_item('o003', 'i001', 'u003', '2024-05-05');
```

## 安全性验证（第八项）

```sql
-- 可选：创建并绑定只读登录账号
CREATE ROLE readonly_user LOGIN PASSWORD 'change_me_readonly';
GRANT app_readonly TO readonly_user;

SET ROLE readonly_user;
SELECT * FROM item LIMIT 1; -- 成功
DELETE FROM item WHERE item_id = 'i001'; -- 失败（权限不足）
RESET ROLE;
```

应用层登录验证要点：

- 游客可调用 GET 查询接口。
- 游客调用写接口（发布、改价、删除、购买）应返回 401。
- 登录用户可调用写接口，且身份由会话注入。

## 并发与恢复验证（第九项）

并发购买：在两个数据库会话中同时调用 `purchase_item` 购买同一 `item_id`，预期一个成功一个失败。

提示：若使用 `i003`（初始未售）做并发测试更容易复现。

恢复后对账：

```sql
SELECT o.order_id, o.item_id, i.status
FROM orders o
JOIN item i ON i.item_id = o.item_id
WHERE i.status <> 1;

SELECT i.item_id
FROM item i
JOIN orders o ON o.item_id = i.item_id
WHERE i.status = 0;
```
