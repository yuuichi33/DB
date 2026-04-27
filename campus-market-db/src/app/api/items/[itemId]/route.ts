import { fail, ok, toApiError } from "@/lib/api-response";
import { getSessionUserIdFromRequest } from "@/lib/auth";
import { getUserById } from "@/lib/marketplace-db";
import { deleteUnsoldItem } from "@/lib/marketplace-db";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    const currentUserId = getSessionUserIdFromRequest(_request);
    if (!currentUserId) {
      return fail("请先登录后再删除商品。", 401);
    }

    const currentUser = await getUserById(currentUserId);
    if (!currentUser) {
      return fail("登录态无效，请重新登录。", 401);
    }

    const { itemId } = await context.params;
    const row = await deleteUnsoldItem(itemId, currentUser.user_id);
    return ok(row);
  } catch (error) {
    return toApiError(error);
  }
}
