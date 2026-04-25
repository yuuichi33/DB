import { ok, toApiError } from "@/lib/api-response";
import { deleteUnsoldItem } from "@/lib/marketplace-db";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await context.params;
    const row = await deleteUnsoldItem(itemId);
    return ok(row);
  } catch (error) {
    return toApiError(error);
  }
}
