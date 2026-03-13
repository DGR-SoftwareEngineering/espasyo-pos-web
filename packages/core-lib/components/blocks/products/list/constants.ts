import {
  LocationOnOutlined,
  BrandingWatermarkOutlined,
  StraightenOutlined,
  CategoryOutlined,
} from "@mui/icons-material";

export const STATUS_CONFIG = {
  1: { label: "Active", color: "success" as const, showIcon: false },
  2: { label: "Low Stock", color: "warning" as const, showIcon: true },
  3: { label: "Critical", color: "error" as const, showIcon: true },
  4: { label: "Out of Stock", color: "error" as const, showIcon: false },
  5: { label: "Discontinued", color: "default" as const, showIcon: false },
} as const;

export const CATEGORY_TYPE_CONFIG = {
  1: { icon: LocationOnOutlined, label: "Location" },
  2: { icon: BrandingWatermarkOutlined, label: "Brand" },
  3: { icon: StraightenOutlined, label: "Unit" },
} as const;

export const DEFAULT_CATEGORY = {
  icon: CategoryOutlined,
  label: "Category",
} as const;

export const TABLE_HEADERS = [
  { name: "Product", align: "left" as const },
  { name: "Price", align: "center" as const },
  { name: "Type", align: "center" as const },
  { name: "Status", align: "center" as const },
  { name: "Category", align: "left" as const },
  { name: "Actions", align: "right" as const },
];

export const DIALOG_TITLES = {
  view: "Product Details",
  edit: "Edit Product",
  delete: "Delete Product",
  create: "Create New Product",
} as const;

export const DIALOG_TYPES = {
  view: "ProductView",
  edit: "ProductEdit",
  delete: "ProductDelete",
  create: "ProductCreate",
} as const;

export const STATUS_OPTIONS = [
  { value: "all", label: "All Status", color: "default" as const },
  { value: 1, label: "Active", color: "success" as const },
  { value: 2, label: "Low Stock", color: "warning" as const },
  { value: 3, label: "Critical", color: "error" as const },
  { value: 4, label: "Out of Stock", color: "error" as const },
  { value: 5, label: "Discontinued", color: "default" as const },
];

export const CATEGORY_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: 1, label: "Location" },
  { value: 2, label: "Brand" },
  { value: 3, label: "Unit" },
];

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
