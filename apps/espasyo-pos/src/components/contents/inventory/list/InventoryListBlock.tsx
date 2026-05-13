import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { RefreshOutlined, AddOutlined } from "@mui/icons-material";
import { useRouter } from "next/router";
import {
  StatsCard,
  FilterBar,
  useDialogContext,
  registerForm,
} from "core-lib";
import type { FilterConfig } from "core-lib/components/FilterBar";
import { HeaderV2 } from "core-lib/components/header/HeaderV2";
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
  const theme = useTheme();
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
        dialogContentType: DIALOG_TYPES.view,
        data: inv,
      });
    },
    [openDialog],
  );

  const handleAdjust = useCallback(
    (inv: InventoryDto) => {
      openDialog({
        title: DIALOG_TITLES.adjust,
        dialogContentType: DIALOG_TYPES.adjust,
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
        dialogContentType: DIALOG_TYPES.thresholds,
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
        dialogContentType: DIALOG_TYPES.history,
        data: inv,
      });
    },
    [openDialog],
  );

  const handleDelete = useCallback(
    (inv: InventoryDto) => {
      openDialog({
        title: DIALOG_TITLES.delete,
        dialogContentType: DIALOG_TYPES.delete,
        data: inv,
        onSuccess: handleRefresh,
      });
    },
    [openDialog, handleRefresh],
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <HeaderV2
          title="Inventory"
          subtitle="Track ingredient stock and adjust quantities with a full audit trail."
          actionButton={{
            label: "New Inventory",
            onClick: handleCreate,
            icon: <AddOutlined />,
            variant: "contained",
            color: "primary",
          }}
        />

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 3, flexWrap: "wrap", gap: 2 }}
        >
          <StatsCard label="Total Items" value={stats.totalItems} color="primary" />
          <StatsCard label="In Stock" value={stats.inStock} color="success" />
          <StatsCard label="Low Stock" value={stats.lowStock} color="warning" />
          <StatsCard label="Critical" value={stats.critical} color="error" />
          <StatsCard
            label="Out of Stock"
            value={stats.outOfStock}
            color="error"
          />
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          sx={{ mt: 3 }}
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
          <Stack direction="row" spacing={1.5} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={filters.showLowStockOnly}
                  onChange={(e) =>
                    updateFilter("showLowStockOnly", e.target.checked)
                  }
                  color="warning"
                />
              }
              label={
                <Typography variant="body2" fontWeight={500}>
                  Needs Attention
                </Typography>
              }
            />
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={() => {
                handleRefresh();
                resetFilters();
              }}
              disabled={data.loading}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: "hidden",
        }}
      >
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
      </Paper>
    </Box>
  );
};
