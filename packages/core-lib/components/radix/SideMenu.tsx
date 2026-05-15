import React, { useState } from "react";
import { Avatar, Badge, Box, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DotFilledIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import { useResolution } from "../../core/hooks";
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

export const SideMenu: React.FC<SideMenuProps> = ({
  logout,
  loading,
  role = "",
  initials = "",
  email = "",
  brand = DEFAULT_BRAND,
  brandMark,
  width = DEFAULT_WIDTH,
  collapsible = false,
  collapsed = false,
  onToggleCollapsed,
}) => {
  const { isMobile } = useResolution();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = initials || "User";
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

          <Flex align="center" gap="2">
            {role && (
              <Tooltip content={`Role: ${role.toUpperCase()}`}>
                <Badge color="indigo" variant="soft" size="1" radius="full">
                  <DotFilledIcon />
                  {role.charAt(0).toUpperCase()}
                </Badge>
              </Tooltip>
            )}
            <Avatar
              size="2"
              radius="full"
              color="indigo"
              variant="solid"
              fallback={userInitial}
            />
          </Flex>
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
        {/* ── Brand header ── */}
        <Flex
          align="center"
          justify="between"
          gap="3"
          px={collapsed ? "2" : "4"}
          py="3"
          style={{ flexShrink: 0, minHeight: 64 }}
        >
          <Flex align="center" gap="2" style={{ overflow: "hidden" }}>
            {/* Brand mark — fallback is a coffee-bean dot when not provided */}
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-3)",
                background:
                  "linear-gradient(135deg, var(--accent-9), var(--accent-10))",
                color: "var(--accent-contrast)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 1px 2px var(--gray-a4)",
              }}
            >
              {brandMark ?? (
                <Text size="3" weight="bold">
                  {brand.charAt(0)}
                </Text>
              )}
            </Box>
            {!collapsed && (
              <Flex direction="column" style={{ minWidth: 0, lineHeight: 1.1 }}>
                <Text size="3" weight="bold" truncate>
                  {brand}
                </Text>
                <Text size="1" color="gray" truncate>
                  {DEFAULT_SUBTITLE}
                </Text>
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
        </Flex>

        {/* ── Role indicator ── */}
        {!collapsed && role && (
          <Box px="4" pb="3">
            <Flex
              align="center"
              gap="2"
              px="2"
              py="2"
              style={{
                borderRadius: "var(--radius-3)",
                background: "var(--accent-a2)",
                border: "1px solid var(--accent-a4)",
              }}
            >
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--accent-9)",
                  boxShadow: "0 0 0 3px var(--accent-a4)",
                  flexShrink: 0,
                }}
              />
              <Flex direction="column" style={{ minWidth: 0 }}>
                <Text size="1" color="gray" style={{ lineHeight: 1.2 }}>
                  Signed in as
                </Text>
                <Text
                  size="2"
                  weight="bold"
                  style={{ color: "var(--accent-11)", lineHeight: 1.2 }}
                >
                  {role.toUpperCase()}
                </Text>
              </Flex>
            </Flex>
          </Box>
        )}

        {collapsed && role && (
          <Flex justify="center" pb="3">
            <Tooltip content={`Role: ${role.toUpperCase()}`} side="right">
              <Badge color="indigo" variant="soft" size="1" radius="full">
                <DotFilledIcon />
                {role.charAt(0).toUpperCase()}
              </Badge>
            </Tooltip>
          </Flex>
        )}

        {/* ── Menu list ── */}
        <Box style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {!collapsed && (
            <RadixMenuContent roleName={role} loading={loading} />
          )}
        </Box>

        {/* ── User footer ── */}
        <Box
          style={{
            borderTop: "1px solid var(--gray-a3)",
            padding: collapsed ? "12px 8px" : "12px 16px",
            flexShrink: 0,
            background: "var(--color-panel-translucent)",
          }}
        >
          {collapsed ? (
            <Flex direction="column" align="center" gap="2">
              <Tooltip content={`${displayName} · ${email}`} side="right">
                <Avatar
                  size="2"
                  fallback={userInitial}
                  radius="full"
                  color="indigo"
                  variant="solid"
                />
              </Tooltip>
              <RadixOptionsMenu logout={logout} loading={loading} />
              {collapsible && (
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
          ) : (
            <Flex align="center" gap="3">
              <Avatar
                size="3"
                fallback={userInitial}
                radius="full"
                color="indigo"
                variant="solid"
              />
              <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
                <Text
                  size="2"
                  weight="bold"
                  as="div"
                  truncate
                  style={{ lineHeight: 1.3 }}
                >
                  {displayName}
                </Text>
                <Text size="1" color="gray" as="div" truncate>
                  {email || "—"}
                </Text>
              </Flex>
              <RadixOptionsMenu logout={logout} loading={loading} />
            </Flex>
          )}
        </Box>
      </aside>
    </Box>
  );
};
