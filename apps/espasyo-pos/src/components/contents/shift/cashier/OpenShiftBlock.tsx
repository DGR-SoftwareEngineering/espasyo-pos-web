import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
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
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  AccessTimeOutlined,
  AttachMoneyOutlined,
  LogoutOutlined,
  ReceiptLongOutlined,
  TrackChangesOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useToastContext, usePublicSettings } from "core-lib/core/contexts";
import { useAuthContext } from "core-lib/core/contexts";
import { useApiCallback } from "core-lib/core/hooks";
import { useLogout } from "core-lib/core/hooks";
import { hexToRadixAccent } from "core-lib/business/colors";
import { OpenShiftParams } from "core-lib/api/commons/types";
import { OpenShiftFormBlock } from "./forms/OpenShiftFormBlock";
import { OpenShiftForm } from "./forms/validation";

const MotionDiv = motion.div;

const padTwo = (n: number) => String(n).padStart(2, "0");
const formatTime = (d: Date) => {
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${padTwo(h12)}:${padTwo(m)}:${padTwo(s)} ${ampm}`;
};
const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const LEFT_FEATURES = [
  { icon: AttachMoneyOutlined, label: "Track Opening Cash" },
  { icon: ReceiptLongOutlined, label: "Auto-link Sales" },
  { icon: AccessTimeOutlined, label: "Shift Reporting" },
  { icon: TrackChangesOutlined, label: "Cash Reconciliation" },
];

export const OpenShiftBlock: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const { systemName, theme } = usePublicSettings();
  const { initials, email } = useAuthContext();
  const { logout } = useLogout();

  const [submitting, setSubmitting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [greeting, setGreeting] = useState('');
  const [checkingShift, setCheckingShift] = useState(true);

  const activeShiftCb = useApiCallback(async (api) => api.commons.getActiveShift());
  const openShiftCb = useApiCallback(
    async (api, params: OpenShiftParams) => api.commons.openShift(params),
  );

  useEffect(() => {
    activeShiftCb.execute()
      .then((res) => {
        if (res?.data?.response) {
          router.replace("/cashier/pos");
        } else {
          setCheckingShift(false);
        }
      })
      .catch(() => {
        setCheckingShift(false);
      });
  }, []);

  useEffect(() => {
    setGreeting(getGreeting());
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = useCallback(
    async (formData: OpenShiftForm) => {
      setSubmitting(true);
      try {
        const params: OpenShiftParams = {
          openingCash: formData.openingCash,
          notes: formData.notes || null,
        };
        const result = await openShiftCb.execute(params);
        if (result?.data?.success && result.data.response) {
          showToast(
            `Shift ${result.data.response.shiftNumber} opened successfully!`,
            "success",
          );
          router.replace("/cashier/pos");
          return;
        }
        const errorMsg =
          Array.isArray(result?.data?.errors) && result.data.errors.length > 0
            ? (result.data.errors as string[])[0]
            : result?.data?.message ?? "Failed to open shift";
        showToast(errorMsg, "error");
      } catch {
        showToast("Failed to open shift", "error");
      } finally {
        setSubmitting(false);
      }
    },
    [openShiftCb, router, showToast],
  );

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }, [logout]);

  const displayName = email?.split("@")[0] ?? initials ?? "Cashier";
  const resolvedAccent = hexToRadixAccent(theme.primaryColor, "indigo");

  // While checking for an active shift, render nothing so the user never sees the
  // form when they have a shift or when navigating back from /cashier/pos.
  if (checkingShift) {
    return null;
  }

  return (
    <Theme appearance="light" accentColor={resolvedAccent} grayColor="slate" radius="large">
      <Box
        style={{
          minHeight: "100vh",
          width: "100%",
          background:
            "radial-gradient(1000px 500px at -5% -5%, var(--accent-a3), transparent 55%), " +
            "radial-gradient(800px 400px at 105% 105%, var(--accent-a3), transparent 55%), " +
            "var(--color-background)",
          overflow: "hidden",
        }}
      >
        <Flex
          direction={{ initial: "column", lg: "row" }}
          style={{ minHeight: "100vh", width: "100%" }}
        >
          {/* ─── Left panel — gif showcase ─── */}
          <Box
            display={{ initial: "none", lg: "block" }}
            style={{
              position: "relative",
              flex: 1,
              overflow: "hidden",
              borderRight: "1px solid var(--accent-a5)",
              background:
                "linear-gradient(160deg, var(--accent-11) 0%, var(--accent-9) 55%, var(--accent-10) 100%)",
            }}
          >
            {/* Subtle decorative blobs */}
            <MotionDiv
              aria-hidden
              animate={{ y: [0, -18, 0], opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "10%",
                right: "8%",
                width: 260,
                height: 260,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
                filter: "blur(16px)",
                pointerEvents: "none",
              }}
            />
            <MotionDiv
              aria-hidden
              animate={{ y: [0, 16, 0], opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: "8%",
                left: "5%",
                width: 320,
                height: 320,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
                filter: "blur(24px)",
                pointerEvents: "none",
              }}
            />

            <Flex
              direction="column"
              justify="between"
              p="7"
              style={{ position: "relative", height: "100%", zIndex: 1 }}
            >
              {/* Brand at top */}
              <MotionDiv
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius-4)",
                      background: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {theme?.logoUrl ? (
                      <img
                        src={theme.logoUrl}
                        alt={systemName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Text size="3" weight="bold" style={{ color: "white" }}>
                        {systemName
                          .split(" ")
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()}
                      </Text>
                    )}
                  </Box>
                  <Flex direction="column" style={{ lineHeight: 1.15 }}>
                    <Text size="3" weight="bold" style={{ color: "white" }}>
                      {systemName}
                    </Text>
                    <Text size="1" style={{ color: "rgba(255,255,255,0.65)" }}>
                      Cashier Portal
                    </Text>
                  </Flex>
                </Flex>
              </MotionDiv>

              {/* Centered GIF */}
              <MotionDiv
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                style={{ display: "flex", justifyContent: "center", flex: 1, alignItems: "center" }}
              >
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 24,
                  }}
                >
                  <Box
                    style={{
                      width: 300,
                      height: 300,
                      borderRadius: "var(--radius-5)",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(4px)",
                      overflow: "hidden",
                      boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                    }}
                  >
                    <img
                      src="/espasyo-flies-2.gif"
                      alt="Espasyo"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </Box>

                  <Flex direction="column" align="center" gap="2">
                    <Heading
                      size="6"
                      weight="bold"
                      align="center"
                      style={{
                        color: "white",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.15,
                        maxWidth: 340,
                      }}
                    >
                      Ready to start your shift?
                    </Heading>
                    <Text
                      size="3"
                      align="center"
                      style={{ color: "rgba(255,255,255,0.72)", maxWidth: 300, lineHeight: 1.5 }}
                    >
                      Open your shift to begin tracking sales, cash, and transactions for this session.
                    </Text>
                  </Flex>

                  <Flex gap="2" wrap="wrap" justify="center" mt="1">
                    {LEFT_FEATURES.map(({ icon: Icon, label }, i) => (
                      <MotionDiv
                        key={label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                      >
                        <Flex
                          align="center"
                          gap="2"
                          px="3"
                          py="2"
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 999,
                            color: "white",
                          }}
                        >
                          <Icon style={{ fontSize: 14, opacity: 0.85 }} />
                          <Text size="1" weight="medium">{label}</Text>
                        </Flex>
                      </MotionDiv>
                    ))}
                  </Flex>
                </Box>
              </MotionDiv>

              {/* Footer */}
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Text size="1" style={{ color: "rgba(255,255,255,0.45)" }}>
                  © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {systemName}. All rights reserved.
                </Text>
              </MotionDiv>
            </Flex>
          </Box>

          {/* ─── Right panel — form ─── */}
          <Box
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 24px",
              minHeight: "100vh",
              overflowY: "auto",
            }}
          >
            {/* Dot grid background */}
            <Box
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(var(--gray-a4) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                maskImage:
                  "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent 80%)",
                pointerEvents: "none",
              }}
            />

            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ width: "100%", maxWidth: 460, position: "relative" }}
            >
              {/* Mobile brand */}
              <Flex display={{ initial: "flex", lg: "none" }} justify="center" mb="6">
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius-4)",
                      background: "linear-gradient(135deg, var(--accent-9) 0%, var(--accent-11) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {theme?.logoUrl ? (
                      <img src={theme.logoUrl} alt={systemName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Text size="2" weight="bold" style={{ color: "white" }}>
                        {systemName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                      </Text>
                    )}
                  </Box>
                  <Flex direction="column" style={{ lineHeight: 1.1 }}>
                    <Text size="3" weight="bold">{systemName}</Text>
                    <Text size="1" color="gray">Cashier Portal</Text>
                  </Flex>
                </Flex>
              </Flex>

              {/* Form card */}
              <Box
                p="6"
                style={{
                  borderRadius: "var(--radius-5)",
                  background: "var(--color-panel-solid)",
                  border: "1px solid var(--gray-a4)",
                  boxShadow: "0 24px 48px -20px var(--gray-a5), 0 2px 4px var(--gray-a3)",
                }}
              >
                {/* Header — greeting + clock */}
                <Flex direction="column" gap="1" mb="5">
                  <Text size="2" color="gray" weight="medium">
                    {greeting || ' '},
                  </Text>
                  <Heading size="7" weight="bold" style={{ letterSpacing: "-0.02em" }}>
                    {displayName}
                  </Heading>
                  <Flex align="center" gap="2" mt="1">
                    <Text size="2" color="gray">{now ? formatDate(now) : ' '}</Text>
                  </Flex>
                  <Box
                    mt="2"
                    style={{
                      display: "inline-block",
                      background: "var(--accent-a2)",
                      border: "1px solid var(--accent-a4)",
                      borderRadius: "var(--radius-3)",
                      padding: "5px 14px",
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      size="5"
                      weight="bold"
                      style={{
                        color: "var(--accent-11)",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "0.04em",
                        fontFamily: "monospace",
                      }}
                    >
                      {now ? formatTime(now) : '--:--:-- --'}
                    </Text>
                  </Box>
                </Flex>

                <Separator size="4" mb="5" />

                <Callout.Root color="blue" variant="surface" size="1" mb="5">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    Count the cash in your drawer and enter the total below to open your shift.
                  </Callout.Text>
                </Callout.Root>

                {/* Form */}
                <OpenShiftFormBlock
                  onSubmit={handleSubmit}
                  submitLoading={submitting}
                />
              </Box>

              {/* Sign out */}
              <Flex justify="center" align="center" gap="2" mt="5">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "none",
                    cursor: loggingOut ? "not-allowed" : "pointer",
                    color: "var(--gray-10)",
                    fontSize: 13,
                    padding: "6px 10px",
                    borderRadius: "var(--radius-2)",
                    opacity: loggingOut ? 0.5 : 1,
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--red-11)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--gray-10)"; }}
                >
                  <LogoutOutlined style={{ fontSize: 15 }} />
                  {loggingOut ? "Signing out…" : "Sign out of your account"}
                </button>
              </Flex>
            </MotionDiv>
          </Box>
        </Flex>
      </Box>
    </Theme>
  );
};
