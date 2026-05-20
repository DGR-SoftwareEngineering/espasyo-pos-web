export const PRINT_TARGET_CLASS = "espasyo-print-target";
export const PRINT_PORTAL_CLASS = "espasyo-print-portal";
export const PRINT_HIDE_CLASS = "espasyo-print-hide";

export const PRINT_GLOBAL_CSS = `
/* Off-screen by default — the dialog handles the visual preview. */
.${PRINT_PORTAL_CLASS} {
  display: none;
}

@media print {
  @page {
    size: A4;
    margin: 12mm 12mm 14mm 12mm;
  }
  html, body {
    background: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  /*
   * Hide every direct child of body — the Next.js app root, the Radix Dialog
   * portal, toasts, anything else — so the only thing that ends up on paper
   * is the dedicated print portal below.
   */
  body > * {
    display: none !important;
  }
  body > .${PRINT_PORTAL_CLASS} {
    display: block !important;
    position: static !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    overflow: visible !important;
  }
  .${PRINT_TARGET_CLASS} {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #111 !important;
    box-shadow: none !important;
  }
  .${PRINT_HIDE_CLASS} {
    display: none !important;
  }
  .espasyo-print-page-break {
    page-break-before: always;
  }
}
`;
