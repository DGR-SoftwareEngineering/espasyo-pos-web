import {
  SalesPaymentMethodDto,
  SaleStatusDto,
} from "core-lib/api/commons/types";

export const PAYMENT_METHOD_META: Record<
  SalesPaymentMethodDto,
  {
    label: string;
    short: string;
    color: "green" | "indigo" | "violet" | "iris" | "blue" | "amber" | "gray";
    requiresReference: boolean;
    available: boolean;
  }
> = {
  [SalesPaymentMethodDto.Cash]: {
    label: "Cash",
    short: "CASH",
    color: "green",
    requiresReference: false,
    available: true,
  },
  [SalesPaymentMethodDto.Card]: {
    label: "Card",
    short: "CARD",
    color: "indigo",
    requiresReference: true,
    available: true,
  },
  [SalesPaymentMethodDto.GCash]: {
    label: "GCash",
    short: "GCASH",
    color: "blue",
    requiresReference: true,
    available: true,
  },
  [SalesPaymentMethodDto.Maya]: {
    label: "Maya",
    short: "MAYA",
    color: "violet",
    requiresReference: true,
    available: true,
  },
  [SalesPaymentMethodDto.BankTransfer]: {
    label: "Bank Transfer",
    short: "BANK",
    color: "iris",
    requiresReference: true,
    available: true,
  },
  [SalesPaymentMethodDto.StoreCredit]: {
    label: "Store Credit",
    short: "CREDIT",
    color: "amber",
    requiresReference: false,
    available: false,
  },
  [SalesPaymentMethodDto.Other]: {
    label: "Other",
    short: "OTHER",
    color: "gray",
    requiresReference: true,
    available: true,
  },
};

export const PAYMENT_METHODS_FOR_SELECTION: SalesPaymentMethodDto[] = [
  SalesPaymentMethodDto.Cash,
  SalesPaymentMethodDto.Card,
  SalesPaymentMethodDto.GCash,
  SalesPaymentMethodDto.Maya,
  SalesPaymentMethodDto.BankTransfer,
  SalesPaymentMethodDto.Other,
];

export const SALE_STATUS_META: Record<
  SaleStatusDto,
  { label: string; color: "green" | "red" | "amber" | "gray" }
> = {
  [SaleStatusDto.Completed]: { label: "Completed", color: "green" },
  [SaleStatusDto.Voided]: { label: "Voided", color: "red" },
  [SaleStatusDto.PartiallyRefunded]: {
    label: "Partially refunded",
    color: "amber",
  },
  [SaleStatusDto.FullyRefunded]: { label: "Refunded", color: "gray" },
};

export const SELLABLE_PRODUCTS_PAGE_SIZE = 60;
