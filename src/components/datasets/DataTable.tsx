"use client";

interface DataTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

export default function DataTable({ columns, rows }: DataTableProps) {
  function formatCell(value: unknown): string {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return value.toLocaleString();
    return String(value);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-800/80">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap border-b border-slate-700/50"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-slate-800/50 hover:bg-slate-700/20 transition-colors ${
                i % 2 === 0 ? "bg-slate-900/30" : "bg-slate-800/20"
              }`}
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-2.5 text-slate-300 whitespace-nowrap font-mono text-xs">
                  {formatCell(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
