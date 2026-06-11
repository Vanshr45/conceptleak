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
    <div
      className="overflow-x-auto rounded-xl"
      style={{ border: "1px solid var(--border)" }}
    >
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: "var(--surface-elevated)" }}>
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                style={{
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border)",
                }}
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
              style={{
                borderBottom: "1px solid var(--border)",
                background: i % 2 === 0 ? "var(--bg)" : "var(--surface)",
              }}
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-4 py-2.5 whitespace-nowrap font-mono text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
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
