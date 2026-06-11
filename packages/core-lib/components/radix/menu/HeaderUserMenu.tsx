import React, { useState } from "react";
import { useRouter as useNextRouter } from "next/router";
import {
  Avatar,
  Badge,
  Box,
  DropdownMenu,
  Flex,
  Text,
} from "@radix-ui/themes";
import {
  ExitIcon,
  GearIcon,
  LockClosedIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { useRouter as useCoreRouter } from "../../../core/router";
import { MpinManagementDialog } from "../security/MpinManagementDialog";
import { useOfflineMode } from "../../../core/contexts/OfflineModeContext";

interface Props {
  logout: () => Promise<void>;
  loading?: boolean;
  role?: string;
  initials?: string;
  email?: string;
}

/**
 * Combined avatar trigger + dropdown menu. The avatar itself is the click
 * target — there's no separate "open menu" button. Header surface for
 * authenticated profile actions.
 */
export const HeaderUserMenu: React.FC<Props> = ({
  logout,
  loading,
  role = "",
  initials = "",
  email = "",
}) => {
  const coreRouter = useCoreRouter();
  const nextRouter = useNextRouter();
  const isAdmin = (role ?? "").toLowerCase() === "admin";
  const [mpinOpen, setMpinOpen] = useState(false);
  const { isOnline, pendingSalesCount } = useOfflineMode();
  const logoutBlocked = !isOnline || pendingSalesCount > 0;

  const displayName = initials || "User";
  const userInitial = (initials || email || "?").charAt(0).toUpperCase();
  const roleLabel = role ? role.toUpperCase() : "";

  const handleLogout = async () => {
    await logout?.();
    if (!loading) coreRouter.push("/");
  };

  const handleSettings = () => {
    if (isAdmin) nextRouter.push("/admin/hub/settings");
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <button
            type="button"
            aria-label="Open profile menu"
            style={{
              all: "unset",
              cursor: "pointer",
              borderRadius: "999px",
              outline: "none",
              transition: "transform 120ms ease, box-shadow 120ms ease",
              display: "inline-flex",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 0 3px var(--accent-a4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "";
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 0 3px var(--accent-a6)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <Avatar
              size="2"
              radius="full"
              color="indigo"
              variant="solid"
              fallback={userInitial}
            />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          size="2"
          align="end"
          sideOffset={8}
          style={{ minWidth: 240 }}
        >
          {/* Identity block — non-interactive header */}
          <Box px="3" py="2">
            <Flex align="center" gap="3">
              <Avatar
                size="3"
                radius="full"
                color="indigo"
                variant="solid"
                fallback={userInitial}
              />
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Flex align="center" gap="2">
                  <Text size="2" weight="bold" truncate>
                    {displayName}
                  </Text>
                  {roleLabel && (
                    <Badge color="indigo" variant="soft" radius="full" size="1">
                      {roleLabel}
                    </Badge>
                  )}
                </Flex>
                {email && (
                  <Text size="1" color="gray" as="div" truncate>
                    {email}
                  </Text>
                )}
              </Box>
            </Flex>
          </Box>

          <DropdownMenu.Separator />

          {/* TODO: Coming soon - Profile Management */}
          {/* <DropdownMenu.Item>
            <PersonIcon />
            Profile
          </DropdownMenu.Item> */}
          <DropdownMenu.Item onSelect={() => setMpinOpen(true)}>
            <LockClosedIcon />
            MPIN Security
          </DropdownMenu.Item>
          <DropdownMenu.Item disabled={!isAdmin} onSelect={handleSettings}>
            <GearIcon />
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Separator />

          <DropdownMenu.Item
            color="red"
            disabled={logoutBlocked}
            title={
              logoutBlocked
                ? "Sync offline sales before logging out"
                : undefined
            }
            onSelect={!logoutBlocked ? handleLogout : undefined}
          >
            <ExitIcon />
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <MpinManagementDialog open={mpinOpen} onOpenChange={setMpinOpen} />
    </>
  );
};
