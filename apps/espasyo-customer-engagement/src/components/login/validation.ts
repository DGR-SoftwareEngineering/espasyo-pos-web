import * as yup from "yup";

export const loginFormSchema = yup.object({
  userName: yup
    .string()
    .required("Username is required")
    .max(80, "Username too long")
    .default(""),
  password: yup
    .string()
    .required("Password is required")
    .max(128, "Password too long")
    .default(""),
});

export type LoginFormType = yup.InferType<typeof loginFormSchema>;
