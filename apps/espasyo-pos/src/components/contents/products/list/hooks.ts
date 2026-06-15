import { useMemo, useCallback } from "react";
import { ProductDataList } from "core-lib/api/commons/types";
import { useFilters } from "core-lib/core/hooks";
import { FilterState, ProductTypeFilter, StatsData } from "./types";

interface UseProductFiltersProps {
  products: ProductDataList[];
}

export const useProductFilters = ({ products }: UseProductFiltersProps) => {
  const {
    filters,
    setFilter,
    resetFilters,
    filteredItems,
  } = useFilters({
    items: products,
    defaultFilters: {
      searchTerm: "",
      productTypeFilter: "all" as ProductTypeFilter,
      statusFilter: "all" as number | "all",
    },
    searchKeys: ["name", "description", "productCategoryName", "ingredientCategoryName", "brandName"],
    filterFns: {
      productTypeFilter: (item, value) => {
        if (value === "all") return true;
        if (value === "menuItem") return item.isMenuItem;
        if (value === "ingredient") return !item.isMenuItem;
        if (value === "supply") return !item.isMenuItem;
        return true;
      },
    },
  });

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
      setFilter(key, value),
    [setFilter],
  );

  const stats: StatsData = useMemo(
    () => ({
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      menuItems: products.filter((p) => p.isMenuItem).length,
      ingredients: products.filter((p) => !p.isMenuItem).length,
      businessSupplies: 0,
    }),
    [products],
  );

  return {
    filters,
    filteredProducts: filteredItems,
    stats,
    updateFilter,
    resetFilters,
  };
};
