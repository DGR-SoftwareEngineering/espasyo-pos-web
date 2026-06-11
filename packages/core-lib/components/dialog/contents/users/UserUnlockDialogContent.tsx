import React from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import { LockOpen1Icon } from "@radix-ui/react-icons";
import { useApiCallback } from "../../../../core/hooks";
import { useToastContext } from "../../../../core/contexts";
import { UserDto } from "../../../../api/commons/types";
import { Button } from "../../../radix/buttons/Button";
import { ImageReader } from "../../../radix/ImageReader";

export const UserUnlockDialogContent: React.FC<{
  user: UserDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ user, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const unlockCb = useApiCallback(
    async (api, id: string) => await api.commons.unlockUser(id),
  );

  const info = user.userInfo;
  const fullName = [info?.firstName, info?.middleName, info?.lastName]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" ");

  const handleUnlock = async () => {
    try {
      const result = await unlockCb.execute(user.userID);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(`${fullName || user.username} has been unlocked`, "success");
        onSuccess();
        onClose();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to unlock account";
      showToast(message, "error");
    } catch (error) {
      console.error("Error unlocking account:", error);
      const fallback =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to unlock account";
      showToast(fallback, "error");
    }
  };

  const lockedAtText = user.lockedAt
    ? new Date(user.lockedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <Box p="3">
      <Flex direction="column" gap="4">
        <Flex
          align="center"
          gap="3"
          p="3"
          style={{
            borderRadius: "var(--radius-3)",
            background: "var(--green-a2)",
            border: "1px solid var(--green-a5)",
          }}
        >
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--green-a4)",
              color: "var(--green-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LockOpen1Icon style={{ width: 32, height: 32 }} />
          </Box>
          <Box>
            <Heading size="4" weight="bold" style={{ color: "var(--green-11)" }}>
              Unlock this account?
            </Heading>
            <Text size="2" color="gray">
              The user will be able to log in immediately.
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
            <Text size="1" color="gray" as="div" mt="2">
              Locked since: {lockedAtText}
            </Text>
          </Box>
        </Flex>

        <Callout.Root color="green" variant="surface">
          <Callout.Text>
            Unlocking will restore login access for this user.
          </Callout.Text>
        </Callout.Root>

        <Flex justify="end" gap="3">
          <Button
            type="Secondary"
            onClick={onClose}
            disabled={unlockCb.loading}
          >
            Cancel
          </Button>
          <Button
            type="Primary"
            onClick={handleUnlock}
            loading={unlockCb.loading}
            disabled={unlockCb.loading}
          >
            Unlock Account
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
