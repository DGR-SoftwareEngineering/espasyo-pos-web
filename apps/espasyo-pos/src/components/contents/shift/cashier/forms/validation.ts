import * as yup from "yup";

const numericTransform = (v: unknown) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
};

export const openShiftFormSchema = yup.object({
  openingCash: yup
    .number()
    .transform(numericTransform)
    .typeError("Opening cash must be a number")
    .required("Opening cash is required")
    .min(0, "Opening cash cannot be negative")
    .max(10_000_000, "Opening cash cannot exceed 10,000,000")
    .default(0),

  notes: yup
    .string()
    .optional()
    .max(1000, "Notes must not exceed 1000 characters")
    .default(""),
});

export type OpenShiftForm = yup.InferType<typeof openShiftFormSchema>;
