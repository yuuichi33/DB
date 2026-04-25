import { fail, ok, toApiError } from "@/lib/api-response";
import { insertItem, listItems } from "@/lib/marketplace-db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await listItems();
    return ok(rows);
  } catch (error) {
    return toApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const itemId = String(body.item_id ?? "").trim();
    const itemName = String(body.item_name ?? "").trim();
    const category = String(body.category ?? "").trim();
    const sellerId = String(body.seller_id ?? "").trim();
    const price = Number(body.price);

    if (!itemId || !itemName || !category || !sellerId) {
      return fail("新增商品失败：字段不能为空。", 400);
    }

    if (!Number.isInteger(price) || price <= 0) {
      return fail("新增商品失败：price 必须是正整数。", 400);
    }

    const row = await insertItem({
      item_id: itemId,
      item_name: itemName,
      category,
      seller_id: sellerId,
      price,
      status: 0,
    });

    return ok(row);
  } catch (error) {
    return toApiError(error);
  }
}
