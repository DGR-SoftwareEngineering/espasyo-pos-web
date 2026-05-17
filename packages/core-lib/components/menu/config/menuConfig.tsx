import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import CategoryIcon from "@mui/icons-material/Category";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import FoodBankIcon from "@mui/icons-material/FoodBank";
import CycloneIcon from "@mui/icons-material/Cyclone";
import ScaleRoundedIcon from "@mui/icons-material/ScaleRounded";
import KitchenRoundedIcon from "@mui/icons-material/KitchenRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
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
        path: "/admin/hub/inventory/add-new",
        permissionKey: "inventory.nested.add",
      },
      {
        id: "inventory-list",
        text: "Inventory List",
        icon: <ListIcon />,
        path: "/admin/hub/inventory/inventory-list",
        permissionKey: "inventory.nested.list",
      },
      {
        id: "inventory-movements",
        text: "Stock Movements",
        icon: <ReceiptLongRoundedIcon />,
        path: "/admin/hub/inventory/movements",
        permissionKey: "inventory.nested.movements",
      },
    ],
  },
  {
    id: "categories",
    text: "Categories",
    icon: <TuneRoundedIcon />,
    permissionKey: "categories",
    nestedItems: [
      {
        id: "categories-units",
        text: "Units",
        icon: <ScaleRoundedIcon />,
        path: "/admin/hub/categories/units",
        permissionKey: "categories.nested.units",
      },
      {
        id: "categories-product-categories",
        text: "Product Categories",
        icon: <CategoryIcon />,
        path: "/admin/hub/categories/product-categories",
        permissionKey: "categories.nested.productCategories",
      },
      {
        id: "categories-ingredient-categories",
        text: "Ingredient Categories",
        icon: <KitchenRoundedIcon />,
        path: "/admin/hub/categories/ingredient-categories",
        permissionKey: "categories.nested.ingredientCategories",
      },
      {
        id: "categories-locations",
        text: "Locations",
        icon: <PlaceRoundedIcon />,
        path: "/admin/hub/categories/locations",
        permissionKey: "categories.nested.locations",
      },
      {
        id: "categories-brands",
        text: "Brands",
        icon: <StorefrontRoundedIcon />,
        path: "/admin/hub/categories/brands",
        permissionKey: "categories.nested.brands",
      },
    ],
  },
  {
    id: "products",
    text: "Products",
    icon: <ProductionQuantityLimitsIcon />,
    permissionKey: "products",
    nestedItems: [
      {
        id: "product-new",
        text: "New Product",
        icon: <AddIcon />,
        permissionKey: "products.nested.new",
        path: "/admin/hub/product/add-new",
      },
      {
        id: "product-list",
        text: "Product List",
        icon: <ListIcon />,
        path: "/admin/hub/product/product-list",
        permissionKey: "products.nested.list",
      },
    ],
  },
  {
    id: "recipe",
    text: "Recipe",
    icon: <FoodBankIcon />,
    permissionKey: "recipe",
    nestedItems: [
      {
        id: "recipe-new",
        text: "New Recipe",
        icon: <AddIcon />,
        permissionKey: "recipe.nested.new",
        path: "/admin/hub/product/recipe/add-new-recipe",
      },
      {
        id: "recipe-list",
        text: "Recipe List",
        icon: <ListIcon />,
        path: "/admin/hub/product/recipe/recipe-list",
        permissionKey: "recipe.nested.list",
      },
    ],
  },
  {
    id: "unit-conversion",
    text: "Unit Conversion",
    icon: <CycloneIcon />,
    path: "/admin/hub/unit-conversion",
    permissionKey: "unitConversion",
  },
  {
    id: "user-management",
    text: "Users & Suppliers",
    icon: <PeopleRoundedIcon />,
    permissionKey: "userManagement",
    nestedItems: [
      {
        id: "user-management-new",
        text: "Add New User",
        icon: <AddCircleRoundedIcon />,
        path: "/admin/hub/user-management/add-new",
        permissionKey: "userManagement.nested.new",
      },
      {
        id: "user-management-new-supplier",
        text: "Add New Supplier",
        icon: <AddCircleRoundedIcon />,
        path: "/admin/hub/user-management/add-new-supplier",
        permissionKey: "userManagement.nested.newSupplier",
      },
      {
        id: "user-management-list",
        text: "Manage",
        icon: <ListIcon />,
        path: "/admin/hub/user-management",
        permissionKey: "userManagement.nested.list",
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
