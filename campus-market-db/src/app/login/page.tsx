import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <section className="surface-card p-6 md:p-7">
        <p className="text-xs uppercase tracking-[0.08em] text-[#6f6556]">Account</p>
        <h2 className="mt-1 text-2xl font-semibold text-[#221d14]">登录</h2>
        <p className="mt-2 text-sm text-[#5f5545]">
          输入账号信息进入 CampusLoop。
        </p>

        <form className="mt-5 space-y-3" action="#" method="post">
          <div className="space-y-1.5">
            <label htmlFor="login-id" className="text-sm font-medium text-[#3b3429]">
              用户名或邮箱
            </label>
            <input
              id="login-id"
              name="loginId"
              type="text"
              required
              autoComplete="username"
              placeholder="例如：student01"
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
              placeholder="请输入密码"
              className="input-field"
            />
          </div>

          <button type="submit" className="btn-primary w-full">登录</button>
        </form>

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
