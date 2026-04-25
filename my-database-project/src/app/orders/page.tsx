import { ResultTable } from "@/components/result-table";
import { listOrderDetails, listOrders } from "@/lib/marketplace-db";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [orders, orderDetails] = await Promise.all([
    listOrders(),
    listOrderDetails(),
  ]);

  return (
    <main className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">订单列表</h2>
            <p className="text-sm text-slate-600">展示 Orders 表以及订单联查结果。</p>
          </div>
          <a
            href="/orders"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            刷新
          </a>
        </div>
      </section>

      <ResultTable title="Orders 表" rows={orders} />
      <ResultTable title="订单详情（商品名 + 买家名 + 日期）" rows={orderDetails} />
    </main>
  );
}
