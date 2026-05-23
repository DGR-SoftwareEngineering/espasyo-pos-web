import { useMemo, useState } from "react";
import { PromoDto } from "core-lib/api/commons/types";
import { PromoFilters, PromoStats } from "./types";
import { StatusFilter } from "../constants";

interface UsePromoFiltersParams {
  promos: PromoDto[];
}

export const usePromoFilters = ({ promos }: UsePromoFiltersParams) => {
  const [filters, setFilters] = useState<PromoFilters>({
    searchTerm: "",
    statusFilter: "all",
  });

  const filteredPromos = useMemo(() => {
    return promos.filter((p) => {
      const matchesSearch =
        !filters.searchTerm ||
        p.title.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesStatus =
        filters.statusFilter === "all" || p.status === filters.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [promos, filters]);

  const stats: PromoStats = useMemo(
    () => ({
      total: promos.length,
      active: promos.filter((p) => p.status === "Active").length,
      draft: promos.filter((p) => p.status === "Draft").length,
      scheduled: promos.filter((p) => p.status === "Scheduled").length,
      expired: promos.filter((p) => p.status === "Expired").length,
    }),
    [promos],
  );

  const updateFilter = <K extends keyof PromoFilters>(key: K, value: PromoFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateStatusFilter = (value: StatusFilter) => {
    setFilters((prev) => ({ ...prev, statusFilter: value }));
  };

  const resetFilters = () => {
    setFilters({ searchTerm: "", statusFilter: "all" });
  };

  return {
    filters,
    filteredPromos,
    stats,
    updateFilter,
    updateStatusFilter,
    resetFilters,
  };
};
