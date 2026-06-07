import React, { useMemo } from "react";
import { useRouter } from "next/router";
import {
  Avatar,
  Badge,
  Box,
  Flex,
  Heading,
  Separator,
  Text,
  Theme,
} from "@radix-ui/themes";
import {
  CoffeeOutlined,
  HomeOutlined,
  ArrowBackOutlined,
  SearchOffOutlined,
  LoginOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Button } from "core-lib/components/radix/buttons/Button";
import {
  useAccessContext,
  useAuthContext,
  usePublicSettings,
} from "core-lib/core/contexts";
import { hexToRadixAccent } from "core-lib/business/colors";
import { ImageReader } from "core-lib/components/radix/ImageReader";
import { resolveIcon } from "core-lib/components/menu/icons";
import { MenuItemDto } from "core-lib/api/access/types";

const MotionDiv = motion.div;

const homePathForRole = (role: string | null | undefined): string => {
  const normalized = (role ?? "").toLowerCase();
  if (normalized === "admin") return "/admin/hub";
  if (normalized === "cashier") return "/cashier/pos";
  return "/";
};

const pickQuickLinks = (menu: MenuItemDto[]): MenuItemDto[] => {
  const candidates = menu
    .filter((m) => m.path && m.path.trim().length > 0 && m.parentMenuItemID === null)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  return candidates.slice(0, 4);
};

const Custom404: React.FC = () => {
  const router = useRouter();
  const { systemName, theme } = usePublicSettings();
  const auth = useAuthContext();
  const access = useAccessContext();

  const accent = hexToRadixAccent(theme.primaryColor, "amber");
  const brandName = systemName || "Espasyo";
  const isAuthed = !!auth.isAuthenticated;
  const roleLabel = (access.role?.name ?? auth.role ?? "").toString();
  const greetingName = (auth.initials || auth.email || "").trim();
  const initials = (greetingName || roleLabel || "?")
    .charAt(0)
    .toUpperCase();
  const homePath = homePathForRole(auth.role);

  const quickLinks = useMemo(
    () => (isAuthed ? pickQuickLinks(access.menu) : []),
    [isAuthed, access.menu],
  );

  const handleHome = () => router.push(isAuthed ? homePath : "/");
  const handleBack = () => router.back();
  const handleQuickLink = (path: string) => router.push(path);

  return (
    <Theme
      appearance="light"
      accentColor={accent}
      grayColor="sand"
      radius="large"
    >
      <Box
        style={{
          minHeight: "100vh",
          width: "100%",
          background:
            "radial-gradient(1200px 600px at -10% -10%, var(--accent-a3), transparent 60%), radial-gradient(900px 500px at 110% 110%, var(--accent-a3), transparent 55%), var(--color-background)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(var(--gray-a4) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 80%)",
            pointerEvents: "none",
          }}
        />

        <MotionDiv
          aria-hidden
          animate={{ y: [0, -14, 0], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "12%",
            right: "10%",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, var(--accent-a5) 0%, transparent 70%)",
            filter: "blur(12px)",
            pointerEvents: "none",
          }}
        />
        <MotionDiv
          aria-hidden
          animate={{ y: [0, 12, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "10%",
            left: "8%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, var(--accent-a4) 0%, transparent 70%)",
            filter: "blur(16px)",
            pointerEvents: "none",
          }}
        />

        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="6"
          style={{
            minHeight: "100vh",
            width: "100%",
            padding: "48px 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <MotionDiv
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Flex align="center" gap="3">
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
                  boxShadow: "0 8px 24px var(--accent-a6)",
                  overflow: "hidden",
                }}
              >
                {theme.logoUrl ? (
                  <ImageReader
                    src={theme.logoUrl}
                    alt={brandName}
                    size={44}
                    radius="3"
                  />
                ) : (
                  <CoffeeOutlined fontSize="medium" />
                )}
              </Box>
              <Flex direction="column" style={{ lineHeight: 1.1 }}>
                <Text size="3" weight="bold">
                  {brandName}
                </Text>
                <Text size="1" color="gray">
                  Coffee House
                </Text>
              </Flex>
            </Flex>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            style={{ width: "100%", maxWidth: 640 }}
          >
            <Flex
              direction="column"
              align="center"
              gap="4"
              p={{ initial: "5", md: "7" }}
              style={{
                borderRadius: "var(--radius-5)",
                background: "var(--color-panel-solid)",
                border: "1px solid var(--gray-a4)",
                boxShadow:
                  "0 32px 64px -24px var(--gray-a5), 0 4px 8px var(--gray-a3)",
                textAlign: "center",
              }}
            >
              {isAuthed ? (
                <Flex align="center" gap="3" wrap="wrap" justify="center">
                  <Avatar
                    size="2"
                    radius="full"
                    variant="solid"
                    color="indigo"
                    fallback={initials}
                  />
                  <Flex direction="column" align={{ initial: "center", md: "start" }}>
                    <Text size="1" color="gray">
                      Signed in as
                    </Text>
                    <Flex align="center" gap="2">
                      <Text size="2" weight="bold">
                        {greetingName || roleLabel || "you"}
                      </Text>
                      {roleLabel && (
                        <Badge color="indigo" variant="soft" radius="full" size="1">
                          {roleLabel}
                        </Badge>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              ) : (
                <Badge
                  color="amber"
                  variant="soft"
                  size="2"
                  radius="full"
                  style={{ alignSelf: "center" }}
                >
                  <SearchOffOutlined style={{ fontSize: 14 }} />
                  Page not found
                </Badge>
              )}

              <Box style={{ position: "relative" }}>
                <Heading
                  size={{ initial: "9", md: "9" }}
                  weight="bold"
                  style={{
                    fontSize: "clamp(96px, 18vw, 168px)",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    background:
                      "linear-gradient(135deg, var(--accent-9) 0%, var(--accent-11) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  404
                </Heading>
                <MotionDiv
                  aria-hidden
                  animate={{ rotate: [-8, 8, -8] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    top: "20%",
                    right: -8,
                    fontSize: 36,
                  }}
                >
                  ☕
                </MotionDiv>
              </Box>

              <Heading size="6" weight="bold" align="center">
                {isAuthed
                  ? "Brew break — that page doesn't exist."
                  : "We brewed something… but not this page."}
              </Heading>

              <Text
                size="3"
                color="gray"
                align="center"
                style={{ maxWidth: 480, lineHeight: 1.6 }}
              >
                {isAuthed
                  ? buildAuthedBody(roleLabel)
                  : "The route you followed may have been moved, retired, or never existed. Let's get you back to a page that does."}
              </Text>

              <Separator size="4" my="2" />

              <Flex gap="3" wrap="wrap" justify="center">
                <Button type="Secondary" size="3" onClick={handleBack}>
                  <Flex align="center" gap="2">
                    <ArrowBackOutlined fontSize="small" />
                    Go back
                  </Flex>
                </Button>
                <Button type="Primary" size="3" onClick={handleHome}>
                  <Flex align="center" gap="2">
                    {isAuthed ? (
                      <HomeOutlined fontSize="small" />
                    ) : (
                      <LoginOutlined fontSize="small" />
                    )}
                    {isAuthed ? "Back to dashboard" : "Sign in"}
                  </Flex>
                </Button>
              </Flex>

              {isAuthed && quickLinks.length > 0 && (
                <Box mt="2" style={{ width: "100%" }}>
                  <Text size="1" color="gray" mb="2" as="div">
                    Or jump to one of your shortcuts
                  </Text>
                  <Flex gap="2" wrap="wrap" justify="center">
                    {quickLinks.map((link) => {
                      const Icon = resolveIcon(link.iconName);
                      return (
                        <Box
                          key={link.menuItemID}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleQuickLink(link.path!)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleQuickLink(link.path!);
                            }
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 12px",
                            borderRadius: 999,
                            background: "var(--accent-a3)",
                            color: "var(--accent-11)",
                            border: "1px solid var(--accent-a5)",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 500,
                            transition: "background 120ms ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "var(--accent-a4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "var(--accent-a3)";
                          }}
                        >
                          <Icon style={{ fontSize: 16 }} />
                          {link.label}
                        </Box>
                      );
                    })}
                  </Flex>
                </Box>
              )}

              {!isAuthed && (
                <Flex
                  gap="2"
                  align="center"
                  justify="center"
                  wrap="wrap"
                  mt="2"
                  style={{ color: "var(--gray-10)" }}
                >
                  <Text size="1">Looking for something specific?</Text>
                  <Text
                    size="1"
                    weight="medium"
                    style={{
                      color: "var(--accent-11)",
                      cursor: "pointer",
                    }}
                    onClick={handleHome}
                  >
                    Sign in to the dashboard →
                  </Text>
                </Flex>
              )}
            </Flex>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Text size="1" color="gray">
              © {new Date().getFullYear()} {brandName}. Crafted with care.
            </Text>
          </MotionDiv>
        </Flex>
      </Box>
    </Theme>
  );
};

const buildAuthedBody = (roleLabel: string): string => {
  const lower = roleLabel.toLowerCase();
  if (lower === "admin") {
    return "Your control panel is one click away. Pick a shortcut below or head back to the admin dashboard.";
  }
  if (lower === "cashier") {
    return "No worries — the POS and your shifts are still right where you left them. Pick a shortcut below or return to the cashier dashboard.";
  }
  if (lower === "supplier") {
    return "The supplier portal is still in development. Use a shortcut below if it's available, or head back to your hub.";
  }
  return "Pick a shortcut below or head back to your dashboard.";
};

export default Custom404;
