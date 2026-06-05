import { useCallback, useEffect, useMemo, useState } from "react";
import { SupplierDto } from "core-lib/api/commons/types";

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
  const [filters, setFilters] = useState<SupplierFilterState>({
    searchTerm: "",
    paymentTermsFilter: "all",
    sortBy: "company",
  });

  const [filteredSuppliers, setFilteredSuppliers] = useState<SupplierDto[]>([]);

  useEffect(() => {
    let next = [...suppliers];
    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      next = next.filter((s) => {
        return (
          (s.companyName ?? "").toLowerCase().includes(q) ||
          (s.contactPersonName ?? "").toLowerCase().includes(q) ||
          (s.email ?? "").toLowerCase().includes(q) ||
          (s.contactNumber ?? "").toLowerCase().includes(q) ||
          (s.taxID ?? "").toLowerCase().includes(q) ||
          (s.paymentTerms ?? "").toLowerCase().includes(q) ||
          (s.address ?? "").toLowerCase().includes(q) ||
          (s.userUsername ?? "").toLowerCase().includes(q)
        );
      });
    }
    if (filters.paymentTermsFilter !== "all") {
      next = next.filter(
        (s) => (s.paymentTerms ?? "") === filters.paymentTermsFilter,
      );
    }
    const sort = sortStrategies[filters.sortBy] ?? sortStrategies.company;
    next.sort(sort);
    setFilteredSuppliers(next);
  }, [suppliers, filters]);

  const updateFilter = useCallback(
    <K extends keyof SupplierFilterState>(
      key: K,
      value: SupplierFilterState[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      paymentTermsFilter: "all",
      sortBy: "company",
    });
  }, []);

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
