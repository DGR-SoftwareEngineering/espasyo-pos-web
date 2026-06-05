import * as yup from "yup";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const numericTransform = (value: unknown) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
};

const hasMaxTwoDecimals = (value: number | undefined | null): boolean => {
  if (value === undefined || value === null) return true;
  if (!Number.isFinite(value)) return false;
  return Math.round(value * 100) === Number((value * 100).toFixed(0));
};

const isOptionalUuid = (value: string | undefined | null): boolean => {
  if (value === null || value === undefined || value === "") return true;
  return UUID_REGEX.test(value);
};

export const businessExpenseFormSchema = yup.object({
  expenseDate: yup
    .string()
    .required("Expense date is required")
    .test(
      "is-valid-date",
      "Must be a valid date in YYYY-MM-DD format",
      (value) => {
        if (!value) return false;
        const date = new Date(value);
        return date instanceof Date && !isNaN(date.getTime());
      },
    )
    .default(""),

  amount: yup
    .number()
    .transform(numericTransform)
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be greater than 0")
    .max(10000000, "Amount cannot exceed 10,000,000")
    .test(
      "two-decimals",
      "Amount can only have up to 6 decimal places",
      hasMaxTwoDecimals,
    )
    .default(0),

  description: yup
    .string()
    .required("Description is required")
    .min(2, "Description must be at least 2 characters")
    .max(300, "Description must not exceed 300 characters")
    .default(""),

  notes: yup
    .string()
    .optional()
    .nullable()
    .max(500, "Notes must not exceed 500 characters")
    .default(null),

  businessSupplyCategoryID: yup
    .string()
    .optional()
    .nullable()
    .test(
      "is-valid-uuid",
      "Invalid category",
      (value) => isOptionalUuid(value),
    )
    .default(null),
});

export type BusinessExpenseForm = yup.InferType<
  typeof businessExpenseFormSchema
>;
