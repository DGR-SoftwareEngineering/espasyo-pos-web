import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Card, Flex, Text } from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
  BusinessCenterOutlined,
} from "@mui/icons-material";
import { useApi } from "core-lib/core/hooks";
import { useDialogContext } from "core-lib";
import { registerForm } from "core-lib/components/radix/form/FormRenderer";
import { ProductDataList } from "core-lib/api/commons/types";
import type { DialogContentType } from "core-lib/api/content/types/common";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { FilterBar } from "core-lib/components/radix/FilterBar";
import { Button } from "core-lib/components/radix/buttons/Button";
import { ProductList } from "./ProductList";
import { useProductFilters } from "./hooks";
import type { ProductTypeFilter } from "./types";
import { DIALOG_TITLES, DIALOG_TYPES } from "../constants";
import { ProductForm } from "../forms/ProductForm";

type TypeTab = { value: ProductTypeFilter; label: string; icon: React.ReactNode; color: string };
const TYPE_TABS: TypeTab[] = [
  { value: "all", label: "All", icon: null, color: "var(--gray-11)" },
  { value: "menuItem", label: "Menu Items", icon: <RestaurantMenuOutlined style={{ fontSize: 14 }} />, color: "var(--indigo-11)" },
  { value: "ingredient", label: "Ingredients", icon: <KitchenOutlined style={{ fontSize: 14 }} />, color: "var(--green-11)" },
  { value: "supply", label: "Business Supplies", icon: <BusinessCenterOutlined style={{ fontSize: 14 }} />, color: "var(--amber-11)" },
];

registerForm("product-form", ProductForm);

export const ProductListBlock: React.FC = () => {
  const { openDialog } = useDialogContext();
  const [products, setProducts] = useState<ProductDataList[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const data = useApi((api) => api.commons.productList());

  useEffect(() => {
    setProducts(data.result?.data.response ?? []);
  }, [data.result?.data.response]);

  const { filters, filteredProducts, stats, updateFilter, resetFilters } =
    useProductFilters({ products });

  const paginatedData = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, pageNumber, pageSize]);

  const pagination = useMemo(
    () => ({
      pageNumber,
      totalPages: Math.ceil(filteredProducts.length / pageSize),
      hasNextPage: pageNumber < Math.ceil(filteredProducts.length / pageSize),
      hasPreviousPage: pageNumber > 1,
      pageSize,
    }),
    [filteredProducts.length, pageNumber, pageSize],
  );

  const handleRefresh = () => {
    data.execute();
    resetFilters();
    setPageNumber(1);
    setSelectedIds(new Set());
  };

  const handleSelectProduct = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(prev =>
      prev.size === paginatedData.length
        ? new Set()
        : new Set(paginatedData.map(p => p.productID))
    );
  }, [paginatedData]);

  const handleBulkDelete = useCallback(() => {
    openDialog({
      title: `Delete ${selectedIds.size} Product${selectedIds.size > 1 ? 's' : ''}`,
      dialogContentType: "ProductBulkDelete" as unknown as DialogContentType,
      data: { ids: Array.from(selectedIds), count: selectedIds.size },
      onSuccess: () => {
        setSelectedIds(new Set());
        handleRefresh();
      },
    });
  }, [selectedIds, openDialog, handleRefresh]);

  const handleCreate = () => {
    openDialog({
      title: DIALOG_TITLES.create,
      dialogContentType: DIALOG_TYPES.create as unknown as DialogContentType,
      onSuccess: handleRefresh,
    });
  };

  const handleView = useCallback(
    (product: ProductDataList) => {
      openDialog({
        title: DIALOG_TITLES.view,
        dialogContentType: DIALOG_TYPES.view as unknown as DialogContentType,
        data: product,
      });
    },
    [openDialog],
  );

  const handleEdit = useCallback(
    (product: ProductDataList) => {
      openDialog({
        title: DIALOG_TITLES.edit,
        dialogContentType: DIALOG_TYPES.edit as unknown as DialogContentType,
        data: product,
        onSuccess: handleRefresh,
      });
    },
    [openDialog],
  );

  const handleDelete = useCallback(
    (product: ProductDataList) => {
      openDialog({
        title: DIALOG_TITLES.delete,
        dialogContentType: DIALOG_TYPES.delete as unknown as DialogContentType,
        data: product,
        onSuccess: handleRefresh,
      });
    },
    [openDialog],
  );

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <HeaderV2 onCreate={handleCreate} title="Product" />

        <Flex gap="3" mt="4" wrap="wrap">
          <StatsCard
            label="Total Products"
            value={stats.totalProducts}
            color="primary"
          />
          <StatsCard
            label="Active Products"
            value={stats.activeProducts}
            color="success"
          />
          <StatsCard label="Menu Items" value={stats.menuItems} color="info" />
          <StatsCard
            label="Ingredients"
            value={stats.ingredients}
            color="primary"
          />
          <StatsCard
            label="Business Supplies"
            value={stats.businessSupplies}
            color="warning"
          />
        </Flex>

        {/* Type filter tabs */}
        <Box
          mt="4"
          style={{
            display: "inline-flex",
            borderRadius: 999,
            border: "1px solid var(--gray-a4)",
            background: "var(--gray-a2)",
            padding: 3,
            gap: 2,
          }}
        >
          {TYPE_TABS.map((tab) => {
            const active = filters.productTypeFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  updateFilter("productTypeFilter", tab.value);
                  setPageNumber(1);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  background: active ? "var(--color-background)" : "transparent",
                  color: active ? tab.color : "var(--gray-11)",
                  boxShadow: active ? "var(--shadow-1)" : "none",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </Box>

        <Flex justify="between" align="center" gap="3" mt="3" wrap="wrap">
          <FilterBar
            searchValue={filters.searchTerm}
            onSearchChange={(value) => updateFilter("searchTerm", value)}
            searchPlaceholder="Search products…"
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageNumber(1);
            }}
            resultCount={filteredProducts.length}
            resultLabel="products"
            pageSize={pageSize}
          />
          <Flex gap="2" align="center">
            {selectedIds.size > 0 && (
              <Button
                type="Critical"
                onClick={handleBulkDelete}
              >
                <Flex align="center" gap="2">
                  Delete Selected ({selectedIds.size})
                </Flex>
              </Button>
            )}
            <Button
              type="Secondary"
              onClick={handleRefresh}
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
        <ProductList
          data={paginatedData}
          loading={data.loading}
          pagination={pagination}
          onNextPage={() => setPageNumber((p) => p + 1)}
          onPreviousPage={() => setPageNumber((p) => p - 1)}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          onSelectProduct={handleSelectProduct}
          onSelectAll={handleSelectAll}
        />
      </Card>

      {filteredProducts.length > 0 && (
        <Flex justify="between" align="center" mt="3" px="2">
          <Text size="2" color="gray">
            Showing {(pageNumber - 1) * pageSize + 1} to{" "}
            {Math.min(pageNumber * pageSize, filteredProducts.length)} of{" "}
            {filteredProducts.length} entries
          </Text>
        </Flex>
      )}
    </Box>
  );
};
