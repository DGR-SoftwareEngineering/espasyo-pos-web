import React from "react";

export type FormKey =
  | "product-form"
  | "recipe-form"
  | "category-form"
  | "unit-conversion-form"
  | "inventory-form"
  | "adjust-stock-form"
  | "thresholds-form";

const formRegistry: Partial<Record<FormKey, React.ComponentType<any>>> = {};

export const registerForm = (
  key: FormKey,
  component: React.ComponentType<any>,
) => {
  formRegistry[key] = component;
};

export const getForm = (key: FormKey) => {
  return formRegistry[key];
};

interface FormRendererProps {
  formKey: FormKey;
  [key: string]: any;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  formKey,
  ...props
}) => {
  const FormComponent = getForm(formKey);

  if (!FormComponent) {
    console.error(`Form with key "${formKey}" is not registered`);
    return <div>Form not found</div>;
  }

  return <FormComponent {...props} />;
};
