import { RoleConfig, MenuPermissions, UserRole } from "../permissions";

// Define permissions structure with proper typing
const permissions: Record<UserRole, MenuPermissions> = {
  cashier: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    inventory: { view: true, create: true, edit: true, delete: true },
    sales: {
      view: true,
      create: true,
      edit: false,
      delete: false,
      nested: {
        new: { view: true, create: true, edit: false, delete: false },
        history: { view: true, create: false, edit: false, delete: false },
        returns: { view: true, create: false, edit: false, delete: false },
      },
    },
    category: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      nested: {
        new: { view: true, create: true, edit: false, delete: false },
        list: { view: true, create: false, edit: true, delete: true },
      },
    },
    clients: { view: false, create: false, edit: false, delete: false },
    tasks: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
    about: { view: true, create: false, edit: false, delete: false },
    feedback: { view: true, create: false, edit: false, delete: false },
  },
};

export const roleConfig: Record<string, RoleConfig> = {
  cashier: {
    name: "cashier",
    level: 50,
    permissions: permissions.cashier,
  },
};

// Also export permissions for debugging
export const defaultPermissions = permissions;
