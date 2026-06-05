import * as yup from "yup";

export const loginFormSchema = yup.object({
  userName: yup
    .string()
    .required("Username is required")
    .max(80, "Username error")
    .default(""),
  password: yup
    .string()
    .required("Password is required")
    .max(128, "Password error")
    .default(""),
});

export type LoginForm = yup.InferType<typeof loginFormSchema>;
