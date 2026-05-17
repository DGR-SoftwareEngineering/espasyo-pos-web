import * as yup from "yup";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEFAULT_PASSWORD_MIN = 6;

export const makeAccountStepSchema = (passwordMinLength = DEFAULT_PASSWORD_MIN) =>
  yup.object({
    roleID: yup
      .string()
      .required("Role is required")
      .test("is-valid-uuid", "Invalid role", (value) =>
        !value ? false : UUID_REGEX.test(value),
      )
      .default(""),
    username: yup
      .string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must not exceed 50 characters")
      .matches(
        /^[A-Za-z0-9._-]+$/,
        "Only letters, numbers, dot, underscore and hyphen",
      )
      .default(""),
    password: yup
      .string()
      .required("Password is required")
      .min(
        passwordMinLength,
        `Password must be at least ${passwordMinLength} characters`,
      )
      .max(100, "Password must not exceed 100 characters")
      .default(""),
    confirmPassword: yup
      .string()
      .required("Please confirm the password")
      .oneOf([yup.ref("password")], "Passwords do not match")
      .default(""),
  });

export const accountStepSchema = makeAccountStepSchema();

export const personalStepSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .min(1)
    .max(100, "First name must not exceed 100 characters")
    .default(""),
  middleName: yup
    .string()
    .optional()
    .max(100, "Middle name must not exceed 100 characters")
    .default(""),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(1)
    .max(100, "Last name must not exceed 100 characters")
    .default(""),
});

export const contactStepSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email")
    .max(200, "Email must not exceed 200 characters")
    .default(""),
  contactNumber: yup
    .string()
    .required("Contact number is required")
    .max(50, "Contact number must not exceed 50 characters")
    .matches(/^[+0-9 ()-]+$/, "Only digits, spaces, +, -, ()")
    .default(""),
  licenseNumber: yup
    .string()
    .optional()
    .max(100, "License number must not exceed 100 characters")
    .default(""),
});

export const imageStepSchema = yup.object({
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
});

export const makeUserCreateFormSchema = (passwordMinLength?: number) =>
  makeAccountStepSchema(passwordMinLength)
    .concat(personalStepSchema)
    .concat(contactStepSchema)
    .concat(imageStepSchema);

export const userCreateFormSchema = makeUserCreateFormSchema();

export type UserCreateForm = yup.InferType<typeof userCreateFormSchema>;
