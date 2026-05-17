import React from "react";
import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import { SupplierDto } from "../../../../api/commons/types";
import { ImageReader } from "../../../radix/ImageReader";
import { IDChip } from "../../../radix/IDChip";

const Field: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <Box style={{ minWidth: 140 }}>
    <Text size="1" color="gray" as="div">
      {label}
    </Text>
    <Text size="2" weight="medium" as="div">
      {value && value.trim() ? value : "—"}
    </Text>
  </Box>
);

export const SupplierViewDialogContent: React.FC<{ supplier: SupplierDto }> = ({
  supplier,
}) => {
  return (
    <Box p="3">
      <Card variant="surface" size="3">
        <Flex
          align="center"
          gap="3"
          p="4"
          style={{ borderBottom: "1px solid var(--gray-a4)" }}
        >
          <ImageReader
            src={supplier.logoUrl}
            alt={supplier.companyName}
            size={72}
            radius="3"
            border
            fallbackText={supplier.companyName}
          />
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Heading size="5" weight="bold">
              {supplier.companyName}
            </Heading>
            <Flex align="center" gap="2" mt="1" wrap="wrap">
              <Badge color="amber" variant="soft" radius="full">
                {supplier.paymentTerms ?? "No terms"}
              </Badge>
              {supplier.userUsername && (
                <Badge color="indigo" variant="soft" radius="full">
                  Portal: @{supplier.userUsername}
                </Badge>
              )}
              <Badge
                color={supplier.isActive ? "green" : "gray"}
                variant="soft"
                radius="full"
              >
                {supplier.isActive ? "Active" : "Inactive"}
              </Badge>
            </Flex>
            <IDChip id={supplier.supplierID} label="ID" />
          </Box>
        </Flex>

        <Box p="4">
          <Flex direction="column" gap="4">
            <Box>
              <Text size="1" weight="bold" color="gray" as="div" mb="2">
                CONTACT
              </Text>
              <Flex gap="4" wrap="wrap">
                <Field
                  label="Contact Person"
                  value={supplier.contactPersonName}
                />
                <Field label="Email" value={supplier.email} />
                <Field label="Phone" value={supplier.contactNumber} />
              </Flex>
            </Box>

            <Separator size="4" />

            <Box>
              <Text size="1" weight="bold" color="gray" as="div" mb="2">
                BUSINESS
              </Text>
              <Flex gap="4" wrap="wrap">
                <Field label="Tax ID" value={supplier.taxID} />
                <Field label="Payment Terms" value={supplier.paymentTerms} />
                <Field label="Address" value={supplier.address} />
              </Flex>
            </Box>

            {supplier.notes && (
              <>
                <Separator size="4" />
                <Box>
                  <Text size="1" weight="bold" color="gray" as="div" mb="2">
                    NOTES
                  </Text>
                  <Text size="2" as="div" style={{ whiteSpace: "pre-wrap" }}>
                    {supplier.notes}
                  </Text>
                </Box>
              </>
            )}

            <Separator size="4" />

            <Box>
              <Text size="1" weight="bold" color="gray" as="div" mb="2">
                AUDIT
              </Text>
              <Flex gap="4" wrap="wrap">
                <Field label="Created" value={supplier.createdAt} />
                <Field label="Updated" value={supplier.updatedAt} />
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Card>
    </Box>
  );
};
