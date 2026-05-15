import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Card, Flex, Text } from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";
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
import { DIALOG_TITLES, DIALOG_TYPES } from "../constants";
import { ProductForm } from "../forms/ProductForm";

registerForm("product-form", ProductForm);

export const ProductListBlock: React.FC = () => {
  const { openDialog } = useDialogContext();
  const [products, setProducts] = useState<ProductDataList[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
  };

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
        </Flex>

        <Flex justify="between" align="center" gap="3" mt="4" wrap="wrap">
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
