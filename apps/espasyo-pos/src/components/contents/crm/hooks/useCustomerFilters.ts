import { useMemo, useState } from "react";
import { CustomerDto, CustomerSegment } from "core-lib/api/crm";
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
  const [filters, setFilters] = useState<CustomerFiltersState>({
    searchTerm: "",
    segmentFilter: "all",
  });

  const filteredCustomers = useMemo(() => {
    const term = filters.searchTerm.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesSearch =
        !term ||
        c.fullName.toLowerCase().includes(term) ||
        (c.customerNumber ?? "").toLowerCase().includes(term) ||
        (c.phone ?? "").toLowerCase().includes(term) ||
        (c.email ?? "").toLowerCase().includes(term);
      const matchesSegment =
        filters.segmentFilter === "all" || c.segment === filters.segmentFilter;
      return matchesSearch && matchesSegment;
    });
  }, [customers, filters]);

  const stats: CustomerStats = useMemo(() => {
    let newThisMonth = 0;
    let vip = 0;
    let atRisk = 0;
    const perSegment: Record<string | number, number> = {};

    // Initialize per-segment counts
    SEGMENT_FILTER_VALUES.forEach((seg) => {
      perSegment[seg] = 0;
    });

    customers.forEach((c) => {
      if (c.segment === CustomerSegment.VIP) vip += 1;
      if (c.segment === CustomerSegment.AtRisk) atRisk += 1;
      const lv = c.lastVisitAt ? new Date(c.lastVisitAt).getTime() : 0;
      if (lv >= startOfMonth && c.totalVisits <= 1) newThisMonth += 1;

      // Count per segment
      perSegment[c.segment] = (perSegment[c.segment] ?? 0) + 1;
    });

    return { total: customers.length, newThisMonth, vip, atRisk, perSegment };
  }, [customers]);

  const updateFilter = <K extends keyof CustomerFiltersState>(
    key: K,
    value: CustomerFiltersState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateSegmentFilter = (value: SegmentFilter) => {
    setFilters((prev) => ({ ...prev, segmentFilter: value }));
  };

  const resetFilters = () => {
    setFilters({ searchTerm: "", segmentFilter: "all" });
  };

  return {
    filters,
    filteredCustomers,
    stats,
    updateFilter,
    updateSegmentFilter,
    resetFilters,
  };
};
