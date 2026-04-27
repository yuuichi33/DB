import { ItemsPageClient } from "@/components/items-page-client";
import { listItems, listUsers } from "@/lib/marketplace-db";

export const dynamic = "force-dynamic";

async function getItemsPageData() {
  try {
    const [items, users] = await Promise.all([listItems(), listUsers()]);
    return { items, users, hasData: true };
  } catch {
    return { items: [], users: [], hasData: false };
  }
}

export default async function ItemsPage() {
  const { items, users, hasData } = await getItemsPageData();

  return (
    <ItemsPageClient
      initialItems={items}
      initialUsers={users}
      hasData={hasData}
    />
  );
}
