import { ItemsPageClient } from "@/components/items-page-client";
import { listItems } from "@/lib/marketplace-db";

export const dynamic = "force-dynamic";

async function getItemsPageData() {
  try {
    const items = await listItems();
    return { items, hasData: true };
  } catch {
    return { items: [], hasData: false };
  }
}

export default async function ItemsPage() {
  const { items, hasData } = await getItemsPageData();

  return (
    <ItemsPageClient
      initialItems={items}
      hasData={hasData}
    />
  );
}
