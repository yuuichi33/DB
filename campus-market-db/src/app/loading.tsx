export default function Loading() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <section className="surface-card animate-pulse p-6">
        <div className="h-4 w-28 rounded bg-[#eadfcd]" />
        <div className="mt-3 h-8 w-3/5 rounded bg-[#eadfcd]" />
        <div className="mt-3 h-4 w-full rounded bg-[#f0e8db]" />
        <div className="mt-2 h-4 w-4/5 rounded bg-[#f0e8db]" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="kpi-card animate-pulse">
            <div className="h-3 w-20 rounded bg-[#eadfcd]" />
            <div className="mt-3 h-7 w-14 rounded bg-[#f0e8db]" />
          </div>
        ))}
      </section>

      <p className="text-sm text-[#5f5545]">页面加载中，请稍候...</p>
    </div>
  );
}
