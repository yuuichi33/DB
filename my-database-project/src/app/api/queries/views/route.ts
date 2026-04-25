import { fail, ok, toApiError } from "@/lib/api-response";
import { ViewQueryType, runViewQuery } from "@/lib/marketplace-db";

export const runtime = "nodejs";

const validTypes: ViewQueryType[] = ["sold_view", "unsold_view"];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") as ViewQueryType | null;

    if (!type || !validTypes.includes(type)) {
      return fail("views 查询参数 type 不合法", 400);
    }

    const rows = await runViewQuery(type);
    return ok(rows);
  } catch (error) {
    return toApiError(error);
  }
}
