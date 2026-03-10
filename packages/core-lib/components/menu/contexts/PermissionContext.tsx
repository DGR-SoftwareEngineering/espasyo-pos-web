import React, { createContext, useContext, ReactNode } from "react";
import { usePermissions } from "../hooks/usePermissions";

interface PermissionContextType {
  canView: (key: string) => boolean;
  canCreate: (key: string) => boolean;
  canEdit: (key: string) => boolean;
  canDelete: (key: string) => boolean;
  roleName: string | null;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined,
);

interface PermissionProviderProps {
  children: ReactNode;
  roleName: string | null;
  roleData?: any;
}

export const PermissionProvider = ({
  children,
  roleName,
  roleData,
}: PermissionProviderProps) => {
  const { canView, canCreate, canEdit, canDelete } = usePermissions(
    roleName,
    roleData,
  );

  return (
    <PermissionContext.Provider
      value={{ canView, canCreate, canEdit, canDelete, roleName }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error(
      "usePermissionContext must be used within PermissionProvider",
    );
  }
  return context;
};
