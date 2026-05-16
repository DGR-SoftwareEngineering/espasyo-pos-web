import { alpha, Box, Chip, Stack, Typography, useTheme } from "@mui/material";
import { ProductDataList } from "../../../../api/commons/types";

export const ProductViewDialogContent: React.FC<{
  product: ProductDataList;
}> = ({ product }) => {
  const theme = useTheme();

  const productTypeLabel = product.isMenuItem ? "Menu Item" : "Ingredient";
  const categoryName = product.isMenuItem
    ? product.productCategoryName
    : product.ingredientCategoryName;
  const categoryTypeLabel = product.isMenuItem
    ? "Menu Category"
    : "Ingredient Category";
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
              {categoryName || "Uncategorized"}
            </Typography>
            {categoryName && (
              <Chip
                label={categoryTypeLabel}
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
