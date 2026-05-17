import * as yup from "yup";

export const companyStepSchema = yup.object({
  companyName: yup
    .string()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name must not exceed 200 characters")
    .default(""),
  contactPersonName: yup
    .string()
    .optional()
    .max(150, "Contact person must not exceed 150 characters")
    .default(""),
});

export const contactStepSchema = yup.object({
  email: yup
    .string()
    .optional()
    .test("optional-email", "Enter a valid email", (value) =>
      !value ? true : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    )
    .max(200, "Email must not exceed 200 characters")
    .default(""),
  contactNumber: yup
    .string()
    .optional()
    .max(50, "Contact number must not exceed 50 characters")
    .default(""),
  address: yup
    .string()
    .optional()
    .max(500, "Address must not exceed 500 characters")
    .default(""),
});

export const businessStepSchema = yup.object({
  taxID: yup
    .string()
    .optional()
    .max(100, "Tax ID must not exceed 100 characters")
    .default(""),
  paymentTerms: yup
    .string()
    .optional()
    .max(100, "Payment terms must not exceed 100 characters")
    .default(""),
  notes: yup
    .string()
    .optional()
    .max(1000, "Notes must not exceed 1000 characters")
    .default(""),
});

export const portalStepSchema = yup.object({
  linkPortalUser: yup.boolean().optional().default(false),
  userID: yup
    .string()
    .optional()
    .when("linkPortalUser", {
      is: true,
      then: (schema) =>
        schema.required("Select a user when linking portal access"),
    })
    .default(""),
});

export const logoStepSchema = yup.object({
  logoFile: yup
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
});

export const supplierCreateFormSchema = companyStepSchema
  .concat(contactStepSchema)
  .concat(businessStepSchema)
  .concat(portalStepSchema)
  .concat(logoStepSchema);

export type SupplierCreateForm = yup.InferType<typeof supplierCreateFormSchema>;
