import { sql } from "@vercel/postgres";

export type UserRow = {
  user_id: string;
  user_name: string;
  phone: string;
};

export type ItemRow = {
  item_id: string;
  item_name: string;
  category: string;
  price: number;
  status: number;
  seller_id: string;
};

export type OrderRow = {
  order_id: string;
  item_id: string;
  buyer_id: string;
  order_date: string;
};

export type OrderDetailRow = {
  order_id: string;
  item_id: string;
  item_name: string;
  buyer_id: string;
  buyer_name: string;
  order_date: string;
};

export type BasicQueryType =
  | "unsold"
  | "price_gt_30"
  | "daily_goods"
  | "seller_u001";

export type JoinQueryType =
  | "sold_with_buyer"
  | "order_item_buyer_date"
  | "seller_u001_purchase_status";

export type AggregateQueryType =
  | "total_items"
  | "items_per_category"
  | "avg_price"
  | "top_publisher";

export type ViewQueryType = "sold_view" | "unsold_view";

function ensurePostgresEnv() {
  if (!process.env.POSTGRES_URL) {
    throw new Error(
      "未检测到 POSTGRES_URL。请在 .env.local 或 Vercel 环境变量中配置数据库连接。",
    );
  }
}

export async function listUsers() {
  ensurePostgresEnv();
  const result = await sql<UserRow>`
    SELECT user_id, user_name, phone
    FROM "user"
    ORDER BY user_id
  `;
  return result.rows;
}

export async function listItems() {
  ensurePostgresEnv();
  const result = await sql<ItemRow>`
    SELECT item_id, item_name, category, price, status, seller_id
    FROM item
    ORDER BY item_id
  `;
  return result.rows;
}

export async function listOrders() {
  ensurePostgresEnv();
  const result = await sql<OrderRow>`
    SELECT order_id, item_id, buyer_id, order_date::text
    FROM orders
    ORDER BY order_id
  `;
  return result.rows;
}

export async function listOrderDetails() {
  ensurePostgresEnv();
  const result = await sql<OrderDetailRow>`
    SELECT
      o.order_id,
      o.item_id,
      i.item_name,
      o.buyer_id,
      u.user_name AS buyer_name,
      o.order_date::text
    FROM orders o
    JOIN item i ON i.item_id = o.item_id
    JOIN "user" u ON u.user_id = o.buyer_id
    ORDER BY o.order_id
  `;
  return result.rows;
}

export async function insertItem(input: {
  item_id: string;
  item_name: string;
  category: string;
  price: number;
  status?: number;
  seller_id: string;
}) {
  ensurePostgresEnv();
  const status = input.status ?? 0;

  const result = await sql<ItemRow>`
    INSERT INTO item (item_id, item_name, category, price, status, seller_id)
    VALUES (
      ${input.item_id},
      ${input.item_name},
      ${input.category},
      ${input.price},
      ${status},
      ${input.seller_id}
    )
    RETURNING item_id, item_name, category, price, status, seller_id
  `;

  return result.rows[0];
}

export async function updateItemPrice(itemId: string, newPrice: number) {
  ensurePostgresEnv();
  const result = await sql<ItemRow>`
    UPDATE item
    SET price = ${newPrice}
    WHERE item_id = ${itemId}
    RETURNING item_id, item_name, category, price, status, seller_id
  `;

  if (result.rows.length === 0) {
    throw new Error("未找到要改价的商品。");
  }

  return result.rows[0];
}

export async function deleteUnsoldItem(itemId: string) {
  ensurePostgresEnv();
  const result = await sql<ItemRow>`
    DELETE FROM item
    WHERE item_id = ${itemId} AND status = 0
    RETURNING item_id, item_name, category, price, status, seller_id
  `;

  if (result.rows.length === 0) {
    throw new Error("删除失败：商品不存在，或该商品不是未售出状态。");
  }

  return result.rows[0];
}

export async function purchaseItem(input: {
  order_id: string;
  item_id: string;
  buyer_id: string;
  order_date: string;
}) {
  ensurePostgresEnv();
  await sql`
    SELECT purchase_item(
      ${input.order_id},
      ${input.item_id},
      ${input.buyer_id},
      ${input.order_date}::date
    )
  `;

  return { message: "购买成功" };
}

export async function runBasicQuery(type: BasicQueryType) {
  ensurePostgresEnv();

  switch (type) {
    case "unsold": {
      const result = await sql`
        SELECT item_id, item_name, category, price, status, seller_id
        FROM item
        WHERE status = 0
        ORDER BY item_id
      `;
      return result.rows;
    }
    case "price_gt_30": {
      const result = await sql`
        SELECT item_id, item_name, category, price, status, seller_id
        FROM item
        WHERE price > 30
        ORDER BY price DESC
      `;
      return result.rows;
    }
    case "daily_goods": {
      const result = await sql`
        SELECT item_id, item_name, category, price, status, seller_id
        FROM item
        WHERE category IN ('DailyGoods', '生活用品')
        ORDER BY item_id
      `;
      return result.rows;
    }
    case "seller_u001": {
      const result = await sql`
        SELECT item_id, item_name, category, price, status, seller_id
        FROM item
        WHERE seller_id = 'u001'
        ORDER BY item_id
      `;
      return result.rows;
    }
    default:
      throw new Error("不支持的基本查询类型");
  }
}

export async function runJoinQuery(type: JoinQueryType) {
  ensurePostgresEnv();

  switch (type) {
    case "sold_with_buyer": {
      const result = await sql`
        SELECT i.item_id, i.item_name, u.user_name AS buyer_name
        FROM item i
        JOIN orders o ON o.item_id = i.item_id
        JOIN "user" u ON u.user_id = o.buyer_id
        WHERE i.status = 1
        ORDER BY i.item_id
      `;
      return result.rows;
    }
    case "order_item_buyer_date": {
      const result = await sql`
        SELECT
          o.order_id,
          i.item_name,
          u.user_name AS buyer_name,
          o.order_date::text
        FROM orders o
        JOIN item i ON i.item_id = o.item_id
        JOIN "user" u ON u.user_id = o.buyer_id
        ORDER BY o.order_date
      `;
      return result.rows;
    }
    case "seller_u001_purchase_status": {
      const result = await sql`
        SELECT
          i.item_id,
          i.item_name,
          CASE WHEN o.item_id IS NULL THEN '否' ELSE '是' END AS is_purchased
        FROM item i
        LEFT JOIN orders o ON o.item_id = i.item_id
        WHERE i.seller_id = 'u001'
        ORDER BY i.item_id
      `;
      return result.rows;
    }
    default:
      throw new Error("不支持的连接查询类型");
  }
}

export async function runAggregateQuery(type: AggregateQueryType) {
  ensurePostgresEnv();

  switch (type) {
    case "total_items": {
      const result = await sql`
        SELECT COUNT(*)::int AS total_items
        FROM item
      `;
      return result.rows;
    }
    case "items_per_category": {
      const result = await sql`
        SELECT category, COUNT(*)::int AS item_count
        FROM item
        GROUP BY category
        ORDER BY item_count DESC, category ASC
      `;
      return result.rows;
    }
    case "avg_price": {
      const result = await sql`
        SELECT ROUND(AVG(price)::numeric, 2) AS avg_price
        FROM item
      `;
      return result.rows;
    }
    case "top_publisher": {
      const result = await sql`
        SELECT u.user_id, u.user_name, COUNT(i.item_id)::int AS publish_count
        FROM "user" u
        LEFT JOIN item i ON i.seller_id = u.user_id
        GROUP BY u.user_id, u.user_name
        ORDER BY publish_count DESC, u.user_id ASC
        LIMIT 1
      `;
      return result.rows;
    }
    default:
      throw new Error("不支持的聚合查询类型");
  }
}

export async function runViewQuery(type: ViewQueryType) {
  ensurePostgresEnv();

  switch (type) {
    case "sold_view": {
      const result = await sql`
        SELECT item_id, item_name, buyer_id
        FROM sold_item_view
        ORDER BY item_id
      `;
      return result.rows;
    }
    case "unsold_view": {
      const result = await sql`
        SELECT item_id, item_name, category, price, seller_id
        FROM unsold_item_view
        ORDER BY item_id
      `;
      return result.rows;
    }
    default:
      throw new Error("不支持的视图查询类型");
  }
}
