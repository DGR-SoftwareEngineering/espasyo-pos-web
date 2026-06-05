import * as Yup from "yup";
import { CreatePlatformParams, UpdatePlatformParams } from "core-lib/api/platform/types";

export const createPlatformSchema = Yup.object().shape({
  name: Yup.string()
    .required("Platform name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  slugKey: Yup.string()
    .required("Slug key is required")
    .min(2, "Slug key must be at least 2 characters")
    .max(30, "Slug key must not exceed 30 characters")
    .matches(/^[a-z0-9-]+$/, "Slug key can only contain lowercase letters, numbers, and hyphens"),
  description: Yup.string()
    .max(200, "Description must not exceed 200 characters")
    .nullable(),
});

export const updatePlatformSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .nullable(),
  description: Yup.string()
    .max(200, "Description must not exceed 200 characters")
    .nullable(),
});
