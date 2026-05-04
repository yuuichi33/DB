import { ResultTable } from "@/components/result-table";

type CellValue = string | number | boolean | null;

type Row = Record<string, CellValue>;

type QueryResultTableProps = {
  title: string;
  rows: Row[];
  description?: string;
  emptyText?: string;
};

export function QueryResultTable({
  title,
  rows,
  description,
  emptyText,
}: QueryResultTableProps) {
  return (
    <ResultTable
      title={title}
      rows={rows}
      description={description}
      emptyText={emptyText}
    />
  );
}
