import * as yup from "yup";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const lookupFormSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .default(""),

  description: yup
    .string()
    .optional()
    .max(500, "Description must not exceed 500 characters")
    .default(""),

  displayOrder: yup
    .number()
    .transform((value) => {
      if (value === undefined || value === null || value === "") return 0;
      const parsed = Number(value);
      return isNaN(parsed) ? 0 : parsed;
    })
    .typeError("Display order must be a number")
    .min(0, "Display order cannot be negative")
    .max(99999, "Display order cannot exceed 99,999")
    .default(0),

  parentID: yup
    .string()
    .optional()
    .nullable()
    .test("is-valid-uuid", "Invalid parent", (value) => {
      if (value === null || value === undefined || value === "") return true;
      return UUID_REGEX.test(value);
    })
    .default(null),
});

export type LookupFormSchemaType = yup.InferType<typeof lookupFormSchema>;
