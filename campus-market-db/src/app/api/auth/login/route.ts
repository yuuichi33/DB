import { fail, ok, toApiError } from "@/lib/api-response";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { getUserAuthByLoginId } from "@/lib/marketplace-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const loginId = String(body.login_id ?? "").trim();
    const password = String(body.password ?? "");

    if (!loginId || !password) {
      return fail("登录失败：login_id 和 password 为必填项。", 400);
    }

    const user = await getUserAuthByLoginId(loginId);
    if (!user) {
      return fail("登录失败：账号或密码错误。", 401);
    }

    const matched = verifyPassword(password, user.password_hash);
    if (!matched) {
      return fail("登录失败：账号或密码错误。", 401);
    }

    const response = ok({
      user_id: user.user_id,
      user_name: user.user_name,
      phone: user.phone,
    });
    setSessionCookie(response, user.user_id);
    return response;
  } catch (error) {
    return toApiError(error);
  }
}
