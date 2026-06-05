import React from "react";
import { Badge, Box, Callout, Flex, Heading, Text } from "@radix-ui/themes";
import { WarningAmberOutlined } from "@mui/icons-material";
import { useApiCallback } from "../../../../core/hooks";
import { useToastContext } from "../../../../core/contexts";
import { SupplierDto } from "../../../../api/commons/types";
import { Button } from "../../../radix/buttons/Button";
import { ImageReader } from "../../../radix/ImageReader";

export const SupplierDeleteDialogContent: React.FC<{
  supplier: SupplierDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ supplier, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const deleteCb = useApiCallback(
    async (api, id: string) => await api.commons.softDeleteSupplier(id),
  );

  const handleDelete = async () => {
    try {
      const result = await deleteCb.execute(supplier.supplierID);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(`${supplier.companyName} has been deactivated`, "success");
        onSuccess();
        onClose();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to deactivate supplier";
      showToast(message, "error");
    } catch (error) {
      console.error("Error deactivating supplier:", error);
      const fallback =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to deactivate supplier";
      showToast(fallback, "error");
    }
  };

  return (
    <Box p="3">
      <Flex direction="column" gap="4">
        <Flex
          align="center"
          gap="3"
          p="3"
          style={{
            borderRadius: "var(--radius-3)",
            background: "var(--red-a2)",
            border: "1px solid var(--red-a5)",
          }}
        >
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--red-a4)",
              color: "var(--red-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <WarningAmberOutlined style={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Heading size="4" weight="bold" style={{ color: "var(--red-11)" }}>
              Deactivate this supplier?
            </Heading>
            <Text size="2" color="gray">
              The supplier will be hidden from the list. Historical purchase
              orders referencing this supplier remain intact.
            </Text>
          </Box>
        </Flex>

        <Flex
          align="center"
          gap="3"
          p="3"
          style={{
            borderRadius: "var(--radius-3)",
            border: "1px solid var(--gray-a5)",
            background: "var(--gray-a2)",
          }}
        >
          <ImageReader
            src={supplier.logoUrl}
            alt={supplier.companyName}
            size={56}
            radius="3"
            border
            fallbackText={supplier.companyName}
          />
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Text size="3" weight="bold" as="div" truncate>
              {supplier.companyName}
            </Text>
            <Flex align="center" gap="2" mt="1" wrap="wrap">
              <Badge color="amber" variant="soft" radius="full" size="1">
                {supplier.paymentTerms ?? "No terms"}
              </Badge>
              {supplier.contactPersonName && (
                <Text size="1" color="gray">
                  {supplier.contactPersonName}
                </Text>
              )}
            </Flex>
            <Text size="1" color="gray" as="div" mt="1">
              {supplier.email ?? supplier.contactNumber ?? "—"}
            </Text>
          </Box>
        </Flex>

        <Callout.Root color="blue" variant="surface">
          <Callout.Text>
            Soft delete only — there is no UI to restore deactivated suppliers.
            Future Purchase Orders cannot be assigned to this vendor.
          </Callout.Text>
        </Callout.Root>

        <Flex justify="end" gap="3">
          <Button
            type="Secondary"
            onClick={onClose}
            disabled={deleteCb.loading}
          >
            Cancel
          </Button>
          <Button
            type="Critical"
            onClick={handleDelete}
            loading={deleteCb.loading}
            disabled={deleteCb.loading}
          >
            Deactivate
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
