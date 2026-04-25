# 阶段6：安全性、并发与恢复说明

## 一、安全性

### 1) 如何防止普通用户删除数据

采用数据库角色与最小权限原则：

- 管理员角色：可执行 SELECT/INSERT/UPDATE/DELETE。
- 普通用户角色：仅允许 SELECT，不授予 DELETE/UPDATE/INSERT。
- 应用层将写操作接口限制为管理员或特定业务入口，避免直接暴露原始 SQL 执行能力。

示例（PostgreSQL）：

```sql
CREATE ROLE app_readonly LOGIN PASSWORD '***';
CREATE ROLE app_writer LOGIN PASSWORD '***';

GRANT CONNECT ON DATABASE campus_trade TO app_readonly, app_writer;
GRANT USAGE ON SCHEMA public TO app_readonly, app_writer;

GRANT SELECT ON TABLE "user", item, orders TO app_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "user", item, orders TO app_writer;

REVOKE INSERT, UPDATE, DELETE ON TABLE "user", item, orders FROM app_readonly;
```

### 2) 如何限制用户只能查询数据

- 普通用户连接数据库时使用只读账号。
- API 层对查询接口与写接口分离，普通用户不暴露写接口。
- 对写接口加鉴权（身份验证 + 角色判断）。

## 二、并发

### 1) 两个用户同时购买同一商品会出现什么问题

若没有并发控制，可能发生“双重下单”：两个请求都认为商品未售出，最终出现同一商品被购买两次，破坏业务一致性。

### 2) 如何解决

本项目采用两层保障：

1. 事务与行级锁：购买函数中先 `SELECT ... FOR UPDATE` 锁定商品行，再检查状态并写入订单。
2. 唯一约束：`orders.item_id` 唯一，确保同一商品最多一条订单记录。

因此并发场景下最多只有一个请求成功，另一个请求会因状态或唯一约束失败。

## 三、恢复

### 1) 如果系统崩溃，如何恢复订单数据

依赖 PostgreSQL 的 WAL（预写日志）和备份机制：

- 定期全量备份 + 增量 WAL 归档。
- 故障后先恢复到最近一次全量备份，再回放 WAL 到目标时间点（PITR）。
- 恢复后执行一致性检查（orders 与 item.status 对账）。

### 2) 为什么订单不会出现“只写一半”

购买操作在同一事务内完成（新增订单 + 更新商品状态）。

- 成功则一起提交。
- 失败则一起回滚。

因此不会出现“订单已写入但商品状态未更新”这类半完成状态。
