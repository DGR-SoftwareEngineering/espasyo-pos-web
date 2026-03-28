import * as yup from "yup";

export const unitConversionFormSchema = yup.object({
  fromUnitID: yup
    .string()
    .required("From Unit is required")
    .test("is-valid-uuid", "Invalid unit selection", (value) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value || "",
      ),
    )
    .default(""),

  toUnitID: yup
    .string()
    .required("To Unit is required")
    .test("is-valid-uuid", "Invalid unit selection", (value) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value || "",
      ),
    )
    .default(""),

  conversionRate: yup
    .number()
    .transform((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    })
    .required("Conversion rate is required")
    .typeError("Conversion rate must be a number")
    .positive("Conversion rate must be greater than 0")
    .max(1000000, "Conversion rate cannot exceed 1,000,000")
    .test(
      "three-decimals",
      "Conversion rate can have up to 3 decimal places",
      (value) => /^\d+(\.\d{1,3})?$/.test(value?.toString() || ""),
    )
    .default(0),

  isApproximate: yup.boolean().default(false),

  notes: yup
    .string()
    .optional()
    .max(500, "Notes must not exceed 500 characters")
    .default(""),
});

export type UnitConversionForm = yup.InferType<typeof unitConversionFormSchema>;
