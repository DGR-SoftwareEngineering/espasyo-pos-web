"use client";
import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Container,
  DropdownMenu,
  Flex,
  IconButton,
  Text,
} from "@radix-ui/themes";
import { ExitIcon, PersonIcon } from "@radix-ui/react-icons";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useRouter } from "../../../core/router";
import { CartProvider, useCart } from "./CartContext";
import { CartDrawer } from "./CartDrawer";

interface Props {
  logout: () => Promise<void>;
  loading?: boolean;
  initials?: string;
  email?: string;
  children: React.ReactNode;
}

/** In-page anchors served by the dashboard sections. */
const NAV_LINKS = [
  { label: "Order", href: "#menu" },
  { label: "Promos", href: "#promos" },
  { label: "My Orders", href: "#orders" },
  { label: "Rewards", href: "#rewards" },
];

/**
 * Authenticated chrome for the CustomerEngagement platform — a clean top nav +
 * slide-in cart, deliberately distinct from the admin/cashier sidebar. Selected
 * by `RadixThemeFramework` when `platform === "CustomerEngagement"`.
 */
export const CustomerShell: React.FC<Props> = ({
  logout,
  loading,
  initials,
  email,
  children,
}) => (
  <CartProvider>
    <CustomerShellInner
      logout={logout}
      loading={loading}
      initials={initials}
      email={email}
    >
      {children}
    </CustomerShellInner>
  </CartProvider>
);

const CustomerShellInner: React.FC<Props> = ({
  logout,
  loading,
  initials,
  email,
  children,
}) => {
  const router = useRouter();
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const userInitial = (initials || email || "?").charAt(0).toUpperCase();
  const displayName = initials || "Guest";

  const handleLogout = async () => {
    await logout?.();
    if (!loading) router.push("/login");
  };

  return (
    <Flex direction="column" style={{ minHeight: "100vh", width: "100%" }}>
      {/* Top navigation */}
      <Box
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "var(--color-panel-translucent)",
          borderBottom: "1px solid var(--gray-a4)",
          backdropFilter: "saturate(180%) blur(8px)",
        }}
      >
        <Container size="4" px="4">
          <Flex align="center" justify="between" gap="4" style={{ height: 64 }}>
            {/* Brand */}
            <Flex
              align="center"
              gap="2"
              style={{ cursor: "pointer", flexShrink: 0 }}
              onClick={() => router.push("/customer/hub")}
            >
              <Text size="5" aria-hidden>
                ☕
              </Text>
              <Text size="4" weight="bold" style={{ letterSpacing: "-0.02em" }}>
                Espasyo
              </Text>
            </Flex>

            {/* Center nav (desktop) */}
            <Flex
              align="center"
              gap="5"
              display={{ initial: "none", md: "flex" }}
              style={{ flex: 1, justifyContent: "center" }}
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  style={{ textDecoration: "none" }}
                  className="customer-nav-link"
                >
                  <Text size="2" weight="medium" color="gray">
                    {link.label}
                  </Text>
                </a>
              ))}
            </Flex>

            {/* Cart + profile */}
            <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
              <Box style={{ position: "relative" }}>
                <IconButton
                  size="3"
                  variant="soft"
                  radius="full"
                  aria-label="Open cart"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingCartIcon style={{ fontSize: 20 }} />
                </IconButton>
                {count > 0 && (
                  <Badge
                    color="orange"
                    variant="solid"
                    radius="full"
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      minWidth: 18,
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    {count}
                  </Badge>
                )}
              </Box>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <button
                    type="button"
                    aria-label="Open profile menu"
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      borderRadius: 999,
                      display: "inline-flex",
                    }}
                  >
                    <Avatar
                      size="2"
                      radius="full"
                      color="orange"
                      variant="solid"
                      fallback={userInitial}
                    />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  size="2"
                  align="end"
                  sideOffset={8}
                  style={{ minWidth: 220 }}
                >
                  <Box px="3" py="2">
                    <Flex align="center" gap="3">
                      <Avatar
                        size="3"
                        radius="full"
                        color="orange"
                        variant="solid"
                        fallback={userInitial}
                      />
                      <Box style={{ minWidth: 0, flex: 1 }}>
                        <Text size="2" weight="bold" as="div" truncate>
                          {displayName}
                        </Text>
                        {email && (
                          <Text size="1" color="gray" as="div" truncate>
                            {email}
                          </Text>
                        )}
                      </Box>
                    </Flex>
                  </Box>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item>
                    <PersonIcon />
                    Profile
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item color="red" onSelect={handleLogout}>
                    <ExitIcon />
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Page content */}
      <Box style={{ flex: 1 }}>
        <Container size="4" px="4" py="5">
          {children}
        </Container>
      </Box>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      <style>{`
        .customer-nav-link span { transition: color 120ms ease; }
        .customer-nav-link:hover span { color: var(--accent-11) !important; }
      `}</style>
    </Flex>
  );
};
