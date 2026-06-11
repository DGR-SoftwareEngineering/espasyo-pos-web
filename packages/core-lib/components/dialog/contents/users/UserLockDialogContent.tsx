import React from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { useApiCallback } from "../../../../core/hooks";
import { useToastContext } from "../../../../core/contexts";
import { UserDto } from "../../../../api/commons/types";
import { Button } from "../../../radix/buttons/Button";
import { ImageReader } from "../../../radix/ImageReader";

export const UserLockDialogContent: React.FC<{
  user: UserDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ user, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const lockCb = useApiCallback(
    async (api, id: string) => await api.commons.lockUser(id),
  );

  const info = user.userInfo;
  const fullName = [info?.firstName, info?.middleName, info?.lastName]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" ");

  const handleLock = async () => {
    try {
      const result = await lockCb.execute(user.userID);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(`${fullName || user.username} has been locked`, "success");
        onSuccess();
        onClose();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to lock account";
      showToast(message, "error");
    } catch (error) {
      console.error("Error locking account:", error);
      const fallback =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to lock account";
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
            background: "var(--amber-a2)",
            border: "1px solid var(--amber-a5)",
          }}
        >
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--amber-a4)",
              color: "var(--amber-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LockClosedIcon style={{ width: 32, height: 32 }} />
          </Box>
          <Box>
            <Heading size="4" weight="bold" style={{ color: "var(--amber-11)" }}>
              Lock this account?
            </Heading>
            <Text size="2" color="gray">
              This will immediately terminate all active sessions for this user.
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

        <Callout.Root color="amber" variant="surface">
          <Callout.Text>
            The user will be unable to log in until the account is unlocked by an administrator.
          </Callout.Text>
        </Callout.Root>

        <Flex justify="end" gap="3">
          <Button
            type="Secondary"
            onClick={onClose}
            disabled={lockCb.loading}
          >
            Cancel
          </Button>
          <Button
            type="Critical"
            onClick={handleLock}
            loading={lockCb.loading}
            disabled={lockCb.loading}
          >
            Lock Account
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
