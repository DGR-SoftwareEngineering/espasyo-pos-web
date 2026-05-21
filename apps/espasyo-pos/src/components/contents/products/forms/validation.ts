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

export type ProductMode = "menuItem" | "ingredient";

export const productFormSchema = yup.object({
  name: yup
    .string()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must not exceed 200 characters")
    .default(""),

  description: yup
    .string()
    .optional()
    .max(500, "Description must not exceed 500 characters")
    .default(""),

  productMode: yup
    .mixed<ProductMode>()
    .oneOf(["menuItem", "ingredient"], "Invalid product type")
    .required("Product type is required")
    .default("menuItem"),

  unitPrice: yup
    .number()
    .transform(numericTransform)
    .when("productMode", {
      is: "menuItem",
      then: (schema) =>
        schema
          .typeError("Unit price must be a number")
          .required("Unit price is required for menu items")
          .positive("Unit price must be greater than 0")
          .max(1000000, "Unit price cannot exceed 1,000,000")
          .test(
            "two-decimals",
            "Unit price can only have up to 2 decimal places",
            hasMaxTwoDecimals,
          ),
      otherwise: (schema) => schema.optional().nullable().default(null),
    }),

  costPrice: yup
    .number()
    .transform(numericTransform)
    .when("productMode", {
      is: "ingredient",
      then: (schema) =>
        schema
          .typeError("Cost price must be a number")
          .required("Cost price is required")
          .positive("Cost price must be greater than 0")
          .max(1000000, "Cost price cannot exceed 1,000,000")
          .test(
            "two-decimals",
            "Cost price can only have up to 2 decimal places",
            hasMaxTwoDecimals,
          ),
      otherwise: (schema) =>
        schema
          .optional()
          .nullable()
          .default(null)
          .test(
            "material-cost-valid",
            "Material cost must be a positive number (max 1,000,000) with up to 2 decimal places",
            (value) => {
              if (value === null || value === undefined) return true;
              return value > 0 && value <= 1000000 && hasMaxTwoDecimals(value);
            },
          ),
    }),

  purchaseQuantity: yup
    .number()
    .transform(numericTransform)
    .when("productMode", {
      is: "ingredient",
      then: (schema) =>
        schema
          .typeError("Purchase quantity must be a number")
          .required("Purchase quantity is required")
          .positive("Purchase quantity must be greater than 0")
          .max(1000000, "Purchase quantity cannot exceed 1,000,000"),
      otherwise: (schema) => schema.optional().nullable().default(null),
    }),

  purchaseUnitID: yup.string().when("productMode", {
    is: "ingredient",
    then: (schema) =>
      schema
        .required("Purchase unit is required")
        .test("is-valid-uuid", "Invalid purchase unit", (value) =>
          UUID_REGEX.test(value || ""),
        ),
    otherwise: (schema) => schema.optional().nullable().default(null),
  }),

  // Stock unit only required for ingredients (used in recipe conversions)
  stockUnitID: yup.string().when("productMode", {
    is: "ingredient",
    then: (schema) =>
      schema
        .required("Stock unit is required for ingredients")
        .test("is-valid-uuid", "Invalid stock unit", (value) =>
          UUID_REGEX.test(value || ""),
        ),
    otherwise: (schema) => schema.optional().nullable().default(null),
  }),

  categoryID: yup
    .string()
    .nullable()
    .required("Category is required")
    .test("is-valid-uuid", "Invalid category", (value) =>
      value === null || value === undefined || UUID_REGEX.test(value),
    )
    .default(null),

  imageFile: yup
    .mixed<File>()
    .optional()
    .nullable()
    .test(
      "is-image",
      "File must be an image",
      (value) =>
        !value || (value instanceof File && value.type.startsWith("image/")),
    )
    .test(
      "max-size",
      "Image must be 5 MB or smaller",
      (value) =>
        !value || (value instanceof File && value.size <= 5 * 1024 * 1024),
    )
    .default(null),

  removeImage: yup.boolean().optional().default(false),
});

export type ProductForm = yup.InferType<typeof productFormSchema>;
