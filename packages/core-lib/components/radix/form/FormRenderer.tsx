import React from "react";
import { Callout } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { getForm, registerForm } from "../../form/FormRenderer";
import type { FormKey } from "../../form/FormRenderer";

export { getForm, registerForm };
export type { FormKey };

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
    return (
      <Callout.Root color="red" variant="surface">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          Form <strong>{formKey}</strong> is not registered. Make sure the
          corresponding <code>registerForm</code> call has run.
        </Callout.Text>
      </Callout.Root>
    );
  }

  return <FormComponent {...props} />;
};
