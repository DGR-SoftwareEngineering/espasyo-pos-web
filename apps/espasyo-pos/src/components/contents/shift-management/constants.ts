import { CashierShiftDto } from "core-lib/api/commons/types";
import { FeatureConfigBuilder } from "core-lib/core/types/constants/feature-config.builder";
import { commonSortStrategies } from "core-lib/core/types/constants/base.constants";

export const STATUS_CONFIG = {
  Open:   { label: "Open",   color: "green"  as const },
  Closed: { label: "Closed", color: "gray"   as const },
} as const;

export const PLACEHOLDERS = {
  actualCash: "e.g., 1850.00",
  notes: "e.g., End of morning shift",
} as const;

const config = new FeatureConfigBuilder<CashierShiftDto>("Shift")
  .setTableHeaders([
    { id: "shiftNumber", name: "Shift #",      width: "12%", sortable: true,  align: "left"   },
    { id: "cashierName", name: "Cashier",       width: "18%", sortable: true,  align: "left"   },
    { id: "openedAt",    name: "Opened At",     width: "16%", sortable: true,  align: "left"   },
    { id: "closedAt",    name: "Closed At",     width: "16%", sortable: false, align: "left"   },
    { id: "openingCash", name: "Opening Cash",  width: "12%", sortable: true,  align: "center" },
    { id: "status",      name: "Status",        width: "10%", sortable: true,  align: "center" },
    { id: "actions",     name: "Actions",       width: "16%", sortable: false, align: "right"  },
  ])
  .setSortOptions([
    { value: "newest",      label: "Newest First"    },
    { value: "oldest",      label: "Oldest First"    },
    { value: "cashierName", label: "Cashier Name"    },
    { value: "shiftNumber", label: "Shift Number"    },
    { value: "openingCash", label: "Opening Cash"    },
  ])
  .setSortStrategies({
    newest:      commonSortStrategies.newest      as any,
    oldest:      commonSortStrategies.oldest      as any,
    cashierName: (a, b) => a.cashierName.localeCompare(b.cashierName),
    shiftNumber: (a, b) => a.shiftNumber.localeCompare(b.shiftNumber),
    openingCash: (a, b) => b.openingCash - a.openingCash,
  })
  .build();

export const SUBMISSION_KEYS = { close: "shift.close" };
export const TABLE_HEADERS   = config.TABLE_HEADERS;
export const DIALOG_TITLES   = { view: "Shift Detail", close: "Close Shift", delete: "Delete Shift" };
export const DIALOG_TYPES    = { view: "ShiftView",    close: "ShiftClose" };
export const sortOptions     = config.sortOptions;
export const applyShiftSorting = config.applySorting;
export type ShiftFilterState   = typeof config.FilterState;
