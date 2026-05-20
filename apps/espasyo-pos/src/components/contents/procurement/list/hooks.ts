import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PurchaseOrderDto,
  PurchaseOrderStatusDto,
} from "core-lib/api/commons/types";
import { FilterState, StatsData } from "./types";

interface UsePurchaseOrderFiltersProps {
  orders: PurchaseOrderDto[];
}

export const usePurchaseOrderFilters = ({
  orders,
}: UsePurchaseOrderFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    statusFilter: "all",
    supplierFilter: "all",
    fulfillmentFilter: "all",
  });

  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrderDto[]>([]);

  useEffect(() => {
    let result = [...orders];

    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      result = result.filter(
        (po) =>
          po.orderNumber.toLowerCase().includes(q) ||
          po.supplierName.toLowerCase().includes(q),
      );
    }

    if (filters.statusFilter !== "all") {
      result = result.filter((po) => po.status === filters.statusFilter);
    }

    if (filters.supplierFilter !== "all") {
      result = result.filter((po) => po.supplierID === filters.supplierFilter);
    }

    if (filters.fulfillmentFilter !== "all") {
      result = result.filter(
        (po) => po.fulfillmentMethod === filters.fulfillmentFilter,
      );
    }

    setFilteredOrders(result);
  }, [orders, filters]);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      statusFilter: "all",
      supplierFilter: "all",
      fulfillmentFilter: "all",
    });
  }, []);

  const stats: StatsData = useMemo(
    () => ({
      total: orders.length,
      pendingReceipt: orders.filter(
        (po) =>
          po.status === PurchaseOrderStatusDto.Approved ||
          po.status === PurchaseOrderStatusDto.PartiallyReceived,
      ).length,
      drafts: orders.filter(
        (po) => po.status === PurchaseOrderStatusDto.Draft,
      ).length,
      totalSpend: orders
        .filter(
          (po) =>
            po.status !== PurchaseOrderStatusDto.Cancelled &&
            po.status !== PurchaseOrderStatusDto.Draft,
        )
        .reduce((sum, po) => sum + po.totalAmount, 0),
    }),
    [orders],
  );

  return {
    filters,
    filteredOrders,
    stats,
    updateFilter,
    resetFilters,
  };
};
