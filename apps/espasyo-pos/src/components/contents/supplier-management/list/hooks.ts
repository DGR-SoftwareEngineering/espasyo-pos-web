import { useCallback, useMemo, useState } from "react";
import { SupplierDto } from "core-lib/api/commons/types";
import { useFilters } from "core-lib/core/hooks";

export interface SupplierFilterState {
  searchTerm: string;
  paymentTermsFilter: string | "all";
  sortBy: string;
}

export interface SupplierStats {
  total: number;
  withLogo: number;
  withPortalUser: number;
  byTerms: Record<string, number>;
}

interface Props {
  suppliers: SupplierDto[];
}

const sortStrategies: Record<
  string,
  (a: SupplierDto, b: SupplierDto) => number
> = {
  company: (a, b) =>
    (a.companyName ?? "").localeCompare(b.companyName ?? ""),
  companyDesc: (a, b) =>
    (b.companyName ?? "").localeCompare(a.companyName ?? ""),
  terms: (a, b) =>
    (a.paymentTerms ?? "").localeCompare(b.paymentTerms ?? ""),
  newest: (a, b) =>
    new Date(b.createdAt ?? 0).getTime() -
    new Date(a.createdAt ?? 0).getTime(),
  oldest: (a, b) =>
    new Date(a.createdAt ?? 0).getTime() -
    new Date(b.createdAt ?? 0).getTime(),
};

export const useSupplierFilters = ({ suppliers }: Props) => {
  const [sortBy, setSortBy] = useState("company");

  const {
    filters,
    setFilter,
    resetFilters: resetGeneric,
    filteredItems,
  } = useFilters({
    items: suppliers,
    defaultFilters: {
      searchTerm: "",
      paymentTermsFilter: "all",
      sortBy: "company",
    },
    filterFns: {
      searchTerm: (item, value) => {
        if (!value || value === "") return true;
        const q = (value as string).toLowerCase();
        return (
          (item.companyName ?? "").toLowerCase().includes(q) ||
          (item.contactPersonName ?? "").toLowerCase().includes(q) ||
          (item.email ?? "").toLowerCase().includes(q) ||
          (item.contactNumber ?? "").toLowerCase().includes(q) ||
          (item.paymentTerms ?? "").toLowerCase().includes(q)
        );
      },
      paymentTermsFilter: (item, value) =>
        value === "all" || (item.paymentTerms ?? "") === value,
    },
  });

  const filteredSuppliers = useMemo(() => {
    const sort = sortStrategies[sortBy] ?? sortStrategies.company;
    return [...filteredItems].sort(sort);
  }, [filteredItems, sortBy]);

  const updateFilter = useCallback(
    <K extends keyof SupplierFilterState>(
      key: K,
      value: SupplierFilterState[K],
    ) => {
      if (key === "sortBy") {
        setSortBy(value as string);
      } else {
        setFilter(key as keyof typeof filters, value as never);
      }
    },
    [setFilter],
  );

  const resetFilters = useCallback(() => {
    resetGeneric();
    setSortBy("company");
  }, [resetGeneric]);

  const stats: SupplierStats = useMemo(() => {
    const byTerms: Record<string, number> = {};
    suppliers.forEach((s) => {
      const key = s.paymentTerms || "Unspecified";
      byTerms[key] = (byTerms[key] ?? 0) + 1;
    });
    const withLogo = suppliers.filter((s) => !!s.logoUrl).length;
    const withPortalUser = suppliers.filter((s) => !!s.userID).length;
    return { total: suppliers.length, withLogo, withPortalUser, byTerms };
  }, [suppliers]);

  return {
    filters,
    filteredSuppliers,
    stats,
    updateFilter,
    resetFilters,
  };
};
