import * as yup from "yup";

const numericTransform = (v: unknown) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
};

export const closeShiftFormSchema = yup.object({
  cashierShiftID: yup.string().required("Shift ID is required"),

  actualCash: yup
    .number()
    .transform(numericTransform)
    .typeError("Actual cash must be a number")
    .required("Actual cash is required")
    .min(0, "Actual cash cannot be negative")
    .max(10_000_000, "Actual cash cannot exceed 10,000,000")
    .default(0),

  mpin: yup
    .string()
    .required("MPIN is required")
    .matches(/^\d{6}$/, "MPIN must be exactly 6 digits")
    .default(""),

  notes: yup
    .string()
    .optional()
    .max(1000, "Notes must not exceed 1000 characters")
    .default(""),
});

export type CloseShiftForm = yup.InferType<typeof closeShiftFormSchema>;
