import React from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useApiCallback } from "../../../../core/hooks";
import { useToastContext } from "../../../../core/contexts";
import { UserDto } from "../../../../api/commons/types";
import { Button } from "../../../radix/buttons/Button";
import { ImageReader } from "../../../radix/ImageReader";

export const UserRevokeTokensDialogContent: React.FC<{
  user: UserDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ user, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const revokeCb = useApiCallback(
    async (api, id: string) => await api.commons.revokeAllUserTokens(id),
  );

  const info = user.userInfo;
  const fullName = [info?.firstName, info?.middleName, info?.lastName]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" ");

  const handleRevoke = async () => {
    try {
      const result = await revokeCb.execute(user.userID);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(`All tokens revoked for ${fullName || user.username}`, "success");
        onSuccess();
        onClose();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to revoke tokens";
      showToast(message, "error");
    } catch (error) {
      console.error("Error revoking tokens:", error);
      const fallback =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to revoke tokens";
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
            background: "var(--violet-a2)",
            border: "1px solid var(--violet-a5)",
          }}
        >
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--violet-a4)",
              color: "var(--violet-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ExclamationTriangleIcon style={{ width: 32, height: 32 }} />
          </Box>
          <Box>
            <Heading size="4" weight="bold" style={{ color: "var(--violet-11)" }}>
              Revoke all tokens?
            </Heading>
            <Text size="2" color="gray">
              This will immediately sign out the user from all devices.
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

        <Callout.Root color="violet" variant="surface">
          <Callout.Text>
            <Text as="div" weight="bold" mb="1">
              Security measure for long-lived tokens:
            </Text>
            <Text as="div" size="2">
              Tokens for this user (especially cashier accounts with 100-year JWTs) will be permanently revoked.
              The user must log in again to regain access.
            </Text>
          </Callout.Text>
        </Callout.Root>

        <Flex justify="end" gap="3">
          <Button
            type="Secondary"
            onClick={onClose}
            disabled={revokeCb.loading}
          >
            Cancel
          </Button>
          <Button
            type="Critical"
            onClick={handleRevoke}
            loading={revokeCb.loading}
            disabled={revokeCb.loading}
          >
            Revoke All Tokens
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
