import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
  Fade,
  Chip,
  Button,
} from "@mui/material";
import {
  RefreshOutlined,
  SwapHorizOutlined,
  TrendingUp,
  TrendingDown,
  CheckCircleOutline,
  WarningAmberOutlined,
  CompareArrows,
} from "@mui/icons-material";
import { useApi } from "core-lib/core/hooks";
import {
  useDialogContext,
  HeaderV2,
  StatsCard,
  FilterBar,
  registerForm,
} from "core-lib";
import { UnitConversionList } from "./UnitConversionList";
import {
  DIALOG_TITLES,
  DIALOG_TYPES,
  applyUnitConversionSorting,
  sortOptions,
  UnitConversionFilterState,
} from "../constants";
import { UnitConversion } from "core-lib/api/commons/types";
import { useUnitConversionStats } from "../hooks/useUnitConversionStats";
import { UnitConversionForm } from "../forms/UnitConversionForm";
import { formatNumber } from "core-lib/business";

registerForm("unit-conversion-form", UnitConversionForm);

export const UnitConversionListBlock: React.FC = () => {
  const theme = useTheme();
  const { openDialog } = useDialogContext();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<UnitConversionFilterState>({
    searchQuery: "",
    sortBy: "fromUnit",
  });

  const data = useApi((api) =>
    api.commons.getUnitConversions(pageNumber, pageSize),
  );
  const response = data.result?.data.response;

  const conversions = useMemo((): UnitConversion[] => {
    return response?.items ?? [];
  }, [response]);

  const stats = useUnitConversionStats(conversions);

  const pagination = useMemo(() => {
    if (!response) return undefined;
    return {
      pageNumber: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      totalItems: response.totalItems,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }, [response]);

  const filteredConversions = useMemo(() => {
    let filtered = [...conversions];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conversion) =>
          conversion.fromUnitName.toLowerCase().includes(query) ||
          conversion.toUnitName.toLowerCase().includes(query) ||
          (conversion.notes && conversion.notes.toLowerCase().includes(query)),
      );
    }

    return applyUnitConversionSorting(filtered, filters);
  }, [conversions, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.sortBy !== "fromUnit") count++;
    return count;
  }, [filters]);

  const handleRefresh = useCallback(() => {
    data.execute();
    setFilters({ searchQuery: "", sortBy: "fromUnit" });
    setPageNumber(1);
  }, [data]);

  const handleNextPage = useCallback(() => {
    if (pagination?.hasNextPage) {
      setPageNumber((prev) => prev + 1);
    }
  }, [pagination]);

  const handlePreviousPage = useCallback(() => {
    if (pagination?.hasPreviousPage) {
      setPageNumber((prev) => prev - 1);
    }
  }, [pagination]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageNumber(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: value }));
    setPageNumber(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
    setPageNumber(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ searchQuery: "", sortBy: "fromUnit" });
    setPageNumber(1);
  }, []);

  return (
    <Fade in timeout={500}>
      <Box sx={{ width: "100%", p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.03,
            )} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            backdropFilter: "blur(8px)",
          }}
        >
          <HeaderV2
            title="Unit Conversion Management"
            subtitle="Define and manage conversion rates between different units of measurement"
            icon={<SwapHorizOutlined sx={{ fontSize: 28 }} />}
            actionButton={{
              label: "New Conversion",
              onClick: () => {},
              variant: "contained",
              color: "primary",
            }}
          />

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 4, flexWrap: "wrap", gap: 2 }}
          >
            <StatsCard
              label="Total Conversions"
              value={stats.totalConversions}
              icon={<CompareArrows />}
              color="primary"
              variant="detailed"
            />
            <StatsCard
              label="Exact Conversions"
              value={stats.exactConversions}
              icon={<CheckCircleOutline />}
              color="success"
              variant="detailed"
            />
            <StatsCard
              label="Approximate"
              value={stats.approximateConversions}
              icon={<WarningAmberOutlined />}
              color="warning"
              variant="detailed"
            />
            <StatsCard
              label="Avg Rate"
              value={formatNumber(stats.averageRate, 2)}
              icon={<TrendingUp />}
              color="info"
              variant="detailed"
            />
          </Stack>

          {(stats.highestRate > 0 || stats.lowestRate < Infinity) && (
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
            >
              <Chip
                icon={<TrendingUp />}
                label={`Highest Rate: 1 unit = ${formatNumber(stats.highestRate, 2)} units`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                }}
              />
              <Chip
                icon={<TrendingDown />}
                label={`Lowest Rate: 1 unit = ${formatNumber(stats.lowestRate, 2)} units`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                }}
              />
              {stats.mostConvertedFromUnit.name && (
                <Chip
                  icon={<SwapHorizOutlined />}
                  label={`Most converted from: ${stats.mostConvertedFromUnit.name} (${stats.mostConvertedFromUnit.count} conversions)`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                  }}
                />
              )}
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <FilterBar
              searchValue={filters.searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search by unit names or notes..."
              sortValue={filters.sortBy}
              sortOptions={sortOptions}
              onSortChange={handleSortChange}
              resultCount={filteredConversions.length}
              resultLabel="conversions"
              pageSize={pageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              onPageSizeChange={handlePageSizeChange}
              activeFilterCount={activeFilterCount}
              onClearFilters={handleClearFilters}
              showFilterChip={true}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={handleRefresh}
              disabled={data.loading}
              sx={{ borderRadius: 3, ml: 2, px: 3, py: 1 }}
            >
              Refresh
            </Button>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`,
          }}
        >
          <UnitConversionList
            data={filteredConversions}
            loading={data.loading}
            pagination={pagination}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </Paper>

        {filteredConversions.length > 0 && (
          <Fade in timeout={800}>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing{" "}
                {filteredConversions.length === 0
                  ? 0
                  : (pageNumber - 1) * pageSize + 1}{" "}
                to {Math.min(pageNumber * pageSize, filteredConversions.length)}{" "}
                of <strong>{pagination?.totalItems ?? 0}</strong> conversions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Page <strong>{pageNumber}</strong> of{" "}
                <strong>{pagination?.totalPages ?? 1}</strong>
              </Typography>
            </Box>
          </Fade>
        )}
      </Box>
    </Fade>
  );
};
