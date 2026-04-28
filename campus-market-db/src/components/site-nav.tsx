"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "发现" },
  { href: "/items", label: "交易市场" },
  { href: "/orders", label: "订单中心" },
  { href: "/users", label: "社区用户" },
  { href: "/queries", label: "数据洞察" },
];

const authItems = [
  { href: "/login", label: "登录" },
  { href: "/register", label: "注册" },
];

type AuthUser = {
  user_id: string;
  user_name: string;
  phone: string;
};

export function SiteNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const json = (await res.json()) as { ok: boolean; data?: AuthUser };
        if (!active) {
          return;
        }

        if (res.ok && json.ok && json.data) {
          setCurrentUser(json.data);
        }
      } catch {
        // ignore auth check errors
      } finally {
        if (active) {
          setAuthChecked(true);
        }
      }
    }

    loadMe();
    return () => {
      active = false;
    };
  }, []);

  const displayName = currentUser?.user_name || currentUser?.user_id;

  return (
    <header className="sticky top-0 z-40 border-b border-[#d9cfbe]/80 bg-[#fffdf8]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="min-w-[12rem]">
          <p className="font-[var(--font-space-grotesk)] text-[0.72rem] uppercase tracking-[0.16em] text-[#6f6555]">
            CAMPUS LOOP
          </p>
          <h1 className="text-lg font-semibold text-[#1f1b15]">校园换物</h1>
          <p className="text-xs text-[#6f6555]">让每件闲置继续被需要</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-[#d4efe9] text-[#004d40]"
                  : "text-[#3b3429] hover:bg-[#f3ebdd]"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {displayName ? (
            <span className="rounded-lg border border-[#9ccdc2] bg-[#e8f6f3] px-3 py-1.5 text-sm font-medium text-[#01564d]">
              你好：{displayName}
            </span>
          ) : null}

          {authChecked && !displayName
            ? authItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "border-[#9ccdc2] bg-[#e8f6f3] text-[#01564d]"
                      : "border-[var(--line-strong)] text-[#3b3429] hover:bg-[#f3ebdd]"
                  }`}
                >
                  {item.label}
                </Link>
              ))
            : null}

          <Link href="/items#publish" className="btn-primary text-sm">
            发布闲置
          </Link>
        </nav>
      </div>
    </header>
  );
}
