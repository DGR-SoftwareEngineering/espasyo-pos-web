import React from "react";
import { Box } from "@radix-ui/themes";
import { useSupplierCreateContext } from "./SupplierCreateContext";
import { useSupplierCreateWizardSteps } from "./steps/useSteps";

export const SupplierCreateForm: React.FC = () => {
  const { form, submit } = useSupplierCreateContext();

  const handleSave = async () => {
    const values = form.getValues();
    await submit(values);
  };

  const { render } = useSupplierCreateWizardSteps(handleSave);

  return (
    <Box
      style={{
        width: "100%",
        maxWidth: 920,
        marginInline: "auto",
      }}
    >
      {render}
    </Box>
  );
};
