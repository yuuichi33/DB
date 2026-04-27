import { ok, toApiError } from "@/lib/api-response";
import { clearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    const response = ok({ message: "已退出登录" });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return toApiError(error);
  }
}
