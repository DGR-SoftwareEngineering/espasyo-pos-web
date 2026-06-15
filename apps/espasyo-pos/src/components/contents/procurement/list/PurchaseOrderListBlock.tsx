import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  AccountBalanceWalletOutlined,
  HourglassEmptyOutlined,
  ListAltOutlined,
  LocalShippingOutlined,
} from "@mui/icons-material";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { useApi } from "core-lib/core/hooks";
import { useDialogContext } from "core-lib";
import { usePublicSettings } from "core-lib/core/contexts";
import { Button } from "core-lib/components/radix/buttons/Button";
import type { DialogContentType } from "core-lib/api/content/types/common";
import {
  FulfillmentMethodDto,
  PurchaseOrderDto,
  PurchaseOrderQueryParams,
  PurchaseOrderStatusDto,
  SupplierDto,
} from "core-lib/api/commons/types";
import { PO_STATUS_FILTER_OPTIONS, PAGE_SIZE_OPTIONS } from "../constants";
import { formatCurrency } from "../format";
import { PurchaseOrderList } from "./PurchaseOrderList";
import { usePurchaseOrderFilters } from "./hooks";

const STATUS_FILTER_ALL = "all";

export const PurchaseOrderListBlock: React.FC = () => {
  const router = useRouter();
  const { currencyCode } = usePublicSettings();
  const { openDialog } = useDialogContext();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [reloadToken, setReloadToken] = useState(0);

  const queryParams = useMemo<PurchaseOrderQueryParams>(
    () => ({ pageNumber, pageSize }),
    [pageNumber, pageSize],
  );

  const listApi = useApi(
    (api) => api.commons.purchaseOrderList(queryParams),
    [queryParams, reloadToken],
  );
  const suppliersApi = useApi((api) => api.commons.supplierList(1, 200));

  const suppliers: SupplierDto[] = useMemo(
    () => suppliersApi.result?.data?.response?.items ?? [],
    [suppliersApi.result],
  );
  const orders: PurchaseOrderDto[] = useMemo(
    () => listApi.result?.data?.response?.items ?? [],
    [listApi.result],
  );
  const pagination = listApi.result?.data?.response;

  const { filters, filteredOrders, stats, updateFilter, resetFilters } =
    usePurchaseOrderFilters({ orders });

  const handleRefresh = () => {
    resetFilters();
    setReloadToken((n) => n + 1);
    setPageNumber(1);
  };

  useEffect(() => {
    if (!router.query.prefill) return;
    const raw = typeof window !== "undefined" ? localStorage.getItem("po_prefill") : null;
    if (!raw) return;
    localStorage.removeItem("po_prefill");
    try {
      const prefillItems = JSON.parse(raw) as Array<{ productID: string; productName: string; quantity: number }>;
      openDialog({
        title: "New purchase order",
        dialogContentType: "PurchaseOrderCreate" as unknown as DialogContentType,
        data: { prefillItems },
        onSuccess: () => setReloadToken((n) => n + 1),
      });
    } catch {
      // malformed localStorage — ignore
    }
    router.replace(router.pathname, undefined, { shallow: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.prefill]);

  const goToDetail = (po: PurchaseOrderDto) =>
    router.push(`/admin/hub/procurement/purchase-orders/${po.purchaseOrderID}`);

  const handleCreate = () => {
    openDialog({
      title: "New purchase order",
      dialogContentType: "PurchaseOrderCreate" as unknown as DialogContentType,
      onSuccess: () => {
        setReloadToken((n) => n + 1);
      },
    });
  };

  const tablePagination = useMemo(
    () => ({
      pageNumber,
      totalPages: pagination?.totalPages ?? 1,
      hasNextPage: pagination?.hasNextPage ?? false,
      hasPreviousPage: pagination?.hasPreviousPage ?? false,
      pageSize,
      totalItems: pagination?.totalItems,
    }),
    [pageNumber, pageSize, pagination],
  );

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <Flex justify="between" align="start" wrap="wrap" gap="3">
          <HeaderV2
            title="Purchase orders"
            subtitle="Order from suppliers, track receiving, and reconcile invoices + payments."
            icon={<ListAltOutlined />}
          />
          <Flex align="center" gap="2">
            <IconButton
              variant="ghost"
              color="gray"
              onClick={handleRefresh}
              disabled={listApi.loading}
              aria-label="Refresh"
              title="Refresh"
            >
              <ReloadIcon />
            </IconButton>
            <Button type="Primary" onClick={handleCreate}>
              <Flex align="center" gap="2">
                <PlusIcon />
                New PO
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Box
        mb="4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        <StatsCard
          label="Total POs"
          value={stats.total}
          color="indigo"
          icon={<ListAltOutlined fontSize="small" />}
        />
        <StatsCard
          label="Pending receipt"
          value={stats.pendingReceipt}
          color="amber"
          icon={<LocalShippingOutlined fontSize="small" />}
        />
        <StatsCard
          label="Drafts"
          value={stats.drafts}
          color="gray"
          icon={<HourglassEmptyOutlined fontSize="small" />}
        />
        <StatsCard
          label="Spend (page)"
          value={formatCurrency(stats.totalSpend, currencyCode)}
          color="teal"
          icon={<AccountBalanceWalletOutlined fontSize="small" />}
        />
      </Box>

      <Card variant="surface" size="2" mb="4">
        <Flex gap="2" wrap="wrap" align="center">
          <Box style={{ flex: 1, minWidth: 220 }}>
            <TextField.Root
              size="2"
              value={filters.searchTerm}
              placeholder="Search by PO number or supplier…"
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon />
              </TextField.Slot>
            </TextField.Root>
          </Box>
          <Select.Root
            size="2"
            value={String(filters.statusFilter)}
            onValueChange={(v) =>
              updateFilter(
                "statusFilter",
                v === STATUS_FILTER_ALL
                  ? "all"
                  : (Number(v) as PurchaseOrderStatusDto),
              )
            }
          >
            <Select.Trigger variant="soft" color="gray" placeholder="Status" />
            <Select.Content>
              <Select.Item value={STATUS_FILTER_ALL}>All statuses</Select.Item>
              <Select.Separator />
              {PO_STATUS_FILTER_OPTIONS.map((opt) => (
                <Select.Item key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Select.Root
            size="2"
            value={filters.supplierFilter}
            onValueChange={(v) => updateFilter("supplierFilter", v)}
          >
            <Select.Trigger
              variant="soft"
              color="gray"
              placeholder="Supplier"
            />
            <Select.Content>
              <Select.Item value={STATUS_FILTER_ALL}>All suppliers</Select.Item>
              <Select.Separator />
              {suppliers.map((s) => (
                <Select.Item key={s.supplierID} value={s.supplierID}>
                  {s.companyName}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Select.Root
            size="2"
            value={String(filters.fulfillmentFilter)}
            onValueChange={(v) =>
              updateFilter(
                "fulfillmentFilter",
                v === STATUS_FILTER_ALL
                  ? "all"
                  : (Number(v) as FulfillmentMethodDto),
              )
            }
          >
            <Select.Trigger
              variant="soft"
              color="gray"
              placeholder="Fulfillment"
            />
            <Select.Content>
              <Select.Item value={STATUS_FILTER_ALL}>All methods</Select.Item>
              <Select.Item value={String(FulfillmentMethodDto.Delivery)}>
                Delivery
              </Select.Item>
              <Select.Item value={String(FulfillmentMethodDto.Pickup)}>
                Pickup
              </Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Card>

      <PurchaseOrderList
        data={filteredOrders}
        loading={listApi.loading}
        pagination={tablePagination}
        onNextPage={() => setPageNumber((n) => n + 1)}
        onPreviousPage={() => setPageNumber((n) => Math.max(1, n - 1))}
        onView={goToDetail}
      />

      <Flex
        justify="between"
        align="center"
        wrap="wrap"
        gap="2"
        mt="3"
        px="2"
      >
        <Flex align="center" gap="2">
          <Text size="1" color="gray">
            Page size
          </Text>
          <Select.Root
            size="1"
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPageNumber(1);
            }}
          >
            <Select.Trigger variant="soft" color="gray" />
            <Select.Content>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <Select.Item key={n} value={String(n)}>
                  {n}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>

    </Box>
  );
};

// StatTile removed in favor of StatsCard from core-lib
