"use client";

import { ResultTable } from "@/components/result-table";
import type { ItemRow, OrderDetailRow, OrderRow } from "@/lib/marketplace-db";
import { useMemo, useState } from "react";

type OrdersPageClientProps = {
  orders: OrderRow[];
  orderDetails: OrderDetailRow[];
  items: ItemRow[];
  hasData: boolean;
};

export function OrdersPageClient({
  orders,
  orderDetails,
  items,
  hasData,
}: OrdersPageClientProps) {
  const [itemKeyword, setItemKeyword] = useState("");
  const [sellerKeyword, setSellerKeyword] = useState("");
  const [orderDate, setOrderDate] = useState("");

  const uniqueBuyerCount = useMemo(
    () => new Set(orders.map((order) => order.buyer_id)).size,
    [orders],
  );
  const uniqueItemCount = useMemo(
    () => new Set(orders.map((order) => order.item_id)).size,
    [orders],
  );
  const latestOrderDate = useMemo(() => {
    if (orders.length === 0) return "-";
    return [...orders]
      .map((order) => order.order_date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  }, [orders]);

  const itemPriceMap = useMemo(() => {
    return new Map(items.map((item) => [item.item_id, item.price]));
  }, [items]);

  const grossVolume = useMemo(() => {
    return orders.reduce((sum, order) => {
      return sum + (itemPriceMap.get(order.item_id) ?? 0);
    }, 0);
  }, [orders, itemPriceMap]);

  const normalizedItem = itemKeyword.trim().toLowerCase();
  const normalizedSeller = sellerKeyword.trim().toLowerCase();
  const normalizedOrderDate = orderDate.trim();

  const filteredOrderDetails = useMemo(() => {
    return orderDetails.filter((trade) => {
      const matchesItem = normalizedItem
        ? trade.item_name.toLowerCase().includes(normalizedItem)
        : true;
      const sellerText = `${trade.seller_name} ${trade.seller_id}`.toLowerCase();
      const matchesSeller = normalizedSeller
        ? sellerText.includes(normalizedSeller)
        : true;
      const matchesDate = normalizedOrderDate
        ? trade.order_date === normalizedOrderDate
        : true;
      return matchesItem && matchesSeller && matchesDate;
    });
  }, [orderDetails, normalizedItem, normalizedSeller, normalizedOrderDate]);

  const filteredOrders = useMemo(() => {
    if (!normalizedOrderDate) {
      return orders;
    }
    return orders.filter((order) => order.order_date === normalizedOrderDate);
  }, [orders, normalizedOrderDate]);

  const recentTrades = useMemo(() => {
    return [...filteredOrderDetails]
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
      .slice(0, 6);
  }, [filteredOrderDetails]);

  const hasActiveFilters =
    normalizedItem !== "" ||
    normalizedSeller !== "" ||
    normalizedOrderDate !== "";

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="surface-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#6f6556]">Orders</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#221d14]">订单中心</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5f5545]">
              查看成交记录与买卖双方信息，并通过筛选快速定位特定商品或卖家。
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

      <section className="surface-card p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[#241f18]">订单筛选栏</h3>
            <p className="mt-1 text-sm text-[#5f5545]">
              支持按商品名、卖家名与日期检索，过滤下方联查结果与成交卡片。
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setItemKeyword("");
              setSellerKeyword("");
              setOrderDate("");
            }}
            disabled={!hasActiveFilters}
            className="btn-outline disabled:cursor-not-allowed disabled:opacity-60"
          >
            清空筛选
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            value={itemKeyword}
            onChange={(e) => setItemKeyword(e.target.value)}
            placeholder="搜索商品名"
            className="input-field"
          />
          <input
            value={sellerKeyword}
            onChange={(e) => setSellerKeyword(e.target.value)}
            placeholder="搜索卖家名或 ID"
            className="input-field"
          />
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="input-field"
          />
        </div>
      </section>

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
            当前筛选条件下暂无订单记录。
          </p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentTrades.map((trade) => (
              <article key={trade.order_id} className="rounded-xl border border-[var(--line)] bg-[#fffdf8] p-4">
                <p className="text-xs uppercase tracking-[0.06em] text-[#786b58]">{trade.order_id}</p>
                <h4 className="mt-1 text-base font-semibold text-[#221d14]">{trade.item_name}</h4>
                <dl className="mt-2 space-y-1 text-sm text-[#5f5545]">
                  <div className="flex justify-between gap-3">
                    <dt>卖家</dt>
                    <dd className="font-medium text-[#312a20]">{trade.seller_name}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>卖家 ID</dt>
                    <dd className="font-medium text-[#312a20]">{trade.seller_id}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>买家</dt>
                    <dd className="font-medium text-[#312a20]">{trade.buyer_name}</dd>
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
        description="Orders 表的基础记录，支持按日期筛选。"
        rows={filteredOrders}
        emptyText="当前筛选未返回数据"
      />
      <ResultTable
        title="订单联查视图"
        description="展示商品名、卖家名、买家名和日期，便于运营阅读。"
        rows={filteredOrderDetails}
        emptyText="当前筛选未返回数据"
      />
    </div>
  );
}
