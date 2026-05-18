import React from "react";
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Popover,
  ScrollArea,
  SegmentedControl,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  CalendarIcon,
  Cross2Icon,
  MixerHorizontalIcon,
} from "@radix-ui/react-icons";
import {
  GROUP_BY_OPTIONS,
  PERIOD_PRESETS,
} from "./constants";
import { ChartGroupBy, ChartPeriod } from "./types";

export interface ProductOption {
  id: string;
  name: string;
}

export interface ChartFiltersState {
  period: ChartPeriod;
  fromDate?: string;
  toDate?: string;
  groupBy?: ChartGroupBy;
  productIds?: string[];
}

interface Props {
  state: ChartFiltersState;
  onChange: (next: ChartFiltersState) => void;
  /** Which controls to render. Default: period + groupBy. */
  enable?: {
    period?: boolean;
    groupBy?: boolean;
    products?: boolean;
  };
  productOptions?: ProductOption[];
  /** Periods to show as quick chips. Falls back to all presets. */
  quickPeriods?: ChartPeriod[];
}

const DEFAULT_ENABLE = { period: true, groupBy: true, products: false };
const DEFAULT_QUICK: ChartPeriod[] = ["today", "7d", "30d", "90d", "year"];

/**
 * Windows where `groupBy=hour` would produce too many buckets — backend
 * rejects these with a 400. We disable the option client-side so users
 * don't see the round-trip error.
 *
 * `today` and `yesterday` are 1-day windows → always allowed.
 * `7d` is exactly 7 days → at the limit, allowed.
 * `custom` is checked dynamically by date span.
 * Everything else is wider → blocked.
 */
const HOUR_BUCKET_ALLOWED: ReadonlySet<ChartPeriod> = new Set<ChartPeriod>([
  "today",
  "yesterday",
  "7d",
]);

const isCustomWithinHourLimit = (
  fromDate: string | undefined,
  toDate: string | undefined,
): boolean => {
  if (!fromDate || !toDate) return false;
  const from = new Date(fromDate).getTime();
  const to = new Date(toDate).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return false;
  const days = (to - from) / (24 * 60 * 60 * 1000);
  return days >= 0 && days <= 6.5;
};

export const ChartFilters: React.FC<Props> = ({
  state,
  onChange,
  enable = DEFAULT_ENABLE,
  productOptions = [],
  quickPeriods = DEFAULT_QUICK,
}) => {
  const enabled = { ...DEFAULT_ENABLE, ...enable };

  const quickPresets = PERIOD_PRESETS.filter((p) =>
    quickPeriods.includes(p.value),
  );

  const setPeriod = (value: ChartPeriod) => {
    const preset = PERIOD_PRESETS.find((p) => p.value === value);
    onChange({
      ...state,
      period: value,
      groupBy: preset?.defaultGroupBy ?? state.groupBy,
    });
  };

  const setGroupBy = (value: ChartGroupBy) =>
    onChange({ ...state, groupBy: value });

  const toggleProduct = (id: string) => {
    const current = new Set(state.productIds ?? []);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    onChange({ ...state, productIds: Array.from(current) });
  };

  const clearProducts = () =>
    onChange({ ...state, productIds: undefined });

  const isCustom = state.period === "custom";
  const productCount = state.productIds?.length ?? 0;

  return (
    <Flex align="center" gap="2" wrap="wrap">
      {enabled.period && (
        <SegmentedControl.Root
          size="1"
          value={quickPresets.find((p) => p.value === state.period) ? state.period : ""}
          onValueChange={(v) => v && setPeriod(v as ChartPeriod)}
        >
          {quickPresets.map((preset) => (
            <SegmentedControl.Item key={preset.value} value={preset.value}>
              {preset.shortLabel}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      )}

      {enabled.period && (
        <Popover.Root>
          <Popover.Trigger>
            <IconButton
              variant={isCustom ? "soft" : "ghost"}
              color="gray"
              size="1"
              aria-label="Custom range"
            >
              <CalendarIcon />
            </IconButton>
          </Popover.Trigger>
          <Popover.Content size="1" style={{ width: 260 }}>
            <Flex direction="column" gap="2">
              <Text size="1" weight="medium">
                Custom range
              </Text>
              <TextField.Root
                size="1"
                type="date"
                value={state.fromDate ?? ""}
                onChange={(e) => {
                  const fromDate = e.target.value || undefined;
                  const nextGroupBy =
                    state.groupBy === "hour" &&
                    !isCustomWithinHourLimit(fromDate, state.toDate)
                      ? "day"
                      : state.groupBy;
                  onChange({
                    ...state,
                    period: "custom",
                    fromDate,
                    groupBy: nextGroupBy,
                  });
                }}
              />
              <TextField.Root
                size="1"
                type="date"
                value={state.toDate ?? ""}
                onChange={(e) => {
                  const toDate = e.target.value || undefined;
                  const nextGroupBy =
                    state.groupBy === "hour" &&
                    !isCustomWithinHourLimit(state.fromDate, toDate)
                      ? "day"
                      : state.groupBy;
                  onChange({
                    ...state,
                    period: "custom",
                    toDate,
                    groupBy: nextGroupBy,
                  });
                }}
              />
            </Flex>
          </Popover.Content>
        </Popover.Root>
      )}

      {enabled.groupBy && (
        <Select.Root
          size="1"
          value={state.groupBy ?? "day"}
          onValueChange={(v) => setGroupBy(v as ChartGroupBy)}
        >
          <Select.Trigger variant="soft" color="gray" />
          <Select.Content>
            {GROUP_BY_OPTIONS.map((opt) => {
              const isHour = opt.value === "hour";
              const hourAllowed =
                HOUR_BUCKET_ALLOWED.has(state.period) ||
                (state.period === "custom" &&
                  isCustomWithinHourLimit(state.fromDate, state.toDate));
              const disabled = isHour && !hourAllowed;
              return (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={disabled}
                >
                  {opt.label}
                  {disabled ? " (window > 7d)" : ""}
                </Select.Item>
              );
            })}
          </Select.Content>
        </Select.Root>
      )}

      {enabled.products && productOptions.length > 0 && (
        <Popover.Root>
          <Popover.Trigger>
            <IconButton
              variant={productCount > 0 ? "soft" : "ghost"}
              color={productCount > 0 ? "indigo" : "gray"}
              size="1"
              aria-label="Filter products"
            >
              <MixerHorizontalIcon />
            </IconButton>
          </Popover.Trigger>
          <Popover.Content size="1" style={{ width: 260 }}>
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="1" weight="medium">
                  Filter by product
                </Text>
                {productCount > 0 && (
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    onClick={clearProducts}
                    aria-label="Clear product filter"
                  >
                    <Cross2Icon />
                  </IconButton>
                )}
              </Flex>
              <ScrollArea style={{ maxHeight: 200 }}>
                <Box pr="2">
                  <Flex direction="column" gap="1">
                    {productOptions.map((p) => {
                      const checked = state.productIds?.includes(p.id) ?? false;
                      return (
                        <Flex
                          key={p.id}
                          align="center"
                          gap="2"
                          py="1"
                          px="1"
                          style={{
                            cursor: "pointer",
                            borderRadius: "var(--radius-2)",
                            background: checked
                              ? "var(--accent-a3)"
                              : "transparent",
                          }}
                          onClick={() => toggleProduct(p.id)}
                        >
                          <Box
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 3,
                              border: "1.5px solid var(--gray-a7)",
                              background: checked
                                ? "var(--accent-9)"
                                : "transparent",
                              flexShrink: 0,
                            }}
                          />
                          <Text size="1" truncate>
                            {p.name}
                          </Text>
                        </Flex>
                      );
                    })}
                  </Flex>
                </Box>
              </ScrollArea>
            </Flex>
          </Popover.Content>
        </Popover.Root>
      )}

      {productCount > 0 && (
        <Badge color="indigo" variant="soft" radius="full">
          {productCount} product{productCount === 1 ? "" : "s"}
        </Badge>
      )}
    </Flex>
  );
};
