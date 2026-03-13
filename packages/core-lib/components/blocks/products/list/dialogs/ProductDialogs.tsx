import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  useTheme,
  alpha,
  Chip,
  LinearProgress,
  Button,
} from "@mui/material";
import { useToastContext } from "core-lib";
import { ProductForm } from "../../create/ProductForm";
import { ProductForm as ProductFormType } from "../../create/validation";
import {
  ProductDataList,
  CreateProductParams,
  CategoryDataList,
} from "core-lib/api/commons/types";
import { useApi, useApiCallback } from "core-lib/core/hooks";

export const ProductViewDialog: React.FC<{ product: ProductDataList }> = ({
  product,
}) => {
  const theme = useTheme();

  const getCategoryTypeLabel = (type: number | null) => {
    switch (type) {
      case 1:
        return "Location";
      case 2:
        return "Brand";
      case 3:
        return "Unit";
      default:
        return "Category";
    }
  };

  // Determine product type label
  const productTypeLabel = product.isMenuItem ? "Menu Item" : "Ingredient";
  const productTypeColor = product.isMenuItem
    ? theme.palette.primary.main
    : theme.palette.success.main;

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header with Product Type */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" fontWeight={600}>
            {product.name}
          </Typography>
          <Chip
            label={productTypeLabel}
            size="small"
            sx={{
              bgcolor: alpha(productTypeColor, 0.1),
              color: productTypeColor,
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
        </Stack>

        {/* Product ID */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Product ID
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, fontFamily: "monospace" }}>
            {product.productID}
          </Typography>
        </Box>

        {/* Description */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {product.description || "No description provided"}
          </Typography>
        </Box>

        {/* Pricing - Conditional based on product type */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {product.isMenuItem ? "Menu Item Pricing" : "Ingredient Cost"}
          </Typography>
          <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
            {product.isMenuItem && product.unitPrice ? (
              /* Menu Item: Show selling price */
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  Selling Price
                </Typography>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  ₱{product.unitPrice.toFixed(2)}
                </Typography>
              </Box>
            ) : !product.isMenuItem && product.costPrice ? (
              /* Ingredient: Show cost price */
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  Cost Price
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  ₱{product.costPrice.toFixed(2)}
                </Typography>
              </Box>
            ) : null}

            {/* Optional: Show both if available (rare case) */}
            {product.unitPrice && product.costPrice && (
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  Both Prices
                </Typography>
                <Typography variant="body2">
                  Sell: ₱{product.unitPrice.toFixed(2)} | Cost: ₱
                  {product.costPrice.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Category */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Category
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mt: 0.5 }}
          >
            <Typography variant="body2" fontWeight={500}>
              {product.categoryName || "Uncategorized"}
            </Typography>
            {product.categoryType && (
              <Chip
                label={getCategoryTypeLabel(product.categoryType)}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontSize: "0.7rem",
                  height: 20,
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Note about Inventory */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.03),
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> Inventory levels are managed separately for{" "}
            {product.isMenuItem
              ? "this menu item's ingredients"
              : "this ingredient"}
            .
          </Typography>
        </Box>

        {/* Audit Info */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Created By
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {product.createdBy || "System"}
          </Typography>
          {product.createdAt && (
            <Typography variant="caption" color="text.secondary">
              {new Date(product.createdAt).toLocaleString()}
            </Typography>
          )}
        </Box>

        {/* Status */}
        {product.isActive !== undefined && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={product.isActive ? "Active" : "Inactive"}
              size="small"
              sx={{
                mt: 0.5,
                bgcolor: product.isActive
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.text.disabled, 0.1),
                color: product.isActive
                  ? theme.palette.success.main
                  : theme.palette.text.disabled,
              }}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export const ProductEditDialog: React.FC<{
  product: ProductDataList;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ product, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const [categories, setCategories] = useState<CategoryDataList[]>([]);

  const categoriesData = useApi((api) => api.commons.categoryList());

  useEffect(() => {
    setCategories(categoriesData.result?.data.response ?? []);
  }, [categoriesData.result?.data.response]);
  const updateProductCb = useApiCallback(
    async (api, args: CreateProductParams & { productID: string }) =>
      await api.commons.updateProduct(args),
  );

  const handleSubmit = async (formValues: ProductFormType) => {
    try {
      const apiValues: CreateProductParams = {
        name: formValues.name,
        description: formValues.description,
        isMenuItem: formValues.isMenuItem,
        categoryID: formValues.categoryID,
      };

      if (formValues.isMenuItem) {
        apiValues.unitPrice = formValues.unitPrice;
      } else if (formValues.costPrice) {
        apiValues.costPrice = formValues.costPrice;
      }

      const updateData = {
        productID: product.productID,
        ...apiValues,
      };

      const result = await updateProductCb.execute(updateData);

      if (result.status === 200 && result.data.success) {
        showToast("Product updated successfully", "success");
        onSuccess();
        onClose();
      }
    } catch (error) {
      showToast("Failed to update product", "error");
    }
  };

  const initialValues: Partial<ProductFormType> = {
    name: product.name,
    description: product.description ?? "no-description",
    unitPrice: product.unitPrice ?? 0.01,
    costPrice: product.costPrice ?? undefined,
    isMenuItem: product.isMenuItem,
    categoryID: product.categoryID || null,
  };

  return (
    <Box sx={{ p: 2 }}>
      <ProductForm
        onSubmit={handleSubmit} // Now accepts ProductForm
        submitLoading={updateProductCb.loading}
        initialValues={initialValues}
        categories={categories}
        isInDialog={true}
        isEdit={true}
      />
    </Box>
  );
};

export const ProductDeleteDialog: React.FC<{
  product: ProductDataList;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ product, onSuccess, onClose }) => {
  const theme = useTheme();
  const { showToast } = useToastContext();

  const deleteProductCb = useApiCallback(
    async (api, args: string[]) => await api.commons.deleteProduct(args),
  );

  const handleDelete = async () => {
    try {
      const result = await deleteProductCb.execute([product.productID]);
      if (result.status === 200 && result.data.success) {
        showToast("Product deleted successfully", "success");
        onSuccess();
        onClose();
      }

      showToast("Delete API not ready yet", "info");
      onClose();
    } catch (error) {
      showToast("Failed to delete product", "error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Are you sure you want to delete this product?
      </Typography>

      <Box
        sx={{
          p: 2,
          mb: 3,
          bgcolor: alpha(theme.palette.error.main, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          {product.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ID: {product.productID}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          loading={deleteProductCb.loading}
          sx={{
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          Delete
        </Button>
      </Stack>
    </Box>
  );
};
