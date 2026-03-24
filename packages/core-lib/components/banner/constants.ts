import {
  AttachMoney,
  InventoryOutlined,
  KitchenOutlined,
} from "@mui/icons-material";
import { BannerTypeConfig, PreviewBannerConfig } from "./types";

export const DEFAULT_CONFIG: Required<PreviewBannerConfig> = {
  bgOpacity: 0.03,
  borderOpacity: 0.1,
  borderRadius: 2,
  iconSize: 20,
  iconContainerSize: 40,
  spacing: 2,
};

export const PRODUCT_CONFIG: BannerTypeConfig = {
  icon: InventoryOutlined,
  chipIcon: AttachMoney,
  color: "primary",
  showCategory: true,
};

export const MENU_ITEM_CONFIG: BannerTypeConfig = {
  icon: KitchenOutlined,
  chipIcon: AttachMoney,
  color: "success",
  chipLabelPrefix: "Price: ",
  showCategory: true,
};

export const INGREDIENT_CONFIG: BannerTypeConfig = {
  icon: KitchenOutlined,
  chipIcon: KitchenOutlined,
  color: "info",
  chipLabelPrefix: "Cost: ",
  showCategory: false,
};
