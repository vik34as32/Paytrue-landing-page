export function exportToCsv(filename, rows, columns) {
  const headers = columns.map((c) => c.label).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const val = col.selector ? col.selector(row) : row[col.key];
          const str = String(val ?? "").replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([`${headers}\n${body}`], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportToExcel(filename, rows, columns) {
  const tableHeader = `<tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr>`;
  const tableBody = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((col) => {
            const val = col.selector ? col.selector(row) : row[col.key];
            return `<td>${val ?? ""}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");

  const html = `<html><head><meta charset="UTF-8"></head><body><table>${tableHeader}${tableBody}</table></body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function printTable(title, rows, columns) {
  const tableHeader = columns.map((c) => `<th style="padding:8px;border:1px solid #ccc">${c.label}</th>`).join("");
  const tableBody = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((col) => {
            const val = col.selector ? col.selector(row) : row[col.key];
            return `<td style="padding:8px;border:1px solid #ccc">${val ?? ""}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <html><head><title>${title}</title></head><body>
    <h2>${title}</h2>
    <table style="border-collapse:collapse;width:100%">${tableHeader}${tableBody}</table>
    </body></html>
  `);
  win.document.close();
  win.print();
}
