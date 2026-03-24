import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { RefreshOutlined } from "@mui/icons-material";
import { useApi } from "core-lib/core/hooks";
import { registerForm, useDialogContext } from "core-lib";
import { ProductDataList } from "core-lib/api/commons/types";
import { ProductList } from "./ProductList";
import { HeaderV2 } from "core-lib/components/header/HeaderV2";
import { useProductFilters } from "./hooks";
import { DIALOG_TITLES, DIALOG_TYPES } from "../constants";
import { StatsCard } from "core-lib/components/StatsCard";
import { FilterBar } from "core-lib/components/FilterBar";
import { ProductForm } from "../forms/ProductForm";

export const ProductListBlock: React.FC = () => {
  const theme = useTheme();
  const { openDialog } = useDialogContext();
  const [products, setProducts] = useState<ProductDataList[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  registerForm("product-form", ProductForm);

  const data = useApi((api) => api.commons.productList());

  useEffect(() => {
    const productData = data.result?.data.response ?? [];
    setProducts(productData);
  }, [data.result?.data.response]);

  const { filters, filteredProducts, stats, updateFilter, resetFilters } =
    useProductFilters({
      products,
    });

  const paginatedData = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    return filteredProducts.slice(start, end);
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
      dialogContentType: DIALOG_TYPES.create,
      onSuccess: handleRefresh,
    });
  };

  const handleView = useCallback(
    (product: ProductDataList) => {
      openDialog({
        title: DIALOG_TITLES.view,
        dialogContentType: DIALOG_TYPES.view,
        data: product,
      });
    },
    [openDialog],
  );

  const handleEdit = useCallback(
    (product: ProductDataList) => {
      openDialog({
        title: DIALOG_TITLES.edit,
        dialogContentType: DIALOG_TYPES.edit,
        data: product,
        onSuccess: handleRefresh,
      });
    },
    [openDialog, handleRefresh],
  );

  const handleDelete = useCallback(
    (product: ProductDataList) => {
      openDialog({
        title: DIALOG_TITLES.delete,
        dialogContentType: DIALOG_TYPES.delete,
        data: product,
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
        <HeaderV2 onCreate={handleCreate} title="Product" />

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 3, flexWrap: "wrap", gap: 2 }}
        >
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
        </Stack>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageNumber(1);
            }}
            resultCount={filteredProducts.length}
            pageSize={pageSize}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={handleRefresh}
            disabled={data.loading}
            sx={{ borderRadius: 2, ml: 2 }}
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
        <ProductList
          data={paginatedData}
          loading={data.loading}
          pagination={pagination}
          onNextPage={() => setPageNumber((prev) => prev + 1)}
          onPreviousPage={() => setPageNumber((prev) => prev - 1)}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Paper>

      {filteredProducts.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            Showing {(pageNumber - 1) * pageSize + 1} to{" "}
            {Math.min(pageNumber * pageSize, filteredProducts.length)} of{" "}
            {filteredProducts.length} entries
          </Typography>
        </Box>
      )}
    </Box>
  );
};
