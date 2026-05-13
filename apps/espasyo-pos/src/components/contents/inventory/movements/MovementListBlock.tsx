import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  MenuItem,
  TextField as MuiTextField,
  alpha,
  useTheme,
} from "@mui/material";
import {
  RefreshOutlined,
  ReceiptLongOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import {
  StockMovementDto,
  StockMovementType,
} from "core-lib/api/commons/types";
import { HeaderV2 } from "core-lib/components/header/HeaderV2";
import { MovementList } from "./MovementList";
import { MOVEMENT_TYPE_OPTIONS, PAGE_SIZE_OPTIONS } from "../constants";
import { MovementFilterState } from "./types";

const toIsoStartOfDay = (yyyyMmDd: string): string => {
  if (!yyyyMmDd) return "";
  return new Date(`${yyyyMmDd}T00:00:00`).toISOString();
};

const toIsoEndOfDay = (yyyyMmDd: string): string => {
  if (!yyyyMmDd) return "";
  return new Date(`${yyyyMmDd}T23:59:59`).toISOString();
};

const defaultFromDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

const defaultToDate = (): string => new Date().toISOString().slice(0, 10);

export const MovementListBlock: React.FC = () => {
  const theme = useTheme();
  const [items, setItems] = useState<StockMovementDto[]>([]);
  const [filters, setFilters] = useState<MovementFilterState>({
    fromDate: defaultFromDate(),
    toDate: defaultToDate(),
    movementType: "all",
    pageSize: 20,
  });
  const [pageNumber, setPageNumber] = useState(1);
  const [pagedMeta, setPagedMeta] = useState({
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchCb = useApiCallback(
    async (
      api,
      args: {
        fromDate: string;
        toDate: string;
        pageNumber: number;
        pageSize: number;
        movementType?: StockMovementType;
      },
    ) => await api.commons.stockMovementByDateRange(args),
  );

  const executeFetch = useCallback(
    async (page: number = 1) => {
      const movementType =
        filters.movementType === "all" ? undefined : filters.movementType;
      const fromIso = toIsoStartOfDay(filters.fromDate);
      const toIso = toIsoEndOfDay(filters.toDate);
      if (!fromIso || !toIso) return;
      try {
        const res = await fetchCb.execute({
          fromDate: fromIso,
          toDate: toIso,
          pageNumber: page,
          pageSize: filters.pageSize,
          movementType,
        });
        const data = res.data.response;
        if (data) {
          setItems(data.items);
          setPagedMeta({
            totalPages: data.totalPages,
            hasNextPage: data.hasNextPage,
            hasPreviousPage: data.hasPreviousPage,
          });
          setPageNumber(data.pageNumber);
        }
      } catch {
        setItems([]);
      }
    },
    [fetchCb, filters],
  );

  useEffect(() => {
    void executeFetch(1);
    // intentionally run on mount only; user-driven refetches go through handlers below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pagination = useMemo(
    () => ({
      pageNumber,
      totalPages: pagedMeta.totalPages,
      hasNextPage: pagedMeta.hasNextPage,
      hasPreviousPage: pagedMeta.hasPreviousPage,
      pageSize: filters.pageSize,
    }),
    [pageNumber, pagedMeta, filters.pageSize],
  );

  const updateFilter = <K extends keyof MovementFilterState>(
    key: K,
    value: MovementFilterState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    void executeFetch(1);
  };

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
          title="Stock Movements"
          subtitle="Audit trail of every inventory change — read-only and append-only."
          icon={<ReceiptLongOutlined />}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          sx={{ mt: 3 }}
        >
          <MuiTextField
            label="From"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.fromDate}
            onChange={(e) => updateFilter("fromDate", e.target.value)}
            sx={{ minWidth: 170 }}
          />
          <MuiTextField
            label="To"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.toDate}
            onChange={(e) => updateFilter("toDate", e.target.value)}
            sx={{ minWidth: 170 }}
          />
          <MuiTextField
            label="Movement Type"
            select
            size="small"
            value={filters.movementType}
            onChange={(e) =>
              updateFilter(
                "movementType",
                e.target.value === "all"
                  ? "all"
                  : (Number(e.target.value) as StockMovementType),
              )
            }
            sx={{ minWidth: 200 }}
          >
            {MOVEMENT_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </MenuItem>
            ))}
          </MuiTextField>
          <MuiTextField
            label="Page Size"
            select
            size="small"
            value={filters.pageSize}
            onChange={(e) =>
              updateFilter("pageSize", Number(e.target.value))
            }
            sx={{ minWidth: 130 }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </MuiTextField>
          <Button
            variant="contained"
            startIcon={<SearchOutlined />}
            onClick={handleSearch}
            disabled={fetchCb.loading}
            sx={{ borderRadius: 2 }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={() => executeFetch(pageNumber)}
            disabled={fetchCb.loading}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
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
        <MovementList
          data={items}
          loading={fetchCb.loading}
          pagination={pagination}
          onNextPage={() => executeFetch(pageNumber + 1)}
          onPreviousPage={() => executeFetch(Math.max(1, pageNumber - 1))}
        />
      </Paper>
    </Box>
  );
};
