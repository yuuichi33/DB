"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    user_name: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = (await res.json()) as ApiResponse<{ user_id: string }>;
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "注册失败");
      }

      router.push("/items");
      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "注册失败";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <section className="surface-card p-6 md:p-7">
        <p className="text-xs uppercase tracking-[0.08em] text-[#6f6556]">Account</p>
        <h2 className="mt-1 text-2xl font-semibold text-[#221d14]">注册</h2>
        <p className="mt-2 text-sm text-[#5f5545]">
          创建你的 CampusLoop 账号。
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-[#e5b8b4] bg-[#fff1f0] p-3 text-sm text-[#9f2218]" role="alert">
            {error}
          </p>
        ) : null}

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="register-id" className="text-sm font-medium text-[#3b3429]">
              用户 ID
            </label>
            <input
              id="register-id"
              name="user_id"
              type="text"
              required
              value={form.user_id}
              onChange={(e) => setForm((prev) => ({ ...prev, user_id: e.target.value }))}
              placeholder="例如：u005"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-name" className="text-sm font-medium text-[#3b3429]">
              用户名
            </label>
            <input
              id="register-name"
              name="user_name"
              type="text"
              required
              autoComplete="username"
              value={form.user_name}
              onChange={(e) => setForm((prev) => ({ ...prev, user_name: e.target.value }))}
              placeholder="例如：student01"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-contact" className="text-sm font-medium text-[#3b3429]">
              联系方式（手机号或邮箱）
            </label>
            <input
              id="register-contact"
              name="phone"
              type="text"
              required
              autoComplete="email"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="例如：13800000000"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-password" className="text-sm font-medium text-[#3b3429]">
              密码
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="请设置密码"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-confirm-password" className="text-sm font-medium text-[#3b3429]">
              确认密码
            </label>
            <input
              id="register-confirm-password"
              name="confirm_password"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm_password}
              onChange={(e) => setForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
              placeholder="请再次输入密码"
              className="input-field"
            />
          </div>

          <button type="submit" disabled={pending} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? "注册中..." : "注册"}
          </button>
        </form>

        <p className="mt-4 text-sm text-[#5f5545]">
          已有账号？
          <Link href="/login" className="ml-1 font-semibold text-[#01564d] hover:underline">
            去登录
          </Link>
        </p>
      </section>
    </div>
  );
}
