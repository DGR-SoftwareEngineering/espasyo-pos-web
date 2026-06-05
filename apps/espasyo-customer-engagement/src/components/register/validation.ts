import * as yup from "yup";

export const customerRegistrationSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .default(""),
  
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .default(""),
  
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match")
    .default(""),
  
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, apostrophes, and hyphens")
    .default(""),
  
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, apostrophes, and hyphens")
    .default(""),
  
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must not exceed 100 characters")
    .default(""),
});

export type CustomerRegistrationFormType = yup.InferType<typeof customerRegistrationSchema>;