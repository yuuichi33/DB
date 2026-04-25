import { ok, toApiError } from "@/lib/api-response";
import { listOrderDetails, listOrders } from "@/lib/marketplace-db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const detail = url.searchParams.get("detail");

    if (detail === "1") {
      const rows = await listOrderDetails();
      return ok(rows);
    }

    const rows = await listOrders();
    return ok(rows);
  } catch (error) {
    return toApiError(error);
  }
}
