import { useMemo } from "react";
import { CustomerDto, CustomerSegment } from "core-lib/api/crm";
import { useFilters } from "core-lib/core/hooks";
import { SegmentFilter, SEGMENT_FILTER_VALUES } from "../constants";

interface UseCustomerFiltersParams {
  customers: CustomerDto[];
}

export interface CustomerFiltersState {
  searchTerm: string;
  segmentFilter: SegmentFilter;
}

export interface CustomerStats {
  total: number;
  newThisMonth: number;
  vip: number;
  atRisk: number;
  perSegment: Record<string | number, number>;
}

const startOfMonth = (() => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
})();

export const useCustomerFilters = ({
  customers,
}: UseCustomerFiltersParams) => {
  const {
    filters,
    setFilter,
    resetFilters,
    filteredItems,
  } = useFilters({
    items: customers,
    defaultFilters: {
      searchTerm: "",
      segmentFilter: "all" as SegmentFilter,
    },
    searchKeys: ["fullName", "customerNumber", "phone", "email"],
    filterFns: {
      segmentFilter: (item, value) =>
        value === "all" || item.segment === value,
    },
  });

  const stats: CustomerStats = useMemo(() => {
    let newThisMonth = 0;
    let vip = 0;
    let atRisk = 0;
    const perSegment: Record<string | number, number> = {};

    SEGMENT_FILTER_VALUES.forEach((seg) => {
      perSegment[seg] = 0;
    });

    customers.forEach((c) => {
      if (c.segment === CustomerSegment.VIP) vip += 1;
      if (c.segment === CustomerSegment.AtRisk) atRisk += 1;
      const lv = c.lastVisitAt ? new Date(c.lastVisitAt).getTime() : 0;
      if (lv >= startOfMonth && c.totalVisits <= 1) newThisMonth += 1;
      perSegment[c.segment] = (perSegment[c.segment] ?? 0) + 1;
    });

    return { total: customers.length, newThisMonth, vip, atRisk, perSegment };
  }, [customers]);

  const updateFilter = <K extends keyof CustomerFiltersState>(
    key: K,
    value: CustomerFiltersState[K],
  ) => setFilter(key, value);

  const updateSegmentFilter = (value: SegmentFilter) =>
    setFilter("segmentFilter", value);

  return {
    filters,
    filteredCustomers: filteredItems,
    stats,
    updateFilter,
    updateSegmentFilter,
    resetFilters,
  };
};
