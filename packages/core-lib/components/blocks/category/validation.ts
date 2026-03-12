import * as yup from "yup";

export const categoryFormSchema = yup.object({
  name: yup
    .string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters")
    .matches(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Category name can only contain letters, numbers, spaces, hyphens and underscores",
    )
    .default(""),

  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters")
    .default(""),

  type: yup
    .number()
    .required("Category type is required")
    .typeError("Category type must be a number")
    .oneOf([1, 2, 3, 4], "Invalid category type")
    .default(1),

  displayOrder: yup
    .number()
    .required("Display order is required")
    .typeError("Display order must be a number")
    .integer("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
    .max(999, "Display order must not exceed 999")
    .default(1),
});

export type CategoryForm = yup.InferType<typeof categoryFormSchema>;
