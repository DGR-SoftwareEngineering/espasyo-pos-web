import { useMemo, useCallback } from "react";
import {
  InventoryDto,
  InventoryStatus,
} from "core-lib/api/commons/types";
import { useFilters } from "core-lib/core/hooks";
import { InventoryFilterState, InventoryStats } from "./types";

interface UseInventoryFiltersProps {
  items: InventoryDto[];
}

export const useInventoryFilters = ({ items }: UseInventoryFiltersProps) => {
  const {
    filters,
    setFilter,
    resetFilters,
    filteredItems,
  } = useFilters({
    items,
    defaultFilters: {
      searchTerm: "",
      statusFilter: "all" as InventoryStatus | "all",
      showLowStockOnly: false,
    },
    searchKeys: ["productName", "statusName"],
    filterFns: {
      statusFilter: (item, value) =>
        value === "all" || item.status === value,
      showLowStockOnly: (item, value) =>
        value === false || item.status !== InventoryStatus.InStock,
    },
  });

  const updateFilter = useCallback(
    <K extends keyof InventoryFilterState>(
      key: K,
      value: InventoryFilterState[K],
    ) => setFilter(key, value),
    [setFilter],
  );

  const stats: InventoryStats = useMemo(
    () => ({
      totalItems: items.length,
      inStock: items.filter((i) => i.status === InventoryStatus.InStock).length,
      lowStock: items.filter((i) => i.status === InventoryStatus.LowStock).length,
      critical: items.filter((i) => i.status === InventoryStatus.Critical).length,
      outOfStock: items.filter((i) => i.status === InventoryStatus.OutOfStock)
        .length,
    }),
    [items],
  );

  return {
    filters,
    filteredItems,
    stats,
    updateFilter,
    resetFilters,
  };
};
