"use client";

import { ResultTable } from "@/components/result-table";
import { ItemRow } from "@/lib/marketplace-db";
import { FormEvent, useMemo, useState } from "react";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

type ItemsPageClientProps = {
  initialItems: ItemRow[];
  hasData?: boolean;
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatPrice(price: number) {
  return `¥${price.toLocaleString("zh-CN")}`;
}

function parsePriceInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

const itemCategoryOptions = [
  "Book",
  "DailyGoods",
  "Electronics",
  "Furniture",
  "Stationery",
  "Sports",
  "BeautyAndFashion",
  "DormEssentials",
  "Other",
];

export function ItemsPageClient({
  initialItems,
  hasData = true,
}: ItemsPageClientProps) {
  const initialUnsold = initialItems.filter((item) => item.status === 0);
  const defaultItemId = initialItems[0]?.item_id ?? "";
  const defaultUnsoldItemId = initialUnsold[0]?.item_id ?? "";

  const [items, setItems] = useState<ItemRow[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unsold" | "sold">("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("");

  const [newItem, setNewItem] = useState({
    item_id: "",
    item_name: "",
    category: "DailyGoods",
    price: "",
  });

  const [priceForm, setPriceForm] = useState({
    item_id: defaultItemId,
    price: "",
  });

  const [deleteItemId, setDeleteItemId] = useState(defaultUnsoldItemId);

  const [purchaseForm, setPurchaseForm] = useState({
    order_id: "",
    item_id: defaultUnsoldItemId,
    order_date: todayString(),
  });

  const unsoldItems = useMemo(
    () => items.filter((item) => item.status === 0),
    [items],
  );


  const soldItemsCount = items.length - unsoldItems.length;
  const avgPrice =
    items.length > 0
      ? Math.round(items.reduce((sum, item) => sum + item.price, 0) / items.length)
      : 0;

  const rawMinPrice = parsePriceInput(minPrice);
  const rawMaxPrice = parsePriceInput(maxPrice);
  const priceRangeError =
    rawMinPrice !== null && rawMaxPrice !== null && rawMinPrice > rawMaxPrice;
  const effectiveMinPrice = priceRangeError ? null : rawMinPrice;
  const effectiveMaxPrice = priceRangeError ? null : rawMaxPrice;
  const normalizedSeller = sellerFilter.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "unsold"
            ? item.status === 0
            : item.status === 1;

      const matchesCategory =
        categoryFilter === "all" ? true : item.category === categoryFilter;

      const matchesSeller = normalizedSeller
        ? item.seller_id.toLowerCase().includes(normalizedSeller)
        : true;

      const matchesMinPrice =
        effectiveMinPrice !== null ? item.price >= effectiveMinPrice : true;
      const matchesMaxPrice =
        effectiveMaxPrice !== null ? item.price <= effectiveMaxPrice : true;

      return (
        matchesStatus &&
        matchesCategory &&
        matchesSeller &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [
    items,
    statusFilter,
    categoryFilter,
    normalizedSeller,
    effectiveMinPrice,
    effectiveMaxPrice,
  ]);

  const effectivePriceItemId =
    priceForm.item_id && items.some((i) => i.item_id === priceForm.item_id)
      ? priceForm.item_id
      : (items[0]?.item_id ?? "");

  const effectiveDeleteItemId =
    deleteItemId && unsoldItems.some((i) => i.item_id === deleteItemId)
      ? deleteItemId
      : (unsoldItems[0]?.item_id ?? "");

  const effectivePurchaseItemId =
    purchaseForm.item_id && unsoldItems.some((i) => i.item_id === purchaseForm.item_id)
      ? purchaseForm.item_id
      : (unsoldItems[0]?.item_id ?? "");

  const isBusy = loading || submitting;

  const hasActiveFilters =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    sellerFilter.trim() !== "" ||
    minPrice.trim() !== "" ||
    maxPrice.trim() !== "";

  async function withJson<T>(res: Response): Promise<ApiResponse<T>> {
    return (await res.json()) as ApiResponse<T>;
  }

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const itemsRes = await fetch("/api/items", { cache: "no-store" });

      const itemsJson = (await itemsRes.json()) as ApiResponse<ItemRow[]>;

      if (!itemsRes.ok || !itemsJson.ok || !itemsJson.data) {
        throw new Error(itemsJson.error ?? "加载商品失败");
      }

      setItems(itemsJson.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载数据失败";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          price: Number(newItem.price),
          status: 0,
        }),
      });

      const json = await withJson<ItemRow>(res);

      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "新增商品失败");
      }

      setNotice("新增商品成功");
      setNewItem((prev) => ({
        ...prev,
        item_id: "",
        item_name: "",
        category: "DailyGoods",
        price: "",
      }));
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "新增商品失败";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdatePrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setSubmitting(true);

    if (!effectivePriceItemId) {
      setError("改价失败：当前没有可改价的商品。");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/items/${effectivePriceItemId}/price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(priceForm.price) }),
      });

      const json = await withJson<ItemRow>(res);

      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "改价失败");
      }

      setNotice("修改价格成功");
      setPriceForm((prev) => ({ ...prev, price: "" }));
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "改价失败";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUnsold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setSubmitting(true);

    if (!effectiveDeleteItemId) {
      setError("删除失败：当前没有未售商品可删除。");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/items/${effectiveDeleteItemId}`, {
        method: "DELETE",
      });

      const json = await withJson<ItemRow>(res);

      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "删除未售商品失败");
      }

      setNotice("删除未售商品成功");
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "删除未售商品失败";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setSubmitting(true);

    if (!effectivePurchaseItemId) {
      setError("购买失败：当前没有未售商品可购买。");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/orders/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...purchaseForm,
          item_id: effectivePurchaseItemId,
        }),
      });

      const json = await withJson<{ message: string }>(res);

      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "购买失败");
      }

      setNotice("购买成功：已写入订单并更新商品状态");
      setPurchaseForm((prev) => ({
        ...prev,
        order_id: "",
        item_id: "",
      }));
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "购买失败";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="surface-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.08em] text-[#6f6556]">Marketplace</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#221d14]">交易市场</h2>
            <p className="mt-2 text-sm text-[#5f5545]">
              集中管理商品与库存状态，支持筛选、发布与成交操作。写操作需登录，游客仅可查看。
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={isBusy}
            className="btn-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "刷新中..." : "刷新数据"}
          </button>
        </div>
      </section>

      <section className="surface-card p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[#241f18]">筛选栏</h3>
            <p className="mt-1 text-sm text-[#5f5545]">
              使用状态、价格区间、类别与卖家条件快速定位商品。
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setMinPrice("");
              setMaxPrice("");
              setCategoryFilter("all");
              setSellerFilter("");
            }}
            disabled={!hasActiveFilters}
            className="btn-outline disabled:cursor-not-allowed disabled:opacity-60"
          >
            清空筛选
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#6f6556]">状态筛选</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "unsold" | "sold")
              }
              className="select-field"
            >
              <option value="all">所有状态</option>
              <option value="unsold">未售出</option>
              <option value="sold">已售出</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#6f6556]">价格区间</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="最小值"
                className="input-field"
              />
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="最大值"
                className="input-field"
              />
            </div>
            {priceRangeError ? (
              <p className="text-xs text-[#9f2218]">最小值不能大于最大值。</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#6f6556]">类别选择</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select-field"
            >
              <option value="all">全部类别</option>
              {itemCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#6f6556]">卖家搜索</label>
            <input
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              placeholder="输入卖家 ID，例如 u001"
              className="input-field"
            />
          </div>
        </div>
      </section>

      {!hasData ? (
        <section className="surface-card status-panel-error p-4 text-sm">
          当前未连接数据库，交易操作不可用。配置 POSTGRES_URL 后页面会自动恢复正常。
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="kpi-card">
          <p className="kpi-label">商品总量</p>
          <p className="kpi-value">{items.length}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">在售商品</p>
          <p className="kpi-value">{unsoldItems.length}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">已售商品</p>
          <p className="kpi-value">{soldItemsCount}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">平均价格</p>
          <p className="kpi-value">{formatPrice(avgPrice)}</p>
        </article>
      </section>

      <div aria-live="polite" className="min-h-7">
        {notice ? (
          <p className="surface-card status-panel-success p-3 text-sm">{notice}</p>
        ) : null}
      </div>

      {error ? (
        <p className="surface-card status-panel-error p-3 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <section className="surface-card p-4 md:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[#241f18]">商品看板</h3>
            <p className="text-sm text-[#5f5545]">根据筛选栏条件展示商品结果。</p>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <p className="mt-4 rounded-lg border border-[var(--line)] bg-[#fff8ec] p-4 text-sm text-[#5f5545]">
            没有匹配商品，试试清空关键词或切换筛选条件。
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <article key={item.item_id} className="rounded-xl border border-[var(--line)] bg-[#fffdf8] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.06em] text-[#786b58]">{item.item_id}</p>
                    <h4 className="mt-1 text-base font-semibold text-[#221d14]">{item.item_name}</h4>
                  </div>
                  <span
                    className={`status-badge ${
                      item.status === 0 ? "status-badge-on" : "status-badge-off"
                    }`}
                  >
                    {item.status === 0 ? "在售" : "已售"}
                  </span>
                </div>

                <dl className="mt-3 space-y-1.5 text-sm text-[#5f5545]">
                  <div className="flex items-center justify-between gap-2">
                    <dt>分类</dt>
                    <dd className="font-medium text-[#312a20]">{item.category}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt>价格</dt>
                    <dd className="font-medium text-[#312a20]">{formatPrice(item.price)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt>卖家</dt>
                    <dd className="font-medium text-[#312a20]">{item.seller_id}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <form
          onSubmit={handleAddItem}
          id="publish"
          className="surface-card space-y-3 p-4 md:p-5"
        >
          <h3 className="text-base font-semibold text-[#241f18]">发布新商品</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              required
              disabled={isBusy || !hasData}
              value={newItem.item_id}
              onChange={(e) => setNewItem((prev) => ({ ...prev, item_id: e.target.value }))}
              placeholder="商品编号，例如 i010"
              className="input-field"
            />
            <input
              required
              disabled={isBusy || !hasData}
              value={newItem.item_name}
              onChange={(e) => setNewItem((prev) => ({ ...prev, item_name: e.target.value }))}
              placeholder="商品名称"
              className="input-field"
            />
            <select
              required
              disabled={isBusy || !hasData}
              value={newItem.category}
              onChange={(e) => setNewItem((prev) => ({ ...prev, category: e.target.value }))}
              className="select-field"
            >
              {itemCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              required
              disabled={isBusy || !hasData}
              type="number"
              min={1}
              value={newItem.price}
              onChange={(e) => setNewItem((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="价格"
              className="input-field"
            />
          </div>
          <button disabled={isBusy || !hasData} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "提交中..." : "发布商品"}
          </button>
        </form>

        <form
          onSubmit={handleUpdatePrice}
          className="surface-card space-y-3 p-4 md:p-5"
        >
          <h3 className="text-base font-semibold text-[#241f18]">批量改价中的单品调整</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              disabled={isBusy || !hasData}
              value={effectivePriceItemId}
              onChange={(e) =>
                setPriceForm((prev) => ({ ...prev, item_id: e.target.value }))
              }
              className="select-field"
            >
              {items.length === 0 ? <option value="">暂无商品可改价</option> : null}
              {items.map((item) => (
                <option key={item.item_id} value={item.item_id}>
                  {item.item_id} - {item.item_name}
                </option>
              ))}
            </select>
            <input
              required
              disabled={isBusy || !hasData}
              type="number"
              min={1}
              value={priceForm.price}
              onChange={(e) =>
                setPriceForm((prev) => ({ ...prev, price: e.target.value }))
              }
              placeholder="新价格"
              className="input-field"
            />
          </div>
          <button disabled={isBusy || !hasData} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "提交中..." : "保存价格"}
          </button>
        </form>

        <form
          onSubmit={handleDeleteUnsold}
          className="surface-card space-y-3 p-4 md:p-5"
        >
          <h3 className="text-base font-semibold text-[#241f18]">移除未成交商品</h3>
          <select
            disabled={isBusy || !hasData}
            value={effectiveDeleteItemId}
            onChange={(e) => setDeleteItemId(e.target.value)}
            className="select-field"
          >
            {unsoldItems.length === 0 ? <option value="">暂无未售商品</option> : null}
            {unsoldItems.map((item) => (
              <option key={item.item_id} value={item.item_id}>
                {item.item_id} - {item.item_name}
              </option>
            ))}
          </select>
          <button disabled={isBusy || !hasData} className="btn-danger disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "处理中..." : "删除未售商品"}
          </button>
        </form>

        <form
          onSubmit={handlePurchase}
          className="surface-card space-y-3 p-4 md:p-5"
        >
          <h3 className="text-base font-semibold text-[#241f18]">创建购买订单</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              required
              disabled={isBusy || !hasData}
              value={purchaseForm.order_id}
              onChange={(e) =>
                setPurchaseForm((prev) => ({ ...prev, order_id: e.target.value }))
              }
              placeholder="订单编号，例如 o003"
              className="input-field"
            />
            <input
              required
              disabled={isBusy || !hasData}
              type="date"
              value={purchaseForm.order_date}
              onChange={(e) =>
                setPurchaseForm((prev) => ({ ...prev, order_date: e.target.value }))
              }
              className="input-field"
            />
            <select
              disabled={isBusy || !hasData}
              value={effectivePurchaseItemId}
              onChange={(e) =>
                setPurchaseForm((prev) => ({ ...prev, item_id: e.target.value }))
              }
              className="select-field"
            >
              {unsoldItems.length === 0 ? <option value="">暂无可购买商品</option> : null}
              {unsoldItems.map((item) => (
                <option key={item.item_id} value={item.item_id}>
                  {item.item_id} - {item.item_name}
                </option>
              ))}
            </select>
          </div>
          <button disabled={isBusy || !hasData} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "处理中..." : "下单并更新状态"}
          </button>
        </form>
      </section>

      {loading ? (
        <section className="surface-card p-4 text-sm text-[#5f5545]">正在刷新商品数据...</section>
      ) : (
        <ResultTable
          title="商品明细数据"
          description="用于核对数据库原始记录，便于快速排查状态与字段变化。"
          rows={items}
        />
      )}
    </div>
  );
}
