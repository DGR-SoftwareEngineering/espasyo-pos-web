import React, { useMemo, useState } from "react";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { CashierShiftDto, ShiftSummaryDto } from "core-lib/api/commons/types";
import { formatCurrency } from "core-lib/business/strings";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  IconButton,
  ScrollArea,
  Separator,
  Skeleton,
  Table,
  Text,
} from "@radix-ui/themes";
import {
  AccessTimeOutlined,
  CalendarTodayOutlined,
  CheckCircleOutlined,
  GroupOutlined,
  HourglassEmptyOutlined,
  OpenInNewOutlined,
  PrintOutlined,
} from "@mui/icons-material";
import { PrintPreviewDialog } from "core-lib/components/print";
import { PrintableDocument } from "core-lib/components/print";
import { ShiftDetailView } from "../contents/shift-management/list/ShiftDetailView";

// ── Helpers ──────────────────────────────────────────────────────────────────

const todayIso = () => new Date().toISOString().slice(0, 10);

const daysAgoIso = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const calcDuration = (openedAt: string, closedAt: string | null): string => {
  if (!closedAt) return "—";
  const ms = new Date(closedAt).getTime() - new Date(openedAt).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
};

const DATE_INPUT_STYLE: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 6,
  border: "1px solid var(--gray-a6)",
  background: "var(--color-panel-solid)",
  color: "var(--gray-12)",
  fontSize: 13,
  outline: "none",
};

// ── Sub-components ────────────────────────────────────────────────────────────

const ShiftKpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "indigo" | "green" | "gray" | "blue";
}> = ({ icon, label, value, accent }) => (
  <Card
    variant="surface"
    style={{
      background: `var(--${accent}-a2)`,
      border: `1px solid var(--${accent}-a4)`,
    }}
  >
    <Flex align="center" gap="2" mb="1">
      <Box style={{ color: `var(--${accent}-11)`, display: "flex", fontSize: 16 }}>
        {icon}
      </Box>
      <Text
        size="1"
        color="gray"
        weight="medium"
        style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        {label}
      </Text>
    </Flex>
    <Text size="5" weight="bold" style={{ color: `var(--${accent}-12)` }}>
      {value}
    </Text>
  </Card>
);

// ── Main Component ────────────────────────────────────────────────────────────

export const ShiftDetailsTab: React.FC = () => {
  const [fromDate, setFromDate] = useState(daysAgoIso(30));
  const [toDate, setToDate] = useState(todayIso());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<ShiftSummaryDto | null>(null);
  const [selectedShiftNum, setSelectedShiftNum] = useState("");

  const shiftsData = useApi((api) => api.commons.listShifts(), []);
  const loadDetailCb = useApiCallback((api, id: string) => api.commons.getShiftById(id));

  const allShifts: CashierShiftDto[] = useMemo(
    () => shiftsData.result?.data?.response ?? [],
    [shiftsData.result],
  );

  const filteredShifts = useMemo(
    () =>
      allShifts.filter((s) => {
        const d = s.openedAt.slice(0, 10);
        return d >= fromDate && d <= toDate;
      }),
    [allShifts, fromDate, toDate],
  );

  // ── KPIs ──
  const totalShifts = filteredShifts.length;
  const openShifts = filteredShifts.filter((s) => s.status === "Open").length;
  const closedShifts = filteredShifts.filter((s) => s.status === "Closed").length;

  const avgDuration = useMemo(() => {
    const closed = filteredShifts.filter((s) => !!s.closedAt);
    if (!closed.length) return null;
    const totalMs = closed.reduce(
      (sum, s) =>
        sum + (new Date(s.closedAt!).getTime() - new Date(s.openedAt).getTime()),
      0,
    );
    const avg = totalMs / closed.length;
    return `${Math.floor(avg / 3_600_000)}h ${Math.floor((avg % 3_600_000) / 60_000)}m`;
  }, [filteredShifts]);

  const handleView = async (shift: CashierShiftDto) => {
    setSelectedShiftNum(shift.shiftNumber);
    setSelectedSummary(null);
    setDetailLoading(true);
    setDialogOpen(true);
    try {
      const res = await loadDetailCb.execute(shift.cashierShiftID);
      setSelectedSummary(res?.data?.response ?? null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Box>
      {/* ── KPI Row ── */}
      <Grid columns={{ initial: "2", sm: "4" }} gap="3" mb="5">
        <ShiftKpiCard
          icon={<GroupOutlined fontSize="small" />}
          label="Total Shifts"
          value={String(totalShifts)}
          accent="indigo"
        />
        <ShiftKpiCard
          icon={<HourglassEmptyOutlined fontSize="small" />}
          label="Active Now"
          value={String(openShifts)}
          accent="green"
        />
        <ShiftKpiCard
          icon={<CheckCircleOutlined fontSize="small" />}
          label="Completed"
          value={String(closedShifts)}
          accent="gray"
        />
        <ShiftKpiCard
          icon={<AccessTimeOutlined fontSize="small" />}
          label="Avg Duration"
          value={avgDuration ?? "—"}
          accent="blue"
        />
      </Grid>

      {/* ── Date Range Filter ── */}
      <Card variant="surface" mb="4" style={{ background: "var(--gray-a2)" }}>
        <Flex align="center" gap="3" wrap="wrap">
          <CalendarTodayOutlined style={{ fontSize: 16, color: "var(--gray-11)" }} />
          <Text size="2" color="gray" weight="medium">
            Date Range
          </Text>
          <Flex align="center" gap="2" wrap="wrap">
            <input
              type="date"
              value={fromDate}
              max={toDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={DATE_INPUT_STYLE}
            />
            <Text size="2" color="gray">
              to
            </Text>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={todayIso()}
              onChange={(e) => setToDate(e.target.value)}
              style={DATE_INPUT_STYLE}
            />
          </Flex>
          <Button
            size="1"
            variant="soft"
            color="gray"
            onClick={() => {
              setFromDate(daysAgoIso(30));
              setToDate(todayIso());
            }}
          >
            Reset
          </Button>
          <Text size="1" color="gray" style={{ marginLeft: "auto" }}>
            {filteredShifts.length} shift{filteredShifts.length !== 1 ? "s" : ""}
          </Text>
          <Button
            size="1"
            variant="soft"
            color="indigo"
            onClick={() => setPrintOpen(true)}
          >
            <PrintOutlined style={{ fontSize: 13 }} />
            Print
          </Button>
        </Flex>
      </Card>

      {/* ── Shifts Table ── */}
      <Card variant="surface">
        {shiftsData.loading ? (
          <Flex direction="column" gap="2" p="3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height="40px" />
            ))}
          </Flex>
        ) : filteredShifts.length === 0 ? (
          <Flex align="center" justify="center" py="6">
            <Text size="2" color="gray">
              No shifts found for the selected date range.
            </Text>
          </Flex>
        ) : (
          <ScrollArea>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Shift #</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Cashier</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Opened At</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Closed At</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Opening Cash</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Duration</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredShifts.map((shift) => (
                  <Table.Row
                    key={shift.cashierShiftID}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleView(shift)}
                  >
                    <Table.Cell>
                      <Badge variant="soft" color="indigo">
                        {shift.shiftNumber}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{shift.cashierName}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={shift.status === "Open" ? "green" : "gray"}
                        variant="soft"
                      >
                        {shift.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{fmtDateTime(shift.openedAt)}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2" color={shift.closedAt ? undefined : "gray"}>
                        {shift.closedAt ? fmtDateTime(shift.closedAt) : "—"}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{formatCurrency(shift.openingCash)}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2" color="gray">
                        {calcDuration(shift.openedAt, shift.closedAt)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="indigo"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(shift);
                        }}
                      >
                        <OpenInNewOutlined style={{ fontSize: 14 }} />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </ScrollArea>
        )}
      </Card>

      {/* ── Print Preview ── */}
      <PrintPreviewDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        title={`Shift Details · ${fromDate} to ${toDate}`}
      >
        <PrintableDocument
          businessName="Shift Report"
          documentLabel="Shift Details"
          documentNumber={`${fromDate} – ${toDate}`}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #111" }}>
                <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Shift #</th>
                <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Cashier</th>
                <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Opened At</th>
                <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Closed At</th>
                <th style={{ padding: "6px 8px", textAlign: "right", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Opening Cash</th>
                <th style={{ padding: "6px 8px", textAlign: "right", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map((shift) => (
                <tr key={shift.cashierShiftID} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "6px 8px", fontWeight: 600, color: "#4338ca" }}>{shift.shiftNumber}</td>
                  <td style={{ padding: "6px 8px" }}>{shift.cashierName}</td>
                  <td style={{ padding: "6px 8px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 6px", borderRadius: 3, background: shift.status === "Open" ? "#dcfce7" : "#f1f5f9", color: shift.status === "Open" ? "#166534" : "#475569" }}>
                      {shift.status}
                    </span>
                  </td>
                  <td style={{ padding: "6px 8px" }}>{fmtDateTime(shift.openedAt)}</td>
                  <td style={{ padding: "6px 8px", color: shift.closedAt ? "#111" : "#aaa" }}>{shift.closedAt ? fmtDateTime(shift.closedAt) : "—"}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right" }}>{formatCurrency(shift.openingCash)}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", color: "#64748b" }}>{calcDuration(shift.openedAt, shift.closedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredShifts.length === 0 && (
            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, marginTop: 16 }}>
              No shifts found for the selected date range.
            </p>
          )}
          <p style={{ marginTop: 12, fontSize: 10, color: "#94a3b8" }}>
            Total: {filteredShifts.length} shift{filteredShifts.length !== 1 ? "s" : ""} ·
            Active: {openShifts} · Completed: {closedShifts} · Avg duration: {avgDuration ?? "—"}
          </p>
        </PrintableDocument>
      </PrintPreviewDialog>

      {/* ── Detail Dialog ── */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content maxWidth="520px">
          <Dialog.Title>
            Shift {selectedShiftNum}
          </Dialog.Title>
          <Separator size="4" mb="4" />

          {detailLoading ? (
            <Flex direction="column" gap="3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height="80px" />
              ))}
            </Flex>
          ) : selectedSummary ? (
            <ShiftDetailView summary={selectedSummary} />
          ) : (
            <Flex align="center" justify="center" py="4">
              <Text size="2" color="gray">
                Could not load shift details.
              </Text>
            </Flex>
          )}

          <Flex justify="end" mt="4">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Close
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};
