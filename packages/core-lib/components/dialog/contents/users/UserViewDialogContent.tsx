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
import { UserDto } from "../../../../api/commons/types";
import { ImageReader } from "../../../radix/ImageReader";
import { IDChip } from "../../../radix/IDChip";

const ROLE_COLOR: Record<
  string,
  "indigo" | "amber" | "green" | "blue" | "gray" | "purple"
> = {
  Admin: "purple",
  Manager: "indigo",
  Cashier: "blue",
  Staff: "green",
};

const Field: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <Box>
    <Text size="1" color="gray" as="div">
      {label}
    </Text>
    <Text size="2" weight="medium" as="div">
      {value && value.trim() ? value : "—"}
    </Text>
  </Box>
);

export const UserViewDialogContent: React.FC<{ user: UserDto }> = ({
  user,
}) => {
  const info = user.userInfo;
  const fullName = [info?.firstName, info?.middleName, info?.lastName]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" ");
  const roleAccent = ROLE_COLOR[user.roleName ?? ""] ?? "gray";

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
            src={info?.imageUrl}
            alt={fullName || user.username || "User"}
            size={72}
            radius="full"
            border
            fallbackText={fullName}
          />
          <Box style={{ minWidth: 0 }}>
            <Heading size="5" weight="bold">
              {fullName || user.username || "Unnamed"}
            </Heading>
            <Flex align="center" gap="2" mt="1">
              <Badge color={roleAccent} variant="soft" radius="full">
                {user.roleName ?? "—"}
              </Badge>
              <Text size="2" color="gray">
                @{user.username ?? "—"}
              </Text>
            </Flex>
            <IDChip id={user.userID} label="ID" />
          </Box>
        </Flex>

        <Box p="4">
          <Flex direction="column" gap="4">
            <Box>
              <Text size="1" weight="bold" color="gray" as="div" mb="2">
                CONTACT
              </Text>
              <Flex gap="4" wrap="wrap">
                <Field label="Email" value={info?.email} />
                <Field label="Contact Number" value={info?.contactNumber} />
                <Field label="License Number" value={info?.licenseNumber} />
              </Flex>
            </Box>

            <Separator size="4" />

            <Box>
              <Text size="1" weight="bold" color="gray" as="div" mb="2">
                AUDIT
              </Text>
              <Flex gap="4" wrap="wrap">
                <Field label="Last Login" value={user.lastLogin} />
                <Field label="Created" value={user.createdAt} />
                <Field label="Updated" value={user.updatedAt} />
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Card>
    </Box>
  );
};
