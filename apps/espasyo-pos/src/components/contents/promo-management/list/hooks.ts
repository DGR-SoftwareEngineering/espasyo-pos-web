import { useMemo } from "react";
import { PromoDto } from "core-lib/api/commons/types";
import { useFilters } from "core-lib/core/hooks";
import { PromoFilters, PromoStats } from "./types";
import { StatusFilter } from "../constants";

interface UsePromoFiltersParams {
  promos: PromoDto[];
}

export const usePromoFilters = ({ promos }: UsePromoFiltersParams) => {
  const {
    filters,
    setFilter,
    resetFilters,
    filteredItems,
  } = useFilters({
    items: promos,
    defaultFilters: {
      searchTerm: "",
      statusFilter: "all",
    },
    searchKeys: ["title"],
    filterFns: {
      statusFilter: (item, value) =>
        value === "all" || item.status === value,
    },
  });

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

  const updateFilter = <K extends keyof PromoFilters>(key: K, value: PromoFilters[K]) =>
    setFilter(key, value);

  const updateStatusFilter = (value: StatusFilter) =>
    setFilter("statusFilter", value);

  return {
    filters,
    filteredPromos: filteredItems,
    stats,
    updateFilter,
    updateStatusFilter,
    resetFilters,
  };
};
