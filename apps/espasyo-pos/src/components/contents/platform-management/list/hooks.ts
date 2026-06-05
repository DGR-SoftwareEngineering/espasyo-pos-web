import { useMemo, useState } from "react";
import { PlatformDto } from "core-lib/api/platform/types";
import { PlatformFilters } from "./types";

export const usePlatformFilters = ({ items }: { items: PlatformDto[] }) => {
  const [filters, setFilters] = useState<PlatformFilters>({
    search: "",
    status: "all",
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.slugKey.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" && item.isActive) ||
        (filters.status === "inactive" && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [items, filters]);

  const updateFilter = (key: keyof PlatformFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: "", status: "all" });
  };

  return { filters, filteredItems, updateFilter, resetFilters };
};
