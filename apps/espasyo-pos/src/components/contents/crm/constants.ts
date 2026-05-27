import { CustomerSegment } from "core-lib/api/crm";

export type SegmentBadgeColor =
  | "blue"
  | "green"
  | "amber"
  | "gray"
  | "red";

export interface SegmentVisualConfig {
  label: string;
  color: SegmentBadgeColor;
  /** MUI icon name from @mui/icons-material used to look up the actual component in components/SegmentBadge */
  iconKey:
    | "NewReleasesOutlined"
    | "RepeatOutlined"
    | "StarOutlined"
    | "ScheduleOutlined"
    | "WarningAmberOutlined";
  description: string;
}

export const SEGMENT_CONFIG: Record<CustomerSegment, SegmentVisualConfig> = {
  [CustomerSegment.New]: {
    label: "New",
    color: "blue",
    iconKey: "NewReleasesOutlined",
    description: "Joined within the last 30 days, fewer than 5 visits.",
  },
  [CustomerSegment.Regular]: {
    label: "Regular",
    color: "green",
    iconKey: "RepeatOutlined",
    description: "5+ visits, last visit within 60 days.",
  },
  [CustomerSegment.VIP]: {
    label: "VIP",
    color: "amber",
    iconKey: "StarOutlined",
    description: "Lifetime spend ≥ ₱5,000 or 24+ visits.",
  },
  [CustomerSegment.Occasional]: {
    label: "Occasional",
    color: "gray",
    iconKey: "ScheduleOutlined",
    description: "Fewer than 5 visits and joined more than 30 days ago.",
  },
  [CustomerSegment.AtRisk]: {
    label: "At Risk",
    color: "red",
    iconKey: "WarningAmberOutlined",
    description: "Was Regular/VIP but hasn't visited in 30+ days.",
  },
};

/** Numeric segment values for typed tab filters. */
export const SEGMENT_FILTER_VALUES = [
  "all",
  CustomerSegment.New,
  CustomerSegment.Regular,
  CustomerSegment.VIP,
  CustomerSegment.Occasional,
  CustomerSegment.AtRisk,
] as const;

export type SegmentFilter = (typeof SEGMENT_FILTER_VALUES)[number];

export const DIALOG_TITLES = {
  create: "New Customer",
  edit: "Edit Customer",
  view: "Customer Details",
  delete: "Delete Customer",
  addNote: "Add Note",
  editTags: "Edit Tags",
  addStamp: "Add Loyalty Stamp",
  removeStamp: "Remove Loyalty Stamp",
  redeemReward: "Redeem Free Drink",
} as const;

export const SUBMISSION_KEYS = {
  create: "customer.create",
  edit: "customer.edit",
} as const;

export const TABLE_HEADERS = [
  { id: "customerNumber", name: "Customer #", width: "12%", sortable: false, align: "left" as const },
  { id: "fullName", name: "Name", width: "20%", sortable: true, align: "left" as const },
  { id: "contact", name: "Contact", width: "18%", sortable: false, align: "left" as const },
  { id: "segment", name: "Segment", width: "10%", sortable: false, align: "center" as const },
  { id: "loyaltyStamps", name: "Loyalty", width: "10%", sortable: true, align: "center" as const },
  { id: "totalVisits", name: "Visits", width: "8%", sortable: true, align: "center" as const },
  { id: "totalSpend", name: "Spend", width: "10%", sortable: true, align: "right" as const },
  { id: "actions", name: "Actions", width: "12%", sortable: false, align: "right" as const },
];

export const PURCHASES_TABLE_HEADERS = [
  { id: "saleNumber", name: "Sale #", width: "20%", sortable: false, align: "left" as const },
  { id: "completedAt", name: "Date", width: "24%", sortable: false, align: "left" as const },
  { id: "itemCount", name: "Items", width: "12%", sortable: false, align: "center" as const },
  { id: "totalAmount", name: "Total", width: "16%", sortable: false, align: "right" as const },
  { id: "status", name: "Status", width: "14%", sortable: false, align: "center" as const },
  { id: "actions", name: "", width: "14%", sortable: false, align: "right" as const },
];

/** Default chip suggestions inside EditTagsDialog autocomplete. */
export const SUGGESTED_TAGS = [
  "VIP",
  "Coffee Lover",
  "Tea Lover",
  "Birthday Customer",
  "Loyal",
  "Office",
  "Student",
  "Vegan",
  "Decaf",
  "Allergic",
];

/** Visual constants for the loyalty card. */
export const LOYALTY_TOTAL_SLOTS = 12;
export const LOYALTY_REWARD_SLOTS = [6, 12] as const;
export const BUSINESS_NAME = "E'spasyo Coffee House";
export const BUSINESS_LOGO_SRC = "/espasyo-logo.png";
