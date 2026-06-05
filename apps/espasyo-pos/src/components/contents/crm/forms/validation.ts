import * as yup from "yup";

const MMDD_REGEX = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const customerFormSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .max(100, "First name must be at most 100 characters")
    .default(""),
  lastName: yup
    .string()
    .required("Last name is required")
    .max(100, "Last name must be at most 100 characters")
    .default(""),
  email: yup
    .string()
    .transform((v) => (v == null ? "" : v))
    .test(
      "valid-email-or-empty",
      "Please enter a valid email address",
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    )
    .max(200, "Email must be at most 200 characters")
    .default(""),
  phone: yup
    .string()
    .transform((v) => (v == null ? "" : v))
    .max(30, "Phone must be at most 30 characters")
    .default(""),
  address: yup
    .string()
    .transform((v) => (v == null ? "" : v))
    .max(300, "Address must be at most 300 characters")
    .default(""),
  city: yup
    .string()
    .transform((v) => (v == null ? "" : v))
    .max(100, "City must be at most 100 characters")
    .default(""),
  birthday: yup
    .string()
    .transform((v) => (v == null ? "" : v))
    .test(
      "mmdd-or-empty",
      "Use MM-DD format (e.g. 03-25)",
      (val) => !val || MMDD_REGEX.test(val),
    )
    .default(""),
  tags: yup
    .array()
    .of(yup.string().required().max(50, "Each tag must be at most 50 characters"))
    .max(10, "You can pin at most 10 tags")
    .default([]),
});

export type CustomerFormType = yup.InferType<typeof customerFormSchema>;
