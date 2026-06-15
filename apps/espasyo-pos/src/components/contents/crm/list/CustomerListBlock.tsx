import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  AlertDialog,
  Box,
  Button,
  Card,
  Flex,
  Text,
} from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";
import { AddCircleOutlined, PeopleAltOutlined } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { extractApiError } from "core-lib/business/errorUtils";
import { PillTabBar } from "core-lib/components/radix/PillTabBar";
import { PaginationFooter } from "core-lib/components/radix/PaginationFooter";
import {
  CustomerDetailDto,
  CustomerDto,
  CustomerSegment,
} from "core-lib/api/crm";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { FilterBar } from "core-lib/components/radix/FilterBar";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { CustomerList } from "./CustomerList";
import { useCustomerFilters } from "../hooks/useCustomerFilters";
import { CustomerFormBlock } from "../forms/CustomerFormBlock";
import {
  DIALOG_TITLES,
  SEGMENT_CONFIG,
  SegmentFilter,
} from "../constants";

const SEGMENT_TABS: { value: SegmentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: CustomerSegment.New, label: SEGMENT_CONFIG[CustomerSegment.New].label },
  { value: CustomerSegment.Regular, label: SEGMENT_CONFIG[CustomerSegment.Regular].label },
  { value: CustomerSegment.VIP, label: SEGMENT_CONFIG[CustomerSegment.VIP].label },
  { value: CustomerSegment.Occasional, label: SEGMENT_CONFIG[CustomerSegment.Occasional].label },
  { value: CustomerSegment.AtRisk, label: SEGMENT_CONFIG[CustomerSegment.AtRisk].label },
];

export const CustomerListBlock: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToastContext();

  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerDetailDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loadingEditDetail, setLoadingEditDetail] = useState(false);

  const customersData = useApi(
    (api) => api.crm.list({ pageNumber: 1, pageSize: 100 }),
    [],
  );
  const getByIdCb = useApiCallback(async (api, id: string) => api.crm.getById(id));
  const deleteCb = useApiCallback(async (api, id: string) => api.crm.softDelete(id));

  useEffect(() => {
    const response = customersData.result?.data?.response;
    if (response) {
      setCustomers(response.items ?? []);
    }
  }, [customersData.result]);

  const handleRefresh = useCallback(() => {
    customersData.execute();
    setPageNumber(1);
  }, [customersData]);

  const { filters, filteredCustomers, stats, updateFilter, updateSegmentFilter } =
    useCustomerFilters({ customers });

  const paginatedData = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, pageNumber, pageSize]);

  const pagination = useMemo(
    () => ({
      pageNumber,
      totalPages: Math.max(1, Math.ceil(filteredCustomers.length / pageSize)),
      hasNextPage: pageNumber < Math.ceil(filteredCustomers.length / pageSize),
      hasPreviousPage: pageNumber > 1,
      pageSize,
    }),
    [filteredCustomers.length, pageNumber, pageSize],
  );

  const handleView = useCallback(
    (c: CustomerDto) => {
      router.push(`/admin/hub/crm/customers/${c.customerID}`);
    },
    [router],
  );

  const handleEdit = useCallback(
    async (c: CustomerDto) => {
      setLoadingEditDetail(true);
      try {
        const result = await getByIdCb.execute(c.customerID);
        if (result?.data?.response) {
          setEditTarget(result.data.response);
        } else {
          showToast("Could not load customer", "error");
        }
      } catch {
        showToast("Could not load customer", "error");
      } finally {
        setLoadingEditDetail(false);
      }
    },
    [getByIdCb, showToast],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const result = await deleteCb.execute(deleteTarget.customerID);
      if (result?.data?.success) {
        showToast(`${deleteTarget.fullName} removed`, "success");
        setCustomers((prev) => prev.filter((c) => c.customerID !== deleteTarget.customerID));
        setDeleteTarget(null);
        handleRefresh();
        return;
      }
      showToast(extractApiError(result, "Failed to delete customer"), "error");
    } catch {
      showToast("Failed to delete customer", "error");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, deleteCb, handleRefresh, showToast]);

  const handleCreateSuccess = useCallback(() => {
    setCreateOpen(false);
    handleRefresh();
  }, [handleRefresh]);

  const handleEditSuccess = useCallback(() => {
    setEditTarget(null);
    handleRefresh();
  }, [handleRefresh]);

  return (
    <Box style={{ width: "100%" }}>
      <Card
        variant="surface"
        size="3"
        mb="4"
        style={{
          background: "linear-gradient(135deg, var(--indigo-a2) 0%, transparent 60%)",
        }}
      >
        <Flex justify="between" align="center" gap="3" wrap="wrap">
          <HeaderV2
            title="Customers"
            subtitle="Profiles, loyalty cards, notes, and tags"
          />
          <Flex gap="2">
            <Button
              variant="soft"
              color="gray"
              size="2"
              onClick={() => router.push("/admin/hub/crm/deleted-customers")}
            >
              Deleted
            </Button>
            <Button
              variant="soft"
              color="gray"
              size="2"
              onClick={handleRefresh}
              disabled={customersData.loading}
            >
              <ReloadIcon /> Refresh
            </Button>
            <Button
              variant="solid"
              color="indigo"
              size="2"
              onClick={() => setCreateOpen(true)}
            >
              <AddCircleOutlined fontSize="small" /> New Customer
            </Button>
          </Flex>
        </Flex>

        <Flex gap="3" mt="4" wrap="wrap">
          {[
            { label: "Total Customers", value: stats.total, color: "primary" },
            { label: "New (this month)", value: stats.newThisMonth, color: "info" },
            { label: "VIP", value: stats.vip, color: "warning" },
            { label: "At Risk", value: stats.atRisk, color: "error" },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
            >
              <StatsCard label={item.label} value={item.value} color={item.color as any} />
            </motion.div>
          ))}
        </Flex>

        <PillTabBar<SegmentFilter>
          tabs={SEGMENT_TABS.map((tab) => ({
            ...tab,
            count: stats.perSegment[tab.value] ?? 0,
          }))}
          activeTab={filters.segmentFilter}
          onTabChange={(value) => {
            updateSegmentFilter(value);
            setPageNumber(1);
          }}
        />

        <Flex justify="between" align="center" gap="3" mt="3" wrap="wrap">
          <FilterBar
            searchValue={filters.searchTerm}
            onSearchChange={(value) => {
              updateFilter("searchTerm", value);
              setPageNumber(1);
            }}
            searchPlaceholder="Search by name, phone, customer #…"
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageNumber(1);
            }}
            resultCount={filteredCustomers.length}
            resultLabel="customers"
            pageSize={pageSize}
          />
        </Flex>
      </Card>

      <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
        <CustomerList
          data={paginatedData}
          loading={customersData.loading || loadingEditDetail}
          pagination={pagination}
          onNextPage={() => setPageNumber((p) => p + 1)}
          onPreviousPage={() => setPageNumber((p) => p - 1)}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={(c) => setDeleteTarget(c)}
        />
      </Card>

      {filteredCustomers.length === 0 && !customersData.loading && (
        <Card variant="surface" mt="3" size="3">
          <Flex align="center" gap="2" justify="center">
            <PeopleAltOutlined style={{ fontSize: 18, opacity: 0.5 }} />
            <Text size="2" color="gray">
              No customers match your filters yet.
            </Text>
          </Flex>
        </Card>
      )}

      <PaginationFooter
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalItems={filteredCustomers.length}
        itemLabel="customer(s)"
      />

      {/* Create dialog */}
      <DialogBox
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={DIALOG_TITLES.create}
        maxWidth="md"
      >
        <CustomerFormBlock isInDialog onSuccess={handleCreateSuccess} />
      </DialogBox>

      {/* Edit dialog */}
      <DialogBox
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={DIALOG_TITLES.edit}
        maxWidth="md"
      >
        {editTarget && (
          <CustomerFormBlock
            customer={editTarget}
            isInDialog
            onSuccess={handleEditSuccess}
          />
        )}
      </DialogBox>

      {/* Delete confirm */}
      <AlertDialog.Root
        open={!!deleteTarget}
        onOpenChange={(o) => (!o && !deleteLoading ? setDeleteTarget(null) : undefined)}
      >
        <AlertDialog.Content style={{ maxWidth: 440 }}>
          <AlertDialog.Title>Remove this customer?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            <strong>&quot;{deleteTarget?.fullName}&quot;</strong> will be hidden from
            lookups. Their past purchases and loyalty stamps stay on the record
            and won&apos;t be affected. This is a soft delete.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={deleteLoading}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button color="red" onClick={handleDeleteConfirm} loading={deleteLoading}>
              Remove
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
};
