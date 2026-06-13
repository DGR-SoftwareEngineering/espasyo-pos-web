import React, { useState } from "react";
import { Avatar, Badge, Box, DropdownMenu, Flex, IconButton, Separator, Text, Tooltip } from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExitIcon,
  LockClosedIcon,
  GearIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { useResolution } from "../../core/hooks";
import { usePublicSettings, useOfflineMode } from "../../core/contexts";
import { MpinManagementDialog } from "./security/MpinManagementDialog";
import { RadixMenuContent } from "./menu/RadixMenuContent";
import { RadixOptionsMenu } from "./menu/RadixOptionsMenu";
import { SideMenuMobile } from "./SideMenuMobile";

interface SideMenuProps {
  logout: () => Promise<void>;
  loading?: boolean;
  role?: string;
  initials?: string;
  email?: string;
  /** Override brand wordmark. */
  brand?: string;
  /** Optional brand mark / icon shown next to the wordmark. */
  brandMark?: React.ReactNode;
  /** Fixed sidebar width in px. */
  width?: number;
  /** Whether the sidebar can collapse to icon-only. */
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: (next: boolean) => void;
}

const DEFAULT_BRAND = "Espasyo";
const DEFAULT_SUBTITLE = "Coffee House POS";
const DEFAULT_WIDTH = 264;

const UserFooter: React.FC<{
  initials: string;
  email: string;
  role: string;
  collapsed: boolean;
  loading?: boolean;
  logout: () => Promise<void>;
}> = ({ initials, email, role, collapsed, loading, logout }) => {
  const router = useRouter();
  const { isOnline, pendingSalesCount } = useOfflineMode();
  const [mpinOpen, setMpinOpen] = useState(false);
  const logoutBlocked = !isOnline || pendingSalesCount > 0;
  const isAdmin = role.trim().toLowerCase() === "admin";

  const userInitial = (initials || email || "?").charAt(0).toUpperCase();
  const displayName = initials || "User";

  const menuContent = (
    <>
      <Box px="2" py="2">
        <Text size="2" weight="bold" as="div">
          {displayName}
        </Text>
        <Text size="1" color="gray" as="div">
          {email || "—"}
        </Text>
      </Box>
      <DropdownMenu.Separator />

      <DropdownMenu.Item onSelect={() => setMpinOpen(true)}>
        <Flex align="center" gap="2">
          <LockClosedIcon />
          MPIN Security
        </Flex>
      </DropdownMenu.Item>

      {isAdmin && (
        <DropdownMenu.Item onSelect={() => router.push("/admin/hub/settings")}>
          <Flex align="center" gap="2">
            <GearIcon />
            Settings
          </Flex>
        </DropdownMenu.Item>
      )}

      <DropdownMenu.Separator />

      <DropdownMenu.Item
        color="red"
        disabled={logoutBlocked}
        onSelect={logout}
      >
        <Flex align="center" gap="2">
          <ExitIcon />
          Logout
        </Flex>
      </DropdownMenu.Item>
    </>
  );

  if (collapsed) {
    return (
      <>
        <Flex justify="center" py="3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button
                style={{
                  all: "unset",
                  cursor: "pointer",
                  borderRadius: "50%",
                  display: "flex",
                }}
              >
                <Tooltip content={`${displayName} · ${email}`} side="right">
                  <Avatar
                    size="2"
                    radius="full"
                    variant="soft"
                    fallback={userInitial}
                  />
                </Tooltip>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content side="right" align="end" size="2">
              {menuContent}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
        <MpinManagementDialog open={mpinOpen} onOpenChange={setMpinOpen} />
      </>
    );
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Flex
            align="center"
            gap="3"
            px="3"
            py="3"
            role="button"
            style={{
              cursor: "pointer",
              background: "var(--color-panel-translucent)",
              width: "100%",
              borderRadius: "var(--radius-2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gray-a2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-panel-translucent)";
            }}
          >
            <Avatar size="2" radius="full" variant="soft" fallback={userInitial} />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="2" weight="medium" as="div" truncate>
                {displayName}
              </Text>
              <Text size="1" color="gray" as="div" truncate>
                {email || "—"}
              </Text>
            </Box>
            <ChevronRightIcon style={{ color: "var(--gray-9)", flexShrink: 0 }} />
          </Flex>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content side="right" align="end" size="2">
          {menuContent}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <MpinManagementDialog open={mpinOpen} onOpenChange={setMpinOpen} />
    </>
  );
};

export const SideMenu: React.FC<SideMenuProps> = ({
  logout,
  loading,
  role = "",
  initials = "",
  email = "",
  brand: brandProp,
  brandMark: brandMarkProp,
  width = DEFAULT_WIDTH,
  collapsible = false,
  collapsed = false,
  onToggleCollapsed,
}) => {
  const { isMobile } = useResolution();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { systemName, theme } = usePublicSettings();
  const brand = brandProp ?? systemName ?? DEFAULT_BRAND;
  const brandMark =
    brandMarkProp ??
    (theme.logoUrl ? (
      <img
        src={theme.logoUrl}
        alt={brand}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    ) : undefined);
  const userInitial = (initials || email || "?").charAt(0).toUpperCase();
  const collapsedWidth = 72;
  const effectiveWidth = collapsed ? collapsedWidth : width;

  if (isMobile) {
    return (
      <>
        <Flex
          align="center"
          justify="between"
          gap="3"
          px="3"
          py="2"
          style={{
            width: "100%",
            background: "var(--color-panel-solid)",
            borderBottom: "1px solid var(--gray-a3)",
            position: "sticky",
            top: 0,
            zIndex: 5,
            flexShrink: 0,
            minHeight: 56,
          }}
        >
          <Flex align="center" gap="2" style={{ minWidth: 0 }}>
            <IconButton
              variant="ghost"
              color="gray"
              size="2"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <HamburgerMenuIcon />
            </IconButton>
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--radius-2)",
                background:
                  "linear-gradient(135deg, var(--accent-9), var(--accent-10))",
                color: "var(--accent-contrast)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {brandMark ?? (
                <Text size="2" weight="bold">
                  {brand.charAt(0)}
                </Text>
              )}
            </Box>
            <Text size="3" weight="bold" truncate>
              {brand}
            </Text>
          </Flex>

          <Avatar
            size="2"
            radius="full"
            variant="soft"
            fallback={userInitial}
          />
        </Flex>

        <SideMenuMobile
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          role={role}
          initials={initials}
          email={email}
          logout={logout}
          loading={loading}
          brand={brand}
        />
      </>
    );
  }

  return (
    <Box
      asChild
      style={{
        width: effectiveWidth,
        flexShrink: 0,
        background: "var(--color-panel-solid)",
        borderRight: "1px solid var(--gray-a3)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: "width 180ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <aside aria-label="Primary navigation">
        {/* ── Brand header — redesigned with role badge + chevron toggle ── */}
        <Flex
          align="center"
          justify="between"
          gap="2"
          px={collapsed ? "2" : "3"}
          style={{ minHeight: 64, flexShrink: 0 }}
        >
          <Flex
            align="center"
            gap="3"
            style={{ minWidth: 0, flex: 1 }}
          >
            {/* Brand mark — 36×36, rounded, gradient */}
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-3)",
                background:
                  "linear-gradient(135deg, var(--accent-9), var(--accent-10))",
                color: "var(--accent-contrast)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {brandMark ?? (
                <Text size="3" weight="bold">
                  {brand.charAt(0)}
                </Text>
              )}
            </Box>
            {!collapsed && (
              <Flex direction="column" style={{ minWidth: 0, lineHeight: 1.15 }}>
                <Text size="2" weight="bold" truncate>
                  {brand}
                </Text>
                {role && (
                  <Badge
                    size="1"
                    variant="soft"
                    radius="full"
                    style={{ alignSelf: "flex-start", marginTop: 4 }}
                  >
                    {role.toUpperCase()}
                  </Badge>
                )}
              </Flex>
            )}
          </Flex>
          {collapsible && !collapsed && (
            <Tooltip content="Collapse sidebar">
              <IconButton
                variant="ghost"
                color="gray"
                size="1"
                aria-label="Collapse sidebar"
                onClick={() => onToggleCollapsed?.(true)}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
          )}
          {collapsible && collapsed && (
            <Tooltip content="Expand sidebar" side="right">
              <IconButton
                variant="ghost"
                color="gray"
                size="1"
                aria-label="Expand sidebar"
                onClick={() => onToggleCollapsed?.(false)}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          )}
        </Flex>

        <Separator size="4" />

        {/* ── Menu list ── */}
        <Box style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <RadixMenuContent
            roleName={role}
            loading={loading}
            collapsed={collapsed}
          />
        </Box>

        <Separator size="4" />

        {/* ── User footer ── */}
        <UserFooter
          initials={initials}
          email={email}
          role={role}
          collapsed={collapsed}
          loading={loading}
          logout={logout}
        />
      </aside>
    </Box>
  );
};
