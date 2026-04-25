import { fail, ok, toApiError } from "@/lib/api-response";
import { JoinQueryType, runJoinQuery } from "@/lib/marketplace-db";

export const runtime = "nodejs";

const validTypes: JoinQueryType[] = [
  "sold_with_buyer",
  "order_item_buyer_date",
  "seller_u001_purchase_status",
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") as JoinQueryType | null;

    if (!type || !validTypes.includes(type)) {
      return fail("join 查询参数 type 不合法", 400);
    }

    const rows = await runJoinQuery(type);
    return ok(rows);
  } catch (error) {
    return toApiError(error);
  }
}
