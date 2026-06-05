import * as yup from "yup";
import { SalesPaymentMethodDto } from "core-lib/api/commons/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const numericTransform = (value: unknown) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const hasMaxTwoDecimals = (value: number | undefined | null): boolean => {
  if (value === undefined || value === null) return true;
  if (!Number.isFinite(value)) return false;
  return Math.round(value * 100) === Number((value * 100).toFixed(0));
};

const REQUIRES_REFERENCE: ReadonlySet<SalesPaymentMethodDto> = new Set([
  SalesPaymentMethodDto.Card,
  SalesPaymentMethodDto.GCash,
  SalesPaymentMethodDto.Maya,
  SalesPaymentMethodDto.BankTransfer,
  SalesPaymentMethodDto.Other,
]);

export const cartItemSchema = yup.object({
  productID: yup
    .string()
    .required("Product is required")
    .test("is-valid-uuid", "Invalid product", (v) => UUID_REGEX.test(v || "")),
  quantity: yup
    .number()
    .transform(numericTransform)
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .positive("Quantity must be greater than 0")
    .max(10_000, "Quantity cannot exceed 10,000"),
  unitPrice: yup
    .number()
    .transform(numericTransform)
    .typeError("Unit price must be a number")
    .required("Unit price is required")
    .min(0, "Unit price cannot be negative")
    .max(1_000_000)
    .test("two-decimals", "Up to 2 decimals only", hasMaxTwoDecimals),
  discount: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0, "Discount cannot be negative")
    .test("two-decimals", "Up to 2 decimals only", hasMaxTwoDecimals),
});

export const paymentLineSchema = yup.object({
  method: yup
    .number()
    .transform(numericTransform)
    .required("Payment method is required")
    .oneOf(
      [
        SalesPaymentMethodDto.Cash,
        SalesPaymentMethodDto.Card,
        SalesPaymentMethodDto.GCash,
        SalesPaymentMethodDto.Maya,
        SalesPaymentMethodDto.BankTransfer,
        SalesPaymentMethodDto.Other,
      ],
      "Unsupported payment method",
    ),
  amount: yup
    .number()
    .transform(numericTransform)
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be greater than 0")
    .test("two-decimals", "Up to 2 decimals only", hasMaxTwoDecimals),
  tendered: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0, "Tendered cannot be negative")
    .when("method", {
      is: SalesPaymentMethodDto.Cash,
      then: (s) =>
        s.test(
          "tendered-covers-amount",
          "Tendered must be ≥ amount for cash",
          function (value) {
            const amount = this.parent.amount as number | undefined;
            if (amount === undefined) return true;
            if (value === undefined || value === null) return true;
            return value >= amount;
          },
        ),
    }),
  referenceNumber: yup
    .string()
    .optional()
    .nullable()
    .when("method", {
      is: (m: SalesPaymentMethodDto) => REQUIRES_REFERENCE.has(m),
      then: (s) =>
        s
          .required("Reference number is required for this payment method")
          .min(2, "Reference must be at least 2 characters"),
    }),
});

export const createSaleSchema = yup.object({
  items: yup
    .array()
    .of(cartItemSchema)
    .min(1, "Add at least one item")
    .max(200, "Cannot exceed 200 line items")
    .required("Items are required"),
  discountAmount: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0, "Discount cannot be negative")
    .test("two-decimals", "Up to 2 decimals only", hasMaxTwoDecimals),
  taxRate: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0, "Tax rate cannot be negative")
    .max(1, "Tax rate cannot exceed 100%"),
  payments: yup
    .array()
    .of(paymentLineSchema)
    .min(1, "Add at least one payment")
    .required("Payments are required"),
  notes: yup.string().optional().nullable().max(500, "Notes too long"),
});
