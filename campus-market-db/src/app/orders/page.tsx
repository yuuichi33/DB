import { OrdersPageClient } from "@/components/orders-page-client";
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

  return (
    <OrdersPageClient
      orders={orders}
      orderDetails={orderDetails}
      items={items}
      hasData={hasData}
    />
  );
}
