import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import { JSX } from "react";

export interface MenuItem {
  id: string;
  text: string;
  icon: JSX.Element;
  path?: string;
  permissionKey: string;
  nestedItems?: NestedMenuItem[];
}

export interface NestedMenuItem {
  id: string;
  text: string;
  icon: JSX.Element;
  path: string;
  permissionKey: string;
}

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    text: "Dashboard",
    icon: <HomeRoundedIcon />,
    path: "/hub",
    permissionKey: "dashboard",
  },
  {
    id: "inventory",
    text: "Inventory",
    icon: <InventoryRoundedIcon />,
    permissionKey: "inventory",
    nestedItems: [
      {
        id: "inventory-add",
        text: "Add New Inventory",
        icon: <AddCircleRoundedIcon />,
        path: "/inventory/add",
        permissionKey: "inventory.nested.add",
      },
      {
        id: "inventory-edit",
        text: "Edit Inventory",
        icon: <EditRoundedIcon />,
        path: "/inventory/edit",
        permissionKey: "inventory.nested.edit",
      },
      {
        id: "inventory-delete",
        text: "Delete Inventory",
        icon: <DeleteRoundedIcon />,
        path: "/inventory/delete",
        permissionKey: "inventory.nested.delete",
      },
      {
        id: "inventory-list",
        text: "Inventory List",
        icon: <InventoryRoundedIcon />,
        path: "/inventory/list",
        permissionKey: "inventory.nested.list",
      },
    ],
  },
  {
    id: "sales",
    text: "Sales",
    icon: <PointOfSaleRoundedIcon />,
    permissionKey: "sales",
    nestedItems: [
      {
        id: "sales-new",
        text: "New Sale",
        icon: <ShoppingCartRoundedIcon />,
        path: "/sales/new",
        permissionKey: "sales.nested.new",
      },
      {
        id: "sales-history",
        text: "Sales History",
        icon: <RestoreRoundedIcon />,
        path: "/sales/history",
        permissionKey: "sales.nested.history",
      },
      {
        id: "sales-returns",
        text: "Returns",
        icon: <RestoreRoundedIcon />,
        path: "/sales/returns",
        permissionKey: "sales.nested.returns",
      },
      {
        id: "sales-reports",
        text: "Reports",
        icon: <ReceiptRoundedIcon />,
        path: "/sales/reports",
        permissionKey: "sales.nested.reports",
      },
    ],
  },
  {
    id: "clients",
    text: "Clients",
    icon: <PeopleRoundedIcon />,
    path: "/clients",
    permissionKey: "clients",
  },
  {
    id: "tasks",
    text: "Tasks",
    icon: <AssignmentRoundedIcon />,
    path: "/tasks",
    permissionKey: "tasks",
  },
];

export const secondaryMenuItems: MenuItem[] = [
  {
    id: "settings",
    text: "Settings",
    icon: <SettingsRoundedIcon />,
    path: "/settings",
    permissionKey: "settings",
  },
  {
    id: "about",
    text: "About",
    icon: <InfoRoundedIcon />,
    path: "/about",
    permissionKey: "about",
  },
  {
    id: "feedback",
    text: "Feedback",
    icon: <HelpRoundedIcon />,
    path: "/feedback",
    permissionKey: "feedback",
  },
];
