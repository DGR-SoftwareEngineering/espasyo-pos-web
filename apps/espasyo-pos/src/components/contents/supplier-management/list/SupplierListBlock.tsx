import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
} from "@radix-ui/themes";;
import { ReloadIcon, PlusIcon } from "@radix-ui/react-icons";
import { BusinessOutlined } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useDialogContext } from "core-lib";
import type {
  DialogContentType,
  DialogDataType,
} from "core-lib/api/content/types/common";
import type { FilterConfig } from "core-lib/components/radix/FilterBar";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { FilterBar } from "core-lib/components/radix/FilterBar";
import { Button } from "core-lib/components/radix/buttons/Button";
import { MessageBlock } from "core-lib/components/radix/blocks/messages";
import { MessageType } from "core-lib/components/topAlertMessages/types";
import { SupplierDto } from "core-lib/api/commons/types";
import { useApi } from "core-lib/core/hooks";
import { SupplierList } from "./SupplierList";
import { useSupplierFilters } from "./hooks";
import {
  DIALOG_TITLES,
  DIALOG_TYPES,
  PAGE_SIZE_OPTIONS,
  PAYMENT_TERMS_FILTER_OPTIONS,
  SORT_OPTIONS,
} from "../constants";

export const SupplierListBlock: React.FC = () => {
  const router = useRouter();
  const { openDialog } = useDialogContext();
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const data = useApi((api) => api.commons.supplierList(pageNumber, pageSize));

  useEffect(() => {
    const page = data.result?.data.response;
    setSuppliers(page?.items ?? []);
  }, [data.result?.data.response]);

  const { filters, filteredSuppliers, stats, updateFilter, resetFilters } =
    useSupplierFilters({ suppliers });

  const serverPagination = data.result?.data.response;
  const pagination = useMemo(
    () => ({
      pageNumber,
      totalPages: serverPagination?.totalPages ?? 1,
      hasNextPage: serverPagination?.hasNextPage ?? false,
      hasPreviousPage: serverPagination?.hasPreviousPage ?? false,
      pageSize,
      totalItems: serverPagination?.totalItems,
    }),
    [pageNumber, pageSize, serverPagination],
  );

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        key: "paymentTerms",
        label: "Payment Terms",
        value: filters.paymentTermsFilter,
        options: PAYMENT_TERMS_FILTER_OPTIONS,
        onChange: (value) =>
          updateFilter(
            "paymentTermsFilter",
            value === "all" ? "all" : String(value),
          ),
      },
    ],
    [filters.paymentTermsFilter, updateFilter],
  );

  const handleRefresh = useCallback(() => {
    data.execute();
    setPageNumber(1);
  }, [data]);

  const handleCreate = () => {
    router.push("/admin/hub/user-management/add-new-supplier");
  };

  const handleView = useCallback(
    (supplier: SupplierDto) => {
      openDialog({
        title: DIALOG_TITLES.view,
        dialogContentType: DIALOG_TYPES.view as unknown as DialogContentType,
        data: supplier as DialogDataType["SupplierView"],
      });
    },
    [openDialog],
  );

  const handleEdit = useCallback(
    (supplier: SupplierDto) => {
      openDialog({
        title: DIALOG_TITLES.edit,
        dialogContentType: DIALOG_TYPES.edit as unknown as DialogContentType,
        data: supplier as DialogDataType["SupplierEdit"],
        onSuccess: handleRefresh,
      });
    },
    [openDialog, handleRefresh],
  );

  const handleDelete = useCallback(
    (supplier: SupplierDto) => {
      openDialog({
        title: DIALOG_TITLES.delete,
        dialogContentType: DIALOG_TYPES.delete as unknown as DialogContentType,
        data: supplier as DialogDataType["SupplierDelete"],
        onSuccess: handleRefresh,
      });
    },
    [openDialog, handleRefresh],
  );

  const hasNoSuppliers =
    !data.loading && (serverPagination?.totalItems ?? suppliers.length) === 0;

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title="Supplier Management"
          subtitle="Track vendor relationships, payment terms, and optional portal logins."
          icon={<BusinessOutlined />}
          actionButton={{
            label: "New Supplier",
            onClick: handleCreate,
            icon: <PlusIcon />,
            variant: "contained",
            color: "primary",
          }}
        />

        <Flex gap="3" mt="4" wrap="wrap">
          <StatsCard
            label="Total Suppliers"
            value={stats.total}
            color="primary"
            variant="detailed"
          />
          <StatsCard
            label="With Logo"
            value={stats.withLogo}
            color="info"
            variant="detailed"
          />
          <StatsCard
            label="Portal Linked"
            value={stats.withPortalUser}
            color="success"
            variant="detailed"
          />
          {Object.entries(stats.byTerms)
            .slice(0, 3)
            .map(([terms, count]) => (
              <StatsCard
                key={terms}
                label={terms}
                value={count}
                color="info"
                variant="detailed"
              />
            ))}
        </Flex>

        {hasNoSuppliers && (
          <Box mt="4">
            <MessageBlock
              type={MessageType.Info}
              header="No suppliers yet"
              text="Add the first vendor to start tracking purchase orders against them."
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
            searchPlaceholder="Search by company, contact, email, terms, tax ID…"
            filterConfigs={filterConfigs}
            sortValue={filters.sortBy}
            sortOptions={SORT_OPTIONS}
            onSortChange={(value) => updateFilter("sortBy", value)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageNumber(1);
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            resultCount={filteredSuppliers.length}
            resultLabel="suppliers"
            pageSize={pageSize}
          />
          <Flex gap="3" align="center">
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
        <SupplierList
          data={filteredSuppliers}
          loading={data.loading}
          pagination={pagination}
          onNextPage={() => setPageNumber((p) => p + 1)}
          onPreviousPage={() => setPageNumber((p) => Math.max(1, p - 1))}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      {filteredSuppliers.length > 0 && serverPagination && (
        <Flex justify="between" align="center" mt="3" px="2">
          <Text size="2" color="gray">
            Showing{" "}
            <Text weight="bold" color="gray">
              {filteredSuppliers.length}
            </Text>{" "}
            of{" "}
            <Text weight="bold" color="gray">
              {serverPagination.totalItems ?? suppliers.length}
            </Text>{" "}
            suppliers
          </Text>
          <Text size="2" color="gray">
            Page{" "}
            <Text weight="bold" color="gray">
              {pagination.pageNumber}
            </Text>{" "}
            of{" "}
            <Text weight="bold" color="gray">
              {pagination.totalPages}
            </Text>
          </Text>
        </Flex>
      )}
    </Box>
  );
};
