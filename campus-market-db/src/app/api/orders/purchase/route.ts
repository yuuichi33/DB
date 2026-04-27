import { fail, ok, toApiError } from "@/lib/api-response";
import { getSessionUserIdFromRequest } from "@/lib/auth";
import { getUserById } from "@/lib/marketplace-db";
import { purchaseItem } from "@/lib/marketplace-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const currentUserId = getSessionUserIdFromRequest(request);
    if (!currentUserId) {
      return fail("请先登录后再购买商品。", 401);
    }

    const currentUser = await getUserById(currentUserId);
    if (!currentUser) {
      return fail("登录态无效，请重新登录。", 401);
    }

    const body = await request.json();

    const orderId = String(body.order_id ?? "").trim();
    const itemId = String(body.item_id ?? "").trim();
    const orderDate = String(body.order_date ?? "").trim();

    if (!orderId || !itemId || !orderDate) {
      return fail("购买失败：order_id、item_id、order_date 均为必填项。", 400);
    }

    await purchaseItem({
      order_id: orderId,
      item_id: itemId,
      buyer_id: currentUser.user_id,
      order_date: orderDate,
    });

    return ok({ message: "购买成功" });
  } catch (error) {
    return toApiError(error);
  }
}
