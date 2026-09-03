import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Separator,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Button,
  Callout,
  Card,
  Grid,
  Spinner,
} from "@radix-ui/themes";;
import {
  CalendarIcon,
} from "@radix-ui/react-icons";
import {
  TrendingUpOutlined,
  AssessmentOutlined,
  InfoOutlined,
  PrintOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useChart } from "core-lib/components/radix/charts";
import { usePublicSettings } from "core-lib/core/contexts";
import { useRouter } from "core-lib/core/router";
import { formatCurrency } from "../../contents/procurement/format";
import { getDaysAgoIso } from "../constants";
import { dailyTargetTableStyles, keyframeStyles } from "../styles";
import { DailyTransactionsPanel } from "./DailyTransactionsPanel";
import { PrintPreviewDialog, PrintableDocument } from "core-lib/components/print";
import type { DailySalesTargetTabProps } from "../types";

export const DailySalesTargetTab: React.FC<DailySalesTargetTabProps> = ({ todayTotal, salesCount, salesLoading }) => {
  const { pos, currencyCode: tabCurrencyCode } = usePublicSettings();
  const router = useRouter();

  const targetAmount = pos.targetSalesAmountPerDay;
  const currentAmount = todayTotal;

  const [fromDate, setFromDate] = useState(() => getDaysAgoIso(6));
  const [toDate, setToDate] = useState(() => getDaysAgoIso(0));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [printOpen, setPrintOpen] = useState(false);

  const apiToDate = useMemo(() => {
    const d = new Date(toDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, [toDate]);

  const rangeChart = useChart({
    chartKey: "sales-by-day",
    fromDate,
    toDate: apiToDate,
  });

  const progressPct = useMemo(() => {
    if (targetAmount <= 0) return 0;
    return Math.min((currentAmount / targetAmount) * 100, 100);
  }, [currentAmount, targetAmount]);

  const remaining = Math.max(targetAmount - currentAmount, 0);
  const reached = targetAmount > 0 && currentAmount >= targetAmount;

  const rangeRows = useMemo(() => {
    const todayIso = getDaysAgoIso(0);
    const points = rangeChart.data?.points ?? [];
    return points
      .map((p) => {
        const isoDate = p.timestamp
          ? (() => {
              const d = new Date(p.timestamp);
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            })()
          : null;
        const rawAmount = (Object.values(p.values)[0] ?? 0) as number;
        const amount = isoDate === todayIso && todayTotal > 0 ? todayTotal : rawAmount;
        return { date: isoDate, label: p.label, amount };
      })
      .filter((r) => !r.date || (r.date >= fromDate && r.date <= toDate));
  }, [rangeChart.data, fromDate, toDate, todayTotal]);

  const chartData = useMemo(
    () =>
      [...rangeRows].reverse().map(({ label, amount }) => ({
        label,
        actual: amount > 0 ? amount : 0,
      })),
    [rangeRows],
  );

  const selectedDateSummary = selectedDate
    ? { totalAmount: rangeRows.find((r) => r.date === selectedDate)?.amount ?? 0, salesCount: 0 }
    : null;

  if (targetAmount <= 0 || !pos.targetSalesEnabled) {
    return (
      <Box pt="4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Callout.Root
            style={{
              background: "var(--amber-a2)",
              borderColor: "var(--amber-a5)",
              padding: "20px",
            }}
          >
            <WarningAmberOutlined style={{ fontSize: 18 }} />
            <Callout.Text>
              <strong>Daily Sales Target not configured</strong> \u2014 Go to{" "}
              <Button
                variant="ghost"
                size="1"
                style={{ cursor: "pointer", paddingInline: "4px" }}
                onClick={() => router.push("/admin/hub/settings")}
              >
                Settings
              </Button>
              {" "}to enable and set your daily target.
            </Callout.Text>
          </Callout.Root>
        </motion.div>
      </Box>
    );
  }

  const getStatusColor = (): { color: string; bg: string; message: string; emoji: string } => {
    if (reached) return { color: "jade", bg: "jade-a2", message: "\uD83C\uDF89 Target achieved!", emoji: "\uD83C\uDFAF" };
    if (progressPct >= 80) return { color: "green", bg: "green-a2", message: "Almost there! Keep pushing.", emoji: "\uD83D\uDCAA" };
    if (progressPct >= 50) return { color: "amber", bg: "amber-a2", message: "Halfway done! Keep going.", emoji: "\u26A1" };
    return { color: "red", bg: "red-a2", message: "Keep pushing! You're just getting started.", emoji: "\uD83D\uDE80" };
  };

  const status = getStatusColor();
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Box pt="4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Flex justify="between" align="center" mb="4">
          <Heading size="5" weight="bold">Today&apos;s Sales Performance</Heading>
          <Text size="2" color="gray">{today}</Text>
        </Flex>

        <Grid columns={{ initial: "1", md: "3" }} gap="4" mb="6">
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px",
              background: `var(--${status.color}-a2)`,
              border: `2px solid var(--${status.color}-a5)`,
              minHeight: 300,
            }}
          >
            <Box style={{ position: "relative", width: 140, height: 140, marginBottom: "16px" }}>
              <svg width={140} height={140} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                <circle cx={70} cy={70} r={60} fill="none" stroke="var(--gray-a3)" strokeWidth={10} />
                <motion.circle
                  initial={{ strokeDashoffset: 377 }}
                  animate={{ strokeDashoffset: 377 - (377 * progressPct) / 100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  cx={70}
                  cy={70}
                  r={60}
                  fill="none"
                  stroke={`var(--${status.color}-11)`}
                  strokeWidth={10}
                  strokeDasharray={377}
                  strokeLinecap="round"
                />
              </svg>
              <Flex justify="center" align="center" style={{ position: "absolute", inset: 0, fontSize: 28, fontWeight: "bold", color: `var(--${status.color}-11)` }}>
                {salesLoading ? <Spinner size="3" /> : (reached ? "\uD83C\uDFAF" : `${Math.round(progressPct)}%`)}
              </Flex>
            </Box>
            <Text size="3" weight="bold" style={{ color: `var(--${status.color}-11)`, marginBottom: "8px" }}>
              {status.emoji} {status.message}
            </Text>
            <Text size="1" color="gray" align="center">
              {formatCurrency(currentAmount)} of {formatCurrency(targetAmount)}
            </Text>
          </Card>

          <Card
            style={{
              padding: "24px",
              background: "var(--indigo-a2)",
              border: "1px solid var(--indigo-a5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 180,
            }}
          >
            <Flex direction="column" gap="3" align="center">
              <Flex align="center" gap="2">
                <TrendingUpOutlined style={{ fontSize: 20, color: "var(--indigo-11)" }} />
                <Text size="2" weight="medium" color="gray">Current Sales</Text>
              </Flex>
              <Text size="8" weight="bold" align="center" style={{ color: "var(--indigo-11)", lineHeight: 1 }}>
                {formatCurrency(currentAmount)}
              </Text>
              <Text size="2" color="gray" align="center">
                {salesCount.toLocaleString()} transactions
              </Text>
            </Flex>
          </Card>

          <Card
            style={{
              padding: "24px",
              background: "var(--gray-a2)",
              border: "1px solid var(--gray-a4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 180,
            }}
          >
            <Flex direction="column" gap="3" align="center">
              <Flex align="center" gap="2">
                <AssessmentOutlined style={{ fontSize: 20, color: "var(--gray-11)" }} />
                <Text size="2" weight="medium" color="gray">Daily Target</Text>
              </Flex>
              <Text size="8" weight="bold" align="center" style={{ color: "var(--gray-11)", lineHeight: 1 }}>
                {formatCurrency(targetAmount)}
              </Text>
              {!reached && (
                <Text size="2" color="gray" align="center">
                  Remaining: {formatCurrency(remaining)}
                </Text>
              )}
              {reached && (
                <Text size="2" align="center" style={{ color: "var(--jade-11)" }}>
                  \u2713 Completed
                </Text>
              )}
            </Flex>
          </Card>
        </Grid>

        <Box mb="4">
          <Flex justify="between" align="center" mb="2">
            <Text size="1" weight="medium" color="gray">Progress</Text>
            <Text size="1" weight="bold">{Math.round(progressPct)}%</Text>
          </Flex>
          <Box style={{ height: 8, background: "var(--gray-a3)", borderRadius: "var(--radius-3)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, var(--${status.color}-10), var(--${status.color}-11))`,
                borderRadius: "var(--radius-3)",
              }}
            />
          </Box>
        </Box>

        <Callout.Root mb="6" style={{ background: `var(--${status.color}-a2)`, borderColor: `var(--${status.color}-a5)` }}>
          <InfoOutlined style={{ fontSize: 16 }} />
          <Callout.Text>
            <strong>Target Configuration:</strong> Daily target is set to <strong>{formatCurrency(targetAmount)}</strong>. To adjust this, visit your{" "}
            <Button
              variant="ghost"
              size="1"
              style={{ cursor: "pointer", paddingInline: "4px" }}
              onClick={() => router.push("/admin/hub/settings")}
            >
              Settings
            </Button>
          </Callout.Text>
        </Callout.Root>

        <Separator my="6" />

        <Card style={{ padding: "16px", marginBottom: "24px", background: "var(--gray-a1)" }}>
          <Flex align="center" gap="3" wrap="wrap">
            <CalendarIcon width={18} height={18} style={{ color: "var(--gray-11)" }} />
            <Text size="1" weight="medium" color="gray">From:</Text>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                padding: "6px 8px",
                borderRadius: "var(--radius-2)",
                border: "1px solid var(--gray-a4)",
                fontSize: "13px",
                fontFamily: "inherit",
                color: "var(--gray-12)",
                backgroundColor: "var(--color-background)",
              }}
            />
            <Text size="1" weight="medium" color="gray">To:</Text>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                padding: "6px 8px",
                borderRadius: "var(--radius-2)",
                border: "1px solid var(--gray-a4)",
                fontSize: "13px",
                fontFamily: "inherit",
                color: "var(--gray-12)",
                backgroundColor: "var(--color-background)",
              }}
            />
            <Button
              size="1"
              variant="soft"
              onClick={() => {
                setFromDate(getDaysAgoIso(6));
                setToDate(getDaysAgoIso(0));
              }}
            >
              Reset (7 Days)
            </Button>
            <Button
              size="1"
              variant="soft"
              color="indigo"
              style={{ marginLeft: "auto" }}
              onClick={() => setPrintOpen(true)}
            >
              <PrintOutlined style={{ fontSize: 13 }} />
              Print
            </Button>
          </Flex>
        </Card>

        <Card mb="5" style={{ padding: "20px" }}>
          <Flex justify="between" align="center" mb="3">
            <Text size="3" weight="bold">Daily Sales vs Target</Text>
            <Badge color="amber" variant="soft" size="1">
              Target: {formatCurrency(targetAmount)}
            </Badge>
          </Flex>

          {rangeChart.loading ? (
            <div>Loading chart...</div>
          ) : chartData.length === 0 ? (
            <Flex justify="center" align="center" style={{ height: 200 }}>
              <Text size="2" color="gray">No data for this range</Text>
            </Flex>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-a4)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--gray-11)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v)}
                  tick={{ fontSize: 11, fill: "var(--gray-11)" }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <RechartsTooltip
                  formatter={(value, name) => {
                    const numValue = typeof value === 'number' ? value : 0;
                    if (name === "actual") {
                      const hit = numValue >= targetAmount;
                      return [
                        `${formatCurrency(numValue)} ${hit ? "\u2713 Hit" : "\u2193 Below"}`,
                        "Sales",
                      ];
                    }
                    return [formatCurrency(numValue), name as string];
                  }}
                  contentStyle={{
                    background: "var(--color-panel-solid)",
                    border: "1px solid var(--gray-a4)",
                    borderRadius: "var(--radius-2)",
                    fontSize: 12,
                  }}
                />
                <ReferenceLine
                  y={targetAmount}
                  stroke="var(--amber-10)"
                  strokeDasharray="5 3"
                  strokeWidth={2}
                  label={{
                    value: "Target",
                    position: "insideTopRight",
                    fontSize: 11,
                    fill: "var(--amber-11)",
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="actual" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.actual >= targetAmount
                          ? "var(--jade-9)"
                          : "var(--indigo-9)"
                      }
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          )}

          <Flex gap="4" mt="3" justify="center">
            <Flex align="center" gap="1">
              <Box style={{ width: 10, height: 10, borderRadius: 2, background: "var(--jade-9)" }} />
              <Text size="1" color="gray">Hit target</Text>
            </Flex>
            <Flex align="center" gap="1">
              <Box style={{ width: 10, height: 10, borderRadius: 2, background: "var(--indigo-9)" }} />
              <Text size="1" color="gray">Below target</Text>
            </Flex>
            <Flex align="center" gap="1">
              <Box style={{ width: 16, height: 2, background: "var(--amber-10)" }} />
              <Text size="1" color="gray">Target line</Text>
            </Flex>
          </Flex>
        </Card>

        <Text size="2" weight="bold" mb="3">
          Daily Performance
        </Text>
        <Box>
          <style>{dailyTargetTableStyles}</style>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <Box style={{ overflowX: "auto" }}>
              <table className="daily-target-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sales</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...rangeRows]
                    .reverse()
                    .map(({ date, label, amount }) => {
                      const isToday = date === getDaysAgoIso(0);
                      const pct =
                        amount !== null && amount > 0 && targetAmount > 0
                          ? Math.min((amount / targetAmount) * 100, 100)
                          : 0;
                      const hitTarget =
                        amount !== null &&
                        amount > 0 &&
                        targetAmount > 0 &&
                        amount >= targetAmount;

                      return (
                        <tr
                          key={date}
                          onClick={() => date && setSelectedDate(date)}
                          style={{ cursor: date ? "pointer" : "default" }}
                        >
                          <td>
                            <strong>{label}</strong>
                            {isToday && (
                              <span
                                style={{
                                  marginLeft: "8px",
                                  fontSize: 11,
                                  color: "var(--amber-11)",
                                }}
                              >
                                TODAY
                              </span>
                            )}
                          </td>
                          <td style={{ fontWeight: 500 }}>
                            {rangeChart.loading ? (
                              <Box
                                style={{
                                  width: "80px",
                                  height: "16px",
                                  background: "var(--gray-a3)",
                                  borderRadius: "var(--radius-1)",
                                  margin: "0 auto",
                                  animation: "pulse 2s infinite",
                                }}
                              />
                            ) : amount > 0 ? (
                              formatCurrency(amount)
                            ) : (
                              "\u2014"
                            )}
                          </td>
                          <td>
                            {rangeChart.loading ? (
                              <Box
                                style={{
                                  width: "120px",
                                  height: "6px",
                                  background: "var(--gray-a3)",
                                  borderRadius: "var(--radius-1)",
                                  margin: "0 auto",
                                  animation: "pulse 2s infinite",
                                }}
                              />
                            ) : amount > 0 ? (
                              <div
                                style={{
                                  height: 6,
                                  width: 120,
                                  background: "var(--gray-a3)",
                                  borderRadius: "var(--radius-2)",
                                  margin: "0 auto",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${pct}%`,
                                    background: hitTarget
                                      ? "var(--jade-10)"
                                      : "var(--indigo-10)",
                                  }}
                                />
                              </div>
                            ) : (
                              "\u2014"
                            )}
                          </td>
                          <td>
                            {rangeChart.loading ? (
                              <Box
                                style={{
                                  width: "80px",
                                  height: "20px",
                                  background: "var(--gray-a3)",
                                  borderRadius: "var(--radius-1)",
                                  margin: "0 auto",
                                  animation: "pulse 2s infinite",
                                }}
                              />
                            ) : amount > 0 ? (
                              hitTarget ? (
                                <Badge color="jade" size="1">
                                  {"\u2713"} Hit
                                </Badge>
                              ) : (
                                <Badge color="amber" size="1">
                                  {"\u25D0"} In Progress
                                </Badge>
                              )
                            ) : (
                              "\u2014"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </Box>
          </Card>
        </Box>

        <style>{keyframeStyles}</style>

        <DailyTransactionsPanel
          date={selectedDate}
          summary={selectedDateSummary}
          onClose={() => setSelectedDate(null)}
        />
      </motion.div>

      <PrintPreviewDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        title={`Daily Sales Target \u00B7 ${new Date().toLocaleDateString()}`}
      >
        <PrintableDocument
          businessName=""
          documentLabel="Daily Sales Target"
          documentNumber={new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        >
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#444", fontWeight: 700, marginBottom: 10 }}>
            Today&apos;s Performance
          </div>
          <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Box style={{ padding: "10px 12px", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 6 }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888", fontWeight: 700, marginBottom: 3 }}>Current Sales</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#4338ca" }}>{formatCurrency(currentAmount, tabCurrencyCode)}</div>
            </Box>
            <Box style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888", fontWeight: 700, marginBottom: 3 }}>Daily Target</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#334155" }}>{formatCurrency(targetAmount, tabCurrencyCode)}</div>
            </Box>
            <Box style={{ padding: "10px 12px", background: reached ? "#f0fdf4" : progressPct >= 50 ? "#fffbeb" : "#fef2f2", border: "1px solid " + (reached ? "#bbf7d0" : progressPct >= 50 ? "#fde68a" : "#fecaca"), borderRadius: 6 }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888", fontWeight: 700, marginBottom: 3 }}>Progress</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: reached ? "#16a34a" : progressPct >= 50 ? "#d97706" : "#dc2626" }}>{progressPct.toFixed(1)}%</div>
            </Box>
          </Box>
          <p style={{ fontSize: 11, color: reached ? "#16a34a" : "#64748b", marginBottom: 20, fontWeight: reached ? 600 : 400 }}>
            {reached
              ? `\u2713 Target reached \u2014 exceeded by ${formatCurrency(currentAmount - targetAmount, tabCurrencyCode)}`
              : targetAmount > 0
                ? `Remaining: ${formatCurrency(remaining, tabCurrencyCode)} to reach today's target`
                : "Daily sales target not configured"}
          </p>

          {rangeRows.length > 0 && (
            <>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#444", fontWeight: 700, marginBottom: 8 }}>
                Daily Performance \u2014 {fromDate} to {toDate}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #111" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Date</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Revenue</th>
                    {targetAmount > 0 && <th style={{ padding: "6px 8px", textAlign: "right", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>% of Target</th>}
                    {targetAmount > 0 && <th style={{ padding: "6px 8px", textAlign: "center", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Status</th>}
                  </tr>
                </thead>
                <tbody>
                  {[...rangeRows].reverse().map(({ date, label, amount }) => {
                    const isToday = date === getDaysAgoIso(0);
                    const pct = amount > 0 && targetAmount > 0 ? (amount / targetAmount) * 100 : 0;
                    const hit = amount > 0 && targetAmount > 0 && amount >= targetAmount;
                    return (
                      <tr key={date} style={{ borderBottom: "1px solid #eee", background: isToday ? "#fffbeb" : "transparent" }}>
                        <td style={{ padding: "5px 8px" }}>
                          <strong>{label}</strong>
                          {isToday && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: "#b45309", textTransform: "uppercase" }}>Today</span>}
                        </td>
                        <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 500 }}>
                          {amount > 0 ? formatCurrency(amount, tabCurrencyCode) : "\u2014"}
                        </td>
                        {targetAmount > 0 && (
                          <td style={{ padding: "5px 8px", textAlign: "right", color: hit ? "#16a34a" : "#64748b" }}>
                            {amount > 0 ? `${pct.toFixed(1)}%` : "\u2014"}
                          </td>
                        )}
                        {targetAmount > 0 && (
                          <td style={{ padding: "5px 8px", textAlign: "center" }}>
                            {amount > 0 ? (
                              <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "2px 6px", borderRadius: 3, background: hit ? "#dcfce7" : "#fef9c3", color: hit ? "#166534" : "#854d0e" }}>
                                {hit ? "\u2713 Hit" : "In Progress"}
                              </span>
                            ) : "\u2014"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #111" }}>
                    <td style={{ padding: "6px 8px", fontWeight: 700 }}>Total ({rangeRows.length} days)</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: "#4338ca" }}>
                      {formatCurrency(rangeRows.reduce((s, r) => s + (r.amount || 0), 0), tabCurrencyCode)}
                    </td>
                    {targetAmount > 0 && <td colSpan={2} />}
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </PrintableDocument>
      </PrintPreviewDialog>
    </Box>
  );
};
