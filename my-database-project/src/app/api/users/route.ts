import { ok, toApiError } from "@/lib/api-response";
import { listUsers } from "@/lib/marketplace-db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await listUsers();
    return ok(rows);
  } catch (error) {
    return toApiError(error);
  }
}
