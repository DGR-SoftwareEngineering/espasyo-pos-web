import React from "react";
import {
  LocationOnOutlined,
  BrandingWatermarkOutlined,
  StraightenOutlined,
  CategoryOutlined,
} from "@mui/icons-material";

export const getCategoryInfo = (type: number | null) => {
  switch (type) {
    case 1:
      return {
        icon: <LocationOnOutlined fontSize="small" />,
        label: "Location",
      };
    case 2:
      return {
        icon: <BrandingWatermarkOutlined fontSize="small" />,
        label: "Brand",
      };
    case 3:
      return { icon: <StraightenOutlined fontSize="small" />, label: "Unit" };
    default:
      return { icon: <CategoryOutlined fontSize="small" />, label: "Category" };
  }
};

export const truncateDescription = (
  description: string | null,
  maxLength: number = 50,
): string => {
  if (!description) return "No description";
  return description.length > maxLength
    ? `${description.substring(0, maxLength)}...`
    : description;
};

export const formatProductId = (id: string): string => {
  return `${id.substring(0, 8)}...`;
};
