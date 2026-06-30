"use client";

export default function DataTable({ columns, rows, emptyMessage = "No records found" }) {
  if (!rows?.length) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`pb-3 pr-4 ${column.className || ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`py-3 pr-4 align-middle ${column.className || ""}`}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
