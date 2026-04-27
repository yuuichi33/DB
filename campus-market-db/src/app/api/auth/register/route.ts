import { fail, ok, toApiError } from "@/lib/api-response";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { createUser } from "@/lib/marketplace-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userId = String(body.user_id ?? "").trim();
    const userName = String(body.user_name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirm_password ?? "");

    if (!userId || !userName || !phone || !password || !confirmPassword) {
      return fail("注册失败：user_id、user_name、phone、password、confirm_password 均为必填。", 400);
    }

    if (password.length < 6) {
      return fail("注册失败：密码长度不能少于 6 位。", 400);
    }

    if (password !== confirmPassword) {
      return fail("注册失败：两次输入的密码不一致。", 400);
    }

    const row = await createUser({
      user_id: userId,
      user_name: userName,
      phone,
      password_hash: hashPassword(password),
    });

    const response = ok(row);
    setSessionCookie(response, row.user_id);
    return response;
  } catch (error) {
    return toApiError(error);
  }
}
