import { useMemo, useState, useCallback } from "react";

type FilterState = Record<string, unknown>;

interface UseFiltersParams<TItem, TFilter extends FilterState> {
  items: TItem[];
  defaultFilters: TFilter;
  searchKeys?: (keyof TItem)[];
  filterFns?: Partial<{
    [K in keyof TFilter]: (item: TItem, value: TFilter[K]) => boolean;
  }>;
}

interface UseFiltersReturn<TItem, TFilter extends FilterState> {
  filters: TFilter;
  setFilter: <K extends keyof TFilter>(key: K, value: TFilter[K]) => void;
  resetFilters: () => void;
  filteredItems: TItem[];
}

export function useFilters<TItem, TFilter extends FilterState>(
  params: UseFiltersParams<TItem, TFilter>,
): UseFiltersReturn<TItem, TFilter> {
  const { items, defaultFilters, searchKeys, filterFns = {} } = params;

  const [filters, setFiltersState] = useState<TFilter>(defaultFilters);

  const setFilter = useCallback(
    <K extends keyof TFilter>(key: K, value: TFilter[K]) => {
      setFiltersState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, [defaultFilters]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    for (const key of Object.keys(filters) as (keyof TFilter)[]) {
      const value = filters[key];

      if (value === undefined || value === null) continue;

      if (typeof value === "string" && value === "") continue;
      if ((value as unknown) === "all") continue;

      const strVal = typeof value === "string" ? value : "";
      if (key === "searchTerm" && strVal && searchKeys) {
        const q = strVal.toLowerCase();
        result = result.filter((item) =>
          searchKeys.some((k) => {
            const v = item[k];
            return typeof v === "string" && v.toLowerCase().includes(q);
          }),
        );
        continue;
      }

      const customFn = (filterFns as Record<string, ((item: TItem, val: unknown) => boolean) | undefined>)[key as string];
      if (customFn) {
        result = result.filter((item) => customFn(item, value));
        continue;
      }
    }

    return result;
  }, [items, filters, searchKeys, filterFns]);

  return { filters, setFilter, resetFilters, filteredItems };
}
