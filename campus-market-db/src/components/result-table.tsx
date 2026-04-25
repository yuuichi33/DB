type CellValue = string | number | boolean | null;
type Row = Record<string, CellValue>;

type ResultTableProps = {
  title: string;
  rows: Row[];
};

function formatValue(value: CellValue) {
  if (value === null) return "-";
  return String(value);
}

export function ResultTable({ title, rows }: ResultTableProps) {
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="font-medium text-slate-900">{title}</h3>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">暂无数据</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                {columns.map((col) => (
                  <th key={col} className="border-b border-slate-200 px-4 py-2">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-slate-50/30">
                  {columns.map((col) => (
                    <td key={col} className="border-b border-slate-100 px-4 py-2">
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
