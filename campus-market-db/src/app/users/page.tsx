import { ResultTable } from "@/components/result-table";
import { listItems, listOrders, listUsers } from "@/lib/marketplace-db";

export const dynamic = "force-dynamic";

async function getUsersPageData() {
  try {
    const [users, items, orders] = await Promise.all([
      listUsers(),
      listItems(),
      listOrders(),
    ]);
    return { users, items, orders, hasData: true };
  } catch {
    return { users: [], items: [], orders: [], hasData: false };
  }
}

export default async function UsersPage() {
  const { users, items, orders, hasData } = await getUsersPageData();

  const listedUserIds = new Set(items.map((item) => item.seller_id));
  const buyerUserIds = new Set(orders.map((order) => order.buyer_id));
  const activeUsers = new Set([...listedUserIds, ...buyerUserIds]);

  const userStats = users
    .map((user) => {
      const listedCount = items.filter((item) => item.seller_id === user.user_id).length;
      const purchaseCount = orders.filter((order) => order.buyer_id === user.user_id).length;
      return {
        ...user,
        listedCount,
        purchaseCount,
      };
    })
    .sort((a, b) => b.listedCount + b.purchaseCount - (a.listedCount + a.purchaseCount));

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="surface-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#6f6556]">Community</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#221d14]">社区用户中心</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5f5545]">
              追踪当前校园市场里的活跃卖家与买家，识别交易参与度高的核心用户群体。
            </p>
          </div>
          <a href="/users" className="btn-soft text-sm">
            刷新
          </a>
        </div>
      </section>

      {!hasData ? (
        <section className="surface-card status-panel-error p-4 text-sm">
          当前未连接数据库，用户洞察暂不可用。请检查 POSTGRES_URL 配置。
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="kpi-card">
          <p className="kpi-label">用户总量</p>
          <p className="kpi-value">{users.length}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">发布过商品</p>
          <p className="kpi-value">{listedUserIds.size}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">参与购买</p>
          <p className="kpi-value">{buyerUserIds.size}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">活跃用户</p>
          <p className="kpi-value">{activeUsers.size}</p>
        </article>
      </section>

      <section className="surface-card p-4 md:p-5">
        <h3 className="text-base font-semibold text-[#241f18]">高活跃用户</h3>
        <p className="mt-1 text-sm text-[#5f5545]">按发布和购买总次数排序，展示前 6 位。</p>

        {userStats.length === 0 ? (
          <p className="mt-3 rounded-lg border border-[var(--line)] bg-[#fff8ec] p-3 text-sm text-[#5f5545]">
            当前暂无用户数据。
          </p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {userStats.slice(0, 6).map((user) => (
              <article key={user.user_id} className="rounded-xl border border-[var(--line)] bg-[#fffdf8] p-4">
                <p className="text-xs uppercase tracking-[0.06em] text-[#786b58]">{user.user_id}</p>
                <h4 className="mt-1 text-base font-semibold text-[#221d14]">{user.user_name}</h4>
                <p className="mt-1 text-sm text-[#5f5545]">联系电话：{user.phone}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-[#b8ded6] bg-[#e9f7f3] px-2.5 py-1 text-[#01564d]">
                    发布 {user.listedCount}
                  </span>
                  <span className="rounded-full border border-[#f0cb99] bg-[#fff4e2] px-2.5 py-1 text-[#895300]">
                    购买 {user.purchaseCount}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <ResultTable
        title="用户原始数据"
        description="可用于核对用户基础字段，与业务指标面板相互验证。"
        rows={users}
      />
    </div>
  );
}
