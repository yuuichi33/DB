import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-semibold">项目首页</h2>
        <p className="mt-2 text-sm text-slate-600">
          本系统用于完成数据库课程大作业，支持三表展示、数据操作、查询展示、视图查询与购买事务逻辑。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/items"
          className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
        >
          <h3 className="font-semibold">商品列表</h3>
          <p className="mt-1 text-sm text-slate-600">查看商品并执行新增、改价、删除、购买操作。</p>
        </Link>

        <Link
          href="/users"
          className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
        >
          <h3 className="font-semibold">用户列表</h3>
          <p className="mt-1 text-sm text-slate-600">展示 User 表所有用户数据。</p>
        </Link>

        <Link
          href="/orders"
          className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
        >
          <h3 className="font-semibold">订单列表</h3>
          <p className="mt-1 text-sm text-slate-600">展示 Orders 表数据和订单详情联查结果。</p>
        </Link>

        <Link
          href="/queries"
          className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
        >
          <h3 className="font-semibold">查询展示</h3>
          <p className="mt-1 text-sm text-slate-600">通过按钮触发基本、连接、聚合和视图查询。</p>
        </Link>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-semibold text-amber-900">部署前必做</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-amber-900">
          <li>在数据库中按顺序执行 sql 目录下的 4 个脚本。</li>
          <li>在 .env.local 中配置 POSTGRES_URL。</li>
          <li>启动开发服务并验证四个页面均可访问。</li>
        </ol>
      </section>
    </main>
  );
}
