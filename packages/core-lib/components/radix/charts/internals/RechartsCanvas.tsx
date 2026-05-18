"use client";

import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "../ChartTooltip";
import { formatAxisTick } from "../format";
import { resolveSeriesColors, resolveSliceColors } from "../palette";
import {
  ChartNumberFormat,
  ChartPoint,
  ChartSeries,
  ChartType,
  DonutSlice,
} from "../types";

interface Props {
  type: ChartType;
  series?: ChartSeries[];
  points?: ChartPoint[];
  slices?: DonutSlice[];
  numberFormat?: ChartNumberFormat;
  customColors?: string[];
  height: number;
  hiddenSeries?: Set<string>;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const AXIS_TICK_STYLE = {
  fill: "var(--gray-11)",
  fontSize: 11,
} as const;

const GRID_STROKE = "var(--gray-a4)";

const buildCartesianData = (points: ChartPoint[]) =>
  points.map((p) => ({ label: p.label, ...p.values }));

export const RechartsCanvas: React.FC<Props> = ({
  type,
  series = [],
  points = [],
  slices = [],
  numberFormat,
  customColors,
  height,
  hiddenSeries,
  xAxisLabel,
  yAxisLabel,
}) => {
  if (type === "donut") {
    const sliceColors = resolveSliceColors(slices, customColors);
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="86%"
            paddingAngle={2}
            stroke="var(--color-panel-solid)"
            strokeWidth={2}
            isAnimationActive
          >
            {slices.map((slice) => (
              <Cell
                key={slice.id}
                fill={sliceColors.get(slice.id) ?? "var(--gray-9)"}
              />
            ))}
          </Pie>
          <RechartsTooltip
            content={
              <ChartTooltip numberFormat={numberFormat} />
            }
            cursor={{ fill: "var(--gray-a3)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const seriesColors = resolveSeriesColors(series, customColors);
  const data = buildCartesianData(points);
  const visibleSeries = series.filter((s) => !hiddenSeries?.has(s.id));

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK_STYLE}
            tickLine={false}
            axisLine={{ stroke: GRID_STROKE }}
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: "insideBottom", offset: -2, fill: "var(--gray-11)", fontSize: 11 }
                : undefined
            }
          />
          <YAxis
            tick={AXIS_TICK_STYLE}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatAxisTick(v, numberFormat)}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: "insideLeft", fill: "var(--gray-11)", fontSize: 11 }
                : undefined
            }
          />
          <RechartsTooltip
            cursor={{ fill: "var(--gray-a3)" }}
            content={
              <ChartTooltip numberFormat={numberFormat} series={series} />
            }
          />
          {visibleSeries.map((s) => (
            <Bar
              key={s.id}
              dataKey={s.id}
              name={s.name}
              fill={seriesColors.get(s.id) ?? "var(--gray-9)"}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              isAnimationActive
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => {
              const color = seriesColors.get(s.id) ?? "var(--gray-9)";
              return (
                <linearGradient
                  key={s.id}
                  id={`area-fill-${s.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK_STYLE}
            tickLine={false}
            axisLine={{ stroke: GRID_STROKE }}
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: "insideBottom", offset: -2, fill: "var(--gray-11)", fontSize: 11 }
                : undefined
            }
          />
          <YAxis
            tick={AXIS_TICK_STYLE}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatAxisTick(v, numberFormat)}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: "insideLeft", fill: "var(--gray-11)", fontSize: 11 }
                : undefined
            }
          />
          <RechartsTooltip
            cursor={{ stroke: "var(--gray-a6)", strokeWidth: 1 }}
            content={
              <ChartTooltip numberFormat={numberFormat} series={series} />
            }
          />
          {visibleSeries.map((s) => {
            const color = seriesColors.get(s.id) ?? "var(--gray-9)";
            return (
              <Area
                key={s.id}
                type="monotone"
                dataKey={s.id}
                name={s.name}
                stroke={color}
                strokeWidth={2}
                fill={`url(#area-fill-${s.id})`}
                fillOpacity={1}
                stackId={series.length > 1 ? "stack" : undefined}
                isAnimationActive
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Default: line
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={AXIS_TICK_STYLE}
          tickLine={false}
          axisLine={{ stroke: GRID_STROKE }}
          label={
            xAxisLabel
              ? { value: xAxisLabel, position: "insideBottom", offset: -2, fill: "var(--gray-11)", fontSize: 11 }
              : undefined
          }
        />
        <YAxis
          tick={AXIS_TICK_STYLE}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => formatAxisTick(v, numberFormat)}
          label={
            yAxisLabel
              ? { value: yAxisLabel, angle: -90, position: "insideLeft", fill: "var(--gray-11)", fontSize: 11 }
              : undefined
          }
        />
        <RechartsTooltip
          cursor={{ stroke: "var(--gray-a6)", strokeWidth: 1 }}
          content={
            <ChartTooltip numberFormat={numberFormat} series={series} />
          }
        />
        {visibleSeries.map((s) => {
          const color = seriesColors.get(s.id) ?? "var(--gray-9)";
          return (
            <Line
              key={s.id}
              type="monotone"
              dataKey={s.id}
              name={s.name}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, fill: "var(--color-panel-solid)", stroke: color }}
              activeDot={{ r: 5 }}
              isAnimationActive
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};
