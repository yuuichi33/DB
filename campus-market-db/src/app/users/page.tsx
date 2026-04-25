import { ResultTable } from "@/components/result-table";
import { listUsers } from "@/lib/marketplace-db";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <main className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">用户列表</h2>
            <p className="text-sm text-slate-600">展示 User 表中的全部数据。</p>
          </div>
          <a
            href="/users"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            刷新
          </a>
        </div>
      </section>

      <ResultTable title="User 表" rows={users} />
    </main>
  );
}
