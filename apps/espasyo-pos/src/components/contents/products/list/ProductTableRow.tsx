import React, { useMemo } from "react";
import { Avatar, Badge, Box, Flex, Text } from "@radix-ui/themes";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
} from "@mui/icons-material";
import { ProductDataList } from "core-lib/api/commons/types";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { ActionButtons } from "core-lib/components/radix/buttons/ActionButtons";
import { ImageReader } from "core-lib/components/radix/ImageReader";
import {
  truncateDescription,
  formatId,
  formatCurrency,
} from "core-lib/business/strings";
import { DIALOG_TITLES } from "../constants";

interface Props {
  row: ProductDataList;
  onView: (product: ProductDataList) => void;
  onEdit: (product: ProductDataList) => void;
  onDelete: (product: ProductDataList) => void;
  isSelectable?: boolean;
  isChecked?: boolean;
  selectedRowKey?: string | number;
  onSelect?: (rowKey: string | number) => void;
}

export const ProductTableRow: React.FC<Props> = ({
  row,
  onView,
  onEdit,
  onDelete,
  isSelectable,
  isChecked,
  onSelect,
}) => {
  const isMenuItem = row.isMenuItem;
  const typeAccent: "indigo" | "green" = isMenuItem ? "indigo" : "green";

  const categoryInfo = useMemo(
    () =>
      isMenuItem
        ? {
            icon: <RestaurantMenuOutlined fontSize="small" />,
            label: "Menu Category",
            name: row.productCategoryName,
          }
        : {
            icon: <KitchenOutlined fontSize="small" />,
            label: "Ingredient Category",
            name: row.ingredientCategoryName,
          },
    [isMenuItem, row.productCategoryName, row.ingredientCategoryName],
  );

  const variantCount = row.variantCount ?? 0;
  const addOnGroupCount = row.addOnGroupCount ?? 0;

  const columns = [
    {
      id: "product",
      width: "22%",
      render: () => (
        <Flex align="center" gap="3">
          <ImageReader
            src={row.imageUrl}
            alt={row.name}
            size={44}
            radius="2"
            border
            fallbackText={row.name}
            data-testid={`product-image-${row.productID}`}
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
      width: "12%",
      render: () => (
        <Flex direction="column" align="center" gap="1">
          {isMenuItem ? (
            <>
              {row.unitPrice != null ? (
                <Text size="2" weight="bold" style={{ color: "var(--green-11)" }}>
                  {formatCurrency(row.unitPrice)}
                </Text>
              ) : (
                <Badge color="violet" variant="soft" size="1">Variant pricing</Badge>
              )}
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
      width: "11%",
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
      width: "12%",
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
      width: "16%",
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
              {categoryInfo.name || "Uncategorized"}
            </Text>
            <Text size="1" color="gray" as="div">
              {categoryInfo.label}
            </Text>
          </Box>
        </Flex>
      ),
    },
    {
      id: "variants",
      align: "center" as const,
      width: "9%",
      render: () =>
        isMenuItem ? (
          <Badge
            color={variantCount > 0 ? "blue" : "gray"}
            variant="soft"
            radius="medium"
            size="2"
            style={{ minWidth: 56, justifyContent: "center" }}
          >
            {variantCount}
          </Badge>
        ) : (
          <Text size="1" color="gray">—</Text>
        ),
    },
    {
      id: "addOns",
      align: "center" as const,
      width: "9%",
      render: () =>
        isMenuItem ? (
          <Badge
            color={addOnGroupCount > 0 ? "purple" : "gray"}
            variant="soft"
            radius="medium"
            size="2"
            style={{ minWidth: 56, justifyContent: "center" }}
          >
            {addOnGroupCount}
          </Badge>
        ) : (
          <Text size="1" color="gray">—</Text>
        ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "9%",
      render: () => (
        <div onClick={(e) => e.stopPropagation()}>
          <ActionButtons
            onView={() => onView(row)}
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row)}
            viewTooltip={DIALOG_TITLES.view}
            editTooltip={DIALOG_TITLES.edit}
            deleteTooltip={DIALOG_TITLES.delete}
          />
        </div>
      ),
    },
  ];

  return (
    <BaseTableRow
      data={row}
      rowKey={row.productID}
      columns={columns}
      onRowClick={() => onView(row)}
      isSelectable={isSelectable}
      isChecked={isChecked}
      onSelect={onSelect}
    />
  );
};
