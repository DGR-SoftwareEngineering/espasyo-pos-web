import React from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { PrintableDocument } from "core-lib/components/print";
import { SalesForecastResponseDto } from "core-lib/api/commons/types";
import { formatCurrency } from "../contents/procurement/format";

interface Props {
  forecast: SalesForecastResponseDto;
  currencyCode: string;
  businessName: string;
  logoUrl?: string | null;
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#888",
  fontWeight: 600,
};
const valueStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#111",
  fontWeight: 700,
  marginTop: 2,
};
const headerCellStyle: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  color: "#666",
  textAlign: "left",
  borderBottom: "2px solid #111",
  fontWeight: 700,
};
const cellStyle: React.CSSProperties = {
  padding: "7px 10px",
  fontSize: 12,
  color: "#111",
  borderBottom: "1px solid #eee",
  verticalAlign: "middle",
};

const formatShortDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export const SalesForecastPrintable: React.FC<Props> = ({
  forecast,
  currencyCode,
  businessName,
  logoUrl,
}) => {
  const trendColor =
    forecast.trendDirection === "up"
      ? "#059669"
      : forecast.trendDirection === "down"
        ? "#dc2626"
        : "#6b7280";

  const trendSign =
    forecast.trendDirection === "up"
      ? "▲"
      : forecast.trendDirection === "down"
        ? "▼"
        : "→";

  const today = new Date().toISOString().slice(0, 10);

  return (
    <PrintableDocument
      businessName={businessName}
      logoUrl={logoUrl}
      documentLabel="Sales Forecast"
      documentNumber={`${formatShortDate(forecast.forecastWeekStart)} – ${formatShortDate(forecast.forecastWeekEnd)}`}
      documentMeta={
        <Flex gap="3" wrap="wrap" justify="end">
          <Text size="1" style={{ color: "#555" }}>
            {forecast.isAiGenerated ? "AI-generated" : "Statistical prediction"}
          </Text>
          <Text size="1" style={{ color: "#555" }}>
            Generated {formatShortDate(forecast.generatedAt)}
          </Text>
        </Flex>
      }
    >
      {/* ── KPI summary ── */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Box
          style={{
            padding: "12px 14px",
            background: "#eef2ff",
            borderRadius: 6,
            border: "1px solid #c7d2fe",
          }}
        >
          <Text as="div" style={labelStyle}>
            Forecasted Revenue
          </Text>
          <Text as="div" style={{ ...valueStyle, color: "#4338ca" }}>
            {formatCurrency(forecast.totalForecastedRevenue, currencyCode)}
          </Text>
          <Text as="div" style={{ fontSize: 10, color: "#6366f1", marginTop: 2 }}>
            Next 7 days
          </Text>
        </Box>
        <Box
          style={{
            padding: "12px 14px",
            background: "#f8fafc",
            borderRadius: 6,
            border: "1px solid #e2e8f0",
          }}
        >
          <Text as="div" style={labelStyle}>
            Previous Week
          </Text>
          <Text as="div" style={valueStyle}>
            {formatCurrency(forecast.previousWeekRevenue, currencyCode)}
          </Text>
          <Text as="div" style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            Last 7 days actual
          </Text>
        </Box>
        <Box
          style={{
            padding: "12px 14px",
            background: forecast.trendDirection === "up" ? "#f0fdf4" : forecast.trendDirection === "down" ? "#fef2f2" : "#f8fafc",
            borderRadius: 6,
            border: `1px solid ${forecast.trendDirection === "up" ? "#bbf7d0" : forecast.trendDirection === "down" ? "#fecaca" : "#e2e8f0"}`,
          }}
        >
          <Text as="div" style={labelStyle}>
            Trend
          </Text>
          <Text as="div" style={{ ...valueStyle, color: trendColor }}>
            {trendSign} {forecast.trendPercent.toFixed(1)}%
          </Text>
          <Text as="div" style={{ fontSize: 10, color: trendColor, marginTop: 2, opacity: 0.8 }}>
            vs previous week
          </Text>
        </Box>
      </Box>

      {/* ── AI Insight ── */}
      {forecast.insight && (
        <Box
          mb="4"
          style={{
            padding: "12px 14px",
            background: forecast.isAiGenerated ? "#fffbeb" : "#eff6ff",
            border: `1px solid ${forecast.isAiGenerated ? "#fde68a" : "#bfdbfe"}`,
            borderRadius: 6,
          }}
        >
          <Text
            as="div"
            style={{
              ...labelStyle,
              color: forecast.isAiGenerated ? "#92400e" : "#1d4ed8",
              marginBottom: 6,
            }}
          >
            {forecast.isAiGenerated ? "AI Insight" : "Statistical Prediction"}
          </Text>
          <Text
            as="div"
            style={{ fontSize: 12, color: "#111", lineHeight: 1.6 }}
          >
            {forecast.insight}
          </Text>
        </Box>
      )}

      {/* ── Daily breakdown table ── */}
      <Heading size="3" mb="2" style={{ color: "#111" }}>
        Daily Breakdown
      </Heading>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr>
            <th style={headerCellStyle}>Date</th>
            <th style={headerCellStyle}>Day</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Actual Revenue</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Forecasted Revenue</th>
            <th style={{ ...headerCellStyle, textAlign: "center" }}>Type</th>
          </tr>
        </thead>
        <tbody>
          {forecast.days.map((day) => {
            const isFuture = day.actualRevenue === null;
            const isToday = day.date === today;
            const rowBg = isToday
              ? "#fffbeb"
              : isFuture
                ? "#eef2ff"
                : "transparent";
            return (
              <tr key={day.date} style={{ background: rowBg }}>
                <td style={cellStyle}>
                  <span style={{ fontWeight: isToday ? 700 : 400 }}>
                    {formatShortDate(day.date)}
                  </span>
                  {isToday && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#b45309",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Today
                    </span>
                  )}
                </td>
                <td style={cellStyle}>{day.dayOfWeek}</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {day.actualRevenue !== null
                    ? formatCurrency(day.actualRevenue, currencyCode)
                    : <span style={{ color: "#ccc" }}>—</span>}
                </td>
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {isFuture
                    ? <span style={{ color: "#4338ca", fontWeight: 600 }}>{formatCurrency(day.forecastedRevenue, currencyCode)}</span>
                    : <span style={{ color: "#ccc" }}>—</span>}
                </td>
                <td style={{ ...cellStyle, textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      padding: "2px 6px",
                      borderRadius: 3,
                      background: isFuture ? "#e0e7ff" : "#dcfce7",
                      color: isFuture ? "#4338ca" : "#166534",
                    }}
                  >
                    {isFuture ? "Forecast" : "Actual"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Text as="div" style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>
        * Forecasts are based on {forecast.isAiGenerated ? "AI analysis of historical patterns" : "statistical trend analysis"}.
        Actual results may vary.
      </Text>
    </PrintableDocument>
  );
};
