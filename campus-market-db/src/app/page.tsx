import Link from "next/link";
import { listItems, listOrders, listUsers } from "@/lib/marketplace-db";

async function getHomeData() {
  try {
    const [items, orders, users] = await Promise.all([
      listItems(),
      listOrders(),
      listUsers(),
    ]);

    const listedItems = items.length;
    const inStockItems = items.filter((item) => item.status === 0).length;
    const soldItems = listedItems - inStockItems;
    const activeUsers = users.length;
    const orderCount = orders.length;

    return {
      listedItems,
      inStockItems,
      soldItems,
      activeUsers,
      orderCount,
      hasData: true,
    };
  } catch {
    return {
      listedItems: 0,
      inStockItems: 0,
      soldItems: 0,
      activeUsers: 0,
      orderCount: 0,
      hasData: false,
    };
  }
}

export default async function Home() {
  const homeData = await getHomeData();

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="surface-card relative overflow-hidden px-6 py-8 md:px-8 md:py-10">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#f6d390]/45 blur-2xl" />
        <div className="absolute -bottom-24 right-14 h-56 w-56 rounded-full bg-[#bce4dd]/65 blur-2xl" />

        <div className="relative z-10 grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="font-[var(--font-space-grotesk)] text-sm font-semibold uppercase tracking-[0.17em] text-[#6d5f49]">
              CAMPUS LOOP
            </p>
            <h2 className="section-title mt-3 max-w-xl">
              在校园里，让每一次闲置流转都更快、更可靠、更安心。
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#5f5545] md:text-base">
              CampusLoop 帮你把闲置商品从“想卖”变成“成交”。从发布、改价、下单到订单追踪，
              全流程在线完成，交易状态清晰可见。
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/items#publish" className="btn-primary">
                立即发布商品
              </Link>
              <Link href="/items" className="btn-soft">
                去市场挑选
              </Link>
              <Link href="/orders" className="btn-soft">
                查看订单进度
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <article className="kpi-card">
              <p className="kpi-label">在架商品</p>
              <p className="kpi-value">{homeData.inStockItems}</p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">累计成交</p>
              <p className="kpi-value">{homeData.soldItems}</p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">社区用户</p>
              <p className="kpi-value">{homeData.activeUsers}</p>
            </article>
          </div>
        </div>
      </section>

      {!homeData.hasData ? (
        <section className="surface-card status-panel-error p-4 text-sm">
          当前未连接数据库，页面已切换为展示模式。配置好环境变量后会自动恢复实时数据。
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/items" className="surface-card p-4 transition-transform hover:-translate-y-0.5">
          <h3 className="text-lg font-semibold text-[#221d14]">交易市场</h3>
          <p className="mt-2 text-sm text-[#5f5545]">查看在售商品，按需发起购买，并实时确认成交状态。</p>
        </Link>

        <Link href="/orders" className="surface-card p-4 transition-transform hover:-translate-y-0.5">
          <h3 className="text-lg font-semibold text-[#221d14]">订单中心</h3>
          <p className="mt-2 text-sm text-[#5f5545]">追踪每笔订单的买卖双方与金额，快速定位最新成交记录。</p>
        </Link>

        <Link href="/users" className="surface-card p-4 transition-transform hover:-translate-y-0.5">
          <h3 className="text-lg font-semibold text-[#221d14]">社区用户</h3>
          <p className="mt-2 text-sm text-[#5f5545]">查看用户画像与联系信息，提升交易沟通效率。</p>
        </Link>

        <Link href="/queries" className="surface-card p-4 transition-transform hover:-translate-y-0.5">
          <h3 className="text-lg font-semibold text-[#221d14]">数据洞察</h3>
          <p className="mt-2 text-sm text-[#5f5545]">通过预设分析视角，快速理解平台供需与成交表现。</p>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="surface-card p-5">
          <p className="kpi-label">累计发布</p>
          <p className="kpi-value">{homeData.listedItems}</p>
          <p className="mt-2 text-sm text-[#5f5545]">历史上架商品总量，反映社区供给活跃度。</p>
        </article>

        <article className="surface-card p-5">
          <p className="kpi-label">订单总数</p>
          <p className="kpi-value">{homeData.orderCount}</p>
          <p className="mt-2 text-sm text-[#5f5545]">已创建订单的累计数量，用于衡量交易密度。</p>
        </article>

        <article className="surface-card p-5">
          <p className="kpi-label">实时状态</p>
          <p className="mt-3 inline-flex rounded-full border border-[#b8ded6] bg-[#e9f7f3] px-3 py-1 text-sm font-semibold text-[#01564d]">
            {homeData.hasData ? "数据源在线" : "等待数据库连接"}
          </p>
          <p className="mt-2 text-sm text-[#5f5545]">首页会在每次请求时读取最新数据，不需要手动刷新缓存。</p>
        </article>
      </section>

    </div>
  );
}
