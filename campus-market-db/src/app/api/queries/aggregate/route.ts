import { fail, ok, toApiError } from "@/lib/api-response";
import { AggregateQueryType, runAggregateQuery } from "@/lib/marketplace-db";

export const runtime = "nodejs";

const validTypes: AggregateQueryType[] = [
  "total_items",
  "items_per_category",
  "avg_price",
  "top_publisher",
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") as AggregateQueryType | null;

    if (!type || !validTypes.includes(type)) {
      return fail("aggregate 查询参数 type 不合法", 400);
    }

    const rows = await runAggregateQuery(type);
    return ok(rows);
  } catch (error) {
    return toApiError(error);
  }
}
