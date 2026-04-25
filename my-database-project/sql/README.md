# SQL脚本执行顺序

按以下顺序执行：

1. 01_schema.sql
2. 02_seed.sql
3. 03_views.sql
4. 04_business_logic.sql

## 验证点

- `orders.item_id` 唯一，保证每个商品只能交易一次。
- `item.status` 仅允许 0/1。
- 出现在 `orders` 的商品必须为已售出（status=1）。
- `status=0` 的商品不能出现在 `orders`。

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
