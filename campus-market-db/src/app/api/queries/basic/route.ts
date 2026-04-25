import { fail, ok, toApiError } from "@/lib/api-response";
import { BasicQueryType, runBasicQuery } from "@/lib/marketplace-db";

export const runtime = "nodejs";

const validTypes: BasicQueryType[] = [
  "unsold",
  "price_gt_30",
  "daily_goods",
  "seller_u001",
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") as BasicQueryType | null;

    if (!type || !validTypes.includes(type)) {
      return fail("basic 查询参数 type 不合法", 400);
    }

    const rows = await runBasicQuery(type);
    return ok(rows);
  } catch (error) {
    return toApiError(error);
  }
}
