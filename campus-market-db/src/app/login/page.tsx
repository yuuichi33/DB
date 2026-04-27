"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    login_id: "",
    password: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = (await res.json()) as ApiResponse<{ user_id: string }>;
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "登录失败");
      }

      router.push("/items");
      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "登录失败";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <section className="surface-card p-6 md:p-7">
        <p className="text-xs uppercase tracking-[0.08em] text-[#6f6556]">Account</p>
        <h2 className="mt-1 text-2xl font-semibold text-[#221d14]">登录</h2>
        <p className="mt-2 text-sm text-[#5f5545]">
          输入账号信息进入 CampusLoop。
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-[#e5b8b4] bg-[#fff1f0] p-3 text-sm text-[#9f2218]" role="alert">
            {error}
          </p>
        ) : null}

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="login-id" className="text-sm font-medium text-[#3b3429]">
              用户 ID 或手机号
            </label>
            <input
              id="login-id"
              name="login_id"
              type="text"
              required
              autoComplete="username"
              value={form.login_id}
              onChange={(e) => setForm((prev) => ({ ...prev, login_id: e.target.value }))}
              placeholder="例如：u001 或 13800000001"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-sm font-medium text-[#3b3429]">
              密码
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="请输入密码"
              className="input-field"
            />
          </div>

          <button type="submit" disabled={pending} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="mt-2 text-xs text-[#6f6556]">种子用户默认密码：Campus123!</p>

        <p className="mt-4 text-sm text-[#5f5545]">
          还没有账号？
          <Link href="/register" className="ml-1 font-semibold text-[#01564d] hover:underline">
            去注册
          </Link>
        </p>
      </section>
    </div>
  );
}
