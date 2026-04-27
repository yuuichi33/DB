import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <section className="surface-card p-6 md:p-7">
        <p className="text-xs uppercase tracking-[0.08em] text-[#6f6556]">Account</p>
        <h2 className="mt-1 text-2xl font-semibold text-[#221d14]">注册</h2>
        <p className="mt-2 text-sm text-[#5f5545]">
          创建你的 CampusLoop 账号。
        </p>

        <form className="mt-5 space-y-3" action="#" method="post">
          <div className="space-y-1.5">
            <label htmlFor="register-name" className="text-sm font-medium text-[#3b3429]">
              用户名
            </label>
            <input
              id="register-name"
              name="userName"
              type="text"
              required
              autoComplete="username"
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
              name="contact"
              type="text"
              required
              autoComplete="email"
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
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="请再次输入密码"
              className="input-field"
            />
          </div>

          <button type="submit" className="btn-primary w-full">注册</button>
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
