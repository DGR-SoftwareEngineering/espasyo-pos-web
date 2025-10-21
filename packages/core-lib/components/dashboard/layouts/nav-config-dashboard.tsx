import { EvaIcon } from "../../EvaIcon";
import { AccountPopoverProps } from "../component/AccountPopover";
import { Iconify } from "../component/iconify/iconify";

const icon = (name: string) => <EvaIcon name={name} />;

export type MenuItems = MenuItemsChildren;

export type MenuItemsChildren = {
  id: string;
  label: string;
  path: string;
  icon: string;
  menuId: string;
  parentId: string;
  hide?: boolean;
};

export type NavNode = MenuItemsChildren & {
  depth: number;
  children: NavNode[];
};

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: "Dashboard",
    path: "/",
    icon: icon("activity-outline"),
  },
  {
    title: "User",
    path: "/user",
    icon: icon("people-outline"),
  },
];

export const authorizedNav: MenuItemsChildren[] = [
  {
    id: "hub-dashboard",
    label: "Dashboard",
    path: "/hub",
    icon: "activity-outline",
    menuId: "menu1",
    parentId: "",
  },
  {
    id: "booking",
    label: "Booking Management",
    path: "#",
    icon: "briefcase-outline",
    menuId: "menu1",
    parentId: "",
  },
  {
    id: "booking-add",
    label: "Create Booking",
    path: "/hub/booking/create-booking",
    icon: "plus-circle-outline",
    menuId: "menu1",
    parentId: "booking",
  },
];

export const _account: AccountPopoverProps["data"] = [
  {
    label: "Home",
    href: "/",
    icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
  },
  {
    label: "Profile",
    href: "#",
    icon: <Iconify width={22} icon="solar:shield-keyhole-bold-duotone" />,
  },
  {
    label: "Settings",
    href: "#",
    icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
  },
];
