import { DialogContentType } from "core-lib/api/content/types/common";

export const DIALOG_TITLES = {
  edit: "Edit User",
  delete: "Deactivate User",
  view: "User Details",
};

export const DIALOG_TYPES: Record<string, DialogContentType> = {
  edit: "UserEdit" as DialogContentType,
  delete: "UserDelete" as DialogContentType,
  view: "UserView" as DialogContentType,
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const SORT_OPTIONS = [
  { value: "name", label: "Name (A → Z)" },
  { value: "nameDesc", label: "Name (Z → A)" },
  { value: "role", label: "Role" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

export const ROLE_BADGE_COLOR: Record<
  string,
  "indigo" | "amber" | "green" | "blue" | "gray" | "purple"
> = {
  Admin: "purple",
  Manager: "indigo",
  Cashier: "blue",
  Staff: "green",
};
