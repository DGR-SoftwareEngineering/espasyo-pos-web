import React, { useMemo } from "react";
import { Box, Flex, Text, Popover, Button, Card, Separator } from "@radix-ui/themes";
import { RocketIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { usePublicSettings, useAuthContext } from "../../../core/contexts";
import { useApi } from "../../../core/hooks";
import { useRouter } from "../../../core/router";
import { formatCurrency, getDailySalesGross } from "../../../business";

const MotionButton = motion(Button);

const getThresholdColor = (progressPct: number): { color: string; label: string } => {
  if (progressPct >= 100) return { color: "jade", label: "🎯 Goal!" };
  if (progressPct >= 80) return { color: "green", label: "Almost there" };
  if (progressPct >= 50) return { color: "amber", label: `${Math.round(progressPct)}%` };
  return { color: "red", label: `${Math.round(progressPct)}%` };
};

const colorToCSS: Record<string, string> = {
  jade: "var(--jade-9)",
  green: "var(--green-9)",
  amber: "var(--amber-9)",
  red: "var(--red-9)",
};

const colorToBg: Record<string, string> = {
  jade: "var(--jade-a3)",
  green: "var(--green-a3)",
  amber: "var(--amber-a3)",
  red: "var(--red-a3)",
};

export const HeaderSalesTarget: React.FC = () => {
  const router = useRouter();
  const { pos } = usePublicSettings();
  const { role } = useAuthContext();
  const salesApi = useApi((api) => api.commons.salesDailySummary(), []);

  const isAdmin = (role ?? "").toLowerCase() === "admin";

  const targetAmount = pos.targetSalesAmountPerDay;
  const salesResponse = salesApi.result?.data?.response;
  const currentAmount = getDailySalesGross(salesResponse);

  const progressPct = useMemo(() => {
    if (targetAmount <= 0) return 0;
    return Math.min((currentAmount / targetAmount) * 100, 100);
  }, [currentAmount, targetAmount]);

  const reached = targetAmount > 0 && currentAmount >= targetAmount;
  const threshold = getThresholdColor(progressPct);

  if (!isAdmin || !pos.targetSalesEnabled || targetAmount <= 0) {
    return null;
  }

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Popover.Root>
      <Popover.Trigger>
        <MotionButton
          animate={reached ? { scale: [1, 1.04, 1] } : {}}
          transition={reached ? { duration: 1.5, repeat: Infinity } : {}}
          variant="ghost"
          size="2"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 32,
            padding: "0 10px",
            borderRadius: "var(--radius-3)",
            border: `1px solid ${colorToCSS[threshold.color]}`,
            background: reached ? colorToBg[threshold.color] : "transparent",
            color: colorToCSS[threshold.color],
            cursor: "pointer",
            transition: "all 200ms ease",
          }}
        >
          <RocketIcon width={16} height={16} />
          <Text size="1" weight="bold" style={{ whiteSpace: "nowrap" }}>
            {threshold.label}
          </Text>
        </MotionButton>
      </Popover.Trigger>

      <Popover.Content style={{ width: 340, padding: "16px" }}>
        <Flex direction="column" gap="3">
          {/* Header */}
          <Flex justify="between" align="center">
            <Text size="3" weight="bold">
              Daily Sales Target
            </Text>
            <Text size="1" color="gray">
              {today}
            </Text>
          </Flex>

          {/* Circular progress ring */}
          <Flex justify="center" align="center" style={{ height: 140, minHeight: 140 }}>
            <Box style={{ position: "relative", width: 120, height: 120 }}>
              <svg
                width={120}
                height={120}
                style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
              >
                {/* Background circle */}
                <circle
                  cx={60}
                  cy={60}
                  r={50}
                  fill="none"
                  stroke="var(--gray-a3)"
                  strokeWidth={8}
                />
                {/* Progress circle */}
                <motion.circle
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - (314 * progressPct) / 100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  cx={60}
                  cy={60}
                  r={50}
                  fill="none"
                  stroke={colorToCSS[threshold.color]}
                  strokeWidth={8}
                  strokeDasharray={314}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center text */}
              <Flex
                justify="center"
                align="center"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                  fontSize: reached ? "32px" : "28px",
                  fontWeight: "bold",
                }}
              >
                {reached ? "🎯" : `${Math.round(progressPct)}%`}
              </Flex>
            </Box>
          </Flex>

          {/* Stat cards */}
          <Flex gap="2">
            <Card
              style={{
                flex: 1,
                padding: "12px",
                background: colorToBg[threshold.color],
                border: `1px solid ${colorToCSS[threshold.color]}`,
                minHeight: 80,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Flex direction="column" gap="1">
                <Text size="1" color="gray" weight="medium">
                  Current Sales
                </Text>
                <Text size="3" weight="bold" style={{ color: colorToCSS[threshold.color], minHeight: "1.5em", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {formatCurrency(currentAmount)}
                </Text>
              </Flex>
            </Card>

            <Card
              style={{
                flex: 1,
                padding: "12px",
                background: "var(--gray-a2)",
                border: "1px solid var(--gray-a4)",
                minHeight: 80,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Flex direction="column" gap="1">
                <Text size="1" color="gray" weight="medium">
                  Target
                </Text>
                <Text size="3" weight="bold" style={{ color: "var(--gray-11)", minHeight: "1.5em", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {formatCurrency(targetAmount)}
                </Text>
              </Flex>
            </Card>
          </Flex>

          {/* Animated progress bar */}
          <Box>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                height: 6,
                background: colorToCSS[threshold.color],
                borderRadius: "var(--radius-2)",
              }}
            />
          </Box>

          {/* Status message */}
          <Text
            size="2"
            weight="bold"
            style={{
              color: colorToCSS[threshold.color],
              textAlign: "center",
            }}
          >
            {reached ? "🎉 You've hit your target!" : getStatusMessage(progressPct)}
          </Text>

          <Separator />

          {/* Buttons */}
          <Flex direction="column" gap="2">
            <Button
              size="2"
              style={{ width: "100%" }}
              onClick={() => router.push("/admin/hub/reports?tab=daily_target")}
            >
              View Full Report
            </Button>
            <Button
              size="1"
              variant="soft"
              style={{ width: "100%", cursor: "pointer" }}
              onClick={() => router.push("/admin/hub/settings")}
            >
              Configure Target
            </Button>
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
};

function getStatusMessage(pct: number): string {
  if (pct >= 80) return "Almost there! Keep the momentum going.";
  if (pct >= 50) return "Halfway there! Keep pushing.";
  return "Keep going! You're just getting started.";
}
