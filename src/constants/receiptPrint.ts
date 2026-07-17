/**
 * Compact A4 print styles for Paytrue customer receipts.
 * Target: fit a full DMT/AEPS receipt in 1–2 pages (not 4–5).
 */
export const RECEIPT_PRINT_PAGE_STYLE = `
  @page {
    size: A4 portrait;
    margin: 8mm;
  }

  @media print {
    html, body {
      width: 100% !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .receipt-no-print,
    .receipt-payment-summary,
    .print\\:hidden {
      display: none !important;
    }

    .receipt-print-area,
    .receipt-print-area * {
      box-shadow: none !important;
      text-shadow: none !important;
    }

    .receipt-print-area {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      background: #fff !important;
      color: #111827 !important;
      font-size: 10.5px !important;
      line-height: 1.3 !important;
    }

    .receipt-print-area header,
    .receipt-print-area footer,
    .receipt-print-area section,
    .receipt-print-area .receipt-print-body,
    .receipt-print-area .receipt-main-col,
    .receipt-print-area .receipt-side-col {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .receipt-print-area .receipt-header {
      padding: 8px 10px !important;
      margin: 0 !important;
      page-break-after: avoid !important;
      break-after: avoid-page !important;
    }

    .receipt-print-area .receipt-header h1 {
      font-size: 18px !important;
      line-height: 1.15 !important;
    }

    .receipt-print-area .receipt-header .relative,
    .receipt-print-area .receipt-header img {
      width: 32px !important;
      height: 32px !important;
    }

    .receipt-print-area .receipt-header-row {
      gap: 8px !important;
    }

    .receipt-print-area .receipt-print-body {
      display: block !important;
      padding: 6px 10px 8px !important;
      margin: 0 !important;
    }

    /* Collapse Tailwind space-y-* */
    .receipt-print-area .space-y-8 > :not([hidden]) ~ :not([hidden]),
    .receipt-print-area .space-y-6 > :not([hidden]) ~ :not([hidden]),
    .receipt-print-area .space-y-4 > :not([hidden]) ~ :not([hidden]) {
      margin-top: 6px !important;
    }

    .receipt-print-area .receipt-print-grid {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) 120px !important;
      gap: 8px !important;
      align-items: start !important;
      margin-top: 6px !important;
    }

    .receipt-print-area .receipt-main-col {
      min-width: 0 !important;
    }

    .receipt-print-area .receipt-side-col {
      display: block !important;
      width: 120px !important;
    }

    .receipt-print-area .receipt-side-col .sticky {
      position: static !important;
      top: auto !important;
    }

    .receipt-print-area .receipt-qr-mobile {
      display: none !important;
    }

    .receipt-print-area section {
      margin: 0 !important;
      border-radius: 6px !important;
      overflow: hidden !important;
    }

    /* Success / status banner */
    .receipt-print-area .receipt-success-card {
      padding: 8px 10px !important;
      text-align: center !important;
      page-break-before: avoid !important;
      break-before: avoid-page !important;
    }

    .receipt-print-area .receipt-success-card .h-16,
    .receipt-print-area .receipt-success-card .w-16 {
      width: 28px !important;
      height: 28px !important;
      margin-bottom: 4px !important;
    }

    .receipt-print-area .receipt-success-card .h-9.w-9,
    .receipt-print-area .receipt-success-card svg {
      width: 16px !important;
      height: 16px !important;
    }

    .receipt-print-area .receipt-success-card h2 {
      font-size: 13px !important;
      margin: 0 !important;
    }

    .receipt-print-area .receipt-success-card .mt-2,
    .receipt-print-area .receipt-success-card .mt-6 {
      margin-top: 2px !important;
    }

    .receipt-print-area .receipt-success-card .text-3xl,
    .receipt-print-area .receipt-success-card .text-4xl {
      font-size: 18px !important;
      margin-top: 4px !important;
    }

    /* Card headers */
    .receipt-print-area section > div.border-b,
    .receipt-print-area section > div.bg-gradient-to-r,
    .receipt-print-area section > header {
      padding: 5px 8px !important;
    }

    .receipt-print-area section h3,
    .receipt-print-area section h4 {
      font-size: 11px !important;
      line-height: 1.2 !important;
    }

    /* Customer detail cells */
    .receipt-print-area .grid.gap-4.p-5,
    .receipt-print-area .grid.gap-4 {
      gap: 4px !important;
      padding: 6px !important;
      grid-template-columns: 1fr 1fr !important;
    }

    .receipt-print-area .rounded-xl.bg-\\[\\#F8FAFC\\],
    .receipt-print-area .rounded-xl {
      padding: 4px 6px !important;
      border-radius: 4px !important;
    }

    /* Transaction / summary rows */
    .receipt-print-area .receipt-detail-row {
      padding: 3px 8px !important;
      gap: 8px !important;
    }

    .receipt-print-area .receipt-detail-icon {
      display: none !important;
    }

    /* Bank table cells */
    .receipt-print-area .grid.grid-cols-\\[minmax\\(120px\\,34\\%\\)_1fr\\] > div,
    .receipt-print-area [class*="grid-cols-"] > div.px-4.py-3 {
      padding: 3px 6px !important;
    }

    /* QR compact */
    .receipt-print-area .receipt-side-col section {
      padding: 6px !important;
    }

    .receipt-print-area .receipt-side-col .h-\\[148px\\],
    .receipt-print-area .receipt-side-col .w-\\[148px\\] {
      width: 84px !important;
      height: 84px !important;
      padding: 4px !important;
    }

    .receipt-print-area .receipt-side-col img {
      width: 76px !important;
      height: 76px !important;
    }

    .receipt-print-area .receipt-side-col .mb-3,
    .receipt-print-area .receipt-side-col .mt-3,
    .receipt-print-area .receipt-side-col .mt-1 {
      margin: 2px 0 !important;
    }

    .receipt-print-area .receipt-side-col p {
      font-size: 9px !important;
    }

    /* Notice */
    .receipt-print-area section.flex.gap-3 {
      padding: 6px 8px !important;
      gap: 6px !important;
    }

    .receipt-print-area section.flex.gap-3 p {
      margin: 0 !important;
      font-size: 9.5px !important;
      line-height: 1.25 !important;
    }

    /* Footer */
    .receipt-print-area .receipt-footer {
      padding: 6px 10px !important;
      margin-top: 4px !important;
      page-break-inside: avoid !important;
    }

    .receipt-print-area .receipt-footer img {
      width: 22px !important;
      height: 22px !important;
      margin-bottom: 2px !important;
    }

    .receipt-print-area .receipt-footer .mt-2,
    .receipt-print-area .receipt-footer .mt-4,
    .receipt-print-area .receipt-footer .mt-1,
    .receipt-print-area .receipt-footer .mb-3 {
      margin: 1px 0 !important;
    }

    .receipt-print-area .receipt-footer p {
      font-size: 9px !important;
      line-height: 1.2 !important;
    }

    /* Hide interactive / helper chrome in print */
    .receipt-print-area button,
    .receipt-print-area [aria-label^="Copy"] {
      display: none !important;
    }
  }
`;
