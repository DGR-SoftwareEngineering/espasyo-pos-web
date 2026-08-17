import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Switch,
} from "@radix-ui/themes";;
import { ReloadIcon, PlusIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { useDialogContext } from "core-lib";
import { registerForm } from "core-lib/components/radix/form/FormRenderer";
import type { DialogContentType } from "core-lib/api/content/types/common";
import type { FilterConfig } from "core-lib/components/radix/FilterBar";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { FilterBar } from "core-lib/components/radix/FilterBar";
import { Button } from "core-lib/components/radix/buttons/Button";
import { MessageBlock } from "core-lib/components/radix/blocks/messages";
import { MessageType } from "core-lib/components/topAlertMessages/types";
import { useApi } from "core-lib/core/hooks";
import {
  InventoryDto,
  InventoryStatus,
} from "core-lib/api/commons/types";
import { InventoryList } from "./InventoryList";
import { useInventoryFilters } from "./hooks";
import {
  DIALOG_TITLES,
  DIALOG_TYPES,
  PAGE_SIZE_OPTIONS,
  STATUS_OPTIONS,
} from "../constants";
import { AdjustStockForm } from "../forms/AdjustStockForm";
import { ThresholdsForm } from "../forms/ThresholdsForm";

registerForm("adjust-stock-form", AdjustStockForm);
registerForm("thresholds-form", ThresholdsForm);

export const InventoryListBlock: React.FC = () => {
  const router = useRouter();
  const { openDialog } = useDialogContext();
  const [items, setItems] = useState<InventoryDto[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const data = useApi((api) =>
    api.commons.inventoryList(pageNumber, pageSize),
  );

  useEffect(() => {
    const page = data.result?.data.response;
    setItems(page?.items ?? []);
  }, [data.result?.data.response]);

  const { filters, filteredItems, stats, updateFilter, resetFilters } =
    useInventoryFilters({ items });

  const statusFilterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        value: filters.statusFilter as string | number,
        options: STATUS_OPTIONS.map((opt) => ({
          value: opt.value as string | number,
          label: opt.label,
        })),
        onChange: (value) =>
          updateFilter(
            "statusFilter",
            value === "all" ? "all" : (value as InventoryStatus),
          ),
      },
    ],
    [filters.statusFilter, updateFilter],
  );

  const serverPagination = data.result?.data.response;

  const pagination = useMemo(
    () => ({
      pageNumber,
      totalPages: serverPagination?.totalPages ?? 1,
      hasNextPage: serverPagination?.hasNextPage ?? false,
      hasPreviousPage: serverPagination?.hasPreviousPage ?? false,
      pageSize,
    }),
    [pageNumber, pageSize, serverPagination],
  );

  const handleRefresh = useCallback(() => {
    data.execute();
    setPageNumber(1);
  }, [data]);

  const handleCreate = () => {
    router.push("/admin/hub/inventory/add-new");
  };

  const handleView = useCallback(
    (inv: InventoryDto) => {
      openDialog({
        title: DIALOG_TITLES.view,
        dialogContentType: DIALOG_TYPES.view as unknown as DialogContentType,
        data: inv,
      });
    },
    [openDialog],
  );

  const handleAdjust = useCallback(
    (inv: InventoryDto) => {
      openDialog({
        title: DIALOG_TITLES.adjust,
        dialogContentType: DIALOG_TYPES.adjust as unknown as DialogContentType,
        data: inv,
        onSuccess: handleRefresh,
      });
    },
    [openDialog, handleRefresh],
  );

  const handleEditThresholds = useCallback(
    (inv: InventoryDto) => {
      openDialog({
        title: DIALOG_TITLES.thresholds,
        dialogContentType: DIALOG_TYPES.thresholds as unknown as DialogContentType,
        data: inv,
        onSuccess: handleRefresh,
      });
    },
    [openDialog, handleRefresh],
  );

  const handleViewHistory = useCallback(
    (inv: InventoryDto) => {
      openDialog({
        title: DIALOG_TITLES.history,
        dialogContentType: DIALOG_TYPES.history as unknown as DialogContentType,
        data: inv,
      });
    },
    [openDialog],
  );

  const handleDelete = useCallback(
    (inv: InventoryDto) => {
      openDialog({
        title: DIALOG_TITLES.delete,
        dialogContentType: DIALOG_TYPES.delete as unknown as DialogContentType,
        data: inv,
        onSuccess: handleRefresh,
      });
    },
    [openDialog, handleRefresh],
  );

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title="Inventory"
          subtitle="Track ingredient stock and adjust quantities with a full audit trail."
          actionButton={{
            label: "New Inventory",
            onClick: handleCreate,
            icon: <PlusIcon />,
            variant: "contained",
            color: "primary",
          }}
        />

        <Flex gap="3" mt="4" wrap="wrap">
          <StatsCard
            label="Total Items"
            value={stats.totalItems}
            color="primary"
          />
          <StatsCard label="In Stock" value={stats.inStock} color="success" />
          <StatsCard label="Low Stock" value={stats.lowStock} color="warning" />
          <StatsCard label="Critical" value={stats.critical} color="error" />
          <StatsCard
            label="Out of Stock"
            value={stats.outOfStock}
            color="error"
          />
        </Flex>

        {!data.loading && (stats.critical > 0 || stats.outOfStock > 0) && (
          <Box mt="4">
            <MessageBlock
              type={MessageType.Problem}
              header="Immediate attention required"
              text={buildAttentionMessage(stats.critical, stats.outOfStock)}
            />
          </Box>
        )}

        {!data.loading &&
          stats.critical === 0 &&
          stats.outOfStock === 0 &&
          stats.lowStock > 0 && (
            <Box mt="4">
              <MessageBlock
                type={MessageType.Warning}
                header="Low stock alert"
                text={`${stats.lowStock} ingredient${
                  stats.lowStock === 1 ? " is" : "s are"
                } below the reorder threshold. Adjust stock or update purchasing soon to avoid running out.`}
              />
            </Box>
          )}

        <Flex
          direction={{ initial: "column", md: "row" }}
          justify="between"
          align={{ initial: "stretch", md: "center" }}
          gap="3"
          mt="4"
        >
          <FilterBar
            searchValue={filters.searchTerm}
            onSearchChange={(value) => updateFilter("searchTerm", value)}
            searchPlaceholder="Search by ingredient or status…"
            filterConfigs={statusFilterConfig}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageNumber(1);
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            resultCount={filteredItems.length}
            pageSize={pageSize}
          />
          <Flex gap="3" align="center">
            <Flex align="center" gap="2" asChild>
              <label>
                <Switch
                  size="2"
                  color="amber"
                  checked={filters.showLowStockOnly}
                  onCheckedChange={(checked) =>
                    updateFilter("showLowStockOnly", checked)
                  }
                />
                <Text size="2" weight="medium">
                  Needs Attention
                </Text>
              </label>
            </Flex>
            <Button
              type="Secondary"
              onClick={() => {
                handleRefresh();
                resetFilters();
              }}
              disabled={data.loading}
            >
              <Flex align="center" gap="2">
                <ReloadIcon />
                Refresh
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
        <InventoryList
          data={filteredItems}
          loading={data.loading}
          pagination={pagination}
          onNextPage={() => setPageNumber((p) => p + 1)}
          onPreviousPage={() => setPageNumber((p) => Math.max(1, p - 1))}
          onView={handleView}
          onAdjust={handleAdjust}
          onEditThresholds={handleEditThresholds}
          onViewHistory={handleViewHistory}
          onDelete={handleDelete}
        />
      </Card>
    </Box>
  );
};

function buildAttentionMessage(critical: number, outOfStock: number): string {
  const parts: string[] = [];
  if (outOfStock > 0) {
    parts.push(
      `${outOfStock} ingredient${outOfStock === 1 ? " is" : "s are"} out of stock`,
    );
  }
  if (critical > 0) {
    parts.push(
      `${critical} ${critical === 1 ? "is" : "are"} at the critical threshold`,
    );
  }
  return `${parts.join(" and ")}. Adjust stock or place a purchase order to keep service running.`;
}
