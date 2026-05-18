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
import { CoffeeOutlined } from "@mui/icons-material";
import { RadixMenuContent } from "./menu/RadixMenuContent";
import { CardAlert } from "./CardAlert";
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
}) => {
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
          background: "var(--color-panel-solid)",
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
              borderBottom: "1px solid var(--gray-a3)",
              flexShrink: 0,
            }}
          >
            <Flex align="center" gap="2" style={{ minWidth: 0 }}>
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-3)",
                  background:
                    "linear-gradient(135deg, var(--accent-9), var(--accent-11))",
                  color: "var(--accent-contrast)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CoffeeOutlined fontSize="small" />
              </Box>
              <Text size="3" weight="bold" truncate>
                {brand}
              </Text>
            </Flex>
            <IconButton
              variant="ghost"
              color="gray"
              size="2"
              aria-label="Close menu"
              onClick={() => onOpenChange(false)}
            >
              <Cross1Icon />
            </IconButton>
          </Flex>
        </Dialog.Title>

        {role && (
          <Box px="4" py="3" style={{ flexShrink: 0 }}>
            <Flex
              align="center"
              gap="3"
              px="3"
              py="2"
              style={{
                background: "var(--accent-a2)",
                border: "1px solid var(--accent-a4)",
                borderRadius: "var(--radius-3)",
              }}
            >
              <Avatar
                size="2"
                radius="full"
                color="indigo"
                variant="solid"
                fallback={userInitial}
              />
              <Box style={{ minWidth: 0 }}>
                <Text size="1" color="gray" as="div">
                  Signed in as
                </Text>
                <Text
                  size="2"
                  weight="bold"
                  as="div"
                  truncate
                  style={{ color: "var(--accent-11)" }}
                >
                  {role.toUpperCase()}
                </Text>
              </Box>
            </Flex>
          </Box>
        )}

        <Box style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          <RadixMenuContent roleName={role} loading={loading} />
        </Box>

        <Separator size="4" />

        <Box px="3" py="2" style={{ flexShrink: 0 }}>
          <CardAlert />
        </Box>

        <Box
          px="3"
          py="3"
          style={{
            borderTop: "1px solid var(--gray-a3)",
            flexShrink: 0,
            background: "var(--color-panel-translucent)",
          }}
        >
          <Flex align="center" gap="3" mb="3">
            <Avatar
              size="2"
              radius="full"
              color="indigo"
              variant="solid"
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
