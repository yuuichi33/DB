"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4">
      <section className="surface-card status-panel-error p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.08em]">Error</p>
        <h2 className="mt-1 text-xl font-semibold">页面出现异常</h2>
        <p className="mt-2 text-sm">
          系统暂时无法完成当前请求。你可以重试一次，或稍后刷新页面。
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => reset()} className="btn-primary">
            重新尝试
          </button>
          <Link href="/" className="btn-soft">
            返回首页
          </Link>
        </div>
      </section>
    </div>
  );
}
