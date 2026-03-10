import {
  ShoppingCart,
  TrendingDown,
  AttachMoney,
  Coffee,
} from "@mui/icons-material";

export const QUICK_ACTIONS = [
  { id: "new-sale", label: "New Sale", icon: ShoppingCart, color: "#4caf50" },
  { id: "void", label: "Void Item", icon: TrendingDown, color: "#f44336" },
  {
    id: "price-check",
    label: "Price Check",
    icon: AttachMoney,
    color: "#ff9800",
  },
  { id: "break", label: "Break Time", icon: Coffee, color: "#2196f3" },
] as const;

export const ACHIEVEMENTS = [
  {
    id: "speed",
    label: "Fastest Cashier",
    value: "23 sec/transaction",
    icon: "Bolt",
  },
  {
    id: "compliments",
    label: "Customer Compliments",
    value: "5 today",
    icon: "Star",
  },
  {
    id: "accuracy",
    label: "Perfect Scan Rate",
    value: "99.8%",
    icon: "Psychology",
  },
] as const;
