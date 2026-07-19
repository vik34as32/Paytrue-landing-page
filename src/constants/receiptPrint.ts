/**
 * Compact A4 print styles for Paytrue customer receipts.
 * Target: fit full customer receipt on a single A4 page.
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
    .receipt-print-hide,
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
      font-size: 10px !important;
      line-height: 1.25 !important;
    }

    .receipt-print-area .receipt-header {
      padding: 6px 8px !important;
      margin: 0 !important;
    }

    .receipt-print-area .receipt-header h1 {
      font-size: 16px !important;
      line-height: 1.15 !important;
    }

    .receipt-print-area .receipt-header .relative,
    .receipt-print-area .receipt-header img {
      width: 28px !important;
      height: 28px !important;
    }

    .receipt-print-area .receipt-header-row {
      gap: 6px !important;
    }

    .receipt-print-area .receipt-print-body {
      display: block !important;
      padding: 4px 8px 6px !important;
      margin: 0 !important;
    }

    .receipt-print-area .space-y-4 > :not([hidden]) ~ :not([hidden]),
    .receipt-print-area .space-y-8 > :not([hidden]) ~ :not([hidden]),
    .receipt-print-area .space-y-6 > :not([hidden]) ~ :not([hidden]) {
      margin-top: 5px !important;
    }

    .receipt-print-area .receipt-print-grid {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) 100px !important;
      gap: 6px !important;
      align-items: start !important;
      margin-top: 4px !important;
    }

    .receipt-print-area .receipt-side-col {
      display: block !important;
      width: 100px !important;
    }

    .receipt-print-area .receipt-side-col .sticky {
      position: static !important;
    }

    .receipt-print-area .receipt-qr-mobile {
      display: none !important;
    }

    .receipt-print-area section {
      margin: 0 !important;
      border-radius: 4px !important;
      overflow: hidden !important;
    }

    .receipt-print-area section > div.border-b,
    .receipt-print-area section > div.bg-gradient-to-r,
    .receipt-print-area section > header {
      padding: 4px 6px !important;
    }

    .receipt-print-area section h3,
    .receipt-print-area section h4 {
      font-size: 10px !important;
      line-height: 1.2 !important;
    }

    .receipt-print-area .grid.gap-2\\.5,
    .receipt-print-area .grid.gap-4 {
      gap: 3px !important;
      padding: 4px !important;
      grid-template-columns: 1fr 1fr !important;
    }

    .receipt-print-area .rounded-xl {
      padding: 3px 5px !important;
      border-radius: 3px !important;
    }

    .receipt-print-area .receipt-detail-row {
      padding: 2px 6px !important;
      gap: 6px !important;
    }

    .receipt-print-area .receipt-detail-icon {
      display: none !important;
    }

    .receipt-print-area [class*="grid-cols-"] > div.px-3.py-2\\.5,
    .receipt-print-area [class*="grid-cols-"] > div.px-4.py-3 {
      padding: 2px 5px !important;
    }

    .receipt-print-area .receipt-side-col section {
      padding: 4px !important;
    }

    .receipt-print-area .receipt-side-col img {
      width: 72px !important;
      height: 72px !important;
    }

    .receipt-print-area .receipt-side-col p {
      font-size: 8px !important;
    }

    .receipt-print-area section.flex.gap-2\\.5,
    .receipt-print-area section.flex.gap-3 {
      padding: 4px 6px !important;
      gap: 4px !important;
    }

    .receipt-print-area section.flex p {
      margin: 0 !important;
      font-size: 8.5px !important;
      line-height: 1.2 !important;
    }

    .receipt-print-area .receipt-footer {
      padding: 4px 8px !important;
      margin-top: 2px !important;
    }

    .receipt-print-area .receipt-footer img {
      width: 18px !important;
      height: 18px !important;
      margin-bottom: 1px !important;
    }

    .receipt-print-area .receipt-footer p {
      font-size: 8px !important;
      line-height: 1.15 !important;
      margin: 0 !important;
    }

    .receipt-print-area button,
    .receipt-print-area [aria-label^="Copy"] {
      display: none !important;
    }
  }
`;
