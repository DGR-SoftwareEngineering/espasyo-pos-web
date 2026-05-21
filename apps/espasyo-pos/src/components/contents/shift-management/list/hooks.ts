import { useState, useMemo } from "react";
import { CashierShiftDto } from "core-lib/api/commons/types";
import { ShiftFilterState, StatusFilter } from "./types";

const DEFAULT_FILTERS: ShiftFilterState = {
  searchTerm: "",
  statusFilter: "all",
};

export const useShiftFilters = ({ shifts }: { shifts: CashierShiftDto[] }) => {
  const [filters, setFilters] = useState<ShiftFilterState>(DEFAULT_FILTERS);

  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      const matchesSearch =
        !filters.searchTerm ||
        s.shiftNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        s.cashierName.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesStatus =
        filters.statusFilter === "all" || s.status === filters.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [shifts, filters]);

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
  ) => setFilters((prev) => ({ ...prev, [key]: value }));

  const updateStatusFilter = (value: StatusFilter) =>
    updateFilter("statusFilter", value);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return { filters, filteredShifts, stats, updateFilter, updateStatusFilter, resetFilters };
};
