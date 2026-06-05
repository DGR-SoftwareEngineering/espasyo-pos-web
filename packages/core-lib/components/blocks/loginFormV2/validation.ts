import * as yup from "yup";

export const loginFormSchemaV2 = yup.object({
  tenantId: yup
    .string()
    .required("Tenant ID is required")
    .max(80, "Tenant ID error")
    .default(""),
  password: yup
    .string()
    .required("Password is required")
    .max(128, "Password error")
    .default(""),
});

export type LoginFormV2 = yup.InferType<typeof loginFormSchemaV2>;
