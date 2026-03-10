import {
  AttachMoney,
  ShoppingCart,
  Inventory,
  People,
} from "@mui/icons-material";

export const STATS_CARDS = [
  {
    id: "sales",
    title: "Today's Sales",
    value: "0",
    change: "0",
    trend: "down",
    icon: AttachMoney,
    color: "#4caf50",
  },
  {
    id: "transactions",
    title: "Transactions",
    value: "0",
    change: "0",
    trend: "down",
    icon: ShoppingCart,
    color: "#2196f3",
  },
  {
    id: "items",
    title: "Items Scanned",
    value: "0",
    change: "0",
    trend: "down",
    icon: Inventory,
    color: "#ff9800",
  },
  {
    id: "rating",
    title: "Customer Rating",
    value: "0",
    change: "0",
    trend: "down",
    icon: People,
    color: "#9c27b0",
  },
] as const;
