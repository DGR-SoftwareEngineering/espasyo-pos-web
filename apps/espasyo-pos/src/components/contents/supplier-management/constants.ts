import { DialogContentType } from "core-lib/api/content/types/common";

export const DIALOG_TITLES = {
  edit: "Edit Supplier",
  delete: "Deactivate Supplier",
  view: "Supplier Details",
};

export const DIALOG_TYPES: Record<string, DialogContentType> = {
  edit: "SupplierEdit" as DialogContentType,
  delete: "SupplierDelete" as DialogContentType,
  view: "SupplierView" as DialogContentType,
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const SORT_OPTIONS = [
  { value: "company", label: "Company (A → Z)" },
  { value: "companyDesc", label: "Company (Z → A)" },
  { value: "terms", label: "Payment Terms" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

export const PAYMENT_TERMS_FILTER_OPTIONS = [
  { value: "all", label: "All Terms" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 60", label: "Net 60" },
  { value: "COD", label: "COD" },
  { value: "Prepaid", label: "Prepaid" },
  { value: "2/10 Net 30", label: "2/10 Net 30" },
];

export const PAYMENT_TERMS_BADGE_COLOR: Record<
  string,
  "indigo" | "amber" | "green" | "blue" | "gray" | "purple"
> = {
  "Net 30": "indigo",
  "Net 60": "purple",
  COD: "green",
  Prepaid: "blue",
  "2/10 Net 30": "amber",
};
