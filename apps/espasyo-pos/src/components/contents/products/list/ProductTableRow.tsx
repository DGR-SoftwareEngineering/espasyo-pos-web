import React, { useMemo } from "react";
import { Avatar, Badge, Box, Flex, Text } from "@radix-ui/themes";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
  LocationOnOutlined,
  BrandingWatermarkOutlined,
  StraightenOutlined,
  CategoryOutlined,
} from "@mui/icons-material";
import { ProductDataList } from "core-lib/api/commons/types";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { ActionButtons } from "core-lib/components/radix/buttons/ActionButtons";
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
  const categoryInfo = useMemo(
    () => getIconInfo(row.categoryType),
    [row.categoryType],
  );

  const isMenuItem = row.isMenuItem;
  const typeAccent: "indigo" | "green" = isMenuItem ? "indigo" : "green";

  const columns = [
    {
      id: "product",
      width: "35%",
      render: () => (
        <Flex align="center" gap="3">
          <Avatar
            size="2"
            radius="full"
            color={typeAccent}
            variant="soft"
            fallback={row.name.charAt(0).toUpperCase()}
          />
          <Box style={{ minWidth: 0 }}>
            <Text size="2" weight="bold" as="div" truncate>
              {row.name}
            </Text>
            <Text size="1" color="gray" as="div">
              {truncateDescription(row.description)}
            </Text>
            <Text size="1" color="gray" as="div">
              ID: {formatId(row.productID)}
            </Text>
          </Box>
        </Flex>
      ),
    },
    {
      id: "price",
      align: "center" as const,
      width: "15%",
      render: () => (
        <Flex direction="column" align="center" gap="1">
          {isMenuItem ? (
            <>
              <Text size="2" weight="bold" style={{ color: "var(--green-11)" }}>
                {formatCurrency(row.unitPrice)}
              </Text>
              {row.costPrice && row.costPrice > 0 && (
                <Text size="1" color="gray">
                  Cost: {formatCurrency(row.costPrice)}
                </Text>
              )}
            </>
          ) : (
            <>
              <Text size="2" weight="bold" style={{ color: "var(--blue-11)" }}>
                {formatCurrency(row.costPrice)}
              </Text>
              <Text size="1" color="gray">
                Cost Price
              </Text>
            </>
          )}
        </Flex>
      ),
    },
    {
      id: "type",
      align: "center" as const,
      width: "15%",
      render: () => (
        <Badge color={typeAccent} variant="soft" radius="medium" size="2">
          {isMenuItem ? (
            <RestaurantMenuOutlined fontSize="small" />
          ) : (
            <KitchenOutlined fontSize="small" />
          )}
          {isMenuItem ? "Menu Item" : "Ingredient"}
        </Badge>
      ),
    },
    {
      id: "status",
      align: "center" as const,
      width: "15%",
      render: () => (
        <Badge
          color={row.isActive ? "green" : "gray"}
          variant="soft"
          radius="medium"
          size="2"
          style={{ minWidth: 80, justifyContent: "center" }}
        >
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "category",
      width: "20%",
      render: () => (
        <Flex align="center" gap="2">
          <Avatar
            size="1"
            radius="full"
            color="indigo"
            variant="soft"
            fallback={categoryInfo.icon}
          />
          <Box>
            <Text size="2" as="div">
              {row.categoryName || "Uncategorized"}
            </Text>
            <Text size="1" color="gray" as="div">
              {categoryInfo.label}
            </Text>
          </Box>
        </Flex>
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
