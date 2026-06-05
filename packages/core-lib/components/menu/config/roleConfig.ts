import { RoleConfig, MenuPermissions, UserRole } from "../permissions";

const permissions: Record<UserRole, MenuPermissions> = {
  cashier: {
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
    about: { view: true, create: false, edit: false, delete: false },
    feedback: { view: true, create: false, edit: false, delete: false },
  },
  admin: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    inventory: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      nested: {
        add: { view: true, create: true, edit: true, delete: true },
        list: { view: true, create: true, edit: true, delete: true },
        movements: { view: true, create: false, edit: false, delete: false },
      },
    },
    products: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      nested: {
        new: { view: true, create: true, edit: false, delete: false },
        list: { view: true, create: false, edit: true, delete: true },
      },
    },
    recipe: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      nested: {
        new: { view: true, create: true, edit: false, delete: false },
        list: { view: true, create: false, edit: true, delete: true },
      },
    },
    unitConversion: { view: true, create: true, edit: true, delete: true },
    userManagement: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      nested: {
        new: { view: true, create: true, edit: false, delete: false },
        newSupplier: { view: true, create: true, edit: false, delete: false },
        list: { view: true, create: false, edit: true, delete: true },
      },
    },
    clients: { view: true, create: true, edit: true, delete: true },
    tasks: { view: true, create: true, edit: true, delete: true },
    categories: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      nested: {
        units: { view: true, create: true, edit: true, delete: true },
        productCategories: {
          view: true,
          create: true,
          edit: true,
          delete: true,
        },
        ingredientCategories: {
          view: true,
          create: true,
          edit: true,
          delete: true,
        },
        locations: { view: true, create: true, edit: true, delete: true },
        brands: { view: true, create: true, edit: true, delete: true },
      },
    },
    shiftManagement: { view: true, create: false, edit: true, delete: false },
    promoManagement: { view: true, create: true, edit: true, delete: true },
    about: { view: true, create: true, edit: true, delete: true },
    feedback: { view: true, create: true, edit: true, delete: true },
  },
};

export const roleConfig: Record<string, RoleConfig> = {
  cashier: {
    name: "cashier",
    level: 50,
    permissions: permissions.cashier,
  },
  admin: {
    name: "admin",
    level: 100,
    permissions: permissions.admin,
  },
};
