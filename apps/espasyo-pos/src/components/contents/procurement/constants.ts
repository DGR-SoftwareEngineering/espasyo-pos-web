import { DataTableHeader } from "core-lib/components/radix/table/DataTableV2";
import {
  FulfillmentMethodDto,
  PaymentMethodDto,
  PurchaseOrderStatusDto,
  SupplierInvoiceStatusDto,
} from "core-lib/api/commons/types";

type RadixColor =
  | "gray"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "violet"
  | "indigo"
  | "teal"
  | "crimson";

export interface StatusMeta {
  label: string;
  color: RadixColor;
}

export const PO_STATUS_META: Record<PurchaseOrderStatusDto, StatusMeta> = {
  [PurchaseOrderStatusDto.Draft]: { label: "Draft", color: "gray" },
  [PurchaseOrderStatusDto.Submitted]: { label: "Submitted", color: "blue" },
  [PurchaseOrderStatusDto.Approved]: { label: "Approved", color: "indigo" },
  [PurchaseOrderStatusDto.PartiallyReceived]: {
    label: "Partially received",
    color: "amber",
  },
  [PurchaseOrderStatusDto.Received]: { label: "Received", color: "teal" },
  [PurchaseOrderStatusDto.Closed]: { label: "Closed", color: "green" },
  [PurchaseOrderStatusDto.Cancelled]: { label: "Cancelled", color: "red" },
};

export const PO_STATUS_ORDER: PurchaseOrderStatusDto[] = [
  PurchaseOrderStatusDto.Draft,
  PurchaseOrderStatusDto.Submitted,
  PurchaseOrderStatusDto.Approved,
  PurchaseOrderStatusDto.PartiallyReceived,
  PurchaseOrderStatusDto.Received,
  PurchaseOrderStatusDto.Closed,
];

export const PO_STATUS_FILTER_OPTIONS: Array<{
  value: PurchaseOrderStatusDto;
  label: string;
}> = [
  { value: PurchaseOrderStatusDto.Draft, label: "Draft" },
  { value: PurchaseOrderStatusDto.Submitted, label: "Submitted" },
  { value: PurchaseOrderStatusDto.Approved, label: "Approved" },
  {
    value: PurchaseOrderStatusDto.PartiallyReceived,
    label: "Partially received",
  },
  { value: PurchaseOrderStatusDto.Received, label: "Received" },
  { value: PurchaseOrderStatusDto.Closed, label: "Closed" },
  { value: PurchaseOrderStatusDto.Cancelled, label: "Cancelled" },
];

export const INVOICE_STATUS_META: Record<
  SupplierInvoiceStatusDto,
  StatusMeta
> = {
  [SupplierInvoiceStatusDto.Pending]: { label: "Pending", color: "gray" },
  [SupplierInvoiceStatusDto.PartiallyPaid]: {
    label: "Partially paid",
    color: "amber",
  },
  [SupplierInvoiceStatusDto.Paid]: { label: "Paid", color: "green" },
  [SupplierInvoiceStatusDto.Overdue]: { label: "Overdue", color: "red" },
  [SupplierInvoiceStatusDto.Voided]: { label: "Voided", color: "gray" },
};

export const FULFILLMENT_META: Record<FulfillmentMethodDto, StatusMeta> = {
  [FulfillmentMethodDto.Delivery]: { label: "Delivery", color: "indigo" },
  [FulfillmentMethodDto.Pickup]: { label: "Pickup", color: "violet" },
};

export const PAYMENT_METHOD_META: Record<PaymentMethodDto, StatusMeta> = {
  [PaymentMethodDto.Cash]: { label: "Cash", color: "green" },
  [PaymentMethodDto.BankTransfer]: { label: "Bank transfer", color: "blue" },
  [PaymentMethodDto.Check]: { label: "Check", color: "amber" },
  [PaymentMethodDto.GCash]: { label: "GCash", color: "teal" },
  [PaymentMethodDto.Other]: { label: "Other", color: "gray" },
};

export const PAYMENT_TERMS_PRESETS = [
  "On Receipt",
  "COD",
  "Net 7",
  "Net 15",
  "Net 30",
  "Net 60",
];

export const REQUIRES_REFERENCE_NUMBER: ReadonlySet<PaymentMethodDto> = new Set([
  PaymentMethodDto.BankTransfer,
  PaymentMethodDto.Check,
  PaymentMethodDto.GCash,
]);

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const TABLE_HEADERS: DataTableHeader[] = [
  { name: "PO #", align: "left", width: "15%" },
  { name: "Supplier", align: "left", width: "20%" },
  { name: "Status", align: "left", width: "15%" },
  { name: "Fulfillment", align: "center", width: "12%" },
  { name: "Items", align: "left", width: "13%" },
  { name: "Total", align: "right", width: "12%" },
  { name: "Expected", align: "left", width: "8%" },
  { name: "Created", align: "left", width: "5%" },
];
