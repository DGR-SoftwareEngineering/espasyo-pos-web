import React, { useState, useCallback, useMemo } from "react";
import { Avatar, Badge, Box, DropdownMenu, Flex, IconButton, Separator, Text, Tooltip } from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExitIcon,
  LockClosedIcon,
  GearIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useResolution } from "../../core/hooks";
import { usePublicSettings, useOfflineMode } from "../../core/contexts";
import { useThemePreference } from "../../core/contexts/theme/ThemePreferenceContext";
import { MpinManagementDialog } from "./security/MpinManagementDialog";
import { RadixMenuContent } from "./menu/RadixMenuContent";

interface SideMenuProps {
  logout: () => Promise<void>;
  loading?: boolean;
  role?: string;
  initials?: string;
  email?: string;
  brand?: string;
  brandMark?: React.ReactNode;
  width?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: (next: boolean) => void;
  onNavigate?: () => void;
}

const DEFAULT_BRAND = "Espasyo";
const DEFAULT_WIDTH = 264;
const SIDEBAR_COLLAPSED_WIDTH = 72;

const UserDropdown: React.FC<{
  initials: string;
  email: string;
  isAdmin: boolean;
  collapsed: boolean;
  logoutBlocked: boolean;
  onMpinOpen: () => void;
  onSettings: () => void;
  onLogout: () => void;
  isDark: boolean;
}> = ({ initials, email, isAdmin, collapsed, logoutBlocked, onMpinOpen, onSettings, onLogout, isDark }) => {
  const displayName = initials || "User";
  const userInitial = (initials || email || "?").charAt(0).toUpperCase();
  const textPrimary = isDark ? "#fafafa" : "#171717";
  const textSecondary = isDark ? "#666" : "#888";

  const menuContent = (
    <>
      <Box px="2" py="2">
        <Text size="2" weight="bold" as="div">{displayName}</Text>
        <Text size="1" color="gray" as="div">{email || "—"}</Text>
      </Box>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onSelect={onMpinOpen}>
        <Flex align="center" gap="2"><LockClosedIcon /> MPIN Security</Flex>
      </DropdownMenu.Item>
      {isAdmin && (
        <DropdownMenu.Item onSelect={onSettings}>
          <Flex align="center" gap="2"><GearIcon /> Settings</Flex>
        </DropdownMenu.Item>
      )}
      <DropdownMenu.Separator />
      <DropdownMenu.Item color="red" disabled={logoutBlocked} onSelect={onLogout}>
        <Flex align="center" gap="2"><ExitIcon /> Logout</Flex>
      </DropdownMenu.Item>
    </>
  );

  if (collapsed) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <button style={{ all: "unset", cursor: "pointer", borderRadius: "50%", display: "flex" }}>
            <Avatar size="2" radius="full" variant="soft" fallback={userInitial} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content side="right" align="end" size="2">
          {menuContent}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Flex
          align="center"
          gap="2"
          px="2"
          py="1.5"
          role="button"
          style={{
            cursor: "pointer",
            width: "100%",
            borderRadius: 6,
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
            transition: "background 150ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";
          }}
        >
          <Avatar size="1" radius="full" variant="soft" fallback={userInitial} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="1" weight="medium" as="div" truncate style={{ lineHeight: 1.3, color: textPrimary }}>
              {displayName}
            </Text>
            <Text size="1" as="div" truncate style={{ color: textSecondary, lineHeight: 1.3, fontSize: 10 }}>
              {email || "—"}
            </Text>
          </Box>
        </Flex>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="top" align="start" size="2">
        {menuContent}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
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
  onNavigate,
}) => {
  const { isMobile } = useResolution();
  const [mpinOpen, setMpinOpen] = useState(false);
  const { systemName, theme } = usePublicSettings();
  const { isOnline, pendingSalesCount } = useOfflineMode();
  const { appearance, toggleAppearance } = useThemePreference();
  const isDark = appearance === "dark";
  const router = useRouter();
  const isAdmin = (role ?? "").trim().toLowerCase() === "admin";

  const brand = brandProp ?? systemName ?? DEFAULT_BRAND;
  const brandMark = brandMarkProp ?? (theme.logoUrl ? (
    <img src={theme.logoUrl} alt={brand} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  ) : undefined);
  const effectiveWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : width;
  const logoutBlocked = !isOnline || pendingSalesCount > 0;

  const bg = isDark ? "#000" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const dividerColor = isDark ? "#222" : "#eaeaea";
  const textSecondary = isDark ? "#666" : "#888";
  const textPrimary = isDark ? "#fafafa" : "#171717";

  const handleMpinOpen = useCallback(() => setMpinOpen(true), []);
  const handleSettings = useCallback(() => router.push("/admin/hub/settings"), [router]);
  const handleLogout = useCallback(() => logout(), [logout]);

  const collapseBtn = useMemo(() => {
    if (!collapsible) return null;
    return (
      <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        <IconButton
          variant="ghost"
          color="gray"
          size="1"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => onToggleCollapsed?.(!collapsed)}
          style={{
            flexShrink: 0,
            opacity: 0.5,
            transition: "opacity 150ms",
            color: textSecondary,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.5"; }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Tooltip>
    );
  }, [collapsible, collapsed, onToggleCollapsed, textSecondary]);

  const themeBtn = useMemo(() => (
    <button
      onClick={toggleAppearance}
      style={{
        all: "unset",
        cursor: "pointer",
        width: collapsed ? 28 : 24,
        height: collapsed ? 28 : 24,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: textSecondary,
        transition: "background 150ms ease, color 150ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLElement).style.color = textPrimary;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.color = textSecondary;
      }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <SunIcon width={collapsed ? 16 : 14} height={collapsed ? 16 : 14} /> : <MoonIcon width={collapsed ? 16 : 14} height={collapsed ? 16 : 14} />}
    </button>
  ), [toggleAppearance, collapsed, textSecondary, textPrimary, isDark]);

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
            background: bg,
            borderBottom: `1px solid ${dividerColor}`,
            position: "sticky",
            top: 0,
            zIndex: 5,
            flexShrink: 0,
            minHeight: 56,
          }}
        >
          <Flex align="center" gap="2" style={{ minWidth: 0 }}>
            <Box
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: isDark ? "#222" : "#fafafa",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, overflow: "hidden",
              }}
            >
              {brandMark ?? <Text size="2" weight="bold" style={{ color: textPrimary }}>{brand.charAt(0)}</Text>}
            </Box>
            <Text size="3" weight="bold" style={{ color: textPrimary }} truncate>{brand}</Text>
          </Flex>
          <UserDropdown
            initials={initials}
            email={email}
            isAdmin={isAdmin}
            collapsed={false}
            logoutBlocked={logoutBlocked}
            onMpinOpen={handleMpinOpen}
            onSettings={handleSettings}
            onLogout={handleLogout}
            isDark={isDark}
          />
        </Flex>
        <MpinManagementDialog open={mpinOpen} onOpenChange={setMpinOpen} />
      </>
    );
  }

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Primary navigation"
        animate={{ width: effectiveWidth }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flexShrink: 0,
          background: bg,
          boxShadow: `0 0 0 1px ${borderColor}`,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflow: "hidden",
        }}
      >
        {/* ── Brand / workspace switcher ── */}
        <Flex
          align="center"
          justify="between"
          gap="2"
          px={collapsed ? "2" : "3"}
          style={{
            minHeight: 56,
            flexShrink: 0,
            borderBottom: `1px solid ${dividerColor}`,
          }}
        >
          {collapsed ? (
            <Box
              style={{
                width: 40, height: 40, borderRadius: 8,
                background: isDark ? "#111" : "#fafafa",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, overflow: "hidden",
              }}
            >
              {brandMark ?? <Text size="4" weight="bold" style={{ color: textPrimary }}>{brand.charAt(0)}</Text>}
            </Box>
          ) : (
            <Flex align="center" gap="3" style={{ flex: 1, minWidth: 0 }}>
              <Box
                style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: isDark ? "#111" : "#fafafa",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, overflow: "hidden",
                }}
              >
                {brandMark ?? <Text size="3" weight="bold" style={{ color: textPrimary }}>{brand.charAt(0)}</Text>}
              </Box>
              <Flex direction="column" style={{ minWidth: 0, lineHeight: 1.2 }}>
                <Text size="2" weight="medium" style={{ color: textPrimary }} truncate>
                  {brand}
                </Text>
                <Text size="1" style={{ color: textSecondary }} truncate>
                  {role ? role.charAt(0).toUpperCase() + role.slice(1) : "POS"}
                </Text>
              </Flex>
            </Flex>
          )}
          {collapseBtn}
        </Flex>

        {/* ── Menu list ── */}
        <motion.div layout style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <RadixMenuContent
            roleName={role}
            loading={loading}
            collapsed={collapsed}
            onNavigate={onNavigate}
            isDark={isDark}
          />
        </motion.div>

        {/* ── Bottom: theme toggle + user dropdown ── */}
        <Flex
          align="center"
          gap="2"
          px={collapsed ? "2" : "2"}
          py="2"
          style={{
            borderTop: `1px solid ${dividerColor}`,
            flexShrink: 0,
          }}
        >
          {themeBtn}
          <Box style={{ flex: collapsed ? 0 : 1, minWidth: collapsed ? undefined : 0 }}>
            <UserDropdown
              initials={initials}
              email={email}
              isAdmin={isAdmin}
              collapsed={collapsed}
              logoutBlocked={logoutBlocked}
              onMpinOpen={handleMpinOpen}
              onSettings={handleSettings}
              onLogout={handleLogout}
              isDark={isDark}
            />
          </Box>
        </Flex>

        <MpinManagementDialog open={mpinOpen} onOpenChange={setMpinOpen} />
      </motion.aside>
    </AnimatePresence>
  );
};
