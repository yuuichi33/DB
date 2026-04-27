import { ResultTable } from "@/components/result-table";
import { listItems, listOrderDetails, listOrders } from "@/lib/marketplace-db";

export const dynamic = "force-dynamic";

async function getOrdersPageData() {
  try {
    const [orders, orderDetails, items] = await Promise.all([
      listOrders(),
      listOrderDetails(),
      listItems(),
    ]);
    return { orders, orderDetails, items, hasData: true };
  } catch {
    return { orders: [], orderDetails: [], items: [], hasData: false };
  }
}

export default async function OrdersPage() {
  const { orders, orderDetails, items, hasData } = await getOrdersPageData();

  const uniqueBuyerCount = new Set(orders.map((order) => order.buyer_id)).size;
  const uniqueItemCount = new Set(orders.map((order) => order.item_id)).size;
  const latestOrderDate =
    orders.length > 0
      ? [...orders]
          .map((order) => order.order_date)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
      : "-";

  const itemPriceMap = new Map(items.map((item) => [item.item_id, item.price]));
  const grossVolume = orders.reduce((sum, order) => {
    return sum + (itemPriceMap.get(order.item_id) ?? 0);
  }, 0);

  const recentTrades = [...orderDetails]
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="surface-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#6f6556]">Orders</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#221d14]">订单中心</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5f5545]">
              统一查看平台成交记录，快速追踪买家、商品和交易日期，便于日常运营复盘。
            </p>
          </div>
          <a href="/orders" className="btn-soft text-sm">
            刷新
          </a>
        </div>
      </section>

      {!hasData ? (
        <section className="surface-card status-panel-error p-4 text-sm">
          当前未连接数据库，订单数据暂不可用。请检查 POSTGRES_URL 配置。
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="kpi-card">
          <p className="kpi-label">订单总数</p>
          <p className="kpi-value">{orders.length}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">买家数量</p>
          <p className="kpi-value">{uniqueBuyerCount}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">成交商品</p>
          <p className="kpi-value">{uniqueItemCount}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">成交额估算</p>
          <p className="kpi-value">¥{grossVolume.toLocaleString("zh-CN")}</p>
        </article>
      </section>

      <section className="surface-card p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#241f18]">最近成交动态</h3>
          <span className="rounded-full border border-[#b8ded6] bg-[#e9f7f3] px-3 py-1 text-xs font-semibold text-[#01564d]">
            最近订单日期：{latestOrderDate}
          </span>
        </div>

        {recentTrades.length === 0 ? (
          <p className="mt-3 rounded-lg border border-[var(--line)] bg-[#fff8ec] p-3 text-sm text-[#5f5545]">
            当前暂无订单记录。
          </p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentTrades.map((trade) => (
              <article key={trade.order_id} className="rounded-xl border border-[var(--line)] bg-[#fffdf8] p-4">
                <p className="text-xs uppercase tracking-[0.06em] text-[#786b58]">{trade.order_id}</p>
                <h4 className="mt-1 text-base font-semibold text-[#221d14]">{trade.item_name}</h4>
                <dl className="mt-2 space-y-1 text-sm text-[#5f5545]">
                  <div className="flex justify-between gap-3">
                    <dt>买家</dt>
                    <dd className="font-medium text-[#312a20]">{trade.buyer_name}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>用户 ID</dt>
                    <dd className="font-medium text-[#312a20]">{trade.buyer_id}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>日期</dt>
                    <dd className="font-medium text-[#312a20]">{trade.order_date}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      <ResultTable
        title="订单原始数据"
        description="Orders 表的基础记录，适合与联查结果交叉核对。"
        rows={orders}
      />
      <ResultTable
        title="订单联查视图"
        description="展示商品名、买家名和日期，便于运营阅读。"
        rows={orderDetails}
      />
    </div>
  );
}
