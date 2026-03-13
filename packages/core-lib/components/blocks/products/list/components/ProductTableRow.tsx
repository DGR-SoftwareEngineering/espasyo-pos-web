import React, { useMemo } from "react";
import {
  Box,
  IconButton,
  Stack,
  TableRow,
  TableCell,
  Typography,
  useTheme,
  alpha,
  Tooltip,
  Avatar,
  Chip,
} from "@mui/material";
import {
  EditOutlined,
  DeleteOutlined,
  VisibilityOutlined,
  AttachMoney,
  RestaurantMenuOutlined,
  KitchenOutlined,
} from "@mui/icons-material";
import { ProductDataList } from "../../../../../api/commons/types";
import {
  getCategoryInfo,
  truncateDescription,
  formatProductId,
  formatCurrency,
} from "../utils";
import { DIALOG_TITLES } from "../constants";

interface ProductTableRowProps {
  row: ProductDataList;
  onView: (product: ProductDataList) => void;
  onEdit: (product: ProductDataList) => void;
  onDelete: (product: ProductDataList) => void;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({
  row,
  onView,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  const categoryInfo = useMemo(
    () => getCategoryInfo(row.categoryType),
    [row.categoryType],
  );

  // Product type styling
  const isMenuItem = row.isMenuItem;
  const productTypeIcon = isMenuItem ? (
    <RestaurantMenuOutlined fontSize="small" />
  ) : (
    <KitchenOutlined fontSize="small" />
  );
  const productTypeColor = isMenuItem
    ? theme.palette.primary.main
    : theme.palette.success.main;
  const productTypeLabel = isMenuItem ? "Menu Item" : "Ingredient";

  return (
    <TableRow
      sx={{
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          transition: "background-color 0.2s",
        },
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      {/* Product Info */}
      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha(productTypeColor, 0.1),
              color: productTypeColor,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {row.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {truncateDescription(row.description)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              ID: {formatProductId(row.productID)}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* Price - Conditional based on product type */}
      <TableCell align="center">
        <Stack direction="column" alignItems="center" spacing={0.5}>
          {isMenuItem ? (
            // Menu Item: Show unitPrice
            <>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AttachMoney
                  sx={{ fontSize: 16, color: theme.palette.success.main }}
                />
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(row.unitPrice)}
                </Typography>
              </Stack>
              {row.costPrice && row.costPrice > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Cost: {formatCurrency(row.costPrice)}
                </Typography>
              )}
            </>
          ) : (
            // Ingredient: Show costPrice
            <>
              <Typography variant="body2" fontWeight={600} color="info.main">
                {formatCurrency(row.costPrice)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cost Price
              </Typography>
            </>
          )}
        </Stack>
      </TableCell>

      {/* Product Type */}
      <TableCell align="center">
        <Chip
          icon={productTypeIcon}
          label={productTypeLabel}
          size="small"
          sx={{
            bgcolor: alpha(productTypeColor, 0.1),
            color: productTypeColor,
            fontWeight: 500,
            borderRadius: 2,
          }}
        />
      </TableCell>

      {/* Status */}
      <TableCell align="center">
        <Chip
          label={row.isActive ? "Active" : "Inactive"}
          size="small"
          color={row.isActive ? "success" : "default"}
          sx={{
            minWidth: 80,
            fontWeight: 500,
            borderRadius: 2,
          }}
        />
      </TableCell>

      {/* Category */}
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            {categoryInfo.icon}
          </Avatar>
          <Box>
            <Typography variant="body2">
              {row.categoryName || "Uncategorized"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {categoryInfo.label}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* Actions */}
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title={DIALOG_TITLES.view}>
            <IconButton
              size="small"
              onClick={() => onView(row)}
              sx={actionButtonStyles(theme, "info")}
            >
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={DIALOG_TITLES.edit}>
            <IconButton
              size="small"
              onClick={() => onEdit(row)}
              sx={actionButtonStyles(theme, "primary")}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={DIALOG_TITLES.delete}>
            <IconButton
              size="small"
              onClick={() => onDelete(row)}
              sx={actionButtonStyles(theme, "error")}
            >
              <DeleteOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

const actionButtonStyles = (
  theme: any,
  color: "info" | "primary" | "error",
) => ({
  color: theme.palette.text.secondary,
  "&:hover": {
    color: theme.palette[color].main,
    bgcolor: alpha(theme.palette[color].main, 0.1),
  },
});
