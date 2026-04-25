import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/items", label: "商品列表" },
  { href: "/users", label: "用户列表" },
  { href: "/orders", label: "订单列表" },
  { href: "/queries", label: "查询展示" },
];

export function SiteNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <p className="text-sm text-slate-500">数据库大作业</p>
          <h1 className="text-lg font-semibold text-slate-900">
            校园二手交易平台
          </h1>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
