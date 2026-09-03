import React from "react";
import {
  Avatar,
  Box,
  Dialog,
  Flex,
  IconButton,
  Separator,
  Text,
} from "@radix-ui/themes";
import { Cross1Icon, ExitIcon } from "@radix-ui/react-icons";
import { usePublicSettings } from "../../core/contexts";
import { useThemePreference } from "../../core/contexts/theme/ThemePreferenceContext";
import { RadixMenuContent } from "./menu/RadixMenuContent";
import { Button } from "./buttons/Button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: string;
  initials?: string;
  email?: string;
  logout?: () => Promise<void> | void;
  loading?: boolean;
  brand?: string;
  onNavigate?: () => void;
}

const DRAWER_WIDTH = "min(320px, 82dvw)";
const DEFAULT_BRAND = "Espasyo";

export const SideMenuMobile: React.FC<Props> = ({
  open,
  onOpenChange,
  role = "",
  initials = "",
  email = "",
  logout,
  loading,
  brand = DEFAULT_BRAND,
  onNavigate,
}) => {
  const handleNavigate = React.useCallback(() => {
    onOpenChange(false);
    onNavigate?.();
  }, [onOpenChange, onNavigate]);
  const { theme } = usePublicSettings();
  const { appearance } = useThemePreference();
  const isDark = appearance === "dark";
  const displayName = initials || "User";
  const userInitial = (initials || email || "?").charAt(0).toUpperCase();

  const bg = isDark ? "#000" : "#fff";
  const dividerColor = isDark ? "#222" : "#eaeaea";
  const textPrimary = isDark ? "#fafafa" : "#171717";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        aria-describedby={undefined}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          right: "auto",
          transform: "none",
          maxWidth: DRAWER_WIDTH,
          width: DRAWER_WIDTH,
          maxHeight: "100vh",
          height: "100vh",
          padding: 0,
          borderRadius: 0,
          background: bg,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Dialog.Title>
          <Flex
            align="center"
            justify="between"
            gap="3"
            px="4"
            py="3"
            style={{
              borderBottom: `1px solid ${dividerColor}`,
              flexShrink: 0,
            }}
          >
            <Flex align="center" gap="2" style={{ minWidth: 0 }}>
              <Box
                style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: isDark ? "#111" : "#fafafa",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, overflow: "hidden",
                }}
              >
                {theme.logoUrl ? (
                  <img src={theme.logoUrl} alt={brand} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Text size="2" weight="bold" style={{ color: textPrimary }}>{brand.charAt(0)}</Text>
                )}
              </Box>
              <Text size="3" weight="bold" style={{ color: textPrimary }} truncate>{brand}</Text>
            </Flex>
            <IconButton
              variant="ghost"
              color="gray"
              size="3"
              aria-label="Close menu"
              onClick={() => onOpenChange(false)}
            >
              <Cross1Icon />
            </IconButton>
          </Flex>
        </Dialog.Title>

        <Box style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          <RadixMenuContent roleName={role} loading={loading} onNavigate={handleNavigate} isDark={isDark} />
        </Box>

        <Separator size="4" />

        <Box
          px="3"
          py="3"
          style={{
            borderTop: `1px solid ${dividerColor}`,
            flexShrink: 0,
          }}
        >
          <Flex align="center" gap="3" mb="3">
            <Avatar size="2" radius="full" variant="soft" fallback={userInitial} />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="2" weight="bold" as="div" style={{ color: textPrimary }} truncate>
                {displayName}
              </Text>
              <Text size="1" color="gray" as="div" truncate>
                {email || "—"}
              </Text>
            </Box>
          </Flex>
          <Button
            type="Secondary"
            fullWidth
            disabled={loading}
            onClick={async () => {
              await logout?.();
              onOpenChange(false);
            }}
          >
            <Flex align="center" justify="center" gap="2">
              <ExitIcon />
              Logout
            </Flex>
          </Button>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
};
