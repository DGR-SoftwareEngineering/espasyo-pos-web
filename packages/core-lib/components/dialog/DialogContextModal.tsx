import React from "react";
import { DialogContentType } from "./types";

interface Props {
  dialogFormType?: DialogContentType;
}

export const DialogContextModal: React.FC<Props> = ({ dialogFormType }) => {
  switch (dialogFormType) {
    case "UserAccessManagement":
      return <>Dialog for user access management</>;
    default:
      return null;
  }
};
