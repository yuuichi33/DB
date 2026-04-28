"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");

  const mountedRef = useRef(true);

  async function handleLogout() {
    setStatus("pending");
    setMessage("");

    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!mountedRef.current) return;

      if (res.ok) {
        setStatus("success");
        setMessage("已退出登录，正在跳转到商品页...");
        // 给用户一点感知时间，再跳转
        setTimeout(() => {
          router.push("/items");
          router.refresh();
        }, 600);
        return;
      }

      const json = await res.json().catch(() => null);
      setStatus("error");
      setMessage(json?.error ?? "退出失败，请重试。");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "退出失败");
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    // 调用放到微任务中，避免在 effect 同步调用 setState 导致 lint 报错
    Promise.resolve().then(handleLogout);
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl">
      <section className="surface-card p-6 md:p-7">
        <h2 className="text-lg font-semibold">退出登录</h2>
        <div className="mt-4">
          {status === "pending" && <p>正在退出登录…</p>}
          {status === "success" && (
            <p className="text-sm text-[#01564d]">{message}</p>
          )}
          {status === "error" && (
            <>
              <p className="text-sm text-[#9f2218]">{message}</p>
              <div className="mt-4 flex gap-2">
                <Link href="/items" className="btn-primary">
                  返回商品页
                </Link>
                <button className="btn-outline" onClick={() => handleLogout()}>
                  再试一次
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
