import { SvgIconComponent } from "@mui/icons-material";

export interface PreviewBannerConfig {
  bgOpacity?: number;
  borderOpacity?: number;
  borderRadius?: number;
  iconSize?: number;
  iconContainerSize?: number;
  spacing?: number;
}

export interface BannerTypeConfig {
  icon: SvgIconComponent;
  chipIcon: SvgIconComponent;
  color: "primary" | "success" | "info" | "warning" | "error";
  chipLabelPrefix?: string;
  showCategory?: boolean;
}

export interface PreviewBannerCategory {
  name: string;
}

export interface PreviewBannerItem {
  id?: string;
  name: string;
  category?: PreviewBannerCategory;
  formattedPrice?: string;
  priceValue?: number | null;
  metadata?: Record<string, any>;
}
