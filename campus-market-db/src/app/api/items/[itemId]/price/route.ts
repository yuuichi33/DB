import { fail, ok, toApiError } from "@/lib/api-response";
import { getSessionUserIdFromRequest } from "@/lib/auth";
import { getUserById } from "@/lib/marketplace-db";
import { updateItemPrice } from "@/lib/marketplace-db";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    const currentUserId = getSessionUserIdFromRequest(request);
    if (!currentUserId) {
      return fail("请先登录后再改价。", 401);
    }

    const currentUser = await getUserById(currentUserId);
    if (!currentUser) {
      return fail("登录态无效，请重新登录。", 401);
    }

    const { itemId } = await context.params;
    const body = await request.json();
    const price = Number(body.price);

    if (!Number.isInteger(price) || price <= 0) {
      return fail("改价失败：price 必须是正整数。", 400);
    }

    const row = await updateItemPrice(itemId, price, currentUser.user_id);
    return ok(row);
  } catch (error) {
    return toApiError(error);
  }
}
