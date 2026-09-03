import React from "react";
import {
  Badge,
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Tooltip,
} from "@radix-ui/themes";;
import { SupplierDto } from "core-lib/api/commons/types";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { ActionButtons } from "core-lib/components/radix/buttons/ActionButtons";
import { ImageReader } from "core-lib/components/radix/ImageReader";
import { IDChip } from "core-lib/components/radix/IDChip";
import { formatDateTime } from "core-lib/business/dates";
import { DIALOG_TITLES, PAYMENT_TERMS_BADGE_COLOR } from "../constants";

interface Props {
  row: SupplierDto;
  onView: (supplier: SupplierDto) => void;
  onEdit: (supplier: SupplierDto) => void;
  onDelete: (supplier: SupplierDto) => void;
}

export const SupplierTableRow: React.FC<Props> = ({
  row,
  onView,
  onEdit,
  onDelete,
}) => {
  const termsColor = PAYMENT_TERMS_BADGE_COLOR[row.paymentTerms ?? ""] ?? "gray";

  const columns = [
    {
      id: "supplier",
      width: "32%",
      render: () => (
        <Flex align="center" gap="3">
          <ImageReader
            src={row.logoUrl}
            alt={row.companyName}
            size={44}
            radius="3"
            border
            fallbackText={row.companyName}
          />
          <Box style={{ minWidth: 0 }}>
            <Text size="2" weight="bold" as="div" truncate>
              {row.companyName}
            </Text>
            <Text size="1" color="gray" as="div">
              {row.contactPersonName ?? "No contact person"}
            </Text>
            <IDChip id={row.supplierID} label="ID" />
          </Box>
        </Flex>
      ),
    },
    {
      id: "contact",
      width: "22%",
      render: () => (
        <Flex direction="column" gap="0">
          <Text size="2" as="div" truncate>
            {row.email ?? "—"}
          </Text>
          <Text size="1" color="gray" as="div">
            {row.contactNumber ?? "—"}
          </Text>
        </Flex>
      ),
    },
    {
      id: "terms",
      align: "center" as const,
      width: "13%",
      render: () => (
        <Badge color={termsColor} variant="soft" radius="full" size="2">
          {row.paymentTerms ?? "—"}
        </Badge>
      ),
    },
    {
      id: "portal",
      align: "center" as const,
      width: "13%",
      render: () =>
        row.userUsername ? (
          <Tooltip content="Linked to portal user">
            <Badge color="indigo" variant="soft" radius="full" size="2">
              @{row.userUsername}
            </Badge>
          </Tooltip>
        ) : (
          <Text size="1" color="gray">
            —
          </Text>
        ),
    },
    {
      id: "created",
      align: "center" as const,
      width: "10%",
      render: () => (
        <Tooltip content={row.createdAt ?? "No date"}>
          <Text size="2" color="gray" as="div">
            {row.createdAt ? formatDateTime(row.createdAt) : "—"}
          </Text>
        </Tooltip>
      ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "10%",
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
    <BaseTableRow data={row} rowKey={row.supplierID} columns={columns} />
  );
};
