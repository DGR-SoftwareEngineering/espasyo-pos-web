import React from "react";
import { SupplierCreateProvider } from "./SupplierCreateContext";
import { SupplierCreateForm } from "./SupplierCreateForm";

export const SupplierCreateBlock: React.FC = () => (
  <SupplierCreateProvider>
    <SupplierCreateForm />
  </SupplierCreateProvider>
);
