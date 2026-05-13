import * as yup from "yup";

const uuidTest = (value: string | null | undefined) =>
  value === null ||
  value === undefined ||
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value || "",
  );

export const inventoryFormSchema = yup.object({
  productID: yup
    .string()
    .required("Please select an ingredient")
    .test("is-valid-uuid", "Invalid ingredient", uuidTest)
    .default(""),

  currentQuantity: yup
    .number()
    .transform((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    })
    .typeError("Current quantity must be a number")
    .required("Current quantity is required")
    .min(0, "Current quantity cannot be negative")
    .max(1000000, "Current quantity cannot exceed 1,000,000")
    .default(0),

  reorderLevel: yup
    .number()
    .transform((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    })
    .typeError("Reorder level must be a number")
    .required("Reorder level is required")
    .min(0, "Reorder level cannot be negative")
    .max(1000000, "Reorder level cannot exceed 1,000,000")
    .default(0),

  minimumStockLevel: yup
    .number()
    .transform((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    })
    .typeError("Minimum stock level must be a number")
    .required("Minimum stock level is required")
    .min(0, "Minimum stock level cannot be negative")
    .max(1000000, "Minimum stock level cannot exceed 1,000,000")
    .test(
      "reorder-vs-min",
      "Minimum stock level must be less than or equal to reorder level",
      function (value) {
        const reorder = this.parent.reorderLevel;
        if (value === undefined || reorder === undefined) return true;
        return value <= reorder;
      },
    )
    .default(0),
});

export type InventoryFormValues = yup.InferType<typeof inventoryFormSchema>;

export const adjustStockFormSchema = yup.object({
  direction: yup
    .mixed<"in" | "out">()
    .oneOf(["in", "out"], "Choose Stock In or Stock Out")
    .required("Direction is required")
    .default("in"),

  amount: yup
    .number()
    .transform((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    })
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be greater than 0")
    .max(1000000, "Amount cannot exceed 1,000,000")
    .default(0),

  reason: yup
    .string()
    .required("Please provide a reason")
    .min(2, "Reason must be at least 2 characters")
    .max(500, "Reason cannot exceed 500 characters")
    .default(""),
});

export type AdjustStockFormValues = yup.InferType<typeof adjustStockFormSchema>;

export const thresholdsFormSchema = yup.object({
  reorderLevel: yup
    .number()
    .transform((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    })
    .typeError("Reorder level must be a number")
    .required("Reorder level is required")
    .min(0, "Reorder level cannot be negative")
    .max(1000000, "Reorder level cannot exceed 1,000,000")
    .default(0),

  minimumStockLevel: yup
    .number()
    .transform((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    })
    .typeError("Minimum stock level must be a number")
    .required("Minimum stock level is required")
    .min(0, "Minimum stock level cannot be negative")
    .max(1000000, "Minimum stock level cannot exceed 1,000,000")
    .test(
      "reorder-vs-min",
      "Minimum stock level must be less than or equal to reorder level",
      function (value) {
        const reorder = this.parent.reorderLevel;
        if (value === undefined || reorder === undefined) return true;
        return value <= reorder;
      },
    )
    .default(0),
});

export type ThresholdsFormValues = yup.InferType<typeof thresholdsFormSchema>;
