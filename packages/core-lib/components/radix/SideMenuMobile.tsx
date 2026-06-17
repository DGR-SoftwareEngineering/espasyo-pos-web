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
  const displayName = initials || "User";
  const userInitial = (initials || email || "?").charAt(0).toUpperCase();

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
          background: "linear-gradient(180deg, var(--color-panel-solid), var(--gray-2))",
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
              borderBottom: "1px solid",
              borderImage: "linear-gradient(90deg, var(--accent-a6), var(--accent-a4), var(--gray-a5)) 1",
              flexShrink: 0,
            }}
          >
            <Flex align="center" gap="2" style={{ minWidth: 0 }}>
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-4)",
                  background:
                    "linear-gradient(135deg, var(--accent-9), var(--accent-11))",
                  color: "var(--accent-contrast)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                  boxShadow: "0 2px 12px var(--accent-a6)",
                }}
              >
                {theme.logoUrl ? (
                  <img
                    src={theme.logoUrl}
                    alt={brand}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Text size="2" weight="bold">
                    {brand.charAt(0)}
                  </Text>
                )}
              </Box>
              <Text size="3" weight="bold" truncate>
                {brand}
              </Text>
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
          <RadixMenuContent roleName={role} loading={loading} onNavigate={handleNavigate} />
        </Box>

        <Separator size="4" />

        <Box
          px="3"
          py="3"
          style={{
            borderTop: "1px solid",
            borderImage: "linear-gradient(90deg, var(--gray-a5), var(--accent-a4), var(--accent-a6)) 1",
            flexShrink: 0,
            background: "var(--color-panel-translucent)",
          }}
        >
          <Flex align="center" gap="3" mb="3">
            <Avatar
              size="2"
              radius="full"
              variant="soft"
              fallback={userInitial}
            />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="2" weight="bold" as="div" truncate>
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
