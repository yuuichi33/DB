"use client";

import { ResultTable } from "@/components/result-table";
import { useState } from "react";

type Row = Record<string, string | number | null>;

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

const basicQueries = [
  { type: "unsold", label: "查询所有未售出的商品" },
  { type: "price_gt_30", label: "查询价格大于 30 的商品" },
  { type: "daily_goods", label: "查询生活用品类商品" },
  { type: "seller_u001", label: "查询 u001 发布的所有商品" },
];

const joinQueries = [
  { type: "sold_with_buyer", label: "查询所有已售商品及其买家姓名" },
  {
    type: "order_item_buyer_date",
    label: "查询每个订单：商品名 + 买家名 + 日期",
  },
  {
    type: "seller_u001_purchase_status",
    label: "查询卖家是 u001 的商品是否被购买",
  },
];

const aggregateQueries = [
  { type: "total_items", label: "统计商品总数" },
  { type: "items_per_category", label: "统计每类商品数量" },
  { type: "avg_price", label: "计算所有商品平均价格" },
  { type: "top_publisher", label: "查询发布商品数量最多的用户" },
];

const viewQueries = [
  { type: "sold_view", label: "已售商品视图（商品名 + 买家ID）" },
  { type: "unsold_view", label: "未售商品视图" },
];

function QueryGroup({
  title,
  items,
  endpoint,
  onRun,
}: {
  title: string;
  items: { type: string; label: string }[];
  endpoint: string;
  onRun: (title: string, url: string) => Promise<void>;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="grid gap-2">
        {items.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => void onRun(item.label, `${endpoint}?type=${item.type}`)}
            className="rounded border border-slate-300 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100"
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function QueriesPage() {
  const [resultTitle, setResultTitle] = useState("请选择左侧查询项");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runQuery(title: string, url: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = (await res.json()) as ApiResponse<Row[]>;

      if (!res.ok || !json.ok || !json.data) {
        throw new Error(json.error ?? "查询失败");
      }

      setResultTitle(title);
      setRows(json.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "查询失败";
      setError(message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold">查询展示页面</h2>
        <p className="text-sm text-slate-600">
          点击按钮触发 SQL 查询并展示结果，覆盖基本查询、连接查询、聚合分组与视图。
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <QueryGroup
          title="基本查询"
          items={basicQueries}
          endpoint="/api/queries/basic"
          onRun={runQuery}
        />
        <QueryGroup
          title="连接查询"
          items={joinQueries}
          endpoint="/api/queries/join"
          onRun={runQuery}
        />
        <QueryGroup
          title="聚合与分组"
          items={aggregateQueries}
          endpoint="/api/queries/aggregate"
          onRun={runQuery}
        />
        <QueryGroup
          title="视图查询"
          items={viewQueries}
          endpoint="/api/queries/views"
          onRun={runQuery}
        />
      </section>

      {loading ? (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          正在查询...
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </p>
      ) : (
        <ResultTable title={resultTitle} rows={rows} />
      )}
    </main>
  );
}
