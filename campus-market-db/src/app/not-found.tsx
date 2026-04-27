import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4">
      <section className="surface-card p-6 md:p-7">
        <p className="text-xs uppercase tracking-[0.08em] text-[#6f6556]">404</p>
        <h2 className="mt-1 text-2xl font-semibold text-[#221d14]">页面不存在</h2>
        <p className="mt-2 max-w-xl text-sm text-[#5f5545]">
          你访问的内容可能已被移动或暂时下线。可以返回首页继续浏览校园交易市场。
        </p>

        <div className="mt-4">
          <Link href="/" className="btn-primary">
            返回首页
          </Link>
        </div>
      </section>
    </div>
  );
}
