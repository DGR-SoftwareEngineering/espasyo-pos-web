import React from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Tabs,
} from "@radix-ui/themes";;
import {
  AdminPanelSettingsOutlined,
  MenuOpenOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import { useAccessContext } from "core-lib/core/contexts";
import { useMenuItems } from "./access/hooks";
import { RolesSubTab } from "./access/RolesSubTab";
import { MenuItemsSubTab } from "./access/MenuItemsSubTab";

export const AccessControlTab: React.FC = () => {
  const access = useAccessContext();
  const menu = useMenuItems();

  return (
    <Flex direction="column" gap="4">
      <Card variant="surface" size="2">
        <Flex
          align={{ initial: "stretch", md: "center" }}
          justify="between"
          gap="3"
          direction={{ initial: "column", md: "row" }}
        >
          <Box>
            <Flex align="center" gap="2">
              <AdminPanelSettingsOutlined
                style={{ color: "var(--iris-11)" }}
              />
              <Heading size="4">Access Control</Heading>
            </Flex>
            <Text size="2" color="gray">
              Manage roles, sidebar menu entries, and per-role CRUD
              permissions. Changes propagate to every signed-in user on their
              next page load (or right away for the current user).
            </Text>
          </Box>
          <Flex align="center" gap="2" wrap="wrap">
            <Badge
              color={access.ready ? "green" : "amber"}
              variant="soft"
              radius="full"
            >
              {access.ready
                ? `Live · ${access.role?.name ?? "user"}`
                : "Loading access…"}
            </Badge>
          </Flex>
        </Flex>
      </Card>

      <Tabs.Root defaultValue="roles">
        <Tabs.List>
          <Tabs.Trigger value="roles">
            <Flex align="center" gap="2">
              <ShieldOutlined fontSize="small" />
              Roles & Permissions
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="menu">
            <Flex align="center" gap="2">
              <MenuOpenOutlined fontSize="small" />
              Menu Items
            </Flex>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="roles">
          <Box mt="4">
            <RolesSubTab
              menuItems={menu.items}
              menuLoading={menu.loading}
            />
          </Box>
        </Tabs.Content>

        <Tabs.Content value="menu">
          <Box mt="4">
            <MenuItemsSubTab
              menuItems={menu.items}
              menuLoading={menu.loading}
              refreshMenu={menu.refresh}
            />
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  );
};
