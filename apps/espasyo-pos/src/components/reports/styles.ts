export const tableStyles = `
.daily-orders-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.daily-orders-table thead tr { background: var(--gray-a2); border-bottom: 1px solid var(--gray-a4); }
.daily-orders-table th { padding: 10px 12px; text-align: left; font-weight: 500; color: var(--gray-11); }
.daily-orders-table th:nth-child(2),
.daily-orders-table th:nth-child(3),
.daily-orders-table th:nth-child(4),
.daily-orders-table th:nth-child(5),
.daily-orders-table th:nth-child(6) { text-align: center; }
.daily-orders-table tbody tr { border-bottom: 1px solid var(--gray-a3); transition: background 80ms ease; cursor: pointer; }
.daily-orders-table tbody tr:hover { background: var(--gray-a2); }
.daily-orders-table td { padding: 10px 12px; color: var(--gray-12); }
.daily-orders-table td:nth-child(2),
.daily-orders-table td:nth-child(3),
.daily-orders-table td:nth-child(4),
.daily-orders-table td:nth-child(5),
.daily-orders-table td:nth-child(6) { text-align: center; }
`;

export const dailyTargetTableStyles = `
.daily-target-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.daily-target-table thead tr { background: var(--gray-a2); border-bottom: 1px solid var(--gray-a4); }
.daily-target-table th { padding: 12px 16px; text-align: left; font-weight: 500; color: var(--gray-11); }
.daily-target-table th:nth-child(2),
.daily-target-table th:nth-child(3),
.daily-target-table th:nth-child(4) { text-align: center; }
.daily-target-table tbody tr { border-bottom: 1px solid var(--gray-a3); transition: background 80ms ease; cursor: pointer; }
.daily-target-table tbody tr:hover { background: var(--gray-a2); }
.daily-target-table td { padding: 12px 16px; color: var(--gray-12); }
.daily-target-table td:nth-child(2),
.daily-target-table td:nth-child(3),
.daily-target-table td:nth-child(4) { text-align: center; }
`;

export const keyframeStyles = `
@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
`;

export const printStyles = `
.print-only { display: none; }

@media print {
  aside[aria-label="Primary navigation"],
  [data-layout="app-header"],
  [data-layout="maintenance-banner"] {
    display: none !important;
  }

  body, html {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  body > div,
  #__next,
  #__next > * {
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
    overflow: visible !important;
  }

  .reports-print-root {
    width: 100% !important;
    max-width: 100% !important;
    padding: 16px !important;
    margin: 0 !important;
  }

  .rt-Card {
    box-shadow: none !important;
    border: 1px solid #e2e8f0 !important;
    break-inside: avoid;
  }

  .no-print { display: none !important; }
  .print-only { display: block !important; }

  .recharts-wrapper { break-inside: avoid; }
}
`;
