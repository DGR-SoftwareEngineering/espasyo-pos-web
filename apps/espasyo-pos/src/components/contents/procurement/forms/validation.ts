import * as yup from "yup";
import {
  FulfillmentMethodDto,
  PaymentMethodDto,
} from "core-lib/api/commons/types";

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

const REQUIRES_REFERENCE: ReadonlySet<PaymentMethodDto> = new Set([
  PaymentMethodDto.BankTransfer,
  PaymentMethodDto.Check,
  PaymentMethodDto.GCash,
]);

export const purchaseOrderItemSchema = yup.object({
  productID: yup
    .string()
    .required("Product is required")
    .test("is-valid-uuid", "Invalid product", (v) => UUID_REGEX.test(v || "")),
  unitID: yup
    .string()
    .required("Unit is required")
    .test("is-valid-uuid", "Invalid unit", (v) => UUID_REGEX.test(v || "")),
  quantity: yup
    .number()
    .transform(numericTransform)
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .positive("Quantity must be greater than 0")
    .max(1_000_000, "Quantity cannot exceed 1,000,000"),
  unitPrice: yup
    .number()
    .transform(numericTransform)
    .typeError("Unit price must be a number")
    .required("Unit price is required")
    .min(0, "Unit price cannot be negative")
    .max(1_000_000, "Unit price cannot exceed 1,000,000")
    .test(
      "two-decimals",
      "Unit price can only have up to 2 decimal places",
      hasMaxTwoDecimals,
    ),
  discount: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0, "Discount cannot be negative")
    .test(
      "two-decimals",
      "Discount can only have up to 2 decimal places",
      hasMaxTwoDecimals,
    )
    .default(null),
  notes: yup.string().optional().max(500).default(""),
});

export const purchaseOrderSchema = yup.object({
  supplierID: yup
    .string()
    .required("Supplier is required")
    .test("is-valid-uuid", "Invalid supplier", (v) => UUID_REGEX.test(v || "")),
  fulfillmentMethod: yup
    .number()
    .required("Fulfillment method is required")
    .oneOf(
      [FulfillmentMethodDto.Delivery, FulfillmentMethodDto.Pickup],
      "Invalid fulfillment method",
    ),
  expectedDate: yup.string().optional().nullable().default(null),
  paymentTerms: yup.string().optional().max(50).default(""),
  taxAmount: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0)
    .default(null),
  discountAmount: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0)
    .default(null),
  shippingFee: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0)
    .default(null),
  notes: yup.string().optional().max(1000).default(""),
  deliveryAddress: yup.string().when("fulfillmentMethod", {
    is: FulfillmentMethodDto.Delivery,
    then: (schema) =>
      schema
        .required("Delivery address is required when fulfillment is Delivery")
        .min(5, "Delivery address must be at least 5 characters")
        .max(500, "Delivery address must not exceed 500 characters"),
    otherwise: (schema) => schema.optional().nullable().default(null),
  }),
  items: yup
    .array()
    .of(purchaseOrderItemSchema)
    .min(1, "Add at least one line item")
    .max(200, "Cannot exceed 200 line items")
    .required(),
});

export type PurchaseOrderFormValues = yup.InferType<typeof purchaseOrderSchema>;

export const receiptItemSchema = yup.object({
  purchaseOrderItemID: yup.string().required(),
  productName: yup.string().required(),
  unitName: yup.string().required(),
  ordered: yup.number().required(),
  alreadyReceived: yup.number().required(),
  remaining: yup.number().required(),
  quantity: yup
    .number()
    .transform(numericTransform)
    .typeError("Quantity must be a number")
    .min(0, "Quantity cannot be negative")
    .max(1_000_000)
    .default(0),
  unitCost: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0, "Unit cost cannot be negative")
    .max(1_000_000)
    .default(null),
  qualityNotes: yup.string().optional().max(500).default(""),
});

export const receiptSchema = yup.object({
  receivedDate: yup
    .string()
    .required("Received date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  deliveryNoteNumber: yup.string().optional().max(100).default(""),
  notes: yup.string().optional().max(1000).default(""),
  items: yup
    .array()
    .of(receiptItemSchema)
    .test(
      "at-least-one-quantity",
      "Enter a quantity for at least one line",
      (items) =>
        Array.isArray(items) &&
        items.some((line) => (Number(line?.quantity) || 0) > 0),
    )
    .required(),
});

export type ReceiptFormValues = yup.InferType<typeof receiptSchema>;

export const supplierInvoiceSchema = yup.object({
  invoiceNumber: yup
    .string()
    .required("Invoice number is required")
    .max(100, "Invoice number must not exceed 100 characters"),
  invoiceDate: yup
    .string()
    .required("Invoice date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  dueDate: yup
    .string()
    .required("Due date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .test(
      "due-after-invoice",
      "Due date cannot be earlier than invoice date",
      function (value) {
        const invoiceDate = (this.parent as { invoiceDate?: string }).invoiceDate;
        if (!value || !invoiceDate) return true;
        return new Date(value) >= new Date(invoiceDate);
      },
    ),
  subtotal: yup
    .number()
    .transform(numericTransform)
    .typeError("Subtotal must be a number")
    .required("Subtotal is required")
    .positive("Subtotal must be greater than 0")
    .max(10_000_000, "Subtotal cannot exceed 10,000,000")
    .test(
      "two-decimals",
      "Subtotal can only have up to 2 decimal places",
      hasMaxTwoDecimals,
    ),
  taxAmount: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0)
    .default(null),
  discountAmount: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0)
    .default(null),
  shippingFee: yup
    .number()
    .transform(numericTransform)
    .optional()
    .nullable()
    .min(0)
    .default(null),
  notes: yup.string().optional().max(1000).default(""),
});

export type SupplierInvoiceFormValues = yup.InferType<typeof supplierInvoiceSchema>;

export const paymentSchema = yup.object({
  method: yup
    .number()
    .required("Payment method is required")
    .oneOf(
      [
        PaymentMethodDto.Cash,
        PaymentMethodDto.BankTransfer,
        PaymentMethodDto.Check,
        PaymentMethodDto.GCash,
        PaymentMethodDto.Other,
      ],
      "Invalid payment method",
    ),
  referenceNumber: yup
    .string()
    .when("method", {
      is: (m: PaymentMethodDto) => REQUIRES_REFERENCE.has(m),
      then: (schema) =>
        schema
          .required(
            "Reference number is required for Bank Transfer, Check, and GCash payments",
          )
          .max(100, "Reference number must not exceed 100 characters"),
      otherwise: (schema) => schema.optional().max(100).default(""),
    }),
  amount: yup
    .number()
    .transform(numericTransform)
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be greater than 0")
    .max(10_000_000, "Amount cannot exceed 10,000,000")
    .test(
      "two-decimals",
      "Amount can only have up to 2 decimal places",
      hasMaxTwoDecimals,
    ),
  paymentDate: yup
    .string()
    .required("Payment date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  notes: yup.string().optional().max(500).default(""),
});

export type PaymentFormValues = yup.InferType<typeof paymentSchema>;

export const cancelReasonSchema = yup.object({
  reason: yup
    .string()
    .required("Cancellation reason is required")
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason must not exceed 500 characters"),
});

export type CancelReasonFormValues = yup.InferType<typeof cancelReasonSchema>;
