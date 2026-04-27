type CellValue = string | number | boolean | null;
type Row = Record<string, CellValue>;

type ResultTableProps = {
  title: string;
  rows: Row[];
  description?: string;
  emptyText?: string;
};

function formatValue(value: CellValue) {
  if (value === null) return "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function ResultTable({
  title,
  rows,
  description,
  emptyText = "暂无数据",
}: ResultTableProps) {
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-[var(--line)] px-4 py-3 md:px-5">
        <h3 className="text-base font-semibold text-[#241f18]">{title}</h3>
        {description ? <p className="mt-1 text-xs text-[#6a5e4c]">{description}</p> : null}
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-[#6d6252] md:px-5">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#f8f1e5] text-left text-[#5f5545]">
                {columns.map((col) => (
                  <th key={col} className="whitespace-nowrap border-b border-[var(--line)] px-4 py-2.5 font-semibold md:px-5">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="odd:bg-[#fffdf8] even:bg-[#f9f4eb]">
                  {columns.map((col) => (
                    <td key={col} className="whitespace-nowrap border-b border-[#ece3d4] px-4 py-2.5 text-[#2b261e] md:px-5">
                      {formatValue(row[col] ?? null)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
