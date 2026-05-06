import {
  LocationOnOutlined,
  BrandingWatermarkOutlined,
  StraightenOutlined,
  CategoryOutlined,
} from "@mui/icons-material";
import { ProductDataList } from "core-lib/api/commons/types";
import { FeatureConfigBuilder } from "core-lib/core/types/constants/feature-config.builder";
import { commonSortStrategies } from "core-lib/core/types/constants/base.constants";

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

export const PLACEHOLDERS = {
  productName: "e.g., Arabica Coffee Beans, White Sugar, Fresh Milk",
  description: "Provide a detailed description of the product...",
  price: "0.00",
  reorderLevel: "e.g., 20",
  minimumStock: "e.g., 5",
} as const;

const config = new FeatureConfigBuilder<ProductDataList, "Product">("Product")
  .setTableHeaders([
    {
      id: "name",
      label: "Product",
      width: "25%",
      sortable: true,
      align: "left",
    },
    {
      id: "unitPrice",
      label: "Price",
      align: "center",
      width: "15%",
      sortable: true,
    },
    {
      id: "categoryType",
      label: "Type",
      align: "center",
      width: "15%",
      sortable: true,
    },
    {
      id: "status",
      label: "Status",
      align: "center",
      width: "15%",
      sortable: true,
    },
    {
      id: "categoryName",
      label: "Category",
      align: "left",
      width: "20%",
      sortable: true,
    },
    {
      id: "actions",
      label: "Actions",
      align: "right",
      width: "10%",
      sortable: false,
    },
  ])
  .setSortOptions([
    { value: "name", label: "Product Name" },
    { value: "price", label: "Highest Price" },
    { value: "priceLow", label: "Lowest Price" },
    { value: "type", label: "Category Type" },
    { value: "status", label: "Status" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ])
  .setSortStrategies({
    name: (a, b) => a.name.localeCompare(b.name),
    price: (a, b) => (b.unitPrice || 0) - (a.unitPrice || 0),
    priceLow: (a, b) => (a.unitPrice || 0) - (b.unitPrice || 0),
    type: (a, b) => (a.categoryType || 0) - (b.categoryType || 0),
    status: (a, b) => (a.status || 0) - (b.status || 0),
    newest: commonSortStrategies.newest as any,
    oldest: commonSortStrategies.oldest as any,
  })
  .build();

export const SUBMISSION_KEYS = config.SUBMISSION_KEYS;
export const TABLE_HEADERS = config.TABLE_HEADERS;
export const DIALOG_TITLES = config.DIALOG_TITLES;
export const DIALOG_TYPES = config.DIALOG_TYPES;
export const sortOptions = config.sortOptions;
export const applyProductSorting = config.applySorting;
export type ProductFilterState = typeof config.FilterState;
