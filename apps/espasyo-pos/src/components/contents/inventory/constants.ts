import {
  CheckCircleOutlined,
  WarningAmberOutlined,
  ErrorOutlineOutlined,
  RemoveShoppingCartOutlined,
  AddCircleOutline,
  Inventory2Outlined,
  AutorenewOutlined,
  DeleteSweepOutlined,
  AssignmentReturnedOutlined,
  SwapHorizOutlined,
  RestaurantMenuOutlined,
} from "@mui/icons-material";
import {
  InventoryDto,
  InventoryStatus,
  StockMovementType,
} from "core-lib/api/commons/types";
import { FeatureConfigBuilder } from "core-lib/core/types/constants/feature-config.builder";

export const STATUS_CONFIG = {
  [InventoryStatus.InStock]: {
    label: "In Stock",
    color: "success" as const,
    icon: CheckCircleOutlined,
  },
  [InventoryStatus.LowStock]: {
    label: "Low Stock",
    color: "warning" as const,
    icon: WarningAmberOutlined,
  },
  [InventoryStatus.Critical]: {
    label: "Critical",
    color: "error" as const,
    icon: ErrorOutlineOutlined,
  },
  [InventoryStatus.OutOfStock]: {
    label: "Out of Stock",
    color: "error" as const,
    icon: RemoveShoppingCartOutlined,
  },
} as const;

export const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: InventoryStatus.InStock, label: "In Stock" },
  { value: InventoryStatus.LowStock, label: "Low Stock" },
  { value: InventoryStatus.Critical, label: "Critical" },
  { value: InventoryStatus.OutOfStock, label: "Out of Stock" },
];

export const MOVEMENT_TYPE_CONFIG = {
  [StockMovementType.Sale]: {
    label: "Sale",
    color: "primary" as const,
    icon: RestaurantMenuOutlined,
    direction: "out" as const,
  },
  [StockMovementType.Return]: {
    label: "Return",
    color: "info" as const,
    icon: AssignmentReturnedOutlined,
    direction: "in" as const,
  },
  [StockMovementType.Received]: {
    label: "Received",
    color: "success" as const,
    icon: AddCircleOutline,
    direction: "in" as const,
  },
  [StockMovementType.Wastage]: {
    label: "Wastage",
    color: "error" as const,
    icon: DeleteSweepOutlined,
    direction: "out" as const,
  },
  [StockMovementType.Adjustment]: {
    label: "Adjustment",
    color: "warning" as const,
    icon: AutorenewOutlined,
    direction: "any" as const,
  },
  [StockMovementType.Transfer]: {
    label: "Transfer",
    color: "secondary" as const,
    icon: SwapHorizOutlined,
    direction: "any" as const,
  },
  [StockMovementType.Production]: {
    label: "Production",
    color: "info" as const,
    icon: Inventory2Outlined,
    direction: "out" as const,
  },
} as const;

export const MOVEMENT_TYPE_OPTIONS = [
  { value: "all", label: "All Movement Types" },
  { value: StockMovementType.Sale, label: "Sale" },
  { value: StockMovementType.Return, label: "Return" },
  { value: StockMovementType.Received, label: "Received" },
  { value: StockMovementType.Wastage, label: "Wastage" },
  { value: StockMovementType.Adjustment, label: "Adjustment" },
  { value: StockMovementType.Transfer, label: "Transfer" },
  { value: StockMovementType.Production, label: "Production" },
];

export const ADJUSTMENT_REASON_PRESETS = [
  "Received from supplier",
  "Wastage - expired",
  "Wastage - damaged",
  "Inventory recount",
  "Opening balance",
  "Manual correction",
] as const;

export const ADJUST_DIRECTION_OPTIONS = [
  {
    value: "in" as const,
    label: "Stock In",
    description: "Add to current stock",
    selectedColor: "success" as const,
  },
  {
    value: "out" as const,
    label: "Stock Out",
    description: "Remove from current stock",
    selectedColor: "error" as const,
  },
];

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export const PLACEHOLDERS = {
  productSearch: "Search ingredient by name…",
  currentQuantity: "e.g., 100",
  reorderLevel: "e.g., 20",
  minimumStockLevel: "e.g., 5",
  adjustAmount: "e.g., 10",
  adjustReason: "Why is this adjustment being made?",
} as const;

const config = new FeatureConfigBuilder<InventoryDto>("Inventory")
  .setTableHeaders([
    {
      id: "product",
      name: "Ingredient",
      width: "28%",
      sortable: true,
      align: "left",
    },
    {
      id: "currentQuantity",
      name: "Current Stock",
      align: "center",
      width: "15%",
      sortable: true,
    },
    {
      id: "thresholds",
      name: "Reorder / Min",
      align: "center",
      width: "15%",
      sortable: false,
    },
    {
      id: "status",
      name: "Status",
      align: "center",
      width: "12%",
      sortable: true,
    },
    {
      id: "updatedAt",
      name: "Last Updated",
      align: "left",
      width: "15%",
      sortable: true,
    },
    {
      id: "actions",
      name: "Actions",
      align: "right",
      width: "15%",
      sortable: false,
    },
  ])
  .setSortOptions([
    { value: "name", label: "Name (A–Z)" },
    { value: "stockDesc", label: "Most Stock" },
    { value: "stockAsc", label: "Least Stock" },
    { value: "status", label: "Status" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ])
  .setSortStrategies({
    name: (a, b) => (a.productName ?? "").localeCompare(b.productName ?? ""),
    stockDesc: (a, b) => b.currentQuantity - a.currentQuantity,
    stockAsc: (a, b) => a.currentQuantity - b.currentQuantity,
    status: (a, b) => a.status - b.status,
    newest: (a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
    oldest: (a, b) =>
      (a.createdAt ?? "").localeCompare(b.createdAt ?? ""),
  })
  .build();

export const SUBMISSION_KEYS = config.SUBMISSION_KEYS;
export const TABLE_HEADERS = config.TABLE_HEADERS;
export const DIALOG_TITLES = {
  view: "Inventory Details",
  adjust: "Adjust Stock",
  thresholds: "Edit Thresholds",
  delete: "Delete Inventory",
  history: "Stock Movement History",
} as const;
export const DIALOG_TYPES = {
  view: "InventoryView",
  adjust: "InventoryAdjust",
  thresholds: "InventoryThresholds",
  delete: "InventoryDelete",
  history: "InventoryHistory",
} as const;
export const sortOptions = config.sortOptions;
export const applyInventorySorting = config.applySorting;

const movementConfig = new FeatureConfigBuilder<unknown>("StockMovement")
  .setTableHeaders([
    {
      id: "movementType",
      name: "Type",
      width: "14%",
      sortable: false,
      align: "left",
    },
    {
      id: "product",
      name: "Ingredient",
      width: "22%",
      sortable: false,
      align: "left",
    },
    {
      id: "quantity",
      name: "Quantity",
      width: "13%",
      sortable: false,
      align: "center",
    },
    {
      id: "balanceAfter",
      name: "Balance After",
      width: "13%",
      sortable: false,
      align: "center",
    },
    {
      id: "reason",
      name: "Reason",
      width: "20%",
      sortable: false,
      align: "left",
    },
    {
      id: "createdAt",
      name: "When",
      width: "18%",
      sortable: false,
      align: "left",
    },
  ])
  .setSortOptions([])
  .setSortStrategies({})
  .build();

export const MOVEMENT_TABLE_HEADERS = movementConfig.TABLE_HEADERS;
