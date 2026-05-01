# 项目说明

在线访问网址（公开）：
https://campus-market-db-ys.vercel.app/

## 1. 从代码到最终网址
1. 在 Vercel 创建项目并导入此仓库。
2. 创建 Vercel Postgres 数据库，复制连接串。
3. 在 Vercel 环境变量中设置：
   - POSTGRES_URL = <你的连接串>
   - AUTH_SECRET = <随机长密钥>
4. 按顺序执行 SQL 初始化脚本：
   1) sql/01_schema.sql
   2) sql/02_seed.sql
   3) sql/03_views.sql
   4) sql/04_business_logic.sql
   5) sql/05_security_roles.sql
5. 触发部署（推送 main 或点击 Deploy）。
6. 打开部署地址，确认页面可访问。

## 2. 截图清单（需要附在报告里）
页面类：
- 首页（含导航）。
- 商品列表页（列表 + 统计卡）。
- 用户列表页。
- 订单列表页。
- 查询展示页。

数据操作类：
- 插入新商品（展示填写与结果）。
- 修改商品价格（展示前后）。
- 删除未售商品（展示记录消失）。
- 购买商品（展示订单新增 + 商品状态变化）。

基本查询（在查询页逐个执行）：
- 查询未售商品。
- 查询价格 > 30。
- 查询生活用品类（DailyGoods）。
- 查询 u001 发布的所有商品。

连接查询：
- 已售商品与买家姓名。
- 订单明细（商品 + 买家 + 日期）。
- 卖家为 u001 的商品是否被购买。

聚合与分组：
- 统计商品总数。
- 统计每类商品数量。
- 计算平均价格。
- 发布商品数量最多的用户。

视图：
- sold_item_view 查询结果。
- unsold_item_view 查询结果。

安全与一致性证据：
- 未登录尝试写操作，展示报错。
- 购买已售商品失败（可选但加分）。

## 3. 简答：安全性（第八部分）
- 防止普通用户删除数据：数据库角色区分只读与写入，仅写入角色可 INSERT/UPDATE/DELETE；应用层写接口必须登录。
- 限制用户只能查询：游客仅可调用读接口；数据库只读角色仅允许 SELECT，写操作会被拒绝。

## 4. 简答：并发与恢复（第九部分）
- 两个用户并发购买同一商品：若无控制，可能同时看到“未售出”，导致重复下单。
- 解决方案：事务 + 行级锁（SELECT ... FOR UPDATE）+ orders.item_id 唯一约束，保证只有一个成功。
- 崩溃恢复：定期备份 + WAL 归档，恢复最近备份并回放 WAL（PITR），恢复后做一致性校验。

## 5. 操作视频录制流程
1. 用干净浏览器打开在线网址。
2. 展示首页导航。
3. 进入商品页，展示列表与统计卡。
4. 用种子用户登录（例如 u001 / Campus123!）。
5. 发布新商品。
6. 修改一个未售商品价格。
7. 删除一个未售商品。
8. 退出后用另一用户注册（student001）并购买一件未售商品。
9. 进入订单页，展示新增订单。
10. 进入查询页，依次运行基本/连接/聚合/视图查询。
11. 退出登录后尝试写操作，展示权限错误。
12. 结束时让地址栏显示在线网址。

---

## 要求逐项对照表（中文）

下面对作业要求逐条核对，并标注状态：已 / 未 / 需验证。每项后给出代码或脚本证据路径，便于复查。

- 一、项目背景与实现要求
   - 提供可公开访问的网址（无需运行环境）：需验证 — 已在 `README.md` 与本说明中声明（示例：https://campus-market-db-ys.vercel.app/），请打开验证并截图。
      - 证据：`README.md`, `docs/project-report.md`
   - 必须包含页面：首页（导航）、商品列表页、用户列表页、订单列表页：已（实现于代码）
      - 证据：`src/app/page.tsx`, `src/app/items/page.tsx`, `src/app/users/page.tsx`, `src/app/orders/page.tsx`
   - 页面可以展示数据库中的数据：需验证 — 前端调用后端查询函数，但实际展示依赖 `POSTGRES_URL` 与数据库初始化。
      - 证据：`src/lib/marketplace-db.ts`, `src/components/items-page-client.tsx`

- 二、数据库表结构与初始数据
   - 用户表 `user`：已
      - 证据：`sql/01_schema.sql`
   - 商品表 `item`：已
      - 证据：`sql/01_schema.sql`
   - 订单表 `orders`：已
      - 证据：`sql/01_schema.sql`

- 三、字段含义与强制规则
   - `item.status` 字段（0/1）及 CHECK 约束：已
      - 证据：`sql/01_schema.sql`
   - 一致性规则：
      - 每个商品最多只能被交易一次 / `orders.item_id` 只能出现一次：已（`UNIQUE`）
         - 证据：`sql/01_schema.sql`
      - 若商品出现在 `orders` 则 `item.status` 必须为 1：已（触发器）
         - 证据：`sql/01_schema.sql`
      - 若 `status = 0` 则不能出现在 `orders`：已（触发器）
         - 证据：`sql/01_schema.sql`
   - 外键关系（seller_id / buyer_id / item_id）：已
      - 证据：`sql/01_schema.sql`

- 四、作业要求（逐项）
   - （一）数据库定义
      - 创建数据库：需验证/补充 — 仓库 SQL 未包含 `CREATE DATABASE`，通常由数据库服务（如 Vercel Postgres）创建，请在报告中说明或提供建库步骤。
         - 证据：无（需在部署时执行或说明）
      - 创建三张表：已
         - 证据：`sql/01_schema.sql`
      - 设置主键：已
         - 证据：`sql/01_schema.sql`
      - 设置完整性约束（非空、外键、唯一、CHECK）：已
         - 证据：`sql/01_schema.sql`

   - （二）数据操作（必须真实作用于数据库）
      - 插入给定初始数据：已（脚本存在）/需验证（执行）
         - 证据：`sql/02_seed.sql`
      - 插入一个新商品（自定义）：已（前端/后端功能已实现）/需验证（登录并提交表单）
         - 证据：`src/app/api/items/route.ts`, `src/lib/marketplace-db.ts`
      - 修改某商品价格：已/需验证
         - 证据：`src/app/api/items/[itemId]/price/route.ts`, `src/lib/marketplace-db.ts`
      - 删除一个未售出的商品：已/需验证
         - 证据：`src/app/api/items/[itemId]/route.ts`, `src/lib/marketplace-db.ts`
      - 操作后刷新页面能看到结果变化：需验证（依赖数据库连接与会话）

   - （三）基本查询（页面交互展示）：已实现（接口与页面），需运行验证
      - 证据：`src/app/api/queries/basic/route.ts`, `src/lib/marketplace-db.ts`

   - （四）连接查询：已实现，需运行验证
      - 证据：`src/app/api/queries/join/route.ts`, `src/lib/marketplace-db.ts`

   - （五）聚合与分组：已实现，需运行验证
      - 证据：`src/app/api/queries/aggregate/route.ts`, `src/lib/marketplace-db.ts`

   - （六）视图：已实现（视图定义 + 查询接口），需运行验证
      - 证据：`sql/03_views.sql`, `src/lib/marketplace-db.ts`

   - （七）业务逻辑“购买商品” SQL 实现：已实现（`purchase_item`）/需运行验证并拍摄异常场景
      - 证据：`sql/04_business_logic.sql`, `src/app/api/orders/purchase/route.ts`

   - （八）安全性：已实现（角色/权限脚本 + 应用层校验），需数据库管理员运行脚本并验证权限生效
      - 证据：`sql/05_security_roles.sql`, `docs/phase6-security-concurrency-recovery.md`

   - （九）并发与恢复：文档已说明问题与解决方案，需并发测试并保留日志/截图
      - 证据：`sql/04_business_logic.sql`, `docs/phase6-security-concurrency-recovery.md`

- 五、提交材料核对
   - 可运行的完整项目代码：已包含源码（Next.js、SQL 脚本），需在目标环境执行初始化与部署以完成“可运行”证明
      - 证据：仓库根目录（`package.json`、`src/`、`sql/` 等）
   - 项目说明文件：已生成（`docs/project-report.md`），需补充截图与视频链接
      - 证据：`docs/project-report.md`
   - 网站操作视频：未完成（需你录制并上传）

---

结论性建议：
1. 在目标数据库（例如 Vercel Postgres）按顺序运行 `sql/*.sql` 并截图执行结果；
2. 在 Vercel 环境变量设置 `POSTGRES_URL` 与 `AUTH_SECRET`，部署并截图各页面操作结果；
3. 使用种子用户（示例：`u001 / Campus123!`）验证新增/改价/删除/购买操作并截屏；
4. 录制操作视频并把关键截图插入到 `docs/project-report.md`。



