import React, { useMemo } from "react";
import {
  Stack,
  Avatar,
  Typography,
  Box,
  alpha,
  useTheme,
  Chip,
} from "@mui/material";
import {
  AttachMoney,
  RestaurantMenuOutlined,
  KitchenOutlined,
  LocationOnOutlined,
  BrandingWatermarkOutlined,
  StraightenOutlined,
  CategoryOutlined,
} from "@mui/icons-material";
import { ProductDataList } from "core-lib/api/commons/types";
import { BaseTableRow, ActionButtons } from "core-lib";
import {
  truncateDescription,
  formatId,
  formatCurrency,
} from "core-lib/business/strings";
import { DIALOG_TITLES } from "../constants";

const getIconInfo = (type: number | null) => {
  switch (type) {
    case 1:
      return {
        icon: <LocationOnOutlined fontSize="small" />,
        label: "Location",
      };
    case 2:
      return {
        icon: <BrandingWatermarkOutlined fontSize="small" />,
        label: "Brand",
      };
    case 3:
      return { icon: <StraightenOutlined fontSize="small" />, label: "Unit" };
    default:
      return { icon: <CategoryOutlined fontSize="small" />, label: "Category" };
  }
};

interface Props {
  row: ProductDataList;
  onView: (product: ProductDataList) => void;
  onEdit: (product: ProductDataList) => void;
  onDelete: (product: ProductDataList) => void;
  isSelectable?: boolean;
  selectedRowKey?: string | number;
  onSelect?: (rowKey: string | number) => void;
}

export const ProductTableRow: React.FC<Props> = ({
  row,
  onView,
  onEdit,
  onDelete,
  isSelectable,
  onSelect,
}) => {
  const theme = useTheme();

  const categoryInfo = useMemo(
    () => getIconInfo(row.categoryType),
    [row.categoryType],
  );

  const isMenuItem = row.isMenuItem;
  const productTypeColor = isMenuItem
    ? theme.palette.primary.main
    : theme.palette.success.main;

  const columns = [
    {
      id: "product",
      width: "35%",
      render: () => (
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
              ID: {formatId(row.productID)}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: "price",
      align: "center" as const,
      width: "15%",
      render: () => (
        <Stack direction="column" alignItems="center" spacing={0.5}>
          {isMenuItem ? (
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
      ),
    },
    {
      id: "type",
      align: "center" as const,
      width: "15%",
      render: () => (
        <Chip
          icon={isMenuItem ? <RestaurantMenuOutlined /> : <KitchenOutlined />}
          label={isMenuItem ? "Menu Item" : "Ingredient"}
          size="small"
          sx={{
            bgcolor: alpha(productTypeColor, 0.1),
            color: productTypeColor,
            fontWeight: 500,
            borderRadius: 2,
          }}
        />
      ),
    },
    {
      id: "status",
      align: "center" as const,
      width: "15%",
      render: () => (
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
      ),
    },
    {
      id: "category",
      width: "20%",
      render: () => (
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
      ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "15%",
      render: () => (
        <ActionButtons
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
          viewTooltip={DIALOG_TITLES.view}
          editTooltip={DIALOG_TITLES.edit}
          deleteTooltip={DIALOG_TITLES.delete}
        />
      ),
    },
  ];

  return (
    <BaseTableRow
      data={row}
      rowKey={row.productID}
      columns={columns}
      isSelectable={isSelectable}
      onSelect={onSelect}
    />
  );
};
