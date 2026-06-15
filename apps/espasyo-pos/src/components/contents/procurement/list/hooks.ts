import { useMemo, useCallback } from "react";
import {
  PurchaseOrderDto,
  PurchaseOrderStatusDto,
  FulfillmentMethodDto,
} from "core-lib/api/commons/types";
import { useFilters } from "core-lib/core/hooks";
import { FilterState, StatsData } from "./types";

interface UsePurchaseOrderFiltersProps {
  orders: PurchaseOrderDto[];
}

export const usePurchaseOrderFilters = ({
  orders,
}: UsePurchaseOrderFiltersProps) => {
  const {
    filters,
    setFilter,
    resetFilters,
    filteredItems,
  } = useFilters({
    items: orders,
    defaultFilters: {
      searchTerm: "",
      statusFilter: "all" as PurchaseOrderStatusDto | "all",
      supplierFilter: "all",
      fulfillmentFilter: "all" as FulfillmentMethodDto | "all",
    },
    searchKeys: ["orderNumber", "supplierName"],
    filterFns: {
      statusFilter: (item, value) =>
        value === "all" || item.status === value,
      supplierFilter: (item, value) =>
        value === "all" || item.supplierID === value,
      fulfillmentFilter: (item, value) =>
        value === "all" || item.fulfillmentMethod === value,
    },
  });

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
      setFilter(key, value),
    [setFilter],
  );

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
    filteredOrders: filteredItems,
    stats,
    updateFilter,
    resetFilters,
  };
};
