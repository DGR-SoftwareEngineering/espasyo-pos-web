import { useState, useEffect, useMemo, useCallback } from "react";
import {
  InventoryDto,
  InventoryStatus,
} from "core-lib/api/commons/types";
import { InventoryFilterState, InventoryStats } from "./types";

interface UseInventoryFiltersProps {
  items: InventoryDto[];
}

export const useInventoryFilters = ({ items }: UseInventoryFiltersProps) => {
  const [filters, setFilters] = useState<InventoryFilterState>({
    searchTerm: "",
    statusFilter: "all",
    showLowStockOnly: false,
  });

  const [filteredItems, setFilteredItems] = useState<InventoryDto[]>([]);

  useEffect(() => {
    let filtered = [...items];

    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          (i.productName ?? "").toLowerCase().includes(q) ||
          (i.statusName ?? "").toLowerCase().includes(q),
      );
    }

    if (filters.statusFilter !== "all") {
      filtered = filtered.filter((i) => i.status === filters.statusFilter);
    }

    if (filters.showLowStockOnly) {
      filtered = filtered.filter((i) => i.status !== InventoryStatus.InStock);
    }

    setFilteredItems(filtered);
  }, [items, filters]);

  const updateFilter = useCallback(
    <K extends keyof InventoryFilterState>(
      key: K,
      value: InventoryFilterState[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      statusFilter: "all",
      showLowStockOnly: false,
    });
  }, []);

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
