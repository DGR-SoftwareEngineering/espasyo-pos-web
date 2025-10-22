import React from "react";
import { useCreateBookingWizardSteps } from "./steps/useSteps";
import { Box } from "@mui/material";
import { useCreateBookingFormContext } from "./CreateBookingContext";
import { CreateBookingType } from "./validation";

export const CreateBookingForm = () => {
  const { form } = useCreateBookingFormContext();
  const { render } = useCreateBookingWizardSteps(
    form.handleSubmit((data) => handleSubmission(data))
  );
  return <Box>{render}</Box>;
  async function handleSubmission(values: CreateBookingType) {}
};
