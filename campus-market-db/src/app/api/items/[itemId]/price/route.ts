import { fail, ok, toApiError } from "@/lib/api-response";
import { updateItemPrice } from "@/lib/marketplace-db";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await context.params;
    const body = await request.json();
    const price = Number(body.price);

    if (!Number.isInteger(price) || price <= 0) {
      return fail("改价失败：price 必须是正整数。", 400);
    }

    const row = await updateItemPrice(itemId, price);
    return ok(row);
  } catch (error) {
    return toApiError(error);
  }
}
