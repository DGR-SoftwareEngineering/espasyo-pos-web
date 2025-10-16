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
  children: MenuItemsChildren[];
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

export const authorizedNav: MenuItems[] = [
  {
    id: "1",
    label: "Dashboard",
    path: "/hub/hello-world",
    icon: "activity-outline",
    menuId: "menu1",
    parentId: "",
    children: [],
  },
  {
    id: "2",
    label: "User",
    path: "/hub/world-hello",
    icon: "people-outline",
    menuId: "menu1",
    parentId: "",
    children: [],
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
