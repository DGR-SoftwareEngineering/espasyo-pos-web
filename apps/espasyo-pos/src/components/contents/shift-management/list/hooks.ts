import { useMemo } from "react";
import { CashierShiftDto } from "core-lib/api/commons/types";
import { useFilters } from "core-lib/core/hooks";
import { ShiftFilterState, StatusFilter } from "./types";

export const useShiftFilters = ({ shifts }: { shifts: CashierShiftDto[] }) => {
  const {
    filters,
    setFilter,
    resetFilters,
    filteredItems,
  } = useFilters({
    items: shifts,
    defaultFilters: {
      searchTerm: "",
      statusFilter: "all",
    },
    searchKeys: ["shiftNumber", "cashierName"],
    filterFns: {
      statusFilter: (item, value) =>
        value === "all" || item.status === value,
    },
  });

  const stats = useMemo(
    () => ({
      total: shifts.length,
      open: shifts.filter((s) => s.status === "Open").length,
      closed: shifts.filter((s) => s.status === "Closed").length,
    }),
    [shifts],
  );

  const updateFilter = <K extends keyof ShiftFilterState>(
    key: K,
    value: ShiftFilterState[K],
  ) => setFilter(key, value);

  const updateStatusFilter = (value: StatusFilter) =>
    setFilter("statusFilter", value);

  return {
    filters,
    filteredShifts: filteredItems,
    stats,
    updateFilter,
    updateStatusFilter,
    resetFilters,
  };
};
