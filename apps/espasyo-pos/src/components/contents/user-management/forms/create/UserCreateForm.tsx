import React from "react";
import {
  Box,
} from "core-lib/components/radix/proxies";;
import { useUserCreateContext } from "./UserCreateContext";
import { useUserCreateWizardSteps } from "./steps/useSteps";

export const UserCreateForm: React.FC = () => {
  const { form, submit } = useUserCreateContext();

  const handleSave = async () => {
    const values = form.getValues();
    await submit(values);
  };

  const { render } = useUserCreateWizardSteps(handleSave);

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
