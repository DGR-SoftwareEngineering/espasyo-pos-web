import * as yup from "yup";

const itemSchema = yup
  .object({
    /** Form-local UI state; not sent to the backend. */
    targetMode: yup
      .mixed<"product" | "category">()
      .oneOf(["product", "category"])
      .default("product"),
    productID: yup.string().nullable().optional().default(null),
    productCategoryID: yup.string().nullable().optional().default(null),
    quantity: yup
      .number()
      .typeError("Quantity must be a number")
      .required("Quantity is required")
      .integer("Quantity must be a whole number")
      .min(1, "Quantity must be at least 1"),
    isFreeItem: yup.boolean().required().default(false),
  })
  .test("target-required", "Pick a product or a category", (obj) => {
    const hasProduct = !!obj?.productID;
    const hasCategory = !!obj?.productCategoryID;
    return hasProduct !== hasCategory; // XOR
  });

export const promoFormSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .max(200, "Title must not exceed 200 characters"),

  description: yup
    .string()
    .optional()
    .max(2000, "Description must not exceed 2000 characters")
    .default(""),

  imageFile: yup
    .mixed<File>()
    .optional()
    .nullable()
    .test("is-image", "File must be an image", (v) => !v || (v instanceof File && v.type.startsWith("image/")))
    .default(null),

  type: yup
    .number()
    .required("Promo type is required")
    .oneOf([1, 2, 3, 4], "Invalid promo type"),

  discountPercent: yup
    .number()
    .transform((v) => (v === "" || v === undefined || v === null ? null : Number(v)))
    .nullable()
    .when("type", {
      is: 1,
      then: (s) =>
        s
          .required("Discount percentage is required")
          .min(0.01, "Must be at least 0.01%")
          .max(99.99, "Must not exceed 99.99%"),
      otherwise: (s) => s.optional().nullable(),
    })
    .default(null),

  discountAmount: yup
    .number()
    .transform((v) => (v === "" || v === undefined || v === null ? null : Number(v)))
    .nullable()
    .when("type", {
      is: 2,
      then: (s) =>
        s.required("Discount amount is required").min(0.01, "Must be greater than 0"),
      otherwise: (s) => s.optional().nullable(),
    })
    .default(null),

  buyQuantity: yup
    .number()
    .transform((v) => (v === "" || v === undefined || v === null ? null : Number(v)))
    .nullable()
    .when("type", {
      is: 3,
      then: (s) =>
        s
          .required("Buy quantity is required")
          .integer("Must be a whole number")
          .min(1, "Must be at least 1"),
      otherwise: (s) => s.optional().nullable(),
    })
    .default(null),

  getQuantity: yup
    .number()
    .transform((v) => (v === "" || v === undefined || v === null ? null : Number(v)))
    .nullable()
    .when("type", {
      is: 3,
      then: (s) =>
        s
          .required("Get quantity is required")
          .integer("Must be a whole number")
          .min(1, "Must be at least 1"),
      otherwise: (s) => s.optional().nullable(),
    })
    .default(null),

  bundlePrice: yup
    .number()
    .transform((v) => (v === "" || v === undefined || v === null ? null : Number(v)))
    .nullable()
    .when("type", {
      is: 4,
      then: (s) =>
        s.required("Bundle price is required").min(0.01, "Must be greater than 0"),
      otherwise: (s) => s.optional().nullable(),
    })
    .default(null),

  startDate: yup.string().optional().nullable().default(null),
  endDate: yup.string().optional().nullable().default(null),

  reason: yup
    .string()
    .optional()
    .nullable()
    .max(500, "Reason must not exceed 500 characters")
    .default(null),

  items: yup
    .array()
    .of(itemSchema)
    .min(1, "At least one product is required")
    .required()
    .default([]),
});

export type PromoForm = yup.InferType<typeof promoFormSchema>;
export type PromoItemForm = yup.InferType<typeof itemSchema>;
