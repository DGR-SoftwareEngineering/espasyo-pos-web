import React from "react";
import { CloseShiftForm } from "./CloseShiftForm";
import { CloseShiftFormProps } from "./types";

export const CloseShiftFormBlock: React.FC<CloseShiftFormProps> = (props) => (
  <CloseShiftForm {...props} />
);
