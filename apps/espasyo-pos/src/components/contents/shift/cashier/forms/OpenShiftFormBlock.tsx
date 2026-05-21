import React from "react";
import { OpenShiftForm } from "./OpenShiftForm";
import { OpenShiftForm as OpenShiftFormType } from "./validation";

interface OpenShiftFormBlockProps {
  onSubmit: (values: OpenShiftFormType) => void;
  submitLoading: boolean;
  resetForm?: boolean;
}

export const OpenShiftFormBlock: React.FC<OpenShiftFormBlockProps> = ({
  onSubmit,
  submitLoading,
  resetForm,
}) => (
  <OpenShiftForm
    onSubmit={onSubmit}
    submitLoading={submitLoading}
    resetForm={resetForm}
  />
);
