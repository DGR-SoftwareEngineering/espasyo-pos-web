import { useState, useEffect, useMemo, useCallback } from "react";
import { ProductDataList } from "core-lib/api/commons/types";
import { FilterState, StatsData } from "../types";

interface UseProductFiltersProps {
  products: ProductDataList[];
}

export const useProductFilters = ({ products }: UseProductFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    productTypeFilter: "all",
    categoryTypeFilter: "all",
    statusFilter: "all",
  });

  const [filteredProducts, setFilteredProducts] = useState<ProductDataList[]>(
    [],
  );

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower),
      );
    }

    if (filters.productTypeFilter !== "all") {
      const isMenuItem = filters.productTypeFilter === 1;
      filtered = filtered.filter((p) => p.isMenuItem === isMenuItem);
    }

    // Category type filter
    if (filters.categoryTypeFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.categoryType === filters.categoryTypeFilter,
      );
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      productTypeFilter: "all",
      categoryTypeFilter: "all",
      statusFilter: "all",
    });
  }, []);

  // Updated stats - removed inventory-related stats
  const stats: StatsData = useMemo(
    () => ({
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      menuItems: products.filter((p) => p.isMenuItem).length,
      ingredients: products.filter((p) => !p.isMenuItem).length,
    }),
    [products],
  );

  return {
    filters,
    filteredProducts,
    stats,
    updateFilter,
    resetFilters,
  };
};
