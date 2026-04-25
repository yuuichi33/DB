# 校园二手交易平台数据库系统

技术栈：Next.js 16 + Vercel Postgres（`@vercel/postgres`）+ Vercel

当前已完成阶段 1-6：

1. 需求冻结与验收清单
2. 数据库结构与约束脚本
3. 项目骨架与数据库接入
4. 四个核心页面与数据操作
5. 查询展示（基本/连接/聚合/视图）
6. 安全性与并发恢复说明文档

## 一、安装依赖

```bash
npm install
```

## 二、配置环境变量

在项目根目录创建 `.env.local`：

```bash
POSTGRES_URL="你的PostgreSQL连接串"
```

## 三、初始化数据库（按顺序）

执行以下脚本：

1. `sql/01_schema.sql`
2. `sql/02_seed.sql`
3. `sql/03_views.sql`
4. `sql/04_business_logic.sql`

说明：脚本中已包含主键、外键、唯一约束、status 规则、一致性触发器和购买函数。

## 四、启动项目

```bash
npm run dev
```

浏览器访问：`http://localhost:3000`

## 五、页面说明

1. `/`：首页导航
2. `/items`：商品列表 + 新增商品 + 修改价格 + 删除未售商品 + 购买商品
3. `/users`：用户列表
4. `/orders`：订单列表（含联查展示）
5. `/queries`：基本查询、连接查询、聚合分组、视图查询

## 六、关键业务规则

1. 每个商品最多交易一次（`orders.item_id` 唯一）
2. 若商品出现在 `orders` 中，则 `item.status=1`
3. 若 `item.status=0`，则不能出现在 `orders`
4. 购买逻辑通过 SQL 函数 `purchase_item(...)` 完成：
	- 插入订单
	- 更新商品 status 为 1
	- 已售商品禁止再次购买

## 七、验证命令

```bash
npm run lint
npm run build
```

当前代码已通过 lint 与 build。
