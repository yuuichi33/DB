"use client";

import { QueryResultTable } from "@/components/query-result-table";
import { useState } from "react";

type Row = Record<string, string | number | null>;

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

type QueryItem = {
  type: string;
  label: string;
  scenario: string;
};

const aggregateQueries = [
  {
    type: "total_items",
    label: "商品总量统计",
    scenario: "查看平台整体供给规模。",
  },
  {
    type: "items_per_category",
    label: "分类供给分布",
    scenario: "识别热门品类和潜在缺口。",
  },
  {
    type: "avg_price",
    label: "平均价格",
    scenario: "观察平台价格带，辅助促销策略制定。",
  },
  {
    type: "top_publisher",
    label: "发布数量排行",
    scenario: "按发布商品数降序展示所有卖家。",
  },
];

const viewQueries = [
  {
    type: "sold_view",
    label: "已售商品视图",
    scenario: "快速输出成交名单，降低联查成本。",
  },
  {
    type: "unsold_view",
    label: "未售商品视图",
    scenario: "用于库存待转化商品的快速审阅。",
  },
];

function QueryGroup({
  title,
  groupKey,
  items,
  endpoint,
  activeKey,
  loading,
  onRun,
}: {
  title: string;
  groupKey: string;
  items: QueryItem[];
  endpoint: string;
  activeKey: string;
  loading: boolean;
  onRun: (title: string, url: string) => Promise<void>;
}) {
  return (
    <section
      className={`surface-card space-y-3 p-4 ${
        activeKey === groupKey ? "border-[#9dcfc4] shadow-[0_8px_22px_rgba(0,105,92,0.12)]" : ""
      }`}
    >
      <h3 className="text-base font-semibold text-[#241f18]">{title}</h3>
      <div className="grid gap-2">
        {items.map((item) => (
          <article key={item.type} className="rounded-lg border border-[var(--line)] bg-[#fffdf8] p-3">
            <button
              type="button"
              onClick={() => void onRun(item.label, `${endpoint}?type=${item.type}`)}
              disabled={loading}
              className="w-full rounded-md bg-[#f7efe2] px-3 py-2 text-left text-sm font-semibold text-[#30291f] transition hover:bg-[#efe3d0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {item.label}
            </button>
            <p className="mt-2 text-xs leading-5 text-[#6a5e4c]">{item.scenario}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function QueriesPage() {
  const [resultTitle, setResultTitle] = useState("请选择查询任务");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeGroup, setActiveGroup] = useState("overview");
  const [lastRunAt, setLastRunAt] = useState("");

  async function runQuery(title: string, url: string, groupKey: string) {
    setLoading(true);
    setError("");
    setActiveGroup(groupKey);

    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = (await res.json()) as ApiResponse<Row[]>;

      if (!res.ok || !json.ok || !json.data) {
        throw new Error(json.error ?? "查询失败");
      }

      setResultTitle(title);
      setRows(json.data);
      setLastRunAt(new Date().toLocaleString("zh-CN"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "查询失败";
      setError(message);
      setRows([]);
      setLastRunAt("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 md:space-y-6" aria-busy={loading}>
      <section className="surface-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.08em] text-[#6f6556]">Insights</p>
        <h2 className="mt-1 text-2xl font-semibold text-[#221d14]">数据洞察中心</h2>
        <p className="mt-2 max-w-3xl text-sm text-[#5f5545]">
          聚合分组与视图查询集中展示，点击任务卡即可生成统计与视图结果。
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <section className="surface-card p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[#6f6556]">Reports</p>
            <h3 className="mt-1 text-base font-semibold text-[#241f18]">统计报表</h3>
            <p className="mt-2 text-sm text-[#5f5545]">
              聚合分组集中在侧边栏，点击任务即可生成统计结果。
            </p>
          </section>
          <QueryGroup
            title="聚合与分组"
            groupKey="aggregate"
            items={aggregateQueries}
            endpoint="/api/queries/aggregate"
            activeKey={activeGroup}
            loading={loading}
            onRun={(title, url) => runQuery(title, url, "aggregate")}
          />
        </aside>

        <div className="space-y-4">
          <section>
            <QueryGroup
              title="视图查询"
              groupKey="views"
              items={viewQueries}
              endpoint="/api/queries/views"
              activeKey={activeGroup}
              loading={loading}
              onRun={(title, url) => runQuery(title, url, "views")}
            />
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="kpi-card">
              <p className="kpi-label">最近任务</p>
              <p className="mt-2 text-sm font-semibold text-[#2c261d]">{resultTitle}</p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">返回行数</p>
              <p className="kpi-value">{rows.length}</p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">执行状态</p>
              <p className="mt-2 inline-flex rounded-full border border-[#b8ded6] bg-[#e9f7f3] px-3 py-1 text-sm font-semibold text-[#01564d]">
                {loading ? "执行中" : "待命"}
              </p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">最近执行时间</p>
              <p className="mt-2 text-sm font-semibold text-[#2c261d]">{lastRunAt || "尚未执行"}</p>
            </article>
          </section>

          {loading ? (
            <p className="surface-card p-4 text-sm text-[#5f5545]" role="status" aria-live="polite">
              正在执行查询，请稍候...
            </p>
          ) : null}

          {error ? (
            <p className="surface-card status-panel-error p-4 text-sm" role="alert">
              {error}
            </p>
          ) : (
            <QueryResultTable
              title={resultTitle}
              description="结果由接口实时返回。若需刷新，请重新点击对应任务卡。"
              rows={rows}
              emptyText="当前查询未返回数据"
            />
          )}
        </div>
      </section>
    </div>
  );
}
