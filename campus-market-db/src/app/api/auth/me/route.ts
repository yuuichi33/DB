import { fail, ok, toApiError } from "@/lib/api-response";
import { getSessionUserIdFromRequest } from "@/lib/auth";
import { getUserById } from "@/lib/marketplace-db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const userId = getSessionUserIdFromRequest(request);
    if (!userId) {
      return fail("未登录", 401);
    }

    const user = await getUserById(userId);
    if (!user) {
      return fail("登录态无效，请重新登录。", 401);
    }

    return ok(user);
  } catch (error) {
    return toApiError(error);
  }
}
