import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Select,
  TextField,
} from "@radix-ui/themes";;
import {
  ReloadIcon,
  MagnifyingGlassIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import { useApiCallback } from "core-lib/core/hooks";
import {
  StockMovementDto,
  StockMovementType,
} from "core-lib/api/commons/types";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { Button } from "core-lib/components/radix/buttons/Button";
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
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title="Stock Movements"
          subtitle="Audit trail of every inventory change — read-only and append-only."
          icon={<ReaderIcon />}
        />

        <Flex
          direction={{ initial: "column", md: "row" }}
          gap="3"
          align={{ initial: "stretch", md: "end" }}
          mt="4"
          wrap="wrap"
        >
          <Box>
            <Text size="1" color="gray" as="div" mb="1">
              From
            </Text>
            <TextField.Root
              size="2"
              type="date"
              value={filters.fromDate}
              onChange={(e) => updateFilter("fromDate", e.target.value)}
              style={{ minWidth: 170 }}
            />
          </Box>
          <Box>
            <Text size="1" color="gray" as="div" mb="1">
              To
            </Text>
            <TextField.Root
              size="2"
              type="date"
              value={filters.toDate}
              onChange={(e) => updateFilter("toDate", e.target.value)}
              style={{ minWidth: 170 }}
            />
          </Box>
          <Box>
            <Text size="1" color="gray" as="div" mb="1">
              Movement Type
            </Text>
            <Select.Root
              size="2"
              value={String(filters.movementType)}
              onValueChange={(v) =>
                updateFilter(
                  "movementType",
                  v === "all" ? "all" : (Number(v) as StockMovementType),
                )
              }
            >
              <Select.Trigger style={{ minWidth: 200 }} />
              <Select.Content>
                {MOVEMENT_TYPE_OPTIONS.map((opt) => (
                  <Select.Item key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
          <Box>
            <Text size="1" color="gray" as="div" mb="1">
              Page Size
            </Text>
            <Select.Root
              size="2"
              value={String(filters.pageSize)}
              onValueChange={(v) => updateFilter("pageSize", Number(v))}
            >
              <Select.Trigger style={{ minWidth: 130 }} />
              <Select.Content>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <Select.Item key={size} value={String(size)}>
                    {size}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
          <Flex gap="2" align="end">
            <Button
              type="Primary"
              onClick={handleSearch}
              disabled={fetchCb.loading}
            >
              <Flex align="center" gap="2">
                <MagnifyingGlassIcon />
                Search
              </Flex>
            </Button>
            <Button
              type="Secondary"
              onClick={() => executeFetch(pageNumber)}
              disabled={fetchCb.loading}
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
        <MovementList
          data={items}
          loading={fetchCb.loading}
          pagination={pagination}
          onNextPage={() => executeFetch(pageNumber + 1)}
          onPreviousPage={() => executeFetch(Math.max(1, pageNumber - 1))}
        />
      </Card>
    </Box>
  );
};
