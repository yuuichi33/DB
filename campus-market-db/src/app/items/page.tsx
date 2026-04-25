import { ItemsPageClient } from "@/components/items-page-client";
import { listItems, listUsers } from "@/lib/marketplace-db";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const [items, users] = await Promise.all([listItems(), listUsers()]);

  return <ItemsPageClient initialItems={items} initialUsers={users} />;
}
