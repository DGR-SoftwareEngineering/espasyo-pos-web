import { PromoDto, PromoStatus } from "core-lib/api/commons/types";
import { FeatureConfigBuilder } from "core-lib/core/types/constants/feature-config.builder";

export const STATUS_CONFIG: Record<
  PromoStatus,
  { label: string; color: "gray" | "green" | "orange" | "blue" | "red" }
> = {
  Draft: { label: "Draft", color: "gray" },
  Active: { label: "Active", color: "green" },
  Inactive: { label: "Inactive", color: "orange" },
  Scheduled: { label: "Scheduled", color: "blue" },
  Expired: { label: "Expired", color: "red" },
};

export const TYPE_CONFIG: Record<
  number,
  { label: string; description: string; shortLabel: string }
> = {
  1: {
    label: "Percentage Discount",
    shortLabel: "% Discount",
    description: "Reduce the price by a percentage of the original",
  },
  2: {
    label: "Fixed Discount",
    shortLabel: "Fixed Off",
    description: "Subtract a flat amount from the original price",
  },
  3: {
    label: "Buy X Get Y",
    shortLabel: "Buy X Get Y",
    description: "Customer buys X units and gets Y units free",
  },
  4: {
    label: "Bundle",
    shortLabel: "Bundle",
    description: "Group of products sold at a fixed bundle price",
  },
};

export const PROMO_TYPE_INT = {
  PercentageDiscount: 1,
  FixedDiscount: 2,
  BuyXGetY: 3,
  Bundle: 4,
} as const;

export const PROMO_TYPE_INT_TO_STRING: Record<number, string> = {
  1: "PercentageDiscount",
  2: "FixedDiscount",
  3: "BuyXGetY",
  4: "Bundle",
};

export const STATUS_TABS = [
  "all",
  "Active",
  "Draft",
  "Scheduled",
  "Inactive",
  "Expired",
] as const;

export type StatusFilter = (typeof STATUS_TABS)[number];

export const DIALOG_TITLES = {
  create: "New Promo",
  view: "Promo Details",
};

export const SUBMISSION_KEYS = {
  create: "promo.create",
};

const config = new FeatureConfigBuilder<PromoDto>("Promo")
  .setTableHeaders([
    { id: "title",           name: "Title",        width: "22%", sortable: true,  align: "left"   },
    { id: "type",            name: "Type",          width: "14%", sortable: false, align: "center" },
    { id: "status",          name: "Status",        width: "11%", sortable: true,  align: "center" },
    { id: "promoPrice",      name: "Promo Price",   width: "12%", sortable: true,  align: "center" },
    { id: "estimatedMargin", name: "Margin %",      width: "10%", sortable: true,  align: "center" },
    { id: "startDate",       name: "Schedule",      width: "17%", sortable: false, align: "left"   },
    { id: "actions",         name: "Actions",       width: "14%", sortable: false, align: "right"  },
  ])
  .build();

export const TABLE_HEADERS = config.TABLE_HEADERS;
