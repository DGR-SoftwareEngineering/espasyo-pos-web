import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  Separator,
  Text,
  Theme,
} from "@radix-ui/themes";
import {
  TabUnselectedOutlined,
  RestartAltOutlined,
  AccessTimeOutlined,
  CoffeeOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { usePublicSettings } from "../../core/contexts";
import { hexToRadixAccent } from "../../business/colors";
import { Button } from "../radix/buttons/Button";
import { ImageReader } from "../radix/ImageReader";

const MotionDiv = motion.div;

export const DuplicationSessionBlock: React.FC = () => {
  const { systemName, theme } = usePublicSettings();
  const brand = systemName || "Espasyo";
  const accent = hexToRadixAccent(theme.primaryColor, "amber");
  const logoUrl = theme.logoUrl;
  const year = new Date().getFullYear();

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };
  const handleHome = () => {
    if (typeof window !== "undefined") window.location.href = "/";
  };

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
          animate={{ y: [0, -14, 0], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "10%",
            right: "8%",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, var(--accent-a5) 0%, transparent 70%)",
            filter: "blur(14px)",
            pointerEvents: "none",
          }}
        />
        <MotionDiv
          aria-hidden
          animate={{ y: [0, 12, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "8%",
            left: "6%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, var(--accent-a4) 0%, transparent 70%)",
            filter: "blur(18px)",
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
                {logoUrl ? (
                  <ImageReader src={logoUrl} alt={brand} size={44} radius="3" />
                ) : (
                  <CoffeeOutlined fontSize="medium" />
                )}
              </Box>
              <Flex direction="column" style={{ lineHeight: 1.1 }}>
                <Text size="3" weight="bold">
                  {brand}
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
            style={{ width: "100%", maxWidth: 680 }}
          >
            <Flex
              direction="column"
              gap="4"
              p={{ initial: "5", md: "7" }}
              style={{
                borderRadius: "var(--radius-5)",
                background: "var(--color-panel-solid)",
                border: "1px solid var(--gray-a4)",
                boxShadow:
                  "0 32px 64px -24px var(--gray-a5), 0 4px 8px var(--gray-a3)",
              }}
            >
              <Flex align="center" gap="3" wrap="wrap">
                <Box
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "var(--radius-4)",
                    background: "var(--amber-a3)",
                    color: "var(--amber-11)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TabUnselectedOutlined style={{ fontSize: 30 }} />
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Flex align="center" gap="2" wrap="wrap">
                    <Heading
                      size={{ initial: "6", md: "7" }}
                      weight="bold"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      Duplicate session detected
                    </Heading>
                  </Flex>
                  <Flex align="center" gap="2" mt="1" wrap="wrap">
                    <Badge color="amber" variant="soft" radius="full">
                      Multiple tabs open
                    </Badge>
                    <Flex align="center" gap="1">
                      <AccessTimeOutlined
                        style={{ fontSize: 14, color: "var(--gray-10)" }}
                      />
                      <Text size="1" color="gray">
                        {now.toLocaleTimeString()}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>

              <Separator size="4" />

              <Text size="3" color="gray" style={{ lineHeight: 1.7 }}>
                Your account is signed in on another browser tab. To protect
                your session and keep audit trails accurate, {brand} only
                allows one active tab at a time.
              </Text>

              <Box>
                <Text size="2" weight="bold" mb="2" as="div">
                  How this usually happens
                </Text>
                <Flex direction="column" gap="2">
                  <ReasonRow
                    title="A second tab was opened"
                    body="Sometimes a tab is restored from a previous session, or a link opens a new one without you noticing."
                  />
                  <ReasonRow
                    title="The previous tab is still alive in the background"
                    body="Closing the active tab doesn't always end the session immediately on slow connections."
                  />
                  <ReasonRow
                    title="A second device is signed in"
                    body="Signing in on another computer or phone with the same account will trigger this guard."
                  />
                </Flex>
              </Box>

              <Callout.Root color="blue" variant="surface">
                <Callout.Icon>
                  <InfoOutlined fontSize="small" />
                </Callout.Icon>
                <Callout.Text>
                  Close every other tab where you might be signed in, then
                  reload this one. If the issue persists, sign out everywhere
                  from your other device first.
                </Callout.Text>
              </Callout.Root>

              <Flex
                justify={{ initial: "center", sm: "end" }}
                gap="3"
                wrap="wrap"
                mt="2"
              >
                <Button type="Secondary" size="3" onClick={handleHome}>
                  Go to sign in
                </Button>
                <Button type="Primary" size="3" onClick={handleReload}>
                  <Flex align="center" gap="2">
                    <RestartAltOutlined fontSize="small" />
                    Reload this tab
                  </Flex>
                </Button>
              </Flex>
            </Flex>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Text size="1" color="gray">
              © {year} {brand}. Crafted with care.
            </Text>
          </MotionDiv>
        </Flex>
      </Box>
    </Theme>
  );
};

const ReasonRow: React.FC<{ title: string; body: string }> = ({
  title,
  body,
}) => (
  <Flex align="start" gap="2">
    <Box
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "var(--accent-9)",
        marginTop: 8,
        flexShrink: 0,
      }}
    />
    <Box>
      <Text size="2" weight="bold" as="div">
        {title}
      </Text>
      <Text size="2" color="gray" as="div">
        {body}
      </Text>
    </Box>
  </Flex>
);
