export const RECEIPT_PRINT_PAGE_STYLE = `
  @page { size: A4 portrait; margin: 10mm; }
  @media print {
    html, body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .receipt-no-print, .print\\:hidden { display: none !important; }
  }
`;
