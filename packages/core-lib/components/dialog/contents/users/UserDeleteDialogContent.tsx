import React from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import { WarningAmberOutlined } from "@mui/icons-material";
import { useApiCallback } from "../../../../core/hooks";
import { useToastContext } from "../../../../core/contexts";
import { UserDto } from "../../../../api/commons/types";
import { Button } from "../../../radix/buttons/Button";
import { ImageReader } from "../../../radix/ImageReader";

export const UserDeleteDialogContent: React.FC<{
  user: UserDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ user, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const deleteCb = useApiCallback(
    async (api, id: string) => await api.commons.softDeleteUser(id),
  );

  const info = user.userInfo;
  const fullName = [info?.firstName, info?.middleName, info?.lastName]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" ");

  const handleDelete = async () => {
    try {
      const result = await deleteCb.execute(user.userID);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(`${fullName || user.username} has been deactivated`, "success");
        onSuccess();
        onClose();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to deactivate user";
      showToast(message, "error");
    } catch (error) {
      console.error("Error deactivating user:", error);
      const fallback =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to deactivate user";
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
              Deactivate this user?
            </Heading>
            <Text size="2" color="gray">
              They will no longer be able to sign in. The account row is
              preserved for audit purposes.
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
            src={info?.imageUrl}
            alt={fullName || user.username || "User"}
            size={56}
            radius="full"
            border
            fallbackText={fullName}
          />
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Text size="3" weight="bold" as="div" truncate>
              {fullName || user.username || "Unnamed"}
            </Text>
            <Flex align="center" gap="2" mt="1">
              <Badge color="indigo" variant="soft" radius="full" size="1">
                {user.roleName ?? "—"}
              </Badge>
              <Text size="1" color="gray">
                @{user.username ?? "—"}
              </Text>
            </Flex>
            <Text size="1" color="gray" as="div" mt="1">
              {info?.email ?? "—"}
            </Text>
          </Box>
        </Flex>

        <Callout.Root color="blue" variant="surface">
          <Callout.Text>
            Soft delete is reversible only via direct database access. There is
            no UI to restore deactivated users at the moment.
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
