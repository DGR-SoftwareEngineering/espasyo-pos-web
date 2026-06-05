import { useState, useEffect, useMemo, useCallback } from "react";
import { ProductDataList } from "core-lib/api/commons/types";
import { FilterState, ProductTypeFilter, StatsData } from "./types";

interface UseProductFiltersProps {
  products: ProductDataList[];
}

export const useProductFilters = ({ products }: UseProductFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    productTypeFilter: "all",
    statusFilter: "all",
  });

  const [filteredProducts, setFilteredProducts] = useState<ProductDataList[]>(
    [],
  );

  useEffect(() => {
    let filtered = [...products];

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((p) => {
        const categoryName = p.isMenuItem
          ? p.productCategoryName
          : p.ingredientCategoryName;
        return (
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          categoryName?.toLowerCase().includes(searchLower) ||
          p.brandName?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (filters.productTypeFilter !== "all") {
      filtered = filtered.filter((p) => {
        if (filters.productTypeFilter === "menuItem") return p.isMenuItem;
        if (filters.productTypeFilter === "ingredient") return !p.isMenuItem;
        if (filters.productTypeFilter === "supply") return !p.isMenuItem;
        return true;
      });
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
      productTypeFilter: "all" as ProductTypeFilter,
      statusFilter: "all",
    });
  }, []);

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
    filteredProducts,
    stats,
    updateFilter,
    resetFilters,
  };
};
