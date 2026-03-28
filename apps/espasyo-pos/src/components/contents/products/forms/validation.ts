import * as yup from "yup";

export const productFormSchema = yup.object({
  name: yup
    .string()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must not exceed 200 characters")
    .matches(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Product name can only contain letters, numbers, spaces, hyphens and underscores",
    )
    .default(""),

  description: yup
    .string()
    .optional()
    .max(500, "Description must not exceed 500 characters")
    .matches(
      /^[a-zA-Z0-9\s\-_.,!?()]*$/,
      "Description contains invalid characters",
    )
    .default(""),

  unitPrice: yup
    .number()
    .transform((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    })
    .when("isMenuItem", {
      is: true,
      then: (schema) =>
        schema
          .required("Unit price is required for menu items")
          .typeError("Unit price must be a number")
          .positive("Unit price must be greater than 0")
          .max(1000000, "Unit price cannot exceed 1,000,000")
          .test(
            "two-decimals",
            "Unit price can only have up to 2 decimal places",
            (value) => /^\d+(\.\d{1,2})?$/.test(value.toString()),
          ),
      otherwise: (schema) => schema.optional().nullable().default(null),
    }),

  costPrice: yup
    .number()
    .transform((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    })
    .when("isMenuItem", {
      is: false,
      then: (schema) =>
        schema
          .required("Cost price is required for ingredients")
          .typeError("Cost price must be a number")
          .positive("Cost price must be greater than 0")
          .max(1000000, "Cost price cannot exceed 1,000,000")
          .test(
            "two-decimals",
            "Cost price can only have up to 2 decimal places",
            (value) => /^\d+(\.\d{1,2})?$/.test(value.toString()),
          ),
      otherwise: (schema) => schema.optional().nullable().default(null),
    }),

  purchaseQuantity: yup
    .number()
    .transform((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    })
    .when("isMenuItem", {
      is: false,
      then: (schema) =>
        schema
          .required("Purchase quantity is required for ingredients")
          .typeError("Purchase quantity must be a number")
          .positive("Purchase quantity must be greater than 0")
          .max(1000000, "Purchase quantity cannot exceed 1,000,000"),
      otherwise: (schema) => schema.optional().nullable().default(null),
    }),

  purchaseUnitID: yup.string().when("isMenuItem", {
    is: false,
    then: (schema) =>
      schema
        .required("Purchase unit is required for ingredients")
        .test("is-valid-uuid", "Invalid purchase unit", (value) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            value || "",
          ),
        ),
    otherwise: (schema) => schema.optional().nullable().default(null),
  }),

  stockUnitID: yup.string().when("isMenuItem", {
    is: false,
    then: (schema) =>
      schema
        .required("Stock unit is required for ingredients")
        .test("is-valid-uuid", "Invalid stock unit", (value) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            value || "",
          ),
        ),
    otherwise: (schema) => schema.optional().nullable().default(null),
  }),

  isMenuItem: yup.boolean().required("Product type is required").default(true),

  categoryID: yup
    .string()
    .optional()
    .nullable()
    .test(
      "is-valid-uuid",
      "Invalid category ID format",
      (value) =>
        value === null ||
        value === undefined ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value,
        ),
    )
    .default(null),
});

export type ProductForm = yup.InferType<typeof productFormSchema>;
