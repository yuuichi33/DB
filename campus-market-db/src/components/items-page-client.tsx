"use client";

import { ResultTable } from "@/components/result-table";
import { ItemRow, UserRow } from "@/lib/marketplace-db";
import { FormEvent, useMemo, useState } from "react";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

type ItemsPageClientProps = {
  initialItems: ItemRow[];
  initialUsers: UserRow[];
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function ItemsPageClient({
  initialItems,
  initialUsers,
}: ItemsPageClientProps) {
  const initialUnsold = initialItems.filter((item) => item.status === 0);
  const defaultSellerId = initialUsers[0]?.user_id ?? "";
  const defaultItemId = initialItems[0]?.item_id ?? "";
  const defaultUnsoldItemId = initialUnsold[0]?.item_id ?? "";

  const [items, setItems] = useState<ItemRow[]>(initialItems);
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [newItem, setNewItem] = useState({
    item_id: "",
    item_name: "",
    category: "DailyGoods",
    price: "",
    seller_id: defaultSellerId,
  });

  const [priceForm, setPriceForm] = useState({
    item_id: defaultItemId,
    price: "",
  });

  const [deleteItemId, setDeleteItemId] = useState(defaultUnsoldItemId);

  const [purchaseForm, setPurchaseForm] = useState({
    order_id: "",
    item_id: defaultUnsoldItemId,
    buyer_id: defaultSellerId,
    order_date: todayString(),
  });

  const unsoldItems = useMemo(
    () => items.filter((item) => item.status === 0),
    [items],
  );

  const effectiveSellerId =
    newItem.seller_id && users.some((u) => u.user_id === newItem.seller_id)
      ? newItem.seller_id
      : (users[0]?.user_id ?? "");

  const effectivePriceItemId =
    priceForm.item_id && items.some((i) => i.item_id === priceForm.item_id)
      ? priceForm.item_id
      : (items[0]?.item_id ?? "");

  const effectiveDeleteItemId =
    deleteItemId && unsoldItems.some((i) => i.item_id === deleteItemId)
      ? deleteItemId
      : (unsoldItems[0]?.item_id ?? "");

  const effectiveBuyerId =
    purchaseForm.buyer_id && users.some((u) => u.user_id === purchaseForm.buyer_id)
      ? purchaseForm.buyer_id
      : (users[0]?.user_id ?? "");

  const effectivePurchaseItemId =
    purchaseForm.item_id && unsoldItems.some((i) => i.item_id === purchaseForm.item_id)
      ? purchaseForm.item_id
      : (unsoldItems[0]?.item_id ?? "");

  async function withJson<T>(res: Response): Promise<ApiResponse<T>> {
    return (await res.json()) as ApiResponse<T>;
  }

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [itemsRes, usersRes] = await Promise.all([
        fetch("/api/items", { cache: "no-store" }),
        fetch("/api/users", { cache: "no-store" }),
      ]);

      const itemsJson = (await itemsRes.json()) as ApiResponse<ItemRow[]>;
      const usersJson = (await usersRes.json()) as ApiResponse<UserRow[]>;

      if (!itemsRes.ok || !itemsJson.ok || !itemsJson.data) {
        throw new Error(itemsJson.error ?? "加载商品失败");
      }

      if (!usersRes.ok || !usersJson.ok || !usersJson.data) {
        throw new Error(usersJson.error ?? "加载用户失败");
      }

      setItems(itemsJson.data);
      setUsers(usersJson.data);
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

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          seller_id: effectiveSellerId,
          price: Number(newItem.price),
          status: 0,
        }),
      });

      const json = await withJson<ItemRow>(res);

      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "新增商品失败");
      }

      setNotice("新增商品成功");
      setNewItem((prev) => ({ ...prev, item_id: "", item_name: "", price: "" }));
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "新增商品失败";
      setError(message);
    }
  }

  async function handleUpdatePrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");

    if (!effectivePriceItemId) {
      setError("改价失败：当前没有可改价的商品。");
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
    }
  }

  async function handleDeleteUnsold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");

    if (!effectiveDeleteItemId) {
      setError("删除失败：当前没有未售商品可删除。");
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
    }
  }

  async function handlePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");

    if (!effectivePurchaseItemId) {
      setError("购买失败：当前没有未售商品可购买。");
      return;
    }

    if (!effectiveBuyerId) {
      setError("购买失败：当前没有可选买家。");
      return;
    }

    try {
      const res = await fetch("/api/orders/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...purchaseForm,
          item_id: effectivePurchaseItemId,
          buyer_id: effectiveBuyerId,
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
    }
  }

  return (
    <main className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">商品列表与数据操作</h2>
            <p className="text-sm text-slate-600">
              本页支持：新增商品、修改价格、删除未售商品、购买商品。
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            刷新
          </button>
        </div>
      </section>

      {notice ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={handleAddItem}
          className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
        >
          <h3 className="font-semibold">插入新商品</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              required
              value={newItem.item_id}
              onChange={(e) => setNewItem((prev) => ({ ...prev, item_id: e.target.value }))}
              placeholder="item_id"
              className="rounded border border-slate-300 px-2 py-1.5"
            />
            <input
              required
              value={newItem.item_name}
              onChange={(e) => setNewItem((prev) => ({ ...prev, item_name: e.target.value }))}
              placeholder="item_name"
              className="rounded border border-slate-300 px-2 py-1.5"
            />
            <input
              required
              value={newItem.category}
              onChange={(e) => setNewItem((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="category"
              className="rounded border border-slate-300 px-2 py-1.5"
            />
            <input
              required
              type="number"
              min={1}
              value={newItem.price}
              onChange={(e) => setNewItem((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="price"
              className="rounded border border-slate-300 px-2 py-1.5"
            />
            <select
              value={effectiveSellerId}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, seller_id: e.target.value }))
              }
              className="rounded border border-slate-300 px-2 py-1.5 sm:col-span-2"
            >
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.user_id} - {user.user_name}
                </option>
              ))}
            </select>
          </div>
          <button className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">
            新增商品
          </button>
        </form>

        <form
          onSubmit={handleUpdatePrice}
          className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
        >
          <h3 className="font-semibold">修改商品价格</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={effectivePriceItemId}
              onChange={(e) =>
                setPriceForm((prev) => ({ ...prev, item_id: e.target.value }))
              }
              className="rounded border border-slate-300 px-2 py-1.5"
            >
              {items.map((item) => (
                <option key={item.item_id} value={item.item_id}>
                  {item.item_id} - {item.item_name}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              min={1}
              value={priceForm.price}
              onChange={(e) =>
                setPriceForm((prev) => ({ ...prev, price: e.target.value }))
              }
              placeholder="新价格"
              className="rounded border border-slate-300 px-2 py-1.5"
            />
          </div>
          <button className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">
            提交改价
          </button>
        </form>

        <form
          onSubmit={handleDeleteUnsold}
          className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
        >
          <h3 className="font-semibold">删除未售出的商品</h3>
          <select
            value={effectiveDeleteItemId}
            onChange={(e) => setDeleteItemId(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5"
          >
            {unsoldItems.map((item) => (
              <option key={item.item_id} value={item.item_id}>
                {item.item_id} - {item.item_name}
              </option>
            ))}
          </select>
          <button className="rounded bg-rose-600 px-3 py-1.5 text-sm text-white">
            删除未售商品
          </button>
        </form>

        <form
          onSubmit={handlePurchase}
          className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
        >
          <h3 className="font-semibold">购买商品（SQL事务逻辑）</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              required
              value={purchaseForm.order_id}
              onChange={(e) =>
                setPurchaseForm((prev) => ({ ...prev, order_id: e.target.value }))
              }
              placeholder="order_id，例如 o003"
              className="rounded border border-slate-300 px-2 py-1.5"
            />
            <input
              required
              type="date"
              value={purchaseForm.order_date}
              onChange={(e) =>
                setPurchaseForm((prev) => ({ ...prev, order_date: e.target.value }))
              }
              className="rounded border border-slate-300 px-2 py-1.5"
            />
            <select
              value={effectivePurchaseItemId}
              onChange={(e) =>
                setPurchaseForm((prev) => ({ ...prev, item_id: e.target.value }))
              }
              className="rounded border border-slate-300 px-2 py-1.5"
            >
              {unsoldItems.map((item) => (
                <option key={item.item_id} value={item.item_id}>
                  {item.item_id} - {item.item_name}
                </option>
              ))}
            </select>
            <select
              value={effectiveBuyerId}
              onChange={(e) =>
                setPurchaseForm((prev) => ({ ...prev, buyer_id: e.target.value }))
              }
              className="rounded border border-slate-300 px-2 py-1.5"
            >
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.user_id} - {user.user_name}
                </option>
              ))}
            </select>
          </div>
          <button className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white">
            购买并写入订单
          </button>
        </form>
      </section>

      {loading ? (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          正在加载...
        </p>
      ) : (
        <ResultTable title="Item 表" rows={items} />
      )}
    </main>
  );
}
